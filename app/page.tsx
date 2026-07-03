import dynamic from "next/dynamic";

import { FloatingNav } from "@/components/landing/floating-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { LightDnaBackground } from "@/components/system/light-dna-background";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const TrustSection = dynamic(() =>
  import("@/components/landing/section-placeholders").then((module) => module.TrustSection),
);
const SpecialtiesSection = dynamic(() =>
  import("@/components/landing/section-placeholders").then((module) => module.SpecialtiesSection),
);
const HowItWorksSection = dynamic(() =>
  import("@/components/landing/section-placeholders").then((module) => module.HowItWorksSection),
);
const FeaturedDoctorsSection = dynamic(() =>
  import("@/components/landing/section-placeholders").then((module) => module.FeaturedDoctorsSection),
);
const AIShowcaseSection = dynamic(() =>
  import("@/components/landing/section-placeholders").then((module) => module.AIShowcaseSection),
);
const TestimonialsSection = dynamic(() =>
  import("@/components/landing/section-placeholders").then((module) => module.TestimonialsSection),
);
const SecuritySection = dynamic(() =>
  import("@/components/landing/section-placeholders").then((module) => module.SecuritySection),
);
const FAQSection = dynamic(() =>
  import("@/components/landing/section-placeholders").then((module) => module.FAQSection),
);
const FinalCTASection = dynamic(() =>
  import("@/components/landing/section-placeholders").then((module) => module.FinalCTASection),
);
const FooterSection = dynamic(() =>
  import("@/components/landing/section-placeholders").then((module) => module.FooterSection),
);

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let dashboardHref = "/dashboard";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role === "doctor") dashboardHref = "/dashboard/doctor";
    else if (profile?.role === "admin") dashboardHref = "/admin";
    else dashboardHref = "/dashboard/patient";
  }

  const isLoggedIn = !!user;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(31,111,235,0.17),_transparent_30%),linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_48%,_#f7fbff_100%)] text-slate-800 selection:bg-[#1f6feb]/20 selection:text-[#1f6feb]">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.45)_0%,_transparent_35%,_rgba(255,255,255,0.18)_70%,_transparent_100%)]" />
      <LightDnaBackground />

      <div className="relative z-10 flex w-full flex-col">
        <FloatingNav isLoggedIn={isLoggedIn} dashboardHref={dashboardHref} />
        <HeroSection isLoggedIn={isLoggedIn} dashboardHref={dashboardHref} />
        <TrustSection />
        <SpecialtiesSection />
        <HowItWorksSection />
        <FeaturedDoctorsSection />
        <AIShowcaseSection />
        <TestimonialsSection />
        <SecuritySection />
        <FAQSection />
        <FinalCTASection />
        <FooterSection />
      </div>
    </main>
  );
}
