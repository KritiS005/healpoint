"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="dash-card max-w-md p-8 text-center">
        <p className="text-sm font-semibold text-destructive">Error</p>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button type="button" onClick={reset} className="mt-4 rounded-2xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
          Try again
        </button>
      </div>
    </div>
  );
}
