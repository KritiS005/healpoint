import { NextRequest } from "next/server";

import { getAuthContext, requireRole } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/response";
import { verifyRazorpayCheckoutSignature } from "@/lib/razorpay";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { paymentVerifySchema } from "@/types/api";

export async function POST(request: NextRequest) {
  const auth = await getAuthContext();

  if (!auth) {
    return apiError("UNAUTHENTICATED", "Only patients can verify checkout.", 401);
  }

  if (!requireRole(auth, ["patient"])) {
    return apiError("FORBIDDEN", "Only patients can verify checkout.", 403);
  }

  const parsed = paymentVerifySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid Razorpay checkout payload.", 400);
  }

  const valid = verifyRazorpayCheckoutSignature({
    orderId: parsed.data.razorpayOrderId,
    paymentId: parsed.data.razorpayPaymentId,
    signature: parsed.data.razorpaySignature,
  });

  if (!valid) {
    return apiError("FORBIDDEN", "Invalid payment signature.", 403);
  }

  const supabase = await createServerSupabaseClient();
  const { data: payment, error } = await supabase
    .from("payments")
    .update({
      provider_ref: parsed.data.razorpayPaymentId,
      order_id: parsed.data.razorpayOrderId,
      status: "succeeded",
    })
    .eq("appointment_id", parsed.data.appointmentId)
    .select("*")
    .single();

  if (error) {
    return apiError("SERVER_ERROR", "Could not verify payment.", 500);
  }

  await supabase.from("appointments").update({ status: "confirmed" }).eq("id", parsed.data.appointmentId);
  await supabase.from("call_rooms").upsert({ appointment_id: parsed.data.appointmentId, status: "created" }, { onConflict: "appointment_id" });
  await supabase.from("audit_logs").insert({
    actor_id: auth.userId,
    action: "payment_status_changed",
    entity: "payments",
    entity_id: payment.id,
    metadata: { status: "succeeded", source: "checkout_verify" },
  });

  return apiOk({ payment });
}
