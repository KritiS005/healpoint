import { NextRequest } from "next/server";

import { getAuthContext } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/response";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";
import { buildHealthPrompt, generateHealthEducationText, getAiDisclaimer } from "@/lib/gemini";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { aiChatSchema } from "@/types/api";

export async function POST(request: NextRequest) {
  const auth = await getAuthContext();

  if (!auth) {
    return apiError("UNAUTHENTICATED", "Sign in to use the AI assistant.", 401);
  }

  const limit = checkRateLimit(`ai:${auth.userId}:${getClientIp(request)}`, 20, 10 * 60 * 1000);
  if (!limit.allowed) {
    return apiError("RATE_LIMITED", "Too many AI messages. Please try again shortly.", 429);
  }

  const parsed = aiChatSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Please send a valid message.", 400);
  }

  const sessionId = parsed.data.sessionId ?? crypto.randomUUID();
  const supabase = await createServerSupabaseClient();
  const { data: previousTurns } = await supabase
    .from("ai_conversations")
    .select("message,response")
    .eq("user_id", auth.userId)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(10);

  const memory = (previousTurns ?? [])
    .reverse()
    .map((turn) => `Patient: ${turn.message}\nAssistant: ${turn.response}`)
    .join("\n\n")
    .slice(-6000);

  const result = await generateHealthEducationText({
    prompt: buildHealthPrompt("chat", parsed.data.message, memory),
  });

  await supabase.from("ai_conversations").insert({
    user_id: auth.userId,
    session_id: sessionId,
    message: parsed.data.message,
    response: result.text,
    context_type: "general",
    token_count: Math.ceil((parsed.data.message.length + result.text.length) / 4),
  });

  return apiOk({
    sessionId,
    response: result.text,
    reply: result.text,
    disclaimer: getAiDisclaimer(),
    mode: result.mode,
  });
}
