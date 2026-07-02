import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const appointmentCreateSchema = z.object({
  doctorId: uuidSchema,
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(120).optional(),
});

export const appointmentUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"]).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const medicalRecordUpdateSchema = z.object({
  recordType: z.enum(["lab_report", "prescription", "scan", "other"]).optional(),
  aiSummary: z.string().trim().max(12000).nullable().optional(),
});

export const aiChatSchema = z.object({
  sessionId: uuidSchema.optional(),
  message: z.string().trim().min(1).max(4000),
});

export const aiExplainSchema = z.object({
  recordId: uuidSchema.optional(),
  text: z.string().trim().min(1).max(12000).optional(),
});

export const paymentCreateOrderSchema = z.object({
  appointmentId: uuidSchema,
});

export const paymentVerifySchema = z.object({
  appointmentId: uuidSchema,
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const paymentRefundSchema = z.object({
  paymentId: uuidSchema.optional(),
  appointmentId: uuidSchema.optional(),
  amount: z.number().int().positive().optional(),
  reason: z.string().trim().max(500).optional(),
}).refine((value) => value.paymentId || value.appointmentId, {
  message: "paymentId or appointmentId is required",
});

export const callTokenSchema = z.object({
  appointmentId: uuidSchema,
});

export const callSignalSchema = z.object({
  roomId: uuidSchema.or(z.string().min(1).max(120)),
  type: z.enum(["offer", "answer", "ice", "chat", "presence"]),
  payload: z.unknown(),
});
