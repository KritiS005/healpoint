import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PatientPaymentsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/dashboard/patient/payments");

  const { data: patientRow } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  let payments: { id: string; label: string; amount: string; status: string; date: string }[] = [];

  if (patientRow) {
    const { data: apptIds } = await supabase
      .from("appointments")
      .select("id")
      .eq("patient_id", patientRow.id);

    const ids = (apptIds ?? []).map((a) => a.id);

    if (ids.length > 0) {
      const { data, error } = await supabase
        .from("payments")
        .select("id, amount, status, created_at, appointment_id")
        .in("appointment_id", ids)
        .order("created_at", { ascending: false });

      if (error) throw new Error("Could not load payments.");

      payments = (data ?? []).map((p) => ({
        id: p.id,
        label: `Appointment ${(p.appointment_id as string)?.slice(0, 8) ?? "—"}`,
        amount: `₹${(p.amount / 100).toFixed(2)}`,
        status: p.status as string,
        date: new Date(p.created_at).toLocaleDateString("en", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }));
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Payments</h1>
          <p className="mt-1 text-sm text-slate-600">Your billing and payment history.</p>
        </header>

        <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-900">Transactions ({payments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payments.length === 0 ? (
              <p className="text-sm text-slate-500">No payments found.</p>
            ) : (
              payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-2xl border border-white/30 bg-white/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.label}</p>
                    <p className="text-xs text-slate-500">{p.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">{p.amount}</span>
                    <Badge
                      variant={
                        p.status === "completed"
                          ? "success"
                          : p.status === "failed"
                            ? "danger"
                            : "neutral"
                      }
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
