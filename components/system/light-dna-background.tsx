"use client";

import dynamic from "next/dynamic";

const DnaCanvas = dynamic(
  () =>
    import("@/components/landing/hero-section/dna-background").then(
      (m) => m.DnaBackground,
    ),
  { ssr: false },
);

/**
 * Light-theme 3-D DNA background – rendered as a fixed full-page layer
 * so the animated helix is visible behind every section on the site.
 */
export function LightDnaBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none bg-[#eef4fa]"
      aria-hidden="true"
    >
      <DnaCanvas />
    </div>
  );
}
