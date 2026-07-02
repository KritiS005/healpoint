import { NextRequest } from "next/server";

import { getAuthContext, requireRole } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/response";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const maxBytes = 10 * 1024 * 1024;

function safeExtension(file: File) {
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  return "bin";
}

export async function POST(request: NextRequest) {
  const auth = await getAuthContext();

  if (!auth) {
    return apiError("UNAUTHENTICATED", "Only patients can upload reports.", 401);
  }

  if (!requireRole(auth, ["patient"])) {
    return apiError("FORBIDDEN", "Only patients can upload reports.", 403);
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return apiError("VALIDATION_ERROR", "Upload a report file.", 400);
  }

  if (!allowedTypes.has(file.type)) {
    return apiError("VALIDATION_ERROR", "UNSUPPORTED_FILE_TYPE", 400);
  }

  if (file.size > maxBytes) {
    return apiError("VALIDATION_ERROR", "FILE_TOO_LARGE", 413);
  }

  const supabase = await createServerSupabaseClient();
  const { data: patient } = await supabase.from("patients").select("id").eq("profile_id", auth.userId).maybeSingle();

  if (!patient) {
    return apiError("FORBIDDEN", "Create a patient profile before uploading records.", 403);
  }

  const storagePath = `${auth.userId}/${crypto.randomUUID()}.${safeExtension(file)}`;
  const { error: uploadError } = await supabase.storage.from("medical-records").upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return apiError("SERVER_ERROR", "Could not store report.", 500);
  }

  const { data: record, error } = await supabase
    .from("medical_records")
    .insert({
      patient_id: patient.id,
      file_url: storagePath,
      record_type: "lab_report",
      ai_summary: "Processing OCR and AI explanation.",
    })
    .select("*")
    .single();

  if (error) {
    return apiError("SERVER_ERROR", "Could not create medical record.", 500);
  }

  return apiOk({ recordId: record.id, status: "processing", record }, { status: 202 });
}
