import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PatientAppointmentsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/dashboard/patient/appointments");

  const { data: patientRow } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  const { data, error } = patientRow
    ? await supabase
        .from("appointments")
        .select("id, scheduled_at, status, notes, doctors(profiles(full_name))")
        .eq("patient_id", patientRow.id)
        .is("deleted_at", null)
        .order("scheduled_at", { ascending: true })
    : { data: [], error: null };

  if (error) throw new Error("Could not load appointments.");

  const appointments = (data ?? []).map((a) => {
    const doctorProfile = Array.isArray((a as any).doctors)
      ? (a as any).doctors[0]?.profiles
      : (a as any).doctors?.profiles;
    return {
      id: a.id,
      title: a.notes ?? "Consultation",
      doctor: doctorProfile?.full_name ?? "Doctor",
      time: new Date(a.scheduled_at).toLocaleString("en", {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      status: a.status as string,
    };
  });

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl p-6">
          <h1 className="text-2xl font-semibold text-slate-900">My Appointments</h1>
          <p className="mt-1 text-sm text-slate-600">All your scheduled consultations.</p>
        </header>

        <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-900">Appointments ({appointments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointments.length === 0 ? (
              <p className="text-sm text-slate-500">No appointments found.</p>
            ) : (
              appointments.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/30 bg-white/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{a.title}</p>
                    <p className="text-sm text-slate-600">{a.doctor}</p>
                    <p className="text-xs text-slate-500">{a.time}</p>
                  </div>
                  <Badge variant={a.status === "confirmed" ? "success" : a.status === "cancelled" ? "danger" : "neutral"}>
                    {a.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
