"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"

const DnaBackground = dynamic(
  () => import("./dna-background").then((m) => m.DnaBackground),
  { ssr: false },
)

const DOCTORS = [
  { name: "Doctor M.D.", role: "Doctor", img: "/doctors/doctor-1.png" },
  { name: "Doctor P.D.", role: "Doctor", img: "/doctors/doctor-2.png" },
  { name: "Doctor P.D.", role: "Specialist", img: "/doctors/doctor-3.png" },
]

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" />
    </svg>
  )
}

export function DnaHero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-background">
      {/* 3D animated DNA double helix + network field */}
      <div className="absolute inset-0" aria-hidden="true">
        <DnaBackground />
      </div>

      {/* Soft light vignette for legibility */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(238,244,250,0.9)_100%]"
        aria-hidden="true"
      />

      {/* Top navigation */}
      <header className="absolute inset-x-0 top-0 z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
          <span className="font-heading text-xl font-semibold tracking-[0.2em] text-foreground">
            HEALPOINT
          </span>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </a>
        </nav>
      </header>

      {/* Foreground content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 md:px-10">
        <div className="grid w-full items-center gap-8 lg:grid-cols-2">
          {/* Doctor card */}
          <div className="w-full max-w-sm rounded-2xl border border-primary/15 bg-card/70 p-4 shadow-xl shadow-primary/10 backdrop-blur-md md:p-5">
            <ul className="flex flex-col">
              {DOCTORS.map((doc, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 border-b border-border/60 py-3 last:border-b-0"
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/50">
                    <Image
                      src={doc.img || "/placeholder.svg"}
                      alt={`${doc.name}, ${doc.role}`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="font-heading text-base font-semibold text-foreground">
                      {doc.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      Medical Teleconsultation
                    </p>
                    <p className="text-xs text-primary/80">{doc.role}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="mt-4 w-full rounded-full bg-primary font-medium tracking-wide text-primary-foreground hover:bg-primary/90"
            >
              GET STARTED
            </Button>
          </div>

          {/* Info panel */}
          <div className="justify-self-end lg:max-w-md">
            <div className="rounded-2xl border border-primary/15 bg-card/60 p-8 shadow-xl shadow-primary/10 backdrop-blur-md md:p-10">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary/80">
                HEALPOINT: Next-Gen Teleconsultation
              </p>
              <h1 className="mt-5 text-balance font-heading text-4xl font-bold uppercase leading-[1.05] tracking-tight text-primary md:text-6xl">
                Unearthing Genetic Wellness
              </h1>
              <p className="mt-5 text-pretty text-sm uppercase tracking-[0.2em] text-muted-foreground md:text-base">
                Next-Gen Teleconsultation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sparkle accent */}
      <Sparkle className="absolute bottom-10 right-10 z-10 h-7 w-7 text-primary/80" />
    </section>
  )
}
