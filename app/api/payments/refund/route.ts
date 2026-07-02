import { NextRequest } from "next/server";

import { getAuthContext, requireRole } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/response";
import { refundRazorpayPayment } from "@/lib/razorpay";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { paymentRefundSchema } from "@/types/api";

export async function POST(request: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return apiError("UNAUTHENTICATED", "Sign in as an admin to refund payments.", 401);
  }

  if (!requireRole(auth, ["admin"])) {
    return apiError("FORBIDDEN", "Only admins can refund payments.", 403);
  }

  const parsed = paymentRefundSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Send a valid payment or appointment to refund.", 400);
  }

  const supabase = await createServerSupabaseClient();
  const query = supabase
    .from("payments")
    .select("*, appointments(id,scheduled_at,status)")
    .eq(parsed.data.paymentId ? "id" : "appointment_id", parsed.data.paymentId ?? parsed.data.appointmentId)
    .maybeSingle();

  const { data: payment } = await query;
  if (!payment) {
    return apiError("NOT_FOUND", "Payment was not found.", 404);
  }

  if (payment.status !== "succeeded") {
    return apiError("CONFLICT", "Only succeeded payments can be refunded.", 409);
  }

  const row = payment as {
    id: string;
    amount: number;
    provider_ref?: string | null;
    appointment_id: string;
    appointments?: { scheduled_at?: string; status?: string } | { scheduled_at?: string; status?: string }[];
  };
  const appointment = Array.isArray(row.appointments) ? row.appointments[0] : row.appointments;
  const scheduledAt = appointment?.scheduled_at ? new Date(appointment.scheduled_at).getTime() : 0;

  if (scheduledAt && scheduledAt - Date.now() < 2 * 60 * 60 * 1000) {
    return apiError("CONFLICT", "Refunds are only allowed at least 2 hours before the appointment.", 409);
  }

  if (!row.provider_ref) {
    return apiError("CONFLICT", "Payment provider reference is missing.", 409);
  }

  const requestedAmount = parsed.data.amount;
  const refund = await refundRazorpayPayment({
    paymentId: row.provider_ref,
    amount: requestedAmount,
    notes: {
      appointmentId: row.appointment_id,
      reason: parsed.data.reason ?? "admin_cancelled",
    },
  });

  const nextStatus = requestedAmount && requestedAmount < row.amount ? "partially_refunded" : "refunded";
  const { data: updatedPayment, error } = await supabase
    .from("payments")
    .update({ status: nextStatus, receipt_url: refund.id })
    .eq("id", row.id)
    .select("*")
    .single();

  if (error) {
    return apiError("SERVER_ERROR", "Refund was issued but local payment update failed.", 500);
  }

  await supabase.from("appointments").update({ status: "cancelled" }).eq("id", row.appointment_id);
  await supabase.from("audit_logs").insert({
    actor_id: auth.userId,
    action: "refund_requested",
    entity: "payments",
    entity_id: row.id,
    metadata: {
      refundId: refund.id,
      amount: requestedAmount ?? row.amount,
      status: nextStatus,
      mode: refund.mode,
    },
  });

  return apiOk({
    payment: updatedPayment,
    refund,
  });
}
