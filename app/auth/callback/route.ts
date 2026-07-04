import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") ?? "/dashboard";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error("[callback] exchangeCodeForSession error:", sessionError.message);
      return NextResponse.redirect(new URL("/auth/login?error=verification_failed", request.url));
    }

    const user = data?.user;

    if (user?.user_metadata?.role === "doctor") {
      // Use service client — bypasses RLS so insert always works regardless of
      // whether the session cookie is fully propagated in this route handler.
      const service = createServiceSupabaseClient();

      // Idempotency check: never insert a duplicate doctors row
      const { data: existing, error: checkError } = await service
        .from("doctors")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error("[callback] doctors existence check error:", checkError.message);
      }

      if (!existing && !checkError) {
        const meta = user.user_metadata;
        const fee = typeof meta.consultation_fee_paise === "number"
          ? meta.consultation_fee_paise
          : 50000;

        const { error: insertError } = await service.from("doctors").insert({
          profile_id: user.id,
          specialty: meta.specialty ?? "General Practice",
          bio: meta.bio ?? "",
          // license_number is required NOT NULL UNIQUE in schema — generate a stable unique value
          license_number: `HP-${user.id.replace(/-/g, "").slice(0, 12).toUpperCase()}`,
          consultation_fee: fee,
          verified: true,
          rating: 0,
        });

        if (insertError) {
          console.error("[callback] doctors insert error:", insertError.message);
        }
      }
    }
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
