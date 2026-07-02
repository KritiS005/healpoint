import type { Variants } from "motion/react";

export const motionDurations = {
  fast: 0.18,
  base: 0.28,
  page: 0.38,
  slow: 0.6,
} as const;

export const motionEasings = {
  premium: [0.16, 1, 0.3, 1],
  soft: [0.65, 0, 0.35, 1],
  spring: { type: "spring", stiffness: 420, damping: 32, mass: 0.8 },
} as const;

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.985, filter: "blur(10px)" },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: motionDurations.page, ease: motionEasings.premium },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.99,
    filter: "blur(8px)",
    transition: { duration: motionDurations.fast, ease: motionEasings.soft },
  },
};

export const reveal: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: motionDurations.page, ease: motionEasings.premium },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

export const pressable = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.98 },
  transition: motionEasings.spring,
} as const;

export const modalTransition: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: motionDurations.base, ease: motionEasings.premium },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 8,
    filter: "blur(8px)",
    transition: { duration: motionDurations.fast, ease: motionEasings.soft },
  },
};
