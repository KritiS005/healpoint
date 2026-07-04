"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  ClipboardPlus,
  FileStack,
  Home,
  LogOut,
  MessageCircle,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const SPECIALTIES = [
  "General Practice", "Cardiology", "Neurology", "Pediatrics",
  "Dermatology", "Orthopedics", "Gynecology", "Psychiatry", "ENT", "Ophthalmology",
];

export type AppointmentItem = {
  id: string;
  patient: string;
  time: string;
  note: string;
  status: "Confirmed" | "Pending";
};
export type PatientItem = { id: string; name: string };
export type PrescriptionDraft = { id: string; title: string; patient: string; summary: string };

type DoctorProfile = {
  specialty: string;
  bio: string;
  consultationFee: number; // paise
  rating: number;
};

type Props = {
  doctorName: string;
  appointments: AppointmentItem[];
  patients: PatientItem[];
  drafts: PrescriptionDraft[];
  doctorProfile: DoctorProfile;
};

const navItems = [
  { label: "Overview", icon: Activity, href: "/dashboard/doctor" },
  { label: "Schedule", icon: CalendarDays, href: "/dashboard/doctor/appointments" },
  { label: "Patients", icon: Users, href: "/dashboard/doctor/patients" },
  { label: "Prescriptions", icon: ClipboardPlus, href: "/dashboard/doctor/prescriptions" },
  { label: "AI Assistant", icon: MessageCircle, href: "/dashboard/ai" },
];

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{hint}</p>
        </div>
        <div className="rounded-2xl bg-secondary/10 p-3 text-secondary-foreground">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DoctorDashboardShell({ doctorName, appointments, patients, drafts, doctorProfile }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // Profile edit state
  const [specialty, setSpecialty] = React.useState(doctorProfile.specialty);
  const [bio, setBio] = React.useState(doctorProfile.bio);
  const [feeRupees, setFeeRupees] = React.useState(
    doctorProfile.consultationFee > 0 ? String(Math.round(doctorProfile.consultationFee / 100)) : ""
  );
  const [saving, setSaving] = React.useState(false);
  const [saveMsg, setSaveMsg] = React.useState<{ ok: boolean; text: string } | null>(null);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaveMsg({ ok: false, text: "Not authenticated." }); setSaving(false); return; }

    const feeInPaise = Math.round(parseFloat(feeRupees || "0") * 100);
    const { error } = await supabase
      .from("doctors")
      .update({ specialty, bio, consultation_fee: feeInPaise })
      .eq("profile_id", user.id);

    if (error) {
      console.error("[DoctorDashboard] profile update error:", error.message);
      setSaveMsg({ ok: false, text: "Failed to save. Please try again." });
    } else {
      setSaveMsg({ ok: true, text: "Profile updated successfully." });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <aside className="w-full lg:w-72 lg:shrink-0">
          <div className="bg-white/40 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-secondary/10 text-secondary-foreground">
                <Stethoscope className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">HealPoint</p>
                <p className="text-sm text-muted-foreground">Doctor workspace</p>
              </div>
            </div>

            <nav className="mt-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active ? "dash-nav-active" : "dash-nav-idle",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="size-4" />
                      {item.label}
                    </span>
                    <ChevronRight className="size-4 opacity-50" />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 flex gap-2">
              <Link
                href="/"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border/70 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
              >
                <Home className="size-3.5" /> Home
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border/70 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
              >
                <LogOut className="size-3.5" /> Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl p-6">
            <h1 className="text-3xl font-semibold text-slate-900">
              Good morning, Dr. {doctorName}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Here&apos;s your clinical overview for today.
            </p>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Appointments" value={appointments.length.toString()} hint="Scheduled" icon={CalendarDays} />
            <StatCard title="Active patients" value={patients.length.toString()} hint="In queue" icon={Users} />
            <StatCard title="Pending notes" value={drafts.length.toString()} hint="Ready for review" icon={FileStack} />
            <StatCard title="AI summaries" value={drafts.length.toString()} hint="Prepared" icon={Sparkles} />
          </section>

          {/* ── Profile edit ── */}
          <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-slate-900">Your profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Specialty</label>
                <select
                  className="flex h-10 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Consultation fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={feeRupees}
                  onChange={(e) => setFeeRupees(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save profile"}
                </button>
                {saveMsg && (
                  <p className={`text-sm font-medium ${saveMsg.ok ? "text-emerald-600" : "text-red-600"}`}>
                    {saveMsg.text}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle className="text-slate-900">Today&apos;s schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No appointments found.</p>
                ) : (
                  appointments.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-2xl border border-white/30 bg-white/50 p-4"
                    >
                      <p className="font-semibold text-slate-900">{a.patient}</p>
                      <p className="text-sm text-slate-600">{a.time}</p>
                      {a.note && (
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{a.note}</p>
                      )}
                      <Badge
                        className="mt-2"
                        variant={a.status === "Confirmed" ? "success" : "neutral"}
                      >
                        {a.status}
                      </Badge>
                    </div>
                  ))
                )}
                <Link
                  href="/dashboard/doctor/appointments"
                  className="block text-center text-sm font-medium text-primary hover:underline"
                >
                  View full schedule →
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle className="text-slate-900">Recent patients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No patients found.</p>
                ) : (
                  patients.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/30 bg-white/50 px-4 py-3"
                    >
                      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary/10 text-xs font-semibold text-secondary-foreground">
                        {p.name.charAt(0)}
                      </div>
                      <p className="text-sm font-medium text-slate-900">{p.name}</p>
                    </div>
                  ))
                )}
                <Link
                  href="/dashboard/doctor/patients"
                  className="block text-center text-sm font-medium text-primary hover:underline"
                >
                  View all patients →
                </Link>
              </CardContent>
            </Card>
          </section>

          <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-slate-900">Recent prescriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {drafts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No prescriptions found.</p>
              ) : (
                drafts.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-2xl border border-white/30 bg-white/50 p-4"
                  >
                    <p className="font-semibold text-slate-900">{d.title}</p>
                    <p className="text-sm text-slate-600">{d.patient}</p>
                    {d.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{d.summary}</p>
                    )}
                  </div>
                ))
              )}
              <Link
                href="/dashboard/doctor/prescriptions"
                className="block text-center text-sm font-medium text-primary hover:underline"
              >
                View all prescriptions →
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
