import crypto from "node:crypto";

export function getRazorpayKeyId() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || process.env.RAZORPAY_KEY_ID?.trim() || "";
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!secret || !signature) {
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function verifyRazorpayCheckoutSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!secret) {
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function createRazorpayOrder({
  amount,
  currency,
  receipt,
}: {
  amount: number;
  currency: string;
  receipt: string;
}) {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    return {
      id: `test_order_${receipt}`,
      amount,
      currency,
      receipt,
      mode: "manual_config" as const,
    };
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, currency, receipt, payment_capture: 1 }),
  });

  if (!response.ok) {
    throw new Error("Razorpay order creation failed");
  }

  return { ...((await response.json()) as { id: string; amount: number; currency: string; receipt: string }), mode: "live" as const };
}

export async function refundRazorpayPayment({
  paymentId,
  amount,
  notes,
}: {
  paymentId: string;
  amount?: number;
  notes?: Record<string, string>;
}) {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    return {
      id: `test_refund_${paymentId}`,
      payment_id: paymentId,
      amount,
      status: "processed",
      mode: "manual_config" as const,
    };
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refund`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...(amount ? { amount } : {}),
      ...(notes ? { notes } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error("Razorpay refund failed");
  }

  return { ...((await response.json()) as { id: string; payment_id: string; amount?: number; status: string }), mode: "live" as const };
}
