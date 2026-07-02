import type { Metadata } from "next";
import { SpiralAnimation } from "@/components/ui/spiral-animation"; // Change the path if needed

export const metadata: Metadata = {
  title: "Authentication · HealPoint",
  description: "Sign in or create your HealPoint account.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Spiral Animation Background */}
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>

      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Authentication pages */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}