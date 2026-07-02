import { NextRequest } from "next/server";

import { getAuthContext } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/response";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { medicalRecordUpdateSchema, uuidSchema } from "@/types/api";

async function ensureRecordAccess(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data: record } = await supabase
    .from("medical_records")
    .select("*, patients(profile_id)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  return { supabase, record };
}

type MedicalRecordRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: MedicalRecordRouteContext) {
  const auth = await getAuthContext();
  if (!auth) {
    return apiError("UNAUTHENTICATED", "Sign in to view medical records.", 401);
  }

  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return apiError("VALIDATION_ERROR", "Invalid medical record ID.", 400);
  }

  const { record } = await ensureRecordAccess(id);
  if (!record) {
    return apiError("NOT_FOUND", "Medical record was not found.", 404);
  }

  return apiOk({ record });
}

export async function PATCH(request: NextRequest, context: MedicalRecordRouteContext) {
  const auth = await getAuthContext();
  if (!auth) {
    return apiError("UNAUTHENTICATED", "Sign in to update medical records.", 401);
  }

  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return apiError("VALIDATION_ERROR", "Invalid medical record ID.", 400);
  }

  const parsed = medicalRecordUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || (parsed.data.recordType === undefined && parsed.data.aiSummary === undefined)) {
    return apiError("VALIDATION_ERROR", "Send medical record fields to update.", 400);
  }

  const { supabase, record } = await ensureRecordAccess(id);
  if (!record) {
    return apiError("NOT_FOUND", "Medical record was not found.", 404);
  }

  const row = record as { patients?: { profile_id?: string } | { profile_id?: string }[] };
  const patient = Array.isArray(row.patients) ? row.patients[0] : row.patients;
  if (auth.role !== "admin" && patient?.profile_id !== auth.userId) {
    return apiError("FORBIDDEN", "You are not allowed to update this medical record.", 403);
  }

  const update: Record<string, string | null> = {};
  if (parsed.data.recordType) update.record_type = parsed.data.recordType;
  if (parsed.data.aiSummary !== undefined) update.ai_summary = parsed.data.aiSummary;

  const { data, error } = await supabase.from("medical_records").update(update).eq("id", id).select("*").single();
  if (error) {
    return apiError("SERVER_ERROR", "Could not update medical record.", 500);
  }

  return apiOk({ record: data });
}

export async function DELETE(_request: NextRequest, context: MedicalRecordRouteContext) {
  const auth = await getAuthContext();
  if (!auth) {
    return apiError("UNAUTHENTICATED", "Sign in to delete medical records.", 401);
  }

  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return apiError("VALIDATION_ERROR", "Invalid medical record ID.", 400);
  }

  const { supabase, record } = await ensureRecordAccess(id);
  if (!record) {
    return apiError("NOT_FOUND", "Medical record was not found.", 404);
  }

  const row = record as { patients?: { profile_id?: string } | { profile_id?: string }[] };
  const patient = Array.isArray(row.patients) ? row.patients[0] : row.patients;
  if (auth.role !== "admin" && patient?.profile_id !== auth.userId) {
    return apiError("FORBIDDEN", "You are not allowed to delete this medical record.", 403);
  }

  const { error } = await supabase.from("medical_records").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) {
    return apiError("SERVER_ERROR", "Could not delete medical record.", 500);
  }

  await supabase.from("audit_logs").insert({
    actor_id: auth.userId,
    action: "record_soft_deleted",
    entity: "medical_records",
    entity_id: id,
  });

  return apiOk({ deleted: true });
}
