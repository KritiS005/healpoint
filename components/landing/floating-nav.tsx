"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/ui/nav-link";
import { motionDurations, motionEasings, modalTransition } from "@/lib/design-system/motion";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Doctors", href: "#doctors" },
  { label: "Booking", href: "/booking" },
  { label: "AI", href: "/ai" },
  { label: "About", href: "#about" },
];

function useActiveSection() {
  const [activeSection, setActiveSection] = React.useState("home");

  React.useEffect(() => {
    const sectionIds = ["home", "doctors", "services", "ai", "about"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.12, 0.24, 0.48] },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return activeSection;
}

export function FloatingNav() {
  const [isShrunk, setIsShrunk] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const activeSection = useActiveSection();

  React.useEffect(() => {
    const handleScroll = () => setIsShrunk(window.scrollY > 24);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleNavigate = () => setIsMenuOpen(false);

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
        <a
          href="#home"
          className="flex items-center gap-3 rounded-full focus-ring"
          data-cursor="interactive"
          onClick={handleNavigate}
        >
          <span className="grid size-9 place-items-center rounded-2xl medical-gradient text-sm font-bold text-primary-foreground shadow-sm">
            H
          </span>
          <span className="text-sm font-semibold tracking-normal text-foreground">HealPoint</span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              active={activeSection === item.href.slice(1)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild size="sm" variant="outline">
            <a href="/auth/login">Log in</a>
          </Button>
          <Button asChild size="sm">
            <a href="/auth/signup">Sign up</a>
          </Button>
          <Button asChild size="sm">
            <a href="/booking">Book Consultation</a>
          </Button>
        </div>

        <Button
          className="lg:hidden"
          variant="glass"
          size="icon-sm"
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </Button>
      </nav>

      {isMenuOpen ? (
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
            onClick={(event) => event.stopPropagation()}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                active={activeSection === item.href.slice(1)}
                className="h-12 justify-start"
                onClick={handleNavigate}
              >
                {item.label}
              </NavLink>
            ))}
            <Button asChild variant="outline" className="mt-2 w-full" onClick={handleNavigate}>
              <a href="/auth/login">Log in</a>
            </Button>
            <Button asChild className="w-full" onClick={handleNavigate}>
              <a href="/auth/signup">Sign up</a>
            </Button>
            <Button asChild className="w-full" onClick={handleNavigate}>
              <a href="/booking">Book Consultation</a>
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </header>
  );
}
