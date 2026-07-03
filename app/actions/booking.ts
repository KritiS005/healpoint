"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------

const bookingSchema = z.object({
  doctorId: z.string().uuid("Invalid doctor ID."),
  scheduledAt: z.string().datetime("Invalid appointment time."),
  appointmentType: z.enum(["video_call", "in_person"]),
  paymentMethod: z.enum(["online", "cash"]),
  durationMinutes: z.number().int().min(15).max(120).default(30),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export type BookingResult =
  | { success: true; appointmentId: string; fee: number }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

export async function createBooking(raw: BookingInput): Promise<BookingResult> {
  // 1. Parse & validate input shape
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { doctorId, scheduledAt, appointmentType, paymentMethod, durationMinutes } = parsed.data;

  // 2. Business rule: video_call must use online payment
  if (appointmentType === "video_call" && paymentMethod !== "online") {
    return { success: false, error: "Video consultations require online payment." };
  }

  // 3. Appointment time must be in the future
  if (new Date(scheduledAt) <= new Date()) {
    return { success: false, error: "Appointment time must be in the future." };
  }

  const supabase = await createServerSupabaseClient();

  // 4. Authenticate the caller
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in to book an appointment." };
  }

  // 5. Resolve patient row from the authenticated user
  const { data: patientRow, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (patientError) {
    return { success: false, error: "Could not verify your patient profile." };
  }
  if (!patientRow) {
    return {
      success: false,
      error: "No patient profile found. Please complete your profile first.",
    };
  }

  // 6. Fetch the doctor and verify the fee server-side.
  //    The client never sends a fee — we read it from the DB here,
  //    which prevents any client-side fee manipulation.
  const { data: doctorRow, error: doctorError } = await supabase
    .from("doctors")
    .select("id, consultation_fee, verified")
    .eq("id", doctorId)
    .maybeSingle();

  if (doctorError) {
    return { success: false, error: "Could not verify doctor details." };
  }
  if (!doctorRow) {
    return { success: false, error: "Doctor not found." };
  }
  if (!doctorRow.verified) {
    return { success: false, error: "This doctor is not yet verified on the platform." };
  }

  const fee: number = doctorRow.consultation_fee as number;

  // 7. Check for slot collision (belt-and-suspenders on top of the DB unique constraint)
  const { data: collision } = await supabase
    .from("appointments")
    .select("id")
    .eq("doctor_id", doctorId)
    .eq("scheduled_at", new Date(scheduledAt).toISOString())
    .is("deleted_at", null)
    .maybeSingle();

  if (collision) {
    return {
      success: false,
      error: "This time slot is no longer available. Please choose another.",
    };
  }

  // 8. Insert the appointment
  const { data: appointment, error: insertError } = await supabase
    .from("appointments")
    .insert({
      patient_id: patientRow.id,
      doctor_id: doctorId,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: durationMinutes,
      status: "pending",
      notes:
        appointmentType === "video_call" ? "Video consultation" : "In-person consultation",
    })
    .select("id")
    .single();

  if (insertError) {
    // Unique constraint violation — slot was taken between our check and insert
    if (insertError.code === "23505") {
      return {
        success: false,
        error: "This time slot was just taken. Please choose another.",
      };
    }
    return { success: false, error: "Could not create appointment. Please try again." };
  }

  // 9. Lock the fee in a pending payment record immediately.
  //    Amount is always sourced from the DB, never from the client.
  await supabase.from("payments").insert({
    appointment_id: appointment.id,
    amount: fee,
    currency: "inr",
    status: "pending",
    provider: paymentMethod === "online" ? "razorpay" : "cash",
  });

  // 10. Notify the patient
  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "booking",
    message:
      paymentMethod === "cash"
        ? "Your appointment has been booked. Please pay at the clinic."
        : "Your appointment has been booked. Complete payment to confirm your slot.",
  });

  return { success: true, appointmentId: appointment.id, fee };
}
