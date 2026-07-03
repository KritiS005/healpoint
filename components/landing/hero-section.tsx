"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "motion/react";

import { Reveal } from "@/components/motion/reveal";

// Custom Doctor Silhouettes
const DoctorAvatar1 = () => (
  <svg className="size-full object-cover" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#dbeafe" />
    <path d="M50 25C42.8203 25 37 30.8203 37 38C37 45.1797 42.8203 51 50 51C57.1797 51 63 45.1797 63 38C63 30.8203 57.1797 25 50 25Z" fill="#1f6feb" fillOpacity="0.5" />
    <path d="M18 78C18 64.1929 29.1929 59 43 59H57C70.8071 59 82 64.1929 82 78V84H18V78Z" fill="#1f6feb" fillOpacity="0.7" />
    <path d="M43 36H57" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <circle cx="45" cy="38" r="3" stroke="#ffffff" strokeWidth="2" />
    <circle cx="55" cy="38" r="3" stroke="#ffffff" strokeWidth="2" />
  </svg>
);

const DoctorAvatar2 = () => (
  <svg className="size-full object-cover" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#d1fae5" />
    <path d="M50 24C42.8203 24 37 29.8203 37 37C37 44.1797 42.8203 50 50 50C57.1797 50 63 44.1797 63 37C63 29.8203 57.1797 24 50 24Z" fill="#10c4c4" fillOpacity="0.45" />
    <path d="M18 78C18 64.1929 29.1929 58 43 58H57C70.8071 58 82 64.1929 82 78V84H18V78Z" fill="#10c4c4" fillOpacity="0.65" />
    <path d="M40 50C40 55.5228 44.4772 60 50 60C55.5228 60 60 55.5228 60 50" stroke="#1f6feb" strokeWidth="1.5" />
  </svg>
);

const DoctorAvatar3 = () => (
  <svg className="size-full object-cover" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#ede9fe" />
    <path d="M50 23C43.3726 23 38 28.3726 38 35C38 41.6274 43.3726 47 50 47C56.6274 47 62 41.6274 62 35C62 28.3726 56.6274 23 50 23Z" fill="#7c3aed" fillOpacity="0.35" />
    <path d="M18 76C18 62.1929 29.1929 57 43 57H57C70.8071 57 82 62.1929 82 76V82H18V76Z" fill="#7c3aed" fillOpacity="0.5" />
  </svg>
);

export function HeroSection({
  isLoggedIn = false,
  dashboardHref = "/dashboard",
}: {
  isLoggedIn?: boolean;
  dashboardHref?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const leftCardY = useTransform(scrollY, [0, 500], [0, -70]);
  const rightCardY = useTransform(scrollY, [0, 500], [0, -120]);
  const heroGlowY = useTransform(scrollY, [0, 500], [0, -40]);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative flex min-h-screen w-full items-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 35% 20%, rgba(31,111,235,0.22) 0%, transparent 34%), radial-gradient(ellipse at 80% 25%, rgba(16,196,196,0.16) 0%, transparent 28%), radial-gradient(ellipse at center, rgba(248,252,255,0.7) 0%, transparent 70%)",
          y: heroGlowY,
        }}
      />

      <div className="relative z-10 mx-auto w-full px-6 py-24 md:px-10" style={{ maxWidth: "var(--page-max, 80rem)" }}>
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.6fr_1.3fr]">

          {/* Left – doctor list card */}
          <motion.div style={{ y: leftCardY }} className="flex justify-start">
            <Reveal stagger className="w-full max-w-[21rem]">
              <motion.div
                initial={{ opacity: 0, x: -24, y: 18 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-6 rounded-[24px] border border-white/70 bg-white/75 p-6 shadow-[0_24px_80px_rgba(31,111,235,0.12)] backdrop-blur-2xl"
              >

                <div className="flex flex-col gap-0">
                  {/* Doctor 1 */}
                  <a href="/booking" className="flex items-center gap-4 group rounded-2xl py-4 focus-ring">
                    <div className="size-12 rounded-full border-2 border-[#1f6feb]/25 overflow-hidden shrink-0 transition-all duration-300 group-hover:border-[#1f6feb]/70">
                      <DoctorAvatar1 />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm leading-snug">Doctor M.D.</h3>
                      <p className="text-[11px] text-slate-500 font-light mt-0.5">Medical Teleconsultation</p>
                      <p className="text-[11px] text-[#1f6feb] font-semibold tracking-wide">Doctor</p>
                    </div>
                  </a>

                  {/* Doctor 2 */}
                  <a href="/booking" className="flex items-center gap-4 group rounded-2xl py-4 border-t border-slate-100 focus-ring">
                    <div className="size-12 rounded-full border-2 border-[#10c4c4]/25 overflow-hidden shrink-0 transition-all duration-300 group-hover:border-[#10c4c4]/70">
                      <DoctorAvatar2 />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm leading-snug">Doctor P.D.</h3>
                      <p className="text-[11px] text-slate-500 font-light mt-0.5">Medical Teleconsultation</p>
                      <p className="text-[11px] text-[#10c4c4] font-semibold tracking-wide">Doctor</p>
                    </div>
                  </a>

                  {/* Doctor 3 */}
                  <a href="/booking" className="flex items-center gap-4 group rounded-2xl py-4 border-t border-slate-100 focus-ring">
                    <div className="size-12 rounded-full border-2 border-violet-300/50 overflow-hidden shrink-0 transition-all duration-300 group-hover:border-violet-500/70">
                      <DoctorAvatar3 />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm leading-snug">Doctor P.D.</h3>
                      <p className="text-[11px] text-slate-500 font-light mt-0.5">Medical Teleconsultation</p>
                      <p className="text-[11px] text-violet-500 font-semibold tracking-wide">Specialist</p>
                    </div>
                  </a>
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-3">
                  <a
                    href={isLoggedIn ? dashboardHref : "/booking"}
                    className="flex w-full items-center justify-center bg-[#1f6feb] hover:bg-[#1a5fd4] text-white font-bold uppercase tracking-widest text-[11px] py-3.5 px-6 rounded-full transition-all duration-300 shadow-[0_4px_18px_rgba(31,111,235,0.35)] hover:shadow-[0_6px_26px_rgba(31,111,235,0.5)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isLoggedIn ? "Go to Dashboard" : "Get Started"}
                  </a>
                  {!isLoggedIn && (
                    <div className="flex gap-3">
                      <a
                        href="/auth/login"
                        className="flex flex-1 items-center justify-center rounded-full border border-[#1f6feb]/20 bg-white/80 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#1f6feb] transition-all duration-300 hover:border-[#1f6feb]/40 hover:bg-white"
                      >
                        Log in
                      </a>
                      <a
                        href="/auth/signup"
                        className="flex flex-1 items-center justify-center rounded-full border border-[#1f6feb]/20 bg-[#1f6feb]/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#1f6feb] transition-all duration-300 hover:border-[#1f6feb]/40 hover:bg-[#1f6feb]/15"
                      >
                        Sign up
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </Reveal>
          </motion.div>

          {/* Center – space the DNA helix spirals through */}
          <div className="hidden lg:block h-[10rem] pointer-events-none" />

          {/* Right – headline card */}
          <motion.div style={{ y: rightCardY }} className="flex justify-end">
            <Reveal className="w-full max-w-[32rem]">
              <motion.div
                initial={{ opacity: 0, x: 24, y: 18 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/75 p-8 shadow-[0_24px_90px_rgba(31,111,235,0.16)] backdrop-blur-2xl md:p-10"
              >
                <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-[#1f6feb]/8 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-tr-full bg-[#10c4c4]/10 blur-3xl" />

                <div className="relative flex flex-col gap-3">
                  <p className="text-[10px] md:text-xs tracking-[0.25em] font-semibold text-[#1f6feb]/70 uppercase">
                    HEALPOINT: Next-Gen Teleconsultation
                  </p>

                  <h1
                    id="hero-heading"
                    className="text-[2.4rem] md:text-[3.2rem] font-black leading-[1.05] tracking-tight uppercase"
                    style={{
                      background: "linear-gradient(135deg, #1f6feb 0%, #10c4c4 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Unearthing Genetic Wellness
                  </h1>

                  <p className="text-xs md:text-sm tracking-[0.18em] font-medium text-slate-500 uppercase mt-1">
                    Next-Gen Teleconsultation
                  </p>
                </div>
              </motion.div>
            </Reveal>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
