import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-shimmer rounded-2xl bg-[linear-gradient(110deg,var(--muted),color-mix(in_oklch,var(--muted),white_42%),var(--muted))]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
