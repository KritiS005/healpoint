import { NextRequest } from "next/server";

import { getAuthContext, requireRole } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/response";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";
import { buildHealthPrompt, generateHealthEducationText, getAiDisclaimer } from "@/lib/gemini";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { aiExplainSchema } from "@/types/api";

export async function POST(request: NextRequest) {
  const auth = await getAuthContext();

  if (!auth) {
    return apiError("UNAUTHENTICATED", "Only patients can request report explanations.", 401);
  }

  if (!requireRole(auth, ["patient", "admin"])) {
    return apiError("FORBIDDEN", "Only patients can request report explanations.", 403);
  }

  const limit = checkRateLimit(`ai-explain:${auth.userId}:${getClientIp(request)}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) {
    return apiError("RATE_LIMITED", "Too many explanation requests. Please try again shortly.", 429);
  }

  const parsed = aiExplainSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || (!parsed.data.text && !parsed.data.recordId)) {
    return apiError("VALIDATION_ERROR", "Send report text or a medical record ID.", 400);
  }

  const supabase = await createServerSupabaseClient();
  let reportText = parsed.data.text ?? "";

  if (parsed.data.recordId && !reportText) {
    const { data: record } = await supabase
      .from("medical_records")
      .select("ai_summary,file_url")
      .eq("id", parsed.data.recordId)
      .maybeSingle();

    if (!record) {
      return apiError("NOT_FOUND", "Medical record was not found.", 404);
    }

    reportText = record.ai_summary || `Uploaded report at ${record.file_url}`;
  }

  const model = reportText.length > 2500 ? "gemini-2.5-pro" : "gemini-2.5-flash";
  const result = await generateHealthEducationText({
    prompt: buildHealthPrompt("report", reportText.slice(0, 12000)),
    model,
  });

  if (parsed.data.recordId && result.mode === "live") {
    await supabase.from("medical_records").update({ ai_summary: result.text }).eq("id", parsed.data.recordId);
  }

  return apiOk({
    summary: result.text,
    explanation: result.text,
    disclaimer: getAiDisclaimer(),
    mode: result.mode,
  });
}
