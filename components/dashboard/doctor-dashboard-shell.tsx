"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  Activity, BellRing, CalendarDays, ChevronRight, ClipboardPlus, 
  Clock3, FileStack, LogOut, Search, ShieldCheck, Sparkles, 
  Stethoscope, Users, Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// --- Types ---
export type AppointmentItem = {
  patient: string;
  time: string;
  type: string;
  note: string;
  status: "Confirmed" | "Pending";
};

export type PatientItem = {
  name: string;
  condition: string;
  nextVisit: string;
};

export type PrescriptionDraft = {
  title: string;
  patient: string;
  summary: string;
};

type DoctorDashboardShellProps = {
  doctorName: string;
  appointments: AppointmentItem[];
  patients: PatientItem[];
  drafts: PrescriptionDraft[]; // Required as per your page.tsx logic
};

const navItems = [
  { label: "Overview", icon: Activity, href: "#overview" },
  { label: "Calendar", icon: CalendarDays, href: "#schedule" },
  { label: "Patients", icon: Users, href: "#patients" },
  { label: "Prescriptions", icon: ClipboardPlus, href: "#prescriptions" },
  { label: "Availability", icon: Wallet, href: "#alerts" },
];

function DashboardStat({ title, value, hint, icon: Icon }: { title: string; value: string; hint: string; icon: any }) {
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

export function DoctorDashboardShell({ doctorName, appointments, patients, drafts }: DoctorDashboardShellProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = React.useState("overview");

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,196,196,0.1),_transparent_34%),linear-gradient(135deg,_#f8fdfd_0%,_#f4fbff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        {/* Sidebar remains the same */}
        <aside className="w-full lg:w-72 lg:shrink-0">
          {/* ... (Sidebar UI) ... */}
        </aside>

        <main className="flex-1 space-y-6">
          <header className="rounded-[28px] border border-border/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(16,196,196,0.1)] backdrop-blur">
            <h1 className="text-3xl font-semibold text-foreground">Good morning, {doctorName}</h1>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStat title="Appointments" value={appointments.length.toString()} hint="Scheduled" icon={CalendarDays} />
            <DashboardStat title="Active patients" value={patients.length.toString()} hint="In queue" icon={Users} />
            <DashboardStat title="Pending notes" value={drafts.length.toString()} hint="Ready for review" icon={FileStack} />
            <DashboardStat title="AI assistance" value={drafts.length.toString()} hint="Summaries prepared" icon={Sparkles} />
          </section>

          {/* ... rest of the section grids mapping appointments, patients, and drafts ... */}
        </main>
      </div>
    </div>
  );
}