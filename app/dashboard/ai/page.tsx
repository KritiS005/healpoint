import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardAIShell } from "@/components/ai/dashboard-ai-shell";

export default async function DashboardAIPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/dashboard/ai");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/auth/login");

  const backHref =
    profile.role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient";

  return <DashboardAIShell backHref={backHref} />;
}
