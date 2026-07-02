import { NextRequest } from "next/server";

import { apiError, apiOk } from "@/lib/api/response";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

type RazorpayWebhook = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; status?: string } };
    refund?: { entity?: { id?: string; payment_id?: string; amount?: number; status?: string } };
  };
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return apiError("FORBIDDEN", "Invalid webhook signature.", 403);
  }

  const event = JSON.parse(rawBody) as RazorpayWebhook;
  const supabase = createServiceSupabaseClient();

  if (event.event === "payment.captured") {
    const paymentId = event.payload?.payment?.entity?.id;
    const orderId = event.payload?.payment?.entity?.order_id;

    if (paymentId && orderId) {
      const { data: payment } = await supabase
        .from("payments")
        .select("id,appointment_id,status")
        .or(`provider_ref.eq.${paymentId},order_id.eq.${orderId}`)
        .maybeSingle();

      if (payment && payment.status !== "succeeded") {
        await supabase.from("payments").update({ status: "succeeded", provider_ref: paymentId, order_id: orderId }).eq("id", payment.id);
        await supabase.from("appointments").update({ status: "confirmed" }).eq("id", payment.appointment_id);
        await supabase.from("call_rooms").upsert({ appointment_id: payment.appointment_id, status: "created" }, { onConflict: "appointment_id" });
        await supabase.from("audit_logs").insert({
          actor_id: null,
          action: "payment_status_changed",
          entity: "payments",
          entity_id: payment.id,
          metadata: { event: event.event, provider_ref: paymentId },
        });
      }
    }
  }

  if (event.event === "payment.failed") {
    const paymentId = event.payload?.payment?.entity?.id;
    const orderId = event.payload?.payment?.entity?.order_id;

    if (paymentId || orderId) {
      await supabase.from("payments").update({ status: "failed", provider_ref: paymentId }).or(`provider_ref.eq.${paymentId},order_id.eq.${orderId}`);
    }
  }

  if (event.event === "refund.processed") {
    const refund = event.payload?.refund?.entity;
    if (refund?.payment_id) {
      await supabase.from("payments").update({ status: "refunded" }).eq("provider_ref", refund.payment_id);
    }
  }

  return apiOk({ received: true });
}
