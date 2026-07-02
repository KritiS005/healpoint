"use client";

import { motion } from "motion/react";

import { pageTransition } from "@/lib/design-system/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.main initial="initial" animate="animate" exit="exit" variants={pageTransition}>
      {children}
    </motion.main>
  );
}
