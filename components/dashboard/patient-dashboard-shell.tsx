"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  Activity, CalendarDays, ChevronRight, Clock3, FileText, HeartPulse, 
  LogOut, MessageCircle, ShieldCheck, Sparkles, Stethoscope, Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// --- Types ---
export type Appointment = { title: string; doctor: string; time: string; type: string; status: "Confirmed" | "Pending" };
export type RecordItem = { title: string; summary: string; date: string };
export type PaymentItem = { label: string; amount: string; status: string };

type PatientDashboardShellProps = {
  userName: string;
  appointments: Appointment[];
  records: RecordItem[];
  payments: PaymentItem[];
};

const navItems = [
  { label: "Overview", icon: Activity, href: "#overview" },
  { label: "Appointments", icon: CalendarDays, href: "#appointments" },
  { label: "Reports", icon: FileText, href: "#reports" },
  { label: "AI Assistant", icon: MessageCircle, href: "#ai-assistant" },
  { label: "Payments", icon: Wallet, href: "#payments" },
];

function DashboardStat({ title, value, hint, icon: Icon }: { title: string; value: string; hint: string; icon: any }) {
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

export function PatientDashboardShell({ userName, appointments, records, payments }: PatientDashboardShellProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = React.useState("overview");

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  // Helper to safely map status to your existing badge variants
  const getBadgeVariant = (status: string) => {
    return status === "Confirmed" ? "default" : "neutral"; // "neutral" is a standard variant in your list
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
                  <a key={item.label} href={item.href} onClick={() => setActiveSection(itemKey)} 
                    className={cn("flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors", activeSection === itemKey ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground")}>
                    <span className="flex items-center gap-2"><Icon className="size-4" />{item.label}</span>
                    <ChevronRight className="size-4" />
                  </a>
                );
              })}
            </nav>

            <button type="button" onClick={handleLogout} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border/70 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground">
              <LogOut className="size-4" /> Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header id="overview" className="rounded-[28px] border border-border/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(31,111,235,0.09)] backdrop-blur">
            <h1 className="text-3xl font-semibold text-foreground">Welcome back, {userName}</h1>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStat title="Appointments" value={appointments.length.toString()} hint="Scheduled" icon={CalendarDays} />
            <DashboardStat title="AI summaries" value={records.length.toString()} hint="Available" icon={Sparkles} />
            <DashboardStat title="Records" value={records.length.toString()} hint="Files" icon={FileText} />
            <DashboardStat title="Billing" value={payments.length.toString()} hint="Payments" icon={Wallet} />
          </section>

          <section id="appointments" className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <Card className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
              <CardHeader><CardTitle>Upcoming appointments</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {appointments.map((a, i) => (
                  <div key={i} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.doctor}</p>
                    {/* Using the safe variant mapper here */}
                    <Badge className="mt-2" variant={getBadgeVariant(a.status) as any}>{a.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}