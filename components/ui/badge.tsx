import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "cyan"
  | "emerald"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "glass";

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-primary/20 bg-primary/10 text-primary",
  cyan: "border-secondary/25 bg-secondary/12 text-secondary-foreground dark:text-secondary",
  emerald: "border-accent/25 bg-accent/12 text-accent-foreground dark:text-accent",
  success: "border-success/25 bg-success/12 text-success",
  warning: "border-warning/30 bg-warning/14 text-warning",
  danger: "border-destructive/25 bg-destructive/12 text-destructive",
  neutral: "border-border bg-muted/70 text-muted-foreground",
  glass: "glass-panel text-foreground",
};

export type BadgeProps = {
  variant?: BadgeVariant;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  style?: React.CSSProperties;
  id?: string;
  "aria-label"?: string;
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
