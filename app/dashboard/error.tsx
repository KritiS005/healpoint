"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="dash-card max-w-md p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-destructive">
          Dashboard error
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message ?? "An unexpected error occurred loading your dashboard."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
