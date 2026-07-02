import crypto from "node:crypto";
import { NextRequest } from "next/server";

import { getAuthContext } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/response";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { callTokenSchema } from "@/types/api";

function signCallToken(payload: Record<string, string | number>) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "dev-call-token";
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export async function POST(request: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return apiError("UNAUTHENTICATED", "Sign in to join a consultation.", 401);
  }

  const parsed = callTokenSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Send a valid appointment ID.", 400);
  }

  const supabase = await createServerSupabaseClient();
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id,scheduled_at,status,patients(profile_id),doctors(profile_id),call_rooms(id)")
    .eq("id", parsed.data.appointmentId)
    .maybeSingle();

  if (!appointment) {
    return apiError("NOT_FOUND", "Appointment was not found.", 404);
  }

  const appointmentRow = appointment as {
    id: string;
    scheduled_at: string;
    status: string;
    patients?: { profile_id?: string } | { profile_id?: string }[];
    doctors?: { profile_id?: string } | { profile_id?: string }[];
    call_rooms?: { id?: string } | { id?: string }[];
  };
  const patient = Array.isArray(appointmentRow.patients) ? appointmentRow.patients[0] : appointmentRow.patients;
  const doctor = Array.isArray(appointmentRow.doctors) ? appointmentRow.doctors[0] : appointmentRow.doctors;
  const isParticipant = patient?.profile_id === auth.userId || doctor?.profile_id === auth.userId;

  if (!isParticipant && auth.role !== "admin") {
    return apiError("FORBIDDEN", "You are not a participant in this appointment.", 403);
  }

  if (appointmentRow.status !== "confirmed" && appointmentRow.status !== "in_progress") {
    return apiError("FORBIDDEN", "The appointment must be confirmed before joining.", 403);
  }

  const scheduledAt = new Date(appointmentRow.scheduled_at).getTime();
  const now = Date.now();
  const opensAt = scheduledAt - 10 * 60 * 1000;
  const closesAt = scheduledAt + 15 * 60 * 1000;

  if (now < opensAt || now > closesAt) {
    return apiError("FORBIDDEN", "The consultation room is available from 10 minutes before until 15 minutes after the appointment time.", 403);
  }

  let roomId = Array.isArray(appointmentRow.call_rooms) ? appointmentRow.call_rooms[0]?.id : appointmentRow.call_rooms?.id;

  if (!roomId) {
    const { data: room, error } = await supabase
      .from("call_rooms")
      .insert({ appointment_id: appointmentRow.id, status: "waiting" })
      .select("id")
      .single();

    if (error) {
      return apiError("SERVER_ERROR", "Could not create consultation room.", 500);
    }

    roomId = room.id;
  }

  if (!roomId) {
    return apiError("SERVER_ERROR", "Could not resolve consultation room.", 500);
  }

  const token = signCallToken({
    sub: auth.userId,
    appointmentId: appointmentRow.id,
    roomId,
    exp: Math.floor(Date.now() / 1000) + 5 * 60,
  });

  return apiOk({ roomId, token });
}
