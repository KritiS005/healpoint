import { NextRequest } from "next/server";

import { getAuthContext } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/response";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { appointmentUpdateSchema, uuidSchema } from "@/types/api";

type AppointmentRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: AppointmentRouteContext) {
  const auth = await getAuthContext();
  if (!auth) {
    return apiError("UNAUTHENTICATED", "Sign in to update appointments.", 401);
  }

  const { id } = await context.params;
  const idParse = uuidSchema.safeParse(id);
  if (!idParse.success) {
    return apiError("VALIDATION_ERROR", "Invalid appointment ID.", 400);
  }

  const parsed = appointmentUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || (!parsed.data.status && parsed.data.notes === undefined)) {
    return apiError("VALIDATION_ERROR", "Send appointment fields to update.", 400);
  }

  const supabase = await createServerSupabaseClient();
  const { data: current } = await supabase
    .from("appointments")
    .select("id,status,patient_id,doctor_id,patients(profile_id),doctors(profile_id)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!current) {
    return apiError("NOT_FOUND", "Appointment was not found.", 404);
  }

  const row = current as {
    patients?: { profile_id?: string } | { profile_id?: string }[];
    doctors?: { profile_id?: string } | { profile_id?: string }[];
  };
  const patient = Array.isArray(row.patients) ? row.patients[0] : row.patients;
  const doctor = Array.isArray(row.doctors) ? row.doctors[0] : row.doctors;
  const isPatient = patient?.profile_id === auth.userId;
  const isDoctor = doctor?.profile_id === auth.userId;
  const isAdmin = auth.role === "admin";

  if (!isPatient && !isDoctor && !isAdmin) {
    return apiError("FORBIDDEN", "You are not allowed to update this appointment.", 403);
  }

  if (parsed.data.status && auth.role === "patient" && !["cancelled"].includes(parsed.data.status)) {
    return apiError("FORBIDDEN", "Patients can only cancel appointments.", 403);
  }

  const update: Record<string, string | null> = {};
  if (parsed.data.status) update.status = parsed.data.status;
  if (parsed.data.notes !== undefined) update.notes = parsed.data.notes;

  const { data: appointment, error } = await supabase.from("appointments").update(update).eq("id", id).select("*").single();

  if (error) {
    return apiError("SERVER_ERROR", "Could not update appointment.", 500);
  }

  await supabase.from("audit_logs").insert({
    actor_id: auth.userId,
    action: "appointment_status_changed",
    entity: "appointments",
    entity_id: id,
    metadata: { status: parsed.data.status ?? null },
  });

  return apiOk({ appointment });
}
