"use client";

import * as React from "react";
import { Activity, Loader2, MousePointer2 } from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";

const interactiveSelector =
  "a, button, input, textarea, select, [role='button'], [data-cursor='interactive']";

type CursorState = "default" | "interactive" | "loading";

export function CustomCursor() {
  const [enabled, setEnabled] = React.useState(false);
  const [state, setState] = React.useState<CursorState>("default");
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const x = useSpring(mouseX, { stiffness: 520, damping: 42, mass: 0.5 });
  const y = useSpring(mouseY, { stiffness: 520, damping: 42, mass: 0.5 });

  React.useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      const pointerFine = window.matchMedia("(pointer: fine)").matches;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setEnabled(pointerFine && !reducedMotion);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleMove = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const interactive = target?.closest(interactiveSelector);
      const waiting = target?.closest("[aria-busy='true'], [data-loading='true']");

      if (waiting) {
        setState("loading");
      } else if (interactive) {
        setState("interactive");
      } else {
        setState("default");
      }

      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    const handleLeave = () => {
      mouseX.set(-100);
      mouseY.set(-100);
      setState("default");
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, [enabled, mouseX, mouseY]);

  if (!enabled) {
    return null;
  }

  const Icon = state === "loading" ? Loader2 : state === "interactive" ? MousePointer2 : Activity;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-secondary/35 bg-secondary/15 text-primary shadow-glow backdrop-blur-md"
      style={{ x, y }}
      animate={{
        scale: state === "interactive" ? 1.45 : state === "loading" ? 1.28 : 1,
        opacity: 1,
      }}
      transition={{ type: "spring", stiffness: 480, damping: 30 }}
    >
      <span className="absolute inset-1 rounded-full bg-secondary/25 blur-sm" />
      <Icon className={state === "loading" ? "relative size-4 animate-spin" : "relative size-4"} />
    </motion.div>
  );
}
