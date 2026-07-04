"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createBooking } from "@/app/actions/booking";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BookingDoctor = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  specialty: string;
  bio: string;
  rating: number;
  consultationFee: number; // paise (e.g. 65000 = ₹650)
};

type AppointmentType = "video_call" | "in_person";
type PaymentMethod = "online" | "cash";

type Slot = {
  id: string;
  label: string;
  isoDate: string; // full ISO-8601 datetime sent to the server action
  mode: AppointmentType;
};

type BookingShellProps = {
  doctors: BookingDoctor[];
  specialties: string[];
  headerCta: React.ReactNode;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate the next 4 available slots starting from the next full hour. */
function generateSlots(doctorId: string): Slot[] {
  const base = new Date();
  base.setMinutes(0, 0, 0);
  base.setHours(base.getHours() + 1);

  return [0, 1, 2, 3].map((offset) => {
    const d = new Date(base.getTime() + offset * 90 * 60 * 1000);
    const label = d.toLocaleString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    return {
      id: `${doctorId}-${offset}`,
      label,
      isoDate: d.toISOString(),
      mode: offset % 2 === 0 ? "video_call" : "in_person",
    };
  });
}

function formatFee(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

const STEPS = ["Select doctor", "Choose time & type", "Confirm booking"] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BookingShell({ doctors, specialties, headerCta }: BookingShellProps) {
  const router = useRouter();

  // Wizard state
  const [activeStep, setActiveStep] = React.useState(0);
  const [selectedSpecialty, setSelectedSpecialty] = React.useState("All");
  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = React.useState<string>("");
  const [appointmentType, setAppointmentType] = React.useState<AppointmentType>("video_call");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("online");

  // Submission state
  const [isPending, setIsPending] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [confirmedId, setConfirmedId] = React.useState<string | null>(null);
  const [confirmedFee, setConfirmedFee] = React.useState<number | null>(null);

  // Business rule: video_call always requires online payment
  React.useEffect(() => {
    if (appointmentType === "video_call") {
      setPaymentMethod("online");
    }
  }, [appointmentType]);

  // Derived
  const filteredDoctors = React.useMemo(
    () => selectedSpecialty === "All" ? doctors : doctors.filter((d) => d.specialty === selectedSpecialty),
    [doctors, selectedSpecialty],
  );

  const activeDoctorId =
    filteredDoctors.some((d) => d.id === selectedDoctorId)
      ? selectedDoctorId
      : (filteredDoctors[0]?.id ?? "");

  const selectedDoctor =
    filteredDoctors.find((d) => d.id === activeDoctorId) ?? filteredDoctors[0] ?? null;

  const slots = React.useMemo(
    () => (selectedDoctor ? generateSlots(selectedDoctor.id) : []),
    [selectedDoctor],
  );

  const activeSlotId =
    slots.some((s) => s.id === selectedSlotId)
      ? selectedSlotId
      : (slots[0]?.id ?? "");

  const selectedSlot = slots.find((s) => s.id === activeSlotId) ?? slots[0] ?? null;

  // Navigation
  const goNext = () => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => {
    setSubmitError(null);
    setActiveStep((s) => Math.max(s - 1, 0));
  };

  // Submission
  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setIsPending(true);
    setSubmitError(null);

    const result = await createBooking({
      doctorId: selectedDoctor.id,
      scheduledAt: selectedSlot.isoDate,
      appointmentType,
      paymentMethod,
      durationMinutes: 30,
    });

    setIsPending(false);

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }

    setConfirmedId(result.appointmentId);
    setConfirmedFee(result.fee);
    setActiveStep(2);
  };

  // Glass card class reused throughout
  const glass = "bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl p-6";
  const glassInner = "rounded-2xl border border-white/30 bg-white/50 p-4";

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">

        {/* ── Header ── */}
        <header className={glass}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Booking System
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Book a trusted consultation
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Choose a verified doctor, pick a time, select your consultation type, and confirm
                your visit in minutes.
              </p>
            </div>
            {headerCta}
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">

          {/* ── Wizard card ── */}
          <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-slate-900">Appointment flow</CardTitle>
                  <CardDescription className="text-slate-600">
                    Follow the steps below to complete your booking.
                  </CardDescription>
                </div>
                <Badge variant="neutral">Live data</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Step indicators */}
              <div className="flex flex-wrap gap-2">
                {STEPS.map((step, index) => (
                  <div
                    key={step}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium",
                      activeStep >= index
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-white/30 bg-white/40 text-slate-500",
                    )}
                  >
                    {index + 1}. {step}
                  </div>
                ))}
              </div>

              {/* ── Step 0: Select doctor ── */}
              {activeStep === 0 && (
                <div className="space-y-4">
                  {/* Specialty filter — dynamic from real DB data */}
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSpecialty(s)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          selectedSpecialty === s
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-white/30 bg-white/40 text-slate-600 hover:border-primary/20",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Doctor list */}
                  {filteredDoctors.length === 0 ? (
                    <p className="text-sm text-slate-500">No doctors available in this specialty yet.</p>
                  ) : (
                    <div className="grid gap-3">
                      {filteredDoctors.map((doctor) => (
                        <button
                          key={doctor.id}
                          type="button"
                          onClick={() => {
                            setSelectedDoctorId(doctor.id);
                            setSelectedSlotId("");
                          }}
                          className={cn(
                            "rounded-2xl border p-4 text-left transition-colors",
                            activeDoctorId === doctor.id
                              ? "border-primary/20 bg-primary/5"
                              : "border-white/30 bg-white/40 hover:border-primary/20",
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <Stethoscope className="size-4 text-primary" />
                                <p className="font-semibold text-slate-900">{doctor.fullName}</p>
                              </div>
                              <p className="mt-1 text-sm text-slate-600">
                                {doctor.specialty} · {doctor.rating.toFixed(1)} ★
                              </p>
                              <p className="mt-2 text-sm leading-6 text-slate-600">{doctor.bio}</p>
                            </div>
                            <Badge variant="cyan">{formatFee(doctor.consultationFee)}</Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 1: Choose time, type & payment ── */}
              {activeStep === 1 && selectedDoctor && (
                <div className="space-y-4">
                  {/* Selected doctor summary */}
                  <div className={glassInner}>
                    <p className="text-sm font-semibold text-slate-900">Selected doctor</p>
                    <p className="mt-1 text-sm text-slate-700">{selectedDoctor.fullName}</p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {selectedDoctor.specialty} · {formatFee(selectedDoctor.consultationFee)}
                    </p>
                  </div>

                  {/* Slot picker */}
                  <div className="grid gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          setSelectedSlotId(slot.id);
                          setAppointmentType(slot.mode);
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border p-4 text-left transition-colors",
                          activeSlotId === slot.id
                            ? "border-primary/20 bg-primary/5"
                            : "border-white/30 bg-white/40 hover:border-primary/20",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <CalendarDays className="size-4 text-primary" />
                          <span className="font-medium text-slate-900">{slot.label}</span>
                        </div>
                        <Badge variant="neutral">
                          {slot.mode === "video_call" ? "Video" : "In-person"}
                        </Badge>
                      </button>
                    ))}
                  </div>

                  {/* Appointment type selector */}
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-900">Consultation type</p>
                    <div className="grid grid-cols-2 gap-3">
                      {(["video_call", "in_person"] as AppointmentType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAppointmentType(type)}
                          className={cn(
                            "flex items-center gap-2 rounded-2xl border p-3 text-sm font-medium transition-colors",
                            appointmentType === type
                              ? "border-primary/20 bg-primary/10 text-primary"
                              : "border-white/30 bg-white/40 text-slate-600 hover:border-primary/20",
                          )}
                        >
                          <Video className="size-4" />
                          {type === "video_call" ? "Video call" : "In-person"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment method selector */}
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-900">Payment method</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("online")}
                        className={cn(
                          "flex items-center gap-2 rounded-2xl border p-3 text-sm font-medium transition-colors",
                          paymentMethod === "online"
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-white/30 bg-white/40 text-slate-600 hover:border-primary/20",
                        )}
                      >
                        <CreditCard className="size-4" />
                        Online
                      </button>

                      {/* Cash is disabled for video_call */}
                      <button
                        type="button"
                        disabled={appointmentType === "video_call"}
                        onClick={() => setPaymentMethod("cash")}
                        className={cn(
                          "flex items-center gap-2 rounded-2xl border p-3 text-sm font-medium transition-colors",
                          appointmentType === "video_call"
                            ? "cursor-not-allowed border-white/20 bg-white/20 text-slate-400 opacity-50"
                            : paymentMethod === "cash"
                              ? "border-primary/20 bg-primary/10 text-primary"
                              : "border-white/30 bg-white/40 text-slate-600 hover:border-primary/20",
                        )}
                      >
                        <Banknote className="size-4" />
                        Cash
                        {appointmentType === "video_call" && (
                          <span className="ml-auto text-[10px] text-slate-400">N/A</span>
                        )}
                      </button>
                    </div>
                    {appointmentType === "video_call" && (
                      <p className="mt-2 text-xs text-slate-500">
                        Video consultations require online payment.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 2: Confirmation ── */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  {confirmedId ? (
                    <>
                      <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/60 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                          <CheckCircle2 className="size-4" />
                          Booking confirmed
                        </div>
                        <p className="mt-2 text-sm text-emerald-700">
                          Your appointment has been saved.{" "}
                          {paymentMethod === "online"
                            ? "Complete payment from your dashboard to lock the slot."
                            : "Pay at the clinic on the day of your visit."}
                        </p>
                      </div>
                      <div className={glassInner}>
                        <p className="text-sm font-semibold text-slate-900">Summary</p>
                        <div className="mt-3 space-y-1.5 text-sm text-slate-700">
                          <p>Doctor: {selectedDoctor?.fullName}</p>
                          <p>Specialty: {selectedDoctor?.specialty}</p>
                          <p>Time: {selectedSlot?.label}</p>
                          <p>Type: {appointmentType === "video_call" ? "Video call" : "In-person"}</p>
                          <p>Payment: {paymentMethod === "online" ? "Online (Razorpay)" : "Cash at clinic"}</p>
                          {confirmedFee !== null && (
                            <p className="font-semibold text-slate-900">
                              Fee: {formatFee(confirmedFee)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Link
                        href="/dashboard/patient"
                        className={buttonVariants({ variant: "default", size: "sm" })}
                      >
                        Go to dashboard
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className={cn(glassInner, "border-primary/15 bg-primary/5")}>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <CheckCircle2 className="size-4 text-primary" />
                          Ready to confirm
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          Review your details below and confirm your booking.
                        </p>
                      </div>
                      <div className={glassInner}>
                        <p className="text-sm font-semibold text-slate-900">Summary</p>
                        <div className="mt-3 space-y-1.5 text-sm text-slate-700">
                          <p>Doctor: {selectedDoctor?.fullName}</p>
                          <p>Specialty: {selectedDoctor?.specialty}</p>
                          <p>Time: {selectedSlot?.label}</p>
                          <p>Type: {appointmentType === "video_call" ? "Video call" : "In-person"}</p>
                          <p>Payment: {paymentMethod === "online" ? "Online (Razorpay)" : "Cash at clinic"}</p>
                          {selectedDoctor && (
                            <p className="font-semibold text-slate-900">
                              Fee: {formatFee(selectedDoctor.consultationFee)}
                            </p>
                          )}
                        </div>
                      </div>
                      {submitError && (
                        <p className="rounded-2xl border border-red-200/60 bg-red-50/60 px-4 py-3 text-sm text-red-700">
                          {submitError}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── Navigation ── */}
              {!confirmedId && (
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={activeStep === 0}
                    className={cn(
                      "rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white/50",
                      activeStep === 0 && "pointer-events-none opacity-40",
                    )}
                  >
                    Back
                  </button>

                  {activeStep < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!selectedDoctor}
                      className={buttonVariants({ variant: "default", size: "sm" })}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={isPending || !selectedDoctor || !selectedSlot}
                      className={buttonVariants({ variant: "default", size: "sm" })}
                    >
                      {isPending ? "Booking…" : "Confirm booking"}
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Right sidebar ── */}
          <div className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle className="text-slate-900">Why patients choose HealPoint</CardTitle>
                <CardDescription className="text-slate-600">
                  Secure, clear, and guided care coordination.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Verified specialists",
                    body: "Every doctor is credential-checked before appearing on the platform.",
                  },
                  {
                    icon: CreditCard,
                    title: "Flexible payment",
                    body: "Pay online via Razorpay or choose cash for in-person visits.",
                  },
                  {
                    icon: Sparkles,
                    title: "AI-assisted follow-up",
                    body: "After your visit, upload reports for plain-language AI explanations.",
                  },
                ].map(({ icon: Icon, title, body }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 rounded-2xl border border-white/30 bg-white/50 p-4"
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-semibold text-slate-900">{title}</p>
                      <p className="mt-1 text-sm text-slate-600">{body}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-lg border border-white/20 shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle className="text-slate-900">Booking tips</CardTitle>
                <CardDescription className="text-slate-600">
                  What to expect from the next steps.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
                <div className="flex items-start gap-2">
                  <Clock3 className="mt-1 size-4 shrink-0 text-primary" />
                  <span>Choose a slot that fits your schedule and care type.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Video className="mt-1 size-4 shrink-0 text-primary" />
                  <span>
                    Video consultations open 10 minutes before the scheduled time in your dashboard.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-1 size-4 shrink-0 text-primary" />
                  <span>Your fee is locked server-side — no price changes after booking.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
