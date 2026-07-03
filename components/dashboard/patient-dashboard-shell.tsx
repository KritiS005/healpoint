"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import {
  Activity,
  Bell,
  CalendarDays,
  ChevronRight,
  FileText,
  HeartPulse,
  Home,
  LogOut,
  MessageCircle,
  Plus,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type Appointment = {
  id: string;
  title: string;
  doctor: string;
  time: string;
  status: "Confirmed" | "Pending";
};
export type RecordItem = { id: string; title: string; summary: string; date: string };
export type PaymentItem = { id: string; label: string; amount: string; status: string };
export type NotificationItem = { id: string; message: string; createdAt: string };

type Props = {
  userName: string;
  appointments: Appointment[];
  records: RecordItem[];
  payments: PaymentItem[];
  notifications: NotificationItem[];
};

const navItems = [
  { label: "Overview", icon: Activity, href: "/dashboard/patient" },
  { label: "Appointments", icon: CalendarDays, href: "/dashboard/patient/appointments" },
  { label: "Records", icon: FileText, href: "/dashboard/patient/records" },
  { label: "AI Assistant", icon: MessageCircle, href: "/dashboard/ai" },
  { label: "Payments", icon: Wallet, href: "/dashboard/patient/payments" },
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
  notifications,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

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
            {/* ... aside content remains same ... */}
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <HeartPulse className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">HealPoint</p>
                <p className="text-sm text-muted-foreground">Patient workspace</p>
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

            <Link
              href="/booking"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" /> Book Consultation
            </Link>

            <div className="mt-2 flex gap-2">
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
             {/* ... header content ... */}
             <div className="flex items-start justify-between gap-4">
               <div>
                 <h1 className="text-3xl font-semibold text-slate-900">Welcome back, {userName}</h1>
                 <p className="mt-1 text-sm text-slate-600">Here&apos;s your health overview.</p>
               </div>
               {notifications.length > 0 && (
                 <div className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/50 px-3 py-2">
                   <Bell className="size-4 text-primary" />
                   <span className="text-sm font-medium text-slate-900">{notifications.length} unread</span>
                 </div>
               )}
             </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
             {/* ... StatCards ... */}
             <StatCard title="Appointments" value={appointments.length.toString()} hint="Upcoming" icon={CalendarDays} />
             <StatCard title="AI Summaries" value={records.filter((r) => r.summary !== "No AI summary available.").length.toString()} hint="Available" icon={Sparkles} />
             <StatCard title="Records" value={records.length.toString()} hint="Files" icon={FileText} />
             <StatCard title="Payments" value={payments.length.toString()} hint="Transactions" icon={Wallet} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
              <CardHeader><CardTitle className="text-slate-900">Upcoming appointments</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {appointments.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-white/30 bg-white/50 p-4">
                    <p className="font-semibold text-slate-900">{a.title}</p>
                    <p className="text-sm text-slate-600">{a.doctor}</p>
                    <p className="mt-1 text-xs text-slate-500">{a.time}</p>
                    <Badge
                      className="mt-2"
                      variant={a.status === "Confirmed" ? "success" : "neutral"}
                    >
                      {a.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ... Recent Records Card ... */}
            <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
              <CardHeader><CardTitle className="text-slate-900">Recent records</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {records.slice(0, 3).map((r) => (
                  <div key={r.id} className="rounded-2xl border border-white/30 bg-white/50 p-4">
                    <p className="font-semibold text-slate-900">{r.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{r.summary}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
            <CardHeader><CardTitle className="text-slate-900">Recent payments</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl border border-white/30 bg-white/50 px-4 py-3">
                  <p className="text-sm font-medium text-slate-900">{p.label}</p>
                  <Badge variant={p.status === "completed" ? "success" : "neutral"}>
                    {p.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}