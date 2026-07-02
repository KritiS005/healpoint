import { Activity, Dna, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

const defaultMessages = [
  "Preparing your secure healthcare workspace...",
  "Loading specialists...",
  "Encrypting your session...",
  "Synchronizing appointments...",
];

type BrandedLoaderProps = {
  className?: string;
  message?: string;
  messages?: string[];
  compact?: boolean;
};

export function BrandedLoader({
  className,
  message,
  messages = defaultMessages,
  compact = false,
}: BrandedLoaderProps) {
  const visibleMessage = message ?? messages[0];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "grid place-items-center rounded-3xl border border-border/70 bg-glass p-8 text-center shadow-glass backdrop-blur-xl",
        compact ? "gap-3 p-4" : "gap-5",
        className,
      )}
    >
      <div className="relative grid size-20 place-items-center">
        <span className="absolute inset-0 rounded-full border border-secondary/25" />
        <span className="absolute inset-3 rounded-full bg-secondary/15 blur-md animate-pulse-soft" />
        <Activity className="absolute size-16 text-secondary animate-heartbeat" strokeWidth={1.4} />
        <Dna className="relative size-7 text-primary" strokeWidth={1.8} />
        <ShieldCheck className="absolute bottom-1 right-1 size-4 text-accent" />
      </div>
      <p className={cn("max-w-xs text-sm font-medium text-muted-foreground", compact && "sr-only")}>
        {visibleMessage}
      </p>
    </div>
  );
}
