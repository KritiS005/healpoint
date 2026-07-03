"use client";

import * as React from "react";
import Image from "next/image";
import {
  Brain,
  BriefcaseBusiness,
  ChevronDown,
  CheckCircle2,
  Clock3,
  Cloud,
  Database,
  HeartPulse,
  Languages,
  LockKeyhole,
  Mail,
  MessageCircle,
  ShieldCheck,
  SmilePlus,
  Sparkles,
  Stethoscope,
  Star,
  Smartphone,
  TabletSmartphone,
  Upload,
  UserRoundCheck,
} from "lucide-react";
import { motion } from "motion/react";

import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/card";
import { motionEasings, reveal } from "@/lib/design-system/motion";
import { cn } from "@/lib/utils";

type Metric = {
  label: string;
  value: number;
  suffix: string;
};

const trustMetrics: Metric[] = [
  { label: "Registered Doctors", value: 10000, suffix: "+" },
  { label: "Successful Consultations", value: 500000, suffix: "+" },
  { label: "Patient Satisfaction", value: 98, suffix: "%" },
  { label: "Partner Hospitals", value: 250, suffix: "+" },
];

const trustBadges = [
  "HIPAA Compliance",
  "GDPR Compliance",
  "End-to-End Encryption",
  "Verified Medical Professionals",
  "AI-Assisted Healthcare (non-diagnostic)",
];

const partnerLogos = ["Medica", "Northwell", "Apollo", "CareBridge", "Aster", "Fortis", "Narayana"];

const specialties = [
  {
    icon: HeartPulse,
    name: "Cardiology",
    description: "Heart health guidance and follow-up care.",
    availability: "Both",
    responseTime: "12 min",
    fee: "₹399",
  },
  {
    icon: Brain,
    name: "Neurology",
    description: "Neurological symptoms and specialist review.",
    availability: "Online",
    responseTime: "18 min",
    fee: "₹499",
  },
  {
    icon: Sparkles,
    name: "Dermatology",
    description: "Skin concerns, rashes, and treatment planning.",
    availability: "Both",
    responseTime: "9 min",
    fee: "₹299",
  },
  {
    icon: ShieldCheck,
    name: "Orthopedics",
    description: "Bone, joint, and mobility consultations.",
    availability: "Offline",
    responseTime: "24 min",
    fee: "₹449",
  },
  {
    icon: SmilePlus,
    name: "Pediatrics",
    description: "Child health support for families.",
    availability: "Both",
    responseTime: "11 min",
    fee: "₹349",
  },
  {
    icon: Brain,
    name: "Psychiatry",
    description: "Confidential mental health consultations.",
    availability: "Online",
    responseTime: "20 min",
    fee: "₹549",
  },
  {
    icon: SmilePlus,
    name: "Dentistry",
    description: "Dental care, pain review, and follow-ups.",
    availability: "Offline",
    responseTime: "28 min",
    fee: "₹249",
  },
  {
    icon: Stethoscope,
    name: "General Medicine",
    description: "Everyday symptoms and primary care support.",
    availability: "Both",
    responseTime: "7 min",
    fee: "₹199",
  },
];

const steps = [
  {
    title: "Register securely",
    description: "Create a protected patient profile with the details your care team needs.",
  },
  {
    title: "Find specialist",
    description: "Compare verified doctors by specialty, experience, language, and availability.",
  },
  {
    title: "Book consultation",
    description: "Choose online or in-person care with transparent timing and consultation fees.",
  },
  {
    title: "Receive AI-assisted explanation",
    description: "Review non-diagnostic summaries that make medical reports easier to discuss.",
  },
];

const doctors = [
  {
    name: "Dr. Ananya Sen",
    specialization: "Cardiologist",
    experience: "14 years",
    languages: ["English", "Hindi", "Bengali"],
    rating: "4.9",
    fee: "₹599",
    nextSlot: "Today, 5:30 PM",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 320'%3E%3Crect width='320' height='320' fill='%231a1510'/%3E%3Ccircle cx='160' cy='118' r='58' fill='%23b89048' fill-opacity='0.2'/%3E%3Cpath d='M70 292c16-68 58-102 90-102s74 34 90 102' fill='%23b89048' fill-opacity='0.5'/%3E%3C/svg%3E",
  },
  {
    name: "Dr. Rahim Khan",
    specialization: "Neurologist",
    experience: "16 years",
    languages: ["Hindi", "English", "Urdu"],
    rating: "4.8",
    fee: "₹649",
    nextSlot: "Tomorrow, 11:00 AM",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 320'%3E%3Crect width='320' height='320' fill='%2314141c'/%3E%3Ccircle cx='160' cy='116' r='56' fill='%23d4af37' fill-opacity='0.25'/%3E%3Cpath d='M68 292c18-66 58-100 92-100s74 34 92 100' fill='%23d4af37' fill-opacity='0.45'/%3E%3C/svg%3E",
  },
  {
    name: "Dr. Meera Iyer",
    specialization: "Pediatrician",
    experience: "12 years",
    languages: ["Tamil", "English", "Telugu", "Hindi"],
    rating: "4.9",
    fee: "₹449",
    nextSlot: "Today, 7:00 PM",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 320'%3E%3Crect width='320' height='320' fill='%23121512'/%3E%3Ccircle cx='160' cy='118' r='58' fill='%23f59e0b' fill-opacity='0.2'/%3E%3Cpath d='M72 292c18-68 58-102 88-102s70 34 88 102' fill='%23f59e0b' fill-opacity='0.45'/%3E%3C/svg%3E",
  },
];

const chatMessages = [
  {
    sender: "patient",
    text: "I uploaded my blood report. What does this report mean?",
    time: "10:24 AM",
  },
  {
    sender: "ai",
    text: "Here is a simple explanation of the highlighted values. A few markers are outside the usual reference range, which can happen for many reasons.",
    time: "10:24 AM",
  },
  {
    sender: "ai",
    text: "I cannot diagnose or replace your doctor. Please consult a physician for final interpretation and next steps.",
    time: "10:25 AM",
  },
];

const testimonials = [
  {
    name: "Priya Shah",
    city: "Mumbai",
    type: "Online cardiology consult",
    rating: "4.9",
    initials: "PS",
    review:
      "The report explanation helped me prepare better questions for my cardiologist. The doctor consultation still felt central and reassuring.",
  },
  {
    name: "Arjun Mehta",
    city: "Delhi",
    type: "In-person orthopedics",
    rating: "4.8",
    initials: "AM",
    review:
      "Booking was clear, the slot was accurate, and the specialist had all my history ready before I arrived.",
  },
  {
    name: "Nadia Rahman",
    city: "Kolkata",
    type: "Pediatric video visit",
    rating: "5.0",
    initials: "NR",
    review:
      "It felt calm and structured. I liked that the AI summary encouraged us to speak with the pediatrician instead of guessing.",
  },
  {
    name: "Vikram Rao",
    city: "Hyderabad",
    type: "Dermatology follow-up",
    rating: "4.9",
    initials: "VR",
    review:
      "The follow-up notes were easy to understand, and the dermatologist gave a practical care plan without rushing.",
  },
];

const securityBlocks = [
  {
    icon: LockKeyhole,
    title: "End-to-end encryption",
    description: "Consultation messages and sensitive files are protected in transit.",
  },
  {
    icon: Cloud,
    title: "Secure cloud storage",
    description: "Medical documents are stored with monitored access and resilient backups.",
  },
  {
    icon: UserRoundCheck,
    title: "Role-based access control",
    description: "Only authorized care team members can view patient information.",
  },
  {
    icon: CheckCircle2,
    title: "Patient consent management",
    description: "Patients stay in control of sharing permissions and care records.",
  },
  {
    icon: Database,
    title: "Data privacy compliance",
    description: "Privacy workflows support modern healthcare compliance expectations.",
  },
];

const faqs = [
  {
    question: "How do online consultations work?",
    answer:
      "Choose a specialist, select an available video slot, share relevant history, and join securely from your device.",
  },
  {
    question: "Can I book offline appointments?",
    answer:
      "Yes. Doctors who support clinic visits show in-person availability alongside online consultation slots.",
  },
  {
    question: "Is my data secure?",
    answer:
      "HealPoint uses encrypted transfer, protected storage, consent workflows, and role-based access for medical information.",
  },
  {
    question: "Does AI replace doctors?",
    answer:
      "No. AI only explains reports in simpler language and encourages doctor review for final interpretation.",
  },
  {
    question: "What is refund policy?",
    answer:
      "Refund eligibility depends on consultation status, doctor availability, and cancellation timing shown during booking.",
  },
  {
    question: "Can I get prescriptions online?",
    answer:
      "Licensed doctors may provide prescriptions online when clinically appropriate and allowed by local regulations.",
  },
  {
    question: "What about emergencies?",
    answer:
      "HealPoint is not for emergencies. Call local emergency services or visit the nearest emergency department immediately.",
  },
];

const footerLinks = [
  { label: "Careers", href: "mailto:care@healpoint.health?subject=Careers%20at%20HealPoint" },
  { label: "Privacy Policy", href: "#security" },
  { label: "Terms of Service", href: "#faq" },
  { label: "Accessibility", href: "#faq" },
  { label: "Emergency Disclaimer", href: "#about" },
];

function useCountUp(target: number) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    let animationFrame = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      animationFrame = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(animationFrame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        const start = performance.now();
        const duration = 1500;

        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);

          setValue(Math.round(target * eased));

          if (progress < 1) {
            animationFrame = requestAnimationFrame(animate);
          }
        };

        animationFrame = requestAnimationFrame(animate);
        observer.disconnect();
      },
      { threshold: 0.45 },
    );

    observer.observe(element);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [target]);

  return { ref, value };
}

function CountUpMetric({ metric }: { metric: Metric }) {
  const { ref, value } = useCountUp(metric.value);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-[0_18px_55px_rgba(31,111,235,0.08)] backdrop-blur-xl transition-all duration-300 hover:border-[#1f6feb]/35"
    >
      <p className="text-3xl font-semibold tracking-normal text-[#1f6feb]">
        <span ref={ref}>{value.toLocaleString()}</span>
        {metric.suffix}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{metric.label}</p>
    </motion.div>
  );
}

export function TrustSection() {
  return (
    <section id="trust" className="page-shell relative overflow-hidden py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(31,111,235,0.08),_transparent_42%)]" />
      <Reveal stagger className="relative z-10 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <motion.div variants={reveal} className="max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#1f6feb]">Trust System</p>
          <h2 className="text-section text-slate-800 font-bold leading-tight">
            Trusted by patients, backed by clinical excellence.
          </h2>
          <p className="text-body-relaxed mt-6 text-slate-600 leading-relaxed font-light">
            HealPoint connects patients with verified medical professionals,
            secure consultations, non-diagnostic AI-assisted report explanations, and a
            comprehensive trust network designed for safer, informed care.
          </p>
        </motion.div>

        <motion.div variants={reveal} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {trustMetrics.map((metric) => (
              <CountUpMetric key={metric.label} metric={metric} />
            ))}
          </div>

          <div className="glass-panel rounded-3xl p-5 border-[#1f6feb]/10">
            <div className="flex flex-wrap gap-2">
              {trustBadges.map((badge) => (
                <Badge key={badge} variant="glass" className="border-[#1f6feb]/20 text-[#1f6feb] bg-[#1f6feb]/5">
                  <CheckCircle2 className="size-3.5 mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      </Reveal>

      <Reveal className="mt-14 overflow-hidden border-y border-slate-200 py-6">
        <motion.div
          className="flex w-max gap-4"
          initial={{ x: 0 }}
          whileInView={{ x: -80 }}
          viewport={{ once: true }}
          transition={{ duration: 8, ease: motionEasings.premium }}
        >
          {[...partnerLogos, ...partnerLogos].map((partner, index) => (
            <div
              key={`${partner}-${index}`}
              className="grid h-14 min-w-40 place-items-center rounded-2xl border border-slate-200 bg-white/60 px-6 text-sm font-semibold text-slate-500 transition duration-500 hover:border-[#1f6feb]/40 hover:text-[#1f6feb]"
            >
              {partner}
            </div>
          ))}
        </motion.div>
      </Reveal>
    </section>
  );
}

export function SpecialtiesSection() {
  return (
    <section id="services" className="page-shell relative overflow-hidden py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle,_rgba(16,196,196,0.08),_transparent_70%)]" />
      <Reveal className="mb-10 max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#1f6feb]">Specialties</p>
        <h2 className="text-section text-slate-800 font-bold leading-tight">Specialist discovery for the care people actually need.</h2>
      </Reveal>

      <Reveal stagger className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 z-10 relative">
        {specialties.map((specialty) => {
          const Icon = specialty.icon;

          return (
            <motion.div key={specialty.name} variants={reveal} whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 180, damping: 20 }}>
              <PremiumCard className="group relative h-full overflow-hidden border border-white/80 bg-white/80 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-xl transition duration-300 hover:border-[#1f6feb]/40 hover:shadow-[0_24px_80px_rgba(31,111,235,0.12)]">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#1f6feb]/5 rounded-bl-full blur-xl pointer-events-none" />
                
                <div className="mb-5 grid size-11 place-items-center rounded-2xl bg-[#1f6feb]/10 text-[#1f6feb]">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 group-hover:text-[#1f6feb] transition-colors">{specialty.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-relaxed text-slate-600 font-light">{specialty.description}</p>
                
                <div className="mt-5 pt-4 border-t border-slate-100 grid gap-2 text-xs text-slate-500">
                  <p className="flex items-center justify-between gap-3">
                    <span>Availability</span>
                    <span className="font-medium text-slate-700">{specialty.availability}</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span>Response</span>
                    <span className="font-medium text-slate-700">{specialty.responseTime}</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span>Starts at</span>
                    <span className="font-medium text-[#1f6feb]">{specialty.fee}</span>
                  </p>
                </div>
              </PremiumCard>
            </motion.div>
          );
        })}
      </Reveal>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="page-shell relative overflow-hidden py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(31,111,235,0.07),_transparent_40%)]" />
      <Reveal className="mb-12 max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#1f6feb]">How it works</p>
        <h2 className="text-section text-slate-800 font-bold leading-tight">A clear path from symptom to specialist to next step.</h2>
      </Reveal>

      <Reveal stagger className="relative grid gap-5 lg:grid-cols-4 z-10">
        <div className="absolute left-6 right-6 top-8 hidden h-px bg-gradient-to-r from-transparent via-[#1f6feb]/25 to-transparent lg:block" />
        {steps.map((step, index) => (
          <motion.div key={step.title} variants={reveal} whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 180, damping: 20 }} className="relative">
            <PremiumCard className="h-full border border-white/80 bg-white/80 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-xl hover:border-[#1f6feb]/30 hover:shadow-[0_24px_80px_rgba(31,111,235,0.1)]">
              <div className="mb-6 flex items-center gap-4">
                <span className="grid size-14 place-items-center rounded-full border border-[#1f6feb]/35 bg-[#1f6feb]/10 text-sm font-semibold text-[#1f6feb] shadow-[0_0_15px_rgba(31,111,235,0.08)]">
                  {index + 1}
                </span>
                <span className="h-px flex-1 bg-slate-100 lg:hidden" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 font-light">{step.description}</p>
            </PremiumCard>
          </motion.div>
        ))}
      </Reveal>
    </section>
  );
}

export function FeaturedDoctorsSection() {
  return (
    <section id="doctors" className="page-shell relative overflow-hidden py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle,_rgba(31,111,235,0.08),_transparent_70%)]" />
      <Reveal className="mb-10 max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#1f6feb]">Doctors</p>
        <h2 className="text-section text-slate-800 font-bold leading-tight">Featured physicians with verified clinical expertise.</h2>
      </Reveal>

      <Reveal stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 z-10 relative">
        {doctors.map((doctor) => (
          <motion.div key={doctor.name} variants={reveal} whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 180, damping: 20 }}>
            <PremiumCard className="group h-full overflow-hidden border border-white/80 bg-white/80 p-0 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-300 hover:border-[#1f6feb]/35 hover:shadow-[0_24px_80px_rgba(31,111,235,0.12)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <Image
                  src={doctor.image}
                  alt={`${doctor.name} profile`}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                />
                <Badge variant="glass" className="absolute right-4 top-4 border-[#1f6feb]/20 text-[#1f6feb] bg-white/80">
                  <UserRoundCheck className="size-3.5 mr-1" />
                  Verified
                </Badge>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 group-hover:text-[#1f6feb] transition-colors">{doctor.name}</h3>
                    <p className="mt-1 text-xs text-[#1f6feb]/80 font-medium">{doctor.specialization}</p>
                  </div>
                  <Badge variant="cyan" className="border-[#1f6feb]/20">{doctor.rating}</Badge>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-600 font-light border-y border-slate-100 py-4">
                  <p className="flex items-center gap-2">
                    <Clock3 className="size-4 text-[#1f6feb]" />
                    {doctor.experience} experience
                  </p>
                  <p className="flex items-center gap-2">
                    <TabletSmartphone className="size-4 text-[#1f6feb]" />
                    {doctor.fee} consultation fee
                  </p>
                  <p className="flex items-center gap-2">
                    <LockKeyhole className="size-4 text-[#1f6feb]" />
                    Next available: <span className="text-emerald-600 font-medium">{doctor.nextSlot}</span>
                  </p>
                </div>

                <div className="mt-4">
                  <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                    <Languages className="size-3.5 text-[#1f6feb]" />
                    Languages
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((language, index) => (
                      <Badge
                        key={language}
                        variant={index === 0 ? "emerald" : "neutral"}
                        className={cn("bg-slate-50 border-slate-200 text-slate-600", index === 0 && "bg-emerald-50 border-emerald-200 text-emerald-700")}
                      >
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button asChild className="mt-6 w-full border-none bg-gradient-to-r from-[#1f6feb] to-[#10c4c4] text-white shadow-[0_8px_24px_rgba(31,111,235,0.22)] transition-all duration-300 hover:from-[#1a5fd4] hover:to-[#0eafaf] hover:shadow-[0_10px_28px_rgba(31,111,235,0.32)]">
                  <a href="/booking">Book Now</a>
                </Button>
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </Reveal>
    </section>
  );
}

export function AIShowcaseSection() {
  return (
    <section id="ai" className="page-shell relative overflow-hidden py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,196,196,0.09),_transparent_40%)]" />
      <Reveal stagger className="relative z-10 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div variants={reveal} className="max-w-2xl">
          <Badge variant="cyan" className="mb-5 border-[#1f6feb]/25 bg-[#1f6feb]/5 text-[#1f6feb] uppercase tracking-widest font-semibold text-[10px] px-3">
            <Sparkles className="size-3.5 mr-1" />
            Non-diagnostic AI support
          </Badge>
          <h2 className="text-section text-slate-800 font-bold leading-tight">
            Report explanations that support better doctor conversations.
          </h2>
          <p className="text-body-relaxed mt-6 text-slate-600 font-light leading-relaxed">
            HealPoint AI helps patients understand complex medical reports in plain, patient-friendly
            language. It does not diagnose, substitute for clinical guidance, or
            make care decisions.
          </p>
          <div className="mt-8 grid gap-4 text-sm text-slate-600">
            <p className="flex items-center gap-3">
              <Upload className="size-4.5 text-[#1f6feb]" />
              Upload medical records before or after booking.
            </p>
            <p className="flex items-center gap-3">
              <MessageCircle className="size-4.5 text-[#1f6feb]" />
              Get a simple summary of medical terms, ranges, and patterns.
            </p>
            <p className="flex items-center gap-3">
              <ShieldCheck className="size-4.5 text-[#1f6feb]" />
              Review reports interactively with your clinician.
            </p>
          </div>
        </motion.div>

        <motion.div variants={reveal} whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 180, damping: 20 }}>
          <div className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_20px_65px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">HealPoint AI Assistant</p>
                <p className="text-[10px] text-slate-500">Simplifying reports • Never diagnoses</p>
              </div>
              <Badge variant="emerald" className="bg-emerald-50 border-emerald-200 text-emerald-700">Secure</Badge>
            </div>

            <div className="grid min-h-[26rem] content-end gap-4 pt-4">
              {chatMessages.map((message) => (
                <motion.div
                  key={`${message.sender}-${message.time}-${message.text}`}
                  variants={reveal}
                  className={cn(
                     "max-w-[86%] rounded-2xl px-4 py-3.5 text-xs leading-relaxed",
                     message.sender === "patient"
                       ? "ml-auto bg-gradient-to-r from-[#1f6feb] to-[#10c4c4] text-white font-semibold"
                       : "mr-auto border border-slate-200 bg-white/80 text-slate-700 backdrop-blur-md",
                  )}
                >
                  <p>{message.text}</p>
                  <p
                    className={cn(
                      "mt-2 text-[9px] text-right",
                      message.sender === "patient" ? "text-white/60" : "text-slate-400",
                    )}
                  >
                    {message.time}
                  </p>
                </motion.div>
              ))}

              <div className="mr-auto flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-4 py-3.5 backdrop-blur-md">
                <span className="size-1.5 rounded-full bg-[#1f6feb] animate-pulse-soft" />
                <span className="size-1.5 rounded-full bg-[#1f6feb] animate-pulse-soft [animation-delay:160ms]" />
                <span className="size-1.5 rounded-full bg-[#1f6feb] animate-pulse-soft [animation-delay:320ms]" />
              </div>
            </div>
          </div>
        </motion.div>
      </Reveal>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 lg:py-28 relative">
      <div className="page-shell">
        <Reveal className="mb-12 max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#1f6feb]">Patient stories</p>
          <h2 className="text-section text-slate-800 font-bold leading-tight">
            Care experiences that feel measured, informed, and personal.
          </h2>
        </Reveal>
      </div>

      <Reveal className="overflow-hidden">
        <motion.div
          className="flex w-max snap-x gap-6 px-[max(1rem,calc((100vw-var(--page-max))/2))]"
          initial={{ x: 0 }}
          whileInView={{ x: -96 }}
          viewport={{ once: true }}
          transition={{ duration: 10, ease: motionEasings.premium }}
        >
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <PremiumCard
              key={`${testimonial.name}-${index}`}
              className="w-[min(22rem,calc(100vw-2rem))] snap-start p-6 hover:border-[#1f6feb]/30"
            >
              <div className="mb-5 flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-full bg-[#1f6feb]/10 border border-[#1f6feb]/25 text-sm font-semibold text-[#1f6feb] shadow-[0_0_12px_rgba(31,111,235,0.06)]">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 leading-tight">{testimonial.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{testimonial.city}</p>
                </div>
              </div>
              <Badge variant="neutral" className="bg-slate-50 border-slate-200 text-slate-600">{testimonial.type}</Badge>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <span className="flex text-[#1f6feb]">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="size-3.5 fill-current" />
                  ))}
                </span>
                <span>{testimonial.rating}</span>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-slate-600 font-light italic">&quot;{testimonial.review}&quot;</p>
            </PremiumCard>
          ))}
        </motion.div>
      </Reveal>
    </section>
  );
}

export function SecuritySection() {
  return (
    <section id="security" className="page-shell py-20 lg:py-28 relative">
      <Reveal className="relative overflow-hidden rounded-3xl border border-[#1f6feb]/12 bg-white/60 backdrop-blur-xl p-6 shadow-xl shadow-[#1f6feb]/8 lg:p-10 z-10">
        
        {/* Ambient dots */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute left-10 top-12 size-2 rounded-full bg-[#1f6feb] shadow-[0_0_12px_#1f6feb]" />
          <div className="absolute right-20 top-20 size-2 rounded-full bg-[#10c4c4] shadow-[0_0_12px_#10c4c4]" />
          <div className="absolute bottom-16 left-1/3 size-2 rounded-full bg-[#1f6feb] shadow-[0_0_12px_#1f6feb]" />
          <div className="absolute inset-x-20 top-24 h-px bg-gradient-to-r from-transparent via-[#1f6feb]/20 to-transparent" />
          <div className="absolute bottom-24 left-24 right-24 h-px bg-gradient-to-r from-transparent via-[#10c4c4]/20 to-transparent" />
        </div>

        <div className="relative">
          <div className="mb-10 max-w-3xl">
            <Badge variant="glass" className="mb-5 border-[#1f6feb]/25 bg-[#1f6feb]/5 text-[#1f6feb]">
              <LockKeyhole className="size-3.5 mr-1" />
              Security and privacy
            </Badge>
            <h2 className="text-section text-slate-800 font-bold leading-tight">
              Medical data protection designed around patient control.
            </h2>
          </div>

          <Reveal stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {securityBlocks.map((block) => {
              const Icon = block.icon;

              return (
                <motion.div key={block.title} variants={reveal}>
                  <PremiumCard className="h-full p-5 hover:border-[#1f6feb]/35">
                    <div className="mb-5 grid size-11 place-items-center rounded-2xl bg-[#1f6feb]/10 text-[#1f6feb]">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 leading-snug">{block.title}</h3>
                    <p className="mt-3 text-xs leading-relaxed text-slate-600 font-light">{block.description}</p>
                  </PremiumCard>
                </motion.div>
              );
            })}
          </Reveal>
        </div>
      </Reveal>
    </section>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState(0);

  return (
    <section id="faq" className="page-shell py-20 lg:py-28 relative">
      <Reveal className="mx-auto mb-12 max-w-3xl text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#1f6feb]">FAQ</p>
        <h2 className="text-section text-slate-800 font-bold leading-tight">Answers for patients, families, and care teams.</h2>
      </Reveal>

      <Reveal className="mx-auto grid max-w-4xl gap-4 z-10 relative">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={faq.question} className="glassmorphic-card overflow-hidden rounded-3xl">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-ring"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                <span className="font-semibold text-slate-800 group-hover:text-[#1f6feb] transition-colors text-base">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-[#1f6feb] transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 text-sm leading-relaxed text-slate-600 font-light border-t border-slate-100 pt-4">{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}

export function FinalCTASection() {
  return (
    <section id="consultation" className="page-shell py-20 lg:py-28 relative">
      <Reveal className="relative overflow-hidden rounded-3xl border border-[#1f6feb]/15 bg-white/70 backdrop-blur-xl px-6 py-20 text-center shadow-xl shadow-[#1f6feb]/8 lg:px-16 z-10">
        
        {/* Soft blur mesh */}
        <div className="absolute left-1/2 top-1/2 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-[#1f6feb]/8 to-[#10c4c4]/5 blur-[120px] pointer-events-none z-0" />
        
        <div className="relative mx-auto max-w-3xl z-10">
          <Badge variant="glass" className="mb-6 border-[#1f6feb]/25 bg-[#1f6feb]/5 text-[#1f6feb]">
            <HeartPulse className="size-3.5 mr-1.5" />
            HealPoint
          </Badge>
          <h2 className="text-title text-slate-800 font-extrabold leading-tight">Your Health Deserves Intelligent Care.</h2>
          <p className="text-body-relaxed mx-auto mt-6 max-w-2xl text-slate-600 font-light leading-relaxed">
            Take control of your healthcare journey with verified specialists,
            secure consultations, and AI assistance that keeps doctors at the
            center of your wellness decisions.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="bg-gradient-to-r from-[#1f6feb] to-[#10c4c4] hover:from-[#1a5fd4] hover:to-[#0eafaf] text-white font-semibold border-none shadow-[0_4px_20px_rgba(31,111,235,0.22)]">
              <a href="/booking">Book Your First Consultation</a>
            </Button>
            <Button asChild size="lg" variant="glass" className="border-[#1f6feb]/20 text-[#1f6feb] backdrop-blur-md hover:border-[#1f6feb]/40">
              <a href="/ai">Try the AI Assistant</a>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <section
      id="about"
      className="relative overflow-hidden border-t border-slate-200 bg-white/60 backdrop-blur-xl py-14"
    >
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <span className="absolute left-[12%] top-10 size-1.5 rounded-full bg-[#1f6feb]/60 animate-pulse-soft" />
        <span className="absolute right-[18%] top-24 size-1.5 rounded-full bg-[#10c4c4]/60 animate-pulse-soft [animation-delay:280ms]" />
        <span className="absolute bottom-12 left-[46%] size-1.5 rounded-full bg-[#1f6feb]/45 animate-pulse-soft [animation-delay:520ms]" />
      </div>
      
      <Reveal>
        <footer className="page-shell relative grid gap-10 text-sm text-slate-500 lg:grid-cols-[1.15fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-r from-[#1f6feb] to-[#10c4c4] text-sm font-bold text-white shadow-sm">
                H
              </span>
              <p className="font-semibold text-slate-800">HealPoint</p>
            </div>
            <p className="max-w-sm leading-relaxed font-light">
              Premium AI-assisted healthcare access for online and in-person care.
            </p>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-400">
              Not for emergencies. If you need urgent medical help, contact local
              emergency services immediately.
            </p>
          </div>

          <div className="grid gap-3">
            <p className="font-semibold text-slate-800">Company</p>
            {footerLinks.map((link) => (
              <a key={link.label} href={link.href} className="w-fit transition-colors hover:text-[#1f6feb] font-light">
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex gap-2">
              <Badge variant="neutral" className="bg-slate-50 border-slate-200 text-slate-500">LinkedIn</Badge>
              <Badge variant="neutral" className="bg-slate-50 border-slate-200 text-slate-500">X</Badge>
              <Badge variant="neutral" className="bg-slate-50 border-slate-200 text-slate-500">YouTube</Badge>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <p className="mb-3 font-semibold text-slate-800">Contact</p>
              <p className="flex items-center gap-2 font-light hover:text-[#1f6feb] transition-colors">
                <Mail className="size-4 text-[#1f6feb]" />
                care@healpoint.health
              </p>
            </div>
            <div>
              <p className="mb-3 font-semibold text-slate-800">Newsletter</p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Email address"
                  className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-slate-800 outline-none focus-ring focus:border-[#1f6feb]/40 text-xs"
                />
                <Button type="submit" size="sm" className="bg-[#1f6feb] hover:bg-[#1a5fd4] text-white font-semibold">
                  Join
                </Button>
              </form>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="glass" className="bg-slate-50 border-slate-200 text-slate-600">
                <Smartphone className="size-3.5 mr-1" />
                iOS app
              </Badge>
              <Badge variant="glass" className="bg-slate-50 border-slate-200 text-slate-600">
                <BriefcaseBusiness className="size-3.5 mr-1" />
                Android app
              </Badge>
            </div>
          </div>
        </footer>
      </Reveal>
    </section>
  );
}

export const FooterSection = Footer;
