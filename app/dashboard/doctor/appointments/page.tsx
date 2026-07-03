import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DoctorAppointmentsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/dashboard/doctor/appointments");

  const { data: doctorRow } = await supabase
    .from("doctors")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  const { data, error } = doctorRow
    ? await supabase
        .from("appointments")
        .select("id, scheduled_at, status, notes, patients(profiles(full_name))")
        .eq("doctor_id", doctorRow.id)
        .is("deleted_at", null)
        .order("scheduled_at", { ascending: true })
    : { data: [], error: null };

  if (error) throw new Error("Could not load appointments.");

  const appointments = (data ?? []).map((a) => {
    const patientProfile = Array.isArray((a as any).patients)
      ? (a as any).patients[0]?.profiles
      : (a as any).patients?.profiles;
    return {
      id: a.id,
      patient: patientProfile?.full_name ?? "Patient",
      time: new Date(a.scheduled_at).toLocaleString("en", {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      note: a.notes ?? "",
      status: a.status as string,
    };
  });

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Schedule</h1>
          <p className="mt-1 text-sm text-slate-600">All your patient appointments.</p>
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
                    <p className="font-semibold text-slate-900">{a.patient}</p>
                    <p className="text-sm text-slate-600">{a.time}</p>
                    {a.note && (
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{a.note}</p>
                    )}
                  </div>
                  <Badge
                    variant={
                      a.status === "confirmed"
                        ? "success"
                        : a.status === "cancelled"
                          ? "danger"
                          : "neutral"
                    }
                  >
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
