"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, CreditCard, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDoctors } from "@/lib/data/mock-data";
import { cn } from "@/lib/utils";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating: string;
  fee: string;
  languages: string[];
  availability: string[];
  focus: string;
};

const fallbackDoctor: Doctor = {
  id: "",
  name: "Loading doctors...",
  specialty: "General care",
  rating: "0.0",
  fee: "$0",
  languages: [],
  availability: [],
  focus: "Medical specialists will appear here as soon as the matching list loads.",
};

type Slot = {
  id: string;
  label: string;
  time: string;
  mode: "Video" | "In-person";
};

const specialties = ["All", "Cardiology", "Neurology", "Pediatrics"] as const;

const slotsByDoctor: Record<string, Slot[]> = {
  "doctor-ananya": [
    { id: "a1", label: "Today · 5:30 PM", time: "Today 5:30 PM", mode: "Video" },
    { id: "a2", label: "Tomorrow · 11:00 AM", time: "Tomorrow 11:00 AM", mode: "In-person" },
  ],
  "doctor-rahim": [
    { id: "r1", label: "Today · 7:15 PM", time: "Today 7:15 PM", mode: "Video" },
    { id: "r2", label: "Tomorrow · 1:00 PM", time: "Tomorrow 1:00 PM", mode: "Video" },
  ],
  "doctor-meera": [
    { id: "m1", label: "Today · 6:00 PM", time: "Today 6:00 PM", mode: "Video" },
    { id: "m2", label: "Tomorrow · 4:30 PM", time: "Tomorrow 4:30 PM", mode: "In-person" },
  ],
};

const steps = ["Select doctor", "Choose time", "Confirm booking"];

export function BookingShell() {
  const [doctorOptions, setDoctorOptions] = React.useState<Doctor[]>([fallbackDoctor]);

  React.useEffect(() => {
    const loadDoctors = async () => {
      const doctorsFromData = await getDoctors();
      const mappedDoctors = doctorsFromData.map((doctor) => ({
        id: doctor.id,
        name: `Dr. ${doctor.profile_id === "profile-doctor-001" ? "Ananya Sen" : doctor.profile_id === "profile-doctor-002" ? "Rahim Khan" : "Meera Iyer"}`,
        specialty: doctor.specialty,
        rating: doctor.rating.toFixed(1),
        fee: doctor.specialty === "Cardiology" ? "$65" : doctor.specialty === "Neurology" ? "$72" : "$48",
        languages: doctor.specialty === "Cardiology" ? ["English", "Hindi"] : doctor.specialty === "Neurology" ? ["English", "Urdu"] : ["English", "Tamil"],
        availability: doctor.specialty === "Cardiology" ? ["Today · 5:30 PM", "Tomorrow · 11:00 AM"] : doctor.specialty === "Neurology" ? ["Today · 7:15 PM", "Tomorrow · 1:00 PM"] : ["Today · 6:00 PM", "Tomorrow · 4:30 PM"],
        focus: doctor.bio,
      }));
      if (mappedDoctors.length > 0) {
        setDoctorOptions(mappedDoctors);
      }
    };

    void loadDoctors();
  }, []);
  const [selectedSpecialty, setSelectedSpecialty] = React.useState<(typeof specialties)[number]>("All");
  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = React.useState<string>("");
  const [activeStep, setActiveStep] = React.useState(0);
  const [isConfirmed, setIsConfirmed] = React.useState(false);

  const filteredDoctors = React.useMemo(() => {
    if (selectedSpecialty === "All") return doctorOptions;
    return doctorOptions.filter((doctor) => doctor.specialty === selectedSpecialty);
  }, [doctorOptions, selectedSpecialty]);

  const activeDoctorId =
    filteredDoctors.some((doctor) => doctor.id === selectedDoctorId)
      ? selectedDoctorId
      : filteredDoctors[0]?.id ?? doctorOptions[0]?.id ?? "";
  const selectedDoctor = filteredDoctors.find((doctor) => doctor.id === activeDoctorId) ?? filteredDoctors[0] ?? doctorOptions[0] ?? fallbackDoctor;
  const activeSlotId =
    selectedDoctor && selectedDoctor.id && slotsByDoctor[selectedDoctor.id]?.some((slot) => slot.id === selectedSlotId)
      ? selectedSlotId
      : selectedDoctor && selectedDoctor.id
        ? slotsByDoctor[selectedDoctor.id]?.[0]?.id ?? ""
        : "";
  const selectedSlot = selectedDoctor && selectedDoctor.id
    ? slotsByDoctor[selectedDoctor.id]?.find((slot) => slot.id === activeSlotId) ?? slotsByDoctor[selectedDoctor.id]?.[0]
    : undefined;

  const goNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((step) => step + 1);
    }
  };

  const goBack = () => {
    if (activeStep > 0) {
      setActiveStep((step) => step - 1);
    }
  };

  const confirmBooking = () => {
    setIsConfirmed(true);
    setActiveStep(2);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(31,111,235,0.08),_transparent_30%),linear-gradient(135deg,_#f8fbff_0%,_#f4f8ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[28px] border border-border/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(31,111,235,0.08)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Booking System</p>
              <h1 className="mt-2 text-3xl font-semibold text-foreground">Book a trusted consultation</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Choose a doctor, pick a time, and confirm your visit in a guided mock booking flow that mirrors the PRD’s procedure.
              </p>
            </div>
            <Link href="/" className={buttonVariants({ variant: "default", size: "default" })}>
              Back to home
            </Link>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Appointment flow</CardTitle>
                  <CardDescription>Follow the steps below to complete a mock booking.</CardDescription>
                </div>
                <Badge variant="neutral">Mock data</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium",
                      activeStep === index || activeStep > index
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-border/70 bg-background/70 text-muted-foreground",
                    )}
                  >
                    {index + 1}. {step}
                  </div>
                ))}
              </div>

              {activeStep === 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty) => (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => setSelectedSpecialty(specialty)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          selectedSpecialty === specialty
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-border/70 bg-background/70 text-muted-foreground",
                        )}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3">
                    {filteredDoctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        type="button"
                        onClick={() => {
                          setSelectedDoctorId(doctor.id);
                          setSelectedSlotId(slotsByDoctor[doctor.id]?.[0]?.id ?? "");
                        }}
                        className={cn(
                          "rounded-2xl border p-4 text-left transition-colors",
                          activeDoctorId === doctor.id
                            ? "border-primary/20 bg-primary/5"
                            : "border-border/70 bg-background/70 hover:border-primary/15",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Stethoscope className="size-4 text-primary" />
                              <p className="font-semibold text-foreground">{doctor.name}</p>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{doctor.specialty} · {doctor.rating} rating</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{doctor.focus}</p>
                          </div>
                          <Badge variant="cyan">{doctor.fee}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeStep === 1 ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <p className="text-sm font-semibold text-foreground">Selected doctor</p>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedDoctor.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedDoctor.specialty} · {selectedDoctor.fee}</p>
                  </div>
                  <div className="grid gap-3">
                    {slotsByDoctor[selectedDoctor.id]?.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border p-4 text-left transition-colors",
                          activeSlotId === slot.id
                            ? "border-primary/20 bg-primary/5"
                            : "border-border/70 bg-background/70 hover:border-primary/15",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <CalendarDays className="size-4 text-primary" />
                          <span className="font-medium text-foreground">{slot.label}</span>
                        </div>
                        <Badge variant="neutral">{slot.mode}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeStep === 2 ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <CheckCircle2 className="size-4 text-primary" />
                      Booking ready to confirm
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      A secure test checkout is prepared for your selected consultation.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <p className="text-sm font-semibold text-foreground">Summary</p>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p>Doctor: {selectedDoctor.name}</p>
                      <p>Specialty: {selectedDoctor.specialty}</p>
                      <p>Time: {selectedSlot?.label}</p>
                      <p>Mode: {selectedSlot?.mode}</p>
                      <p>Fee: {selectedDoctor.fee}</p>
                    </div>
                  </div>
                  {isConfirmed ? (
                    <div className="rounded-2xl border border-success/20 bg-success/10 p-4 text-sm text-success">
                      Booking confirmed. Your appointment request has been saved in mock mode.
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={goBack}
                  className={cn("rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground", activeStep === 0 ? "pointer-events-none opacity-50" : "")}
                >
                  Back
                </button>
                {activeStep < steps.length - 1 ? (
                  <button type="button" onClick={goNext} className={buttonVariants({ variant: "default", size: "sm" })}>
                    Continue
                  </button>
                ) : (
                  <button type="button" onClick={confirmBooking} className={buttonVariants({ variant: "default", size: "sm" })}>
                    Confirm booking
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Why patients choose HealPoint</CardTitle>
                <CardDescription>Secure, clear, and guided care coordination.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                  <ShieldCheck className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Trusted specialist matching</p>
                    <p className="mt-1 text-sm text-muted-foreground">Verified doctors and easy filtering by specialty.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                  <CreditCard className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Test payment ready</p>
                    <p className="mt-1 text-sm text-muted-foreground">Checkout is mocked now and will become a real payment flow later.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                  <Sparkles className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">AI-assisted context</p>
                    <p className="mt-1 text-sm text-muted-foreground">Your booking summary prepares the later AI report experience.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-white/85 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Booking tips</CardTitle>
                <CardDescription>What to expect from the next steps.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Clock3 className="mt-1 size-4 text-primary" />
                  <span>Choose a slot that fits your schedule and care type.</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-1 size-4 text-primary" />
                  <span>All details are mock-only for now, but the UX follows the PRD’s booking flow.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
