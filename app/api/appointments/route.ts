import { NextRequest } from "next/server";

import { getAuthContext, requireRole } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/response";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { appointmentCreateSchema } from "@/types/api";

export async function GET() {
  const auth = await getAuthContext();

  if (!auth) {
    return apiError("UNAUTHENTICATED", "Sign in to view appointments.", 401);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, doctors(*, profiles(full_name)), patients(*, profiles(full_name)), payments(*), call_rooms(*)")
    .is("deleted_at", null)
    .order("scheduled_at", { ascending: true });

  if (error) {
    return apiError("SERVER_ERROR", "Could not load appointments.", 500);
  }

  return apiOk({ appointments: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthContext();

  if (!auth) {
    return apiError("UNAUTHENTICATED", "Only patients can book appointments.", 401);
  }

  if (!requireRole(auth, ["patient"])) {
    return apiError("FORBIDDEN", "Only patients can book appointments.", 403);
  }

  const parsed = appointmentCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Send a valid doctor and future appointment time.", 400);
  }

  const scheduledAt = new Date(parsed.data.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
    return apiError("VALIDATION_ERROR", "Appointment time must be in the future.", 400);
  }

  const supabase = await createServerSupabaseClient();
  const { data: patient } = await supabase.from("patients").select("id").eq("profile_id", auth.userId).maybeSingle();

  if (!patient) {
    return apiError("FORBIDDEN", "Create a patient profile before booking.", 403);
  }

  const { data: collision } = await supabase
    .from("appointments")
    .select("id")
    .eq("doctor_id", parsed.data.doctorId)
    .eq("scheduled_at", scheduledAt.toISOString())
    .is("deleted_at", null)
    .maybeSingle();

  if (collision) {
    return apiError("CONFLICT", "SLOT_TAKEN", 409);
  }

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      patient_id: patient.id,
      doctor_id: parsed.data.doctorId,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: parsed.data.durationMinutes ?? 30,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    return apiError("SERVER_ERROR", "Could not create appointment.", 500);
  }

  await supabase.from("notifications").insert({
    user_id: auth.userId,
    type: "booking",
    message: "Your appointment is pending payment confirmation.",
  });

  return apiOk({ appointment }, { status: 201 });
}
