import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

// Trusted app origin — never derived from request to prevent Host-header SSRF
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Allowlist of safe internal redirect paths — prevents open redirect / SSRF
const ALLOWED_REDIRECT_PREFIXES = ["/dashboard", "/booking", "/auth", "/"];

function sanitizeRedirect(redirectTo: string | null): string {
  if (!redirectTo) return "/dashboard";
  // Must be a relative path starting with /  and not //  (protocol-relative)
  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) return "/dashboard";
  const allowed = ALLOWED_REDIRECT_PREFIXES.some((p) => redirectTo === p || redirectTo.startsWith(p + "/") || redirectTo.startsWith(p + "?"));
  return allowed ? redirectTo : "/dashboard";
}

function sanitizeForLog(value: unknown): string {
  // Runtime coercion ensures non-string values cannot bypass sanitization
  return String(value)
    .replace(/\x1b[^a-zA-Z]*[a-zA-Z]/g, "") // all ANSI/VT escape sequences
    .replace(/[\r\n\t\x00]/g, " ")           // newlines, tabs, null bytes
    .slice(0, 200);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = sanitizeRedirect(requestUrl.searchParams.get("redirectTo"));

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error("[callback] exchangeCodeForSession error:", sanitizeForLog(sessionError.message));
      return NextResponse.redirect(new URL("/auth/login?error=verification_failed", APP_ORIGIN));
    }

    const user = data?.user;

    if (user?.user_metadata?.role === "doctor") {
      const service = createServiceSupabaseClient();

      const { data: existing, error: checkError } = await service
        .from("doctors")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error("[callback] doctors existence check error:", sanitizeForLog(checkError.message));
      }

      if (!existing && !checkError) {
        const meta = user.user_metadata;
        const fee = typeof meta.consultation_fee_paise === "number" ? meta.consultation_fee_paise : 50000;
        const specialty = sanitizeForLog(meta.specialty ?? "General Practice");
        const bio = sanitizeForLog(meta.bio ?? "");

        const { error: insertError } = await service.from("doctors").insert({
          profile_id: user.id,
          specialty,
          bio,
          consultation_fee: fee,
          verified: true,
          rating: 0,
        });

        if (insertError) {
          console.error("[callback] doctors insert error:", sanitizeForLog(String(insertError.message)));
        }
      }
    }
  }

  const safe = new URL(redirectTo, APP_ORIGIN);
  return NextResponse.redirect(new URL(safe.pathname + safe.search, APP_ORIGIN));
}
