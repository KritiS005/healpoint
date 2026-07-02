import { redirect } from "next/navigation";

import { DoctorDashboardShell } from "@/components/dashboard/doctor-dashboard-shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DoctorDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/dashboard/doctor");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (profile?.role === "patient") {
    redirect("/dashboard/patient");
  }

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  if (profile?.role !== "doctor") {
    redirect("/dashboard");
  }

  return <DoctorDashboardShell />;
}
