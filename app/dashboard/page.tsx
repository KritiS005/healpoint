import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/dashboard");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (!profile?.role) {
    redirect("/auth/login?redirectTo=/dashboard");
  }

  if (profile.role === "doctor") {
    redirect("/dashboard/doctor");
  }

  if (profile.role === "admin") {
    redirect("/admin");
  }

  redirect("/dashboard/patient");
}
