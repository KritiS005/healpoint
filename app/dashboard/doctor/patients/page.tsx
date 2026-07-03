import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DoctorPatientsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/dashboard/doctor/patients");

  const { data: doctorRow } = await supabase
    .from("doctors")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  const { data, error } = doctorRow
    ? await supabase
        .from("appointments")
        .select("patients(id, profile_id, profiles(full_name))")
        .eq("doctor_id", doctorRow.id)
        .is("deleted_at", null)
    : { data: [], error: null };

  if (error) throw new Error("Could not load patients.");

  const seenIds = new Set<string>();
  const patients = (data ?? [])
    .flatMap((a) => {
      const p = Array.isArray((a as any).patients) ? (a as any).patients[0] : (a as any).patients;
      return p ? [p] : [];
    })
    .filter((p) => {
      if (seenIds.has(p.profile_id)) return false;
      seenIds.add(p.profile_id);
      return true;
    })
    .map((p) => ({
      id: p.id as string,
      name: p.profiles?.full_name ?? "Patient",
    }));

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
          <p className="mt-1 text-sm text-slate-600">
            All patients you have appointments with.
          </p>
        </header>

        <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-900">Patients ({patients.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patients.length === 0 ? (
              <p className="text-sm text-slate-500">No patients found.</p>
            ) : (
              patients.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/30 bg-white/50 px-4 py-3"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary/10 text-sm font-semibold text-secondary-foreground">
                    {p.name.charAt(0)}
                  </div>
                  <p className="text-sm font-medium text-slate-900">{p.name}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
