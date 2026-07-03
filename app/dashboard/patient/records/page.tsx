import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PatientRecordsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/dashboard/patient/records");

  const { data: patientRow } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  const { data, error } = patientRow
    ? await supabase
        .from("medical_records")
        .select("id, record_type, uploaded_at, ai_summary, file_url")
        .eq("patient_id", patientRow.id)
        .order("uploaded_at", { ascending: false })
    : { data: [], error: null };

  if (error) throw new Error("Could not load medical records.");

  const records = (data ?? []).map((r) => ({
    id: r.id,
    title: r.record_type ?? "Record",
    summary: r.ai_summary ?? "No AI summary available.",
    date: new Date(r.uploaded_at).toLocaleDateString("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    fileUrl: r.file_url as string | null,
  }));

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Medical Records</h1>
          <p className="mt-1 text-sm text-slate-600">
            Your uploaded reports and AI-generated summaries.
          </p>
        </header>

        <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-900">Records ({records.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {records.length === 0 ? (
              <p className="text-sm text-slate-500">No records found.</p>
            ) : (
              records.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-white/30 bg-white/50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{r.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{r.date}</p>
                    </div>
                    {r.fileUrl && (
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-medium text-primary hover:underline"
                      >
                        View file
                      </a>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{r.summary}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
