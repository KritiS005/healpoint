import { redirect } from "next/navigation";

import { PatientDashboardShell } from "@/components/dashboard/patient-dashboard-shell";
import {
  getAppointments,
  getMedicalRecords,
  getPayments,
  getProfiles,
} from "@/lib/data/mock-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PatientDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/dashboard/patient");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  // Redirect based on role
  if (profile?.role === "doctor") redirect("/dashboard/doctor");
  if (profile?.role === "admin") redirect("/admin");
  if (profile?.role !== "patient") redirect("/dashboard");

  // Fetch all necessary data in parallel
  const [profiles, appointmentRows, recordRows, paymentRows] = await Promise.all([
    getProfiles(),
    getAppointments(),
    getMedicalRecords(),
    getPayments(),
  ]);

  // Data transformations
  const appointments = appointmentRows.map((appointment) => ({
    title: appointment.notes,
    doctor:
      profiles.find((p) => p.id === appointment.doctor_id)?.full_name ?? "Doctor",
    time: new Date(appointment.scheduled_at).toLocaleString("en", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    }),
    type: "Consultation",
    status: (appointment.status === "confirmed" ? "Confirmed" : "Pending") as
      | "Confirmed"
      | "Pending",
  }));

  const records = recordRows.map((record) => ({
    title: record.record_type,
    summary: record.ai_summary,
    date: new Date(record.uploaded_at).toLocaleDateString("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  }));

  const payments = paymentRows.map((payment) => ({
    label: `Consultation ${payment.id}`,
    amount: `$${payment.amount}`,
    status: payment.status,
  }));

  return (
    <PatientDashboardShell
      // Added fallback to "Patient" if full_name is null or missing
      userName={profile?.full_name?.split(" ")[0] ?? "Patient"}
      appointments={appointments}
      records={records}
      payments={payments}
    />
  );
}