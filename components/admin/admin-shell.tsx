"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  ClipboardList,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type VerificationItem = {
  name: string;
  specialty: string;
  email: string;
  status: "Pending" | "Approved";
};

type AdminActivity = {
  title: string;
  detail: string;
  time: string;
};

type AdminShellProps = {
  verifications?: VerificationItem[];
  activities?: AdminActivity[];
};

const defaultVerifications: VerificationItem[] = [
  { name: "Dr. Nisha Rao", specialty: "Dermatology", email: "nisha@healpoint.health", status: "Pending" },
  { name: "Dr. Arjun Malik", specialty: "Orthopedics", email: "arjun@healpoint.health", status: "Approved" },
  { name: "Dr. Sana Iqbal", specialty: "Psychiatry", email: "sana@healpoint.health", status: "Pending" },
];

const defaultActivities: AdminActivity[] = [
  { title: "New doctor application", detail: "Dr. Nisha Rao submitted credentials for review.", time: "5 mins ago" },
  { title: "Booking spike", detail: "Consultation bookings increased by 12% this week.", time: "1 hr ago" },
  { title: "AI explanation volume", detail: "Report explainer usage reached 80 interactions today.", time: "3 hrs ago" },
];

const navItems = [
  { label: "Overview", icon: Activity, href: "#overview" },
  { label: "Doctors", icon: UserCheck, href: "#doctors" },
  { label: "Users", icon: Users, href: "#users" },
  { label: "Reports", icon: ClipboardList, href: "#reports" },
];

function AdminStat({
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

export function AdminShell({ verifications = defaultVerifications, activities = defaultActivities }: AdminShellProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = React.useState("overview");

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <aside className="w-full lg:w-72 lg:shrink-0">
          <div className="bg-white/40 backdrop-blur-md border border-white/20 shadow-sm rounded-3xl p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">HealPoint</p>
                <p className="text-sm text-slate-600">Admin workspace</p>
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
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/30 px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white/50 hover:text-slate-900"
            >
              <LogOut className="size-4" />
              Logout
            </button>

            <div className="mt-6 rounded-3xl border border-primary/10 bg-white/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Sparkles className="size-4 text-primary" />
                Platform oversight
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Review doctor credentials, monitor engagement, and keep the healthcare experience trustworthy.
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header id="overview" className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Admin Panel</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">Platform overview and doctor verification</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Review pending doctor applications, monitor key platform activity, and keep the experience secure and trustworthy.
                </p>
              </div>
              <Link href="/" className={buttonVariants({ variant: "default", size: "default" })}>
                Back to home
              </Link>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminStat title="Verified doctors" value="128" hint="3 pending review" icon={UserCheck} />
            <AdminStat title="Active users" value="8.4k" hint="+14% this month" icon={Users} />
            <AdminStat title="AI interactions" value="1.2k" hint="Today" icon={Sparkles} />
            <AdminStat title="Open issues" value="4" hint="Needs attention" icon={AlertTriangle} />
          </section>

          <section id="doctors" className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900">Doctor verification queue</CardTitle>
                    <CardDescription className="text-slate-600">Pending and approved doctor applications.</CardDescription>
                  </div>
                  <Badge variant="neutral">Mock data</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {verifications.map((verification) => (
                  <div key={verification.email} className="flex items-center justify-between rounded-2xl border border-white/30 bg-white/50 p-4">
                    <div>
                      <p className="font-semibold text-slate-900">{verification.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{verification.specialty} · {verification.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={verification.status === "Approved" ? "emerald" : "warning"}>{verification.status}</Badge>
                      <button type="button" className="rounded-full border border-white/30 p-2 text-slate-500">
                        <ArrowUpRight className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card id="users" className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle className="text-slate-900">Recent admin activity</CardTitle>
                <CardDescription className="text-slate-600">Recent platform events and moderation updates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.title} className="rounded-2xl border border-white/30 bg-white/50 p-4">
                    <p className="font-semibold text-slate-900">{activity.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{activity.detail}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{activity.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
          <section id="reports" className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Moderation queue</h2>
                <p className="mt-1 text-sm text-slate-600">Review reports and trust signals from a single view.</p>
              </div>
              <Link href="/admin" className={buttonVariants({ variant: "default", size: "sm" })}>
                Refresh overview
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
