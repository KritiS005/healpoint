"use client";

import { motion } from "motion/react";

import { reveal, staggerContainer } from "@/lib/design-system/motion";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
  stagger?: boolean;
};

export function Reveal({ children, className, as = "div", stagger = false }: RevealProps) {
  const Component = motion[as];

  return (
    <Component
      className={cn(className)}
      variants={stagger ? staggerContainer : reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </Component>
  );
}
