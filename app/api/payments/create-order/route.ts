import { NextRequest } from "next/server";

import { getAuthContext, requireRole } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/response";
import { createRazorpayOrder, getRazorpayKeyId } from "@/lib/razorpay";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { paymentCreateOrderSchema } from "@/types/api";

export async function POST(request: NextRequest) {
  const auth = await getAuthContext();

  if (!auth) {
    return apiError("UNAUTHENTICATED", "Only patients can start checkout.", 401);
  }

  if (!requireRole(auth, ["patient"])) {
    return apiError("FORBIDDEN", "Only patients can start checkout.", 403);
  }

  const parsed = paymentCreateOrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Send a valid appointment ID.", 400);
  }

  const supabase = await createServerSupabaseClient();
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id,status,doctor_id,patients!inner(profile_id),doctors!inner(consultation_fee)")
    .eq("id", parsed.data.appointmentId)
    .maybeSingle();

  if (!appointment) {
    return apiError("NOT_FOUND", "APPOINTMENT_NOT_FOUND", 404);
  }

  const appointmentRow = appointment as {
    patients?: { profile_id?: string } | { profile_id?: string }[];
    doctors?: { consultation_fee?: number } | { consultation_fee?: number }[];
  };
  const patientProfileId = Array.isArray(appointmentRow.patients) ? appointmentRow.patients[0]?.profile_id : appointmentRow.patients?.profile_id;
  if (patientProfileId !== auth.userId) {
    return apiError("FORBIDDEN", "You can only pay for your own appointment.", 403);
  }

  const { data: existingPayment } = await supabase
    .from("payments")
    .select("*")
    .eq("appointment_id", parsed.data.appointmentId)
    .maybeSingle();

  if (existingPayment?.status === "succeeded") {
    return apiError("CONFLICT", "ALREADY_PAID", 409);
  }

  const doctor = Array.isArray(appointmentRow.doctors) ? appointmentRow.doctors[0] : appointmentRow.doctors;
  const amount = Number(doctor?.consultation_fee ?? 0);
  if (!amount || amount < 100) {
    return apiError("SERVER_ERROR", "Doctor consultation fee is not configured.", 500);
  }

  const order = await createRazorpayOrder({
    amount,
    currency: "INR",
    receipt: `appt_${parsed.data.appointmentId.slice(0, 24)}`,
  });

  const paymentPayload = {
    appointment_id: parsed.data.appointmentId,
    amount,
    currency: "inr",
    status: "pending",
    provider: "razorpay",
    provider_ref: order.id,
    order_id: order.id,
  };

  const paymentResult = existingPayment
    ? await supabase.from("payments").update(paymentPayload).eq("id", existingPayment.id).select("*").single()
    : await supabase.from("payments").insert(paymentPayload).select("*").single();

  if (paymentResult.error) {
    return apiError("SERVER_ERROR", "Could not create payment record.", 500);
  }

  return apiOk({
    orderId: order.id,
    amount,
    currency: "INR",
    keyId: getRazorpayKeyId(),
    payment: paymentResult.data,
    mode: order.mode,
  });
}
