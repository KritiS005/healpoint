"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/ui/nav-link";
import { modalTransition, motionDurations, motionEasings } from "@/lib/design-system/motion";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Role = "patient" | "doctor" | "admin" | null;

const patientNav = [
  { label: "Overview", href: "/dashboard/patient" },
  { label: "Appointments", href: "/dashboard/patient/appointments" },
  { label: "Book Consultation", href: "/booking" },
  { label: "Records", href: "/dashboard/patient/records" },
  { label: "AI Assistant", href: "/dashboard/ai" },
  { label: "Payments", href: "/dashboard/patient/payments" },
  { label: "Home", href: "/" },
];

const doctorNav = [
  { label: "Overview", href: "/dashboard/doctor" },
  { label: "Schedule", href: "/dashboard/doctor/appointments" },
  { label: "Patients", href: "/dashboard/doctor/patients" },
  { label: "Prescriptions", href: "/dashboard/doctor/prescriptions" },
  { label: "AI Assistant", href: "/dashboard/ai" },
  { label: "Home", href: "/" },
];

const publicNav = [
  { label: "Home", href: "/" },
  { label: "Booking", href: "/booking" },
  { label: "AI", href: "/ai" },
];

export function SiteNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isShrunk, setIsShrunk] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems =
    role === "patient" ? patientNav : role === "doctor" ? doctorNav : publicNav;

  React.useEffect(() => {
    const handleScroll = () => setIsShrunk(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="safe-padding sticky top-0 z-50 py-4">
      <nav
        className={cn(
          "page-shell glass-panel flex items-center justify-between transition-all",
          isShrunk ? "min-h-14 px-4 py-2" : "min-h-17 px-5 py-3",
        )}
        style={{
          transitionDuration: `${motionDurations.slow}s`,
          transitionTimingFunction: "var(--ease-out-premium)",
        }}
        aria-label="Primary navigation"
      >
        <Link
          href={role === "doctor" ? "/dashboard/doctor" : role === "patient" ? "/dashboard/patient" : "/"}
          className="flex items-center gap-3 rounded-full focus-ring"
          data-cursor="interactive"
        >
          <span className="grid size-9 place-items-center rounded-2xl medical-gradient text-sm font-bold text-primary-foreground shadow-sm">
            H
          </span>
          <span className="text-sm font-semibold tracking-normal text-foreground">HealPoint</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} active={pathname === item.href}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {role ? (
            <Button size="sm" variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        <Button
          className="lg:hidden"
          variant="glass"
          size="icon-sm"
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((o) => !o)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </Button>
      </nav>

      {isMenuOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-background/50 backdrop-blur-xl lg:hidden"
          variants={modalTransition}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={() => setIsMenuOpen(false)}
        >
          <motion.div
            className="glass-panel absolute right-4 top-24 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 p-3"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: motionDurations.slow, ease: motionEasings.premium }}
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                active={pathname === item.href}
                className="h-12 justify-start"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            {role ? (
              <Button variant="outline" className="mt-2 w-full" onClick={handleLogout}>
                Log out
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="mt-2 w-full">
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>Log in</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>Sign up</Link>
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </header>
  );
}
