import { redirect } from "next/navigation";

import { DoctorDashboardShell } from "@/components/dashboard/doctor-dashboard-shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DoctorDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/dashboard/doctor");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "patient") redirect("/dashboard/patient");
  if (profile?.role === "admin") redirect("/admin");
  if (profile?.role !== "doctor") redirect("/dashboard");

  const { data: doctorRow } = await supabase
    .from("doctors")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  const doctorId = doctorRow?.id ?? null;

  const [appointmentsResult, patientsResult, prescriptionsResult] = await Promise.all([
    doctorId
      ? supabase
          .from("appointments")
          .select("id, scheduled_at, status, notes, patients(profiles(full_name))")
          .eq("doctor_id", doctorId)
          .is("deleted_at", null)
          .order("scheduled_at", { ascending: true })
          .limit(10)
      : Promise.resolve({ data: [], error: null }),
    doctorId
      ? supabase
          .from("appointments")
          .select("patients(id, profile_id, profiles(full_name))")
          .eq("doctor_id", doctorId)
          .is("deleted_at", null)
          .limit(20)
      : Promise.resolve({ data: [], error: null }),
    doctorId
      ? supabase
          .from("prescriptions")
          .select("id, content, issued_at, patients(profiles(full_name))")
          .eq("doctor_id", doctorId)
          .order("issued_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const appointments = (appointmentsResult.data ?? []).map((a) => {
    const patientProfile = Array.isArray((a as any).patients)
      ? (a as any).patients[0]?.profiles
      : (a as any).patients?.profiles;
    return {
      id: a.id,
      patient: patientProfile?.full_name ?? "Patient",
      time: new Date(a.scheduled_at).toLocaleString("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      note: a.notes ?? "",
      status: (a.status === "confirmed" ? "Confirmed" : "Pending") as "Confirmed" | "Pending",
    };
  });

  // Deduplicate patients by profile_id
  const seenPatients = new Set<string>();
  const patients = (patientsResult.data ?? [])
    .flatMap((a) => {
      const p = Array.isArray((a as any).patients) ? (a as any).patients[0] : (a as any).patients;
      return p ? [p] : [];
    })
    .filter((p) => {
      if (seenPatients.has(p.profile_id)) return false;
      seenPatients.add(p.profile_id);
      return true;
    })
    .map((p) => ({
      id: p.id as string,
      name: p.profiles?.full_name ?? "Patient",
    }));

  const drafts = (prescriptionsResult.data ?? []).map((rx) => {
    const patientProfile = Array.isArray((rx as any).patients)
      ? (rx as any).patients[0]?.profiles
      : (rx as any).patients?.profiles;
    return {
      id: rx.id,
      title: `Prescription — ${new Date(rx.issued_at).toLocaleDateString("en", { month: "short", day: "numeric" })}`,
      patient: patientProfile?.full_name ?? "Patient",
      summary: rx.content?.slice(0, 120) ?? "",
    };
  });

  return (
    <DoctorDashboardShell
      doctorName={profile?.full_name?.split(" ").slice(-1)[0] ?? "Doctor"}
      appointments={appointments}
      patients={patients}
      drafts={drafts}
    />
  );
}
