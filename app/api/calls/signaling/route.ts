import { NextRequest } from "next/server";

import { getAuthContext } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/response";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { callSignalSchema } from "@/types/api";

export async function POST(request: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return apiError("UNAUTHENTICATED", "Sign in to signal a consultation room.", 401);
  }

  const parsed = callSignalSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Send a valid signaling message.", 400);
  }

  const supabase = await createServerSupabaseClient();
  const { data: room } = await supabase
    .from("call_rooms")
    .select("id,appointment_id,appointments(patient_id,doctor_id,patients(profile_id),doctors(profile_id))")
    .eq("id", parsed.data.roomId)
    .maybeSingle();

  if (!room) {
    return apiError("NOT_FOUND", "Call room was not found.", 404);
  }

  const row = room as {
    id: string;
    appointments?: {
      patients?: { profile_id?: string } | { profile_id?: string }[];
      doctors?: { profile_id?: string } | { profile_id?: string }[];
    } | {
      patients?: { profile_id?: string } | { profile_id?: string }[];
      doctors?: { profile_id?: string } | { profile_id?: string }[];
    }[];
  };
  const appointment = Array.isArray(row.appointments) ? row.appointments[0] : row.appointments;
  const patient = Array.isArray(appointment?.patients) ? appointment?.patients[0] : appointment?.patients;
  const doctor = Array.isArray(appointment?.doctors) ? appointment?.doctors[0] : appointment?.doctors;

  if (auth.role !== "admin" && patient?.profile_id !== auth.userId && doctor?.profile_id !== auth.userId) {
    return apiError("FORBIDDEN", "You are not a participant in this call room.", 403);
  }

  const channel = supabase.channel(`call-room:${row.id}`);
  await channel.subscribe();
  await channel.send({
    type: "broadcast",
    event: "signal",
    payload: {
      type: parsed.data.type,
      payload: parsed.data.payload,
      senderId: auth.userId,
      sentAt: new Date().toISOString(),
    },
  });
  await supabase.removeChannel(channel);

  return apiOk({ sent: true });
}
