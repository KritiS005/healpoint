import { redirect } from "next/navigation";

import { LightDnaBackground } from "@/components/system/light-dna-background";
import { SiteNav } from "@/components/system/site-nav";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/auth/login?redirectTo=/dashboard");

  const role = profile.role as "patient" | "doctor" | "admin";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(31,111,235,0.17),_transparent_30%),linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_48%,_#f7fbff_100%)] text-slate-800 selection:bg-[#1f6feb]/20 selection:text-[#1f6feb]">
      {/* Same overlay as landing page */}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.45)_0%,_transparent_35%,_rgba(255,255,255,0.18)_70%,_transparent_100%)]" />

      {/* Same 3-D DNA animation as landing page */}
      <LightDnaBackground />

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <SiteNav role={role} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
