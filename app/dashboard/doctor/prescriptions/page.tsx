import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DoctorPrescriptionsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/dashboard/doctor/prescriptions");

  const { data: doctorRow } = await supabase
    .from("doctors")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  const { data, error } = doctorRow
    ? await supabase
        .from("prescriptions")
        .select("id, content, issued_at, patients(profiles(full_name))")
        .eq("doctor_id", doctorRow.id)
        .order("issued_at", { ascending: false })
    : { data: [], error: null };

  if (error) throw new Error("Could not load prescriptions.");

  const prescriptions = (data ?? []).map((rx) => {
    const patientProfile = Array.isArray((rx as any).patients)
      ? (rx as any).patients[0]?.profiles
      : (rx as any).patients?.profiles;
    return {
      id: rx.id,
      patient: patientProfile?.full_name ?? "Patient",
      content: rx.content as string,
      issuedAt: new Date(rx.issued_at).toLocaleDateString("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  });

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Prescriptions</h1>
          <p className="mt-1 text-sm text-slate-600">
            All prescriptions you have issued.
          </p>
        </header>

        <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-900">Prescriptions ({prescriptions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {prescriptions.length === 0 ? (
              <p className="text-sm text-slate-500">No prescriptions found.</p>
            ) : (
              prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="rounded-2xl border border-white/30 bg-white/50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-semibold text-slate-900">{rx.patient}</p>
                    <p className="shrink-0 text-xs text-slate-500">{rx.issuedAt}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{rx.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
