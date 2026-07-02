import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-300 outline-none select-none focus-ring active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "medical-gradient text-primary-foreground shadow-sm hover:shadow-glow before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,255,255,.24),transparent_42%)] before:opacity-70 after:absolute after:left-[var(--ripple-x,50%)] after:top-[var(--ripple-y,50%)] after:size-0 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-white/25 after:transition-all after:duration-500 active:after:size-40",
        secondary:
          "bg-secondary/14 text-secondary-foreground shadow-xs hover:bg-secondary/22 hover:shadow-sm dark:bg-secondary/18 dark:text-foreground",
        outline:
          "border-border/80 bg-background/70 text-foreground shadow-xs backdrop-blur-md hover:border-secondary/50 hover:bg-muted/60 hover:shadow-sm dark:bg-input/20",
        ghost: "text-foreground hover:bg-muted/70 hover:text-foreground",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/18 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/18",
        glass:
          "glass-panel text-foreground hover:border-secondary/40 hover:bg-glass hover:shadow-glow",
        link: "h-auto rounded-none p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 gap-2 px-5",
        xs: "h-7 gap-1.5 rounded-2xl px-3 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-2xl px-4 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-13 gap-2.5 px-7 text-base",
        icon: "size-11",
        "icon-xs": "size-7 rounded-2xl [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-2xl",
        "icon-lg": "size-13",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  onPointerDown,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--ripple-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--ripple-y", `${event.clientY - rect.top}px`);
    onPointerDown?.(event);
  };

  return (
    <Comp
      data-cursor="interactive"
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      onPointerDown={handlePointerDown}
      {...props}
    />
  );
}

export { Button, buttonVariants };
