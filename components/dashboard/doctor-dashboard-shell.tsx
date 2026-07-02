"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  Activity,
  BellRing,
  CalendarDays,
  ChevronRight,
  ClipboardPlus,
  Clock3,
  FileStack,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppointments, getDoctors, getPatients, getProfiles } from "@/lib/data/mock-data";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AppointmentItem = {
  patient: string;
  time: string;
  type: string;
  note: string;
  status: "Confirmed" | "Pending";
};

type PatientItem = {
  name: string;
  condition: string;
  nextVisit: string;
};

type PrescriptionDraft = {
  title: string;
  patient: string;
  summary: string;
};

type DoctorDashboardShellProps = {
  doctorName?: string;
  appointments?: AppointmentItem[];
  patients?: PatientItem[];
  drafts?: PrescriptionDraft[];
};

const defaultDrafts: PrescriptionDraft[] = [
  { title: "Medication guidance", patient: "Asha R.", summary: "Suggested next steps for ongoing treatment plan." },
  { title: "Lab review note", patient: "Nadia K.", summary: "Summarized allergy response and aftercare suggestions." },
];

const navItems = [
  { label: "Overview", icon: Activity, href: "#overview" },
  { label: "Calendar", icon: CalendarDays, href: "#schedule" },
  { label: "Patients", icon: Users, href: "#patients" },
  { label: "Prescriptions", icon: ClipboardPlus, href: "#prescriptions" },
  { label: "Availability", icon: Wallet, href: "#alerts" },
];

function DashboardStat({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: typeof Activity;
}) {
  return (
    <Card className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DoctorDashboardShell({
  doctorName,
  appointments,
  patients,
  drafts = defaultDrafts,
}: DoctorDashboardShellProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = React.useState("overview");
  const [resolvedDoctorName, setResolvedDoctorName] = React.useState(doctorName ?? "Dr. Priya");
  const [resolvedAppointments, setResolvedAppointments] = React.useState<AppointmentItem[]>(appointments ?? []);
  const [resolvedPatients, setResolvedPatients] = React.useState<PatientItem[]>(patients ?? []);

  React.useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      const profiles = await getProfiles();
      const doctorRows = await getDoctors();
      const patientRows = await getPatients();
      const appointmentRows = await getAppointments();

      if (!mounted) return;

      setResolvedDoctorName(doctorName ?? (doctorRows[0]?.bio ? "Dr. Priya" : "Dr. Priya"));
      setResolvedAppointments(
        appointments ??
          appointmentRows.map((appointment) => ({
            patient: profiles.find((profile) => profile.id === "profile-patient-001")?.full_name ?? "Patient",
            time: new Date(appointment.scheduled_at).toLocaleString("en", {
              weekday: "short",
              hour: "numeric",
              minute: "2-digit",
            }),
            type: "Consultation",
            note: appointment.notes,
            status: appointment.status === "confirmed" ? "Confirmed" : "Pending",
          })),
      );
      setResolvedPatients(
        patients ??
          patientRows.map((patient) => ({
            name: profiles.find((profile) => profile.id === patient.profile_id)?.full_name ?? "Patient",
            condition: patient.medical_history_summary,
            nextVisit: "Today",
          })),
      );
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, [appointments, doctorName, patients]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,196,196,0.1),_transparent_34%),linear-gradient(135deg,_#f8fdfd_0%,_#f4fbff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <aside className="w-full lg:w-72 lg:shrink-0">
          <div className="rounded-[28px] border border-border/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(16,196,196,0.1)] backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-secondary/20 text-secondary-foreground">
                <Stethoscope className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">HealPoint</p>
                <p className="text-sm text-muted-foreground">Doctor workspace</p>
              </div>
            </div>

            <nav className="mt-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const itemKey = item.label.toLowerCase().replace(/\s+/g, "-");
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setActiveSection(itemKey)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                      activeSection === itemKey
                        ? "bg-secondary text-secondary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="size-4" />
                      {item.label}
                    </span>
                    <ChevronRight className="size-4" />
                  </a>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border/70 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            >
              <LogOut className="size-4" />
              Logout
            </button>

            <div className="mt-6 rounded-3xl border border-secondary/20 bg-secondary/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="size-4 text-secondary-foreground" />
                Practice essentials
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Organize appointments, patient history, and prescription planning from a single view.
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header id="overview" className="rounded-[28px] border border-border/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(16,196,196,0.1)] backdrop-blur sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary-foreground">Doctor Dashboard</p>
                <h1 className="mt-2 text-3xl font-semibold text-foreground">Good morning, {resolvedDoctorName}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Monitor your schedule, review patients, and prepare care notes in a clear, mock workflow.
                </p>
              </div>
              <Link href="/" className={buttonVariants({ variant: "default", size: "default" })}>
                Back to home
              </Link>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStat title="Today’s appointments" value="6" hint="4 confirmed" icon={CalendarDays} />
            <DashboardStat title="Active patients" value="24" hint="3 follow-ups due" icon={Users} />
            <DashboardStat title="Pending notes" value="2" hint="Ready for review" icon={FileStack} />
            <DashboardStat title="AI assistance" value="5" hint="Summaries prepared" icon={Sparkles} />
          </section>

          <section id="schedule" className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
            <Card className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today’s schedule</CardTitle>
                    <CardDescription>Upcoming appointments and visit context.</CardDescription>
                  </div>
                  <Badge variant="neutral">Mock data</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {resolvedAppointments.map((appointment) => (
                  <div key={appointment.patient} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{appointment.patient}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{appointment.note}</p>
                      </div>
                      <Badge variant="cyan">{appointment.status}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="size-4" />
                        {appointment.time}
                      </span>
                      <span>{appointment.type}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card id="patients" className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Patient queue</CardTitle>
                  <button type="button" className="rounded-full border border-border/70 p-2 text-muted-foreground">
                    <Search className="size-4" />
                  </button>
                </div>
                <CardDescription>Priority follow-ups and upcoming visits.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {resolvedPatients.map((patient) => (
                  <div key={patient.name} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{patient.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{patient.condition}</p>
                      </div>
                      <Badge variant="emerald">{patient.nextVisit}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section id="prescriptions" className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Prescription drafts</CardTitle>
                <CardDescription>Structured notes prepared for the next consultation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {drafts.map((draft) => (
                  <div key={draft.title} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{draft.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{draft.patient}</p>
                      </div>
                      <Badge variant="warning">Draft</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{draft.summary}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card id="alerts" className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Care alerts</CardTitle>
                <CardDescription>Important updates for the day.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BellRing className="size-4 text-primary" />
                    2 new report summaries ready
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Review the latest AI-assisted report explanations before your afternoon consults.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm font-semibold text-foreground">Availability update</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Your evening slots remain open for booking and can be updated from the availability view.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
