import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/admin");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: doctors } = await supabase
    .from("doctors")
    .select("id, specialty, verified, profiles(full_name)")
    .order("created_at", { ascending: false });

  const verifications = (doctors ?? []).map((doctor) => {
    const doctorProfile = Array.isArray(doctor.profiles) ? doctor.profiles[0] : doctor.profiles;
    return {
      id: doctor.id,
      name: doctorProfile?.full_name ?? "Doctor",
      specialty: doctor.specialty,
      status: doctor.verified ? "Approved" as const : "Pending" as const,
    };
  });

  return <AdminShell verifications={verifications} />;
}
