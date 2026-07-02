"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  HeartPulse,
  LogOut,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAppointments,
  getMedicalRecords,
  getPayments,
  getPatientProfile,
  getProfiles,
} from "@/lib/data/mock-data";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Appointment = {
  title: string;
  doctor: string;
  time: string;
  type: string;
  status: "Confirmed" | "Pending";
};

type RecordItem = {
  title: string;
  summary: string;
  date: string;
};

type PaymentItem = {
  label: string;
  amount: string;
  status: string;
};

type PatientDashboardShellProps = {
  userName?: string;
  appointments?: Appointment[];
  records?: RecordItem[];
  payments?: PaymentItem[];
};

const navItems = [
  { label: "Overview", icon: Activity, href: "#overview" },
  { label: "Appointments", icon: CalendarDays, href: "#appointments" },
  { label: "Reports", icon: FileText, href: "#reports" },
  { label: "AI Assistant", icon: MessageCircle, href: "#ai-assistant" },
  { label: "Payments", icon: Wallet, href: "#payments" },
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
    <Card className="border-border/70 bg-white/80 shadow-sm backdrop-blur">
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

export function PatientDashboardShell({
  userName,
  appointments,
  records,
  payments,
}: PatientDashboardShellProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = React.useState("overview");
  const [resolvedUserName, setResolvedUserName] = React.useState(userName ?? "Asha");
  const [resolvedAppointments, setResolvedAppointments] = React.useState<Appointment[]>(appointments ?? []);
  const [resolvedRecords, setResolvedRecords] = React.useState<RecordItem[]>(records ?? []);
  const [resolvedPayments, setResolvedPayments] = React.useState<PaymentItem[]>(payments ?? []);

  React.useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      const profile = await getPatientProfile();
      const profiles = await getProfiles();
      const appointmentRows = await getAppointments();
      const recordRows = await getMedicalRecords();
      const paymentRows = await getPayments();

      if (!mounted) return;

      setResolvedUserName(userName ?? profile.full_name.split(" ")[0] ?? "Asha");
      setResolvedAppointments(
        appointments ??
          appointmentRows.map((appointment) => ({
            title: appointment.notes,
            doctor: profiles.find((profile) => profile.id === appointment.doctor_id)?.full_name ?? "Doctor",
            time: new Date(appointment.scheduled_at).toLocaleString("en", {
              weekday: "short",
              hour: "numeric",
              minute: "2-digit",
            }),
            type: "Consultation",
            status: appointment.status === "confirmed" ? "Confirmed" : "Pending",
          })),
      );
      setResolvedRecords(
        records ??
          recordRows.map((record) => ({
            title: record.record_type,
            summary: record.ai_summary,
            date: new Date(record.uploaded_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }),
          })),
      );
      setResolvedPayments(
        payments ??
          paymentRows.map((payment) => ({
            label: `Consultation ${payment.id}`,
            amount: `$${payment.amount}`,
            status: payment.status,
          })),
      );
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, [appointments, payments, records, userName]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(31,111,235,0.09),_transparent_32%),linear-gradient(135deg,_#f8fbff_0%,_#f4f8ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <aside className="w-full lg:w-72 lg:shrink-0">
          <div className="rounded-[28px] border border-border/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(31,111,235,0.09)] backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <HeartPulse className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">HealPoint</p>
                <p className="text-sm text-muted-foreground">Patient workspace</p>
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
                        ? "bg-primary text-primary-foreground shadow-sm"
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

            <div className="mt-6 rounded-3xl border border-primary/10 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="size-4 text-primary" />
                Secure care overview
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your records stay protected while the AI assistant offers non-diagnostic explanations.
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header id="overview" className="rounded-[28px] border border-border/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(31,111,235,0.09)] backdrop-blur sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Patient Dashboard</p>
                <h1 className="mt-2 text-3xl font-semibold text-foreground">Welcome back, {resolvedUserName}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Review upcoming care, access your report summaries, and explore AI-guided health education.
                </p>
              </div>
              <Link href="/" className={buttonVariants({ variant: "default", size: "default" })}>
                Back to home
              </Link>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStat title="Upcoming visits" value="2" hint="Next in 2 days" icon={CalendarDays} />
            <DashboardStat title="AI explanations" value="4" hint="Saved to timeline" icon={Sparkles} />
            <DashboardStat title="Reports shared" value="3" hint="Ready for review" icon={FileText} />
            <DashboardStat title="Active care plan" value="1" hint="Current prescription" icon={Stethoscope} />
          </section>

          <section id="appointments" className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <Card className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming appointments</CardTitle>
                    <CardDescription>Current care schedule and visit details.</CardDescription>
                  </div>
                  <Badge variant="neutral">Mock data</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {resolvedAppointments.map((appointment) => (
                  <div key={appointment.title} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{appointment.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{appointment.doctor}</p>
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

            <Card className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>AI Assistant preview</CardTitle>
                <CardDescription>Sample health education from the upcoming module.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    “What does this report mean in simple language?”
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm text-muted-foreground">AI</p>
                  <p className="mt-1 text-sm leading-6 text-foreground">
                    This summary highlights the main values and suggests talking with your care team for confirmation.
                  </p>
                </div>
                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  Educational use only. This does not diagnose or replace professional medical advice.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="reports" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Recent medical records</CardTitle>
                <CardDescription>Stored documents and AI summaries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {resolvedRecords.map((record) => (
                  <div key={record.title} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 p-4">
                    <div>
                      <p className="font-semibold text-foreground">{record.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{record.summary}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{record.date}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card id="payments" className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Payment overview</CardTitle>
                <CardDescription>Upcoming and completed billing items.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {resolvedPayments.map((payment) => (
                  <div key={payment.label} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 p-4">
                    <div>
                      <p className="font-semibold text-foreground">{payment.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{payment.status}</p>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{payment.amount}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
          <section id="ai-assistant" className="rounded-[28px] border border-border/70 bg-white/85 p-5 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Need a quick explanation?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Open the AI assistant for non-diagnostic support anytime.</p>
              </div>
              <Link href="/ai" className={buttonVariants({ variant: "default", size: "sm" })}>
                Open AI assistant
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
