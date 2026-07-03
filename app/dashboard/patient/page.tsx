import { redirect } from "next/navigation";

import { PatientDashboardShell } from "@/components/dashboard/patient-dashboard-shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PatientDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/dashboard/patient");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "doctor") redirect("/dashboard/doctor");
  if (profile?.role === "admin") redirect("/admin");
  if (profile?.role !== "patient") redirect("/dashboard");

  const { data: patientRow } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  const patientId = patientRow?.id ?? null;

  const [appointmentsResult, recordsResult, paymentsResult, notificationsResult] =
    await Promise.all([
      patientId
        ? supabase
            .from("appointments")
            .select("id, scheduled_at, status, notes, doctors(profiles(full_name))")
            .eq("patient_id", patientId)
            .is("deleted_at", null)
            .order("scheduled_at", { ascending: true })
            .limit(10)
        : Promise.resolve({ data: [], error: null }),
      patientId
        ? supabase
            .from("medical_records")
            .select("id, record_type, uploaded_at, ai_summary")
            .eq("patient_id", patientId)
            .order("uploaded_at", { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [], error: null }),
      patientId
        ? supabase
            .from("payments")
            .select("id, amount, status, created_at, appointment_id")
            .in(
              "appointment_id",
              await supabase
                .from("appointments")
                .select("id")
                .eq("patient_id", patientId)
                .then(({ data }) => (data ?? []).map((r) => r.id)),
            )
            .order("created_at", { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("notifications")
        .select("id, message, read, created_at")
        .eq("user_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const appointments = (appointmentsResult.data ?? []).map((a) => {
    const doctorProfile = Array.isArray((a as any).doctors)
      ? (a as any).doctors[0]?.profiles
      : (a as any).doctors?.profiles;
    return {
      id: a.id,
      title: a.notes ?? "Consultation",
      doctor: doctorProfile?.full_name ?? "Doctor",
      time: new Date(a.scheduled_at).toLocaleString("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      status: (a.status === "confirmed" ? "Confirmed" : "Pending") as "Confirmed" | "Pending",
    };
  });

  const records = (recordsResult.data ?? []).map((r) => ({
    id: r.id,
    title: r.record_type ?? "Record",
    summary: r.ai_summary ?? "No AI summary available.",
    date: new Date(r.uploaded_at).toLocaleDateString("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  }));

  const payments = (paymentsResult.data ?? []).map((p) => ({
    id: p.id,
    label: `Appointment ${p.appointment_id?.slice(0, 8) ?? "—"}`,
    amount: `₹${(p.amount / 100).toFixed(2)}`,
    status: p.status as string,
  }));

  const notifications = (notificationsResult.data ?? []).map((n) => ({
    id: n.id,
    message: n.message as string,
    createdAt: n.created_at as string,
  }));

  return (
    <PatientDashboardShell
      userName={profile?.full_name?.split(" ")[0] ?? "Patient"}
      appointments={appointments}
      records={records}
      payments={payments}
      notifications={notifications}
    />
  );
}
