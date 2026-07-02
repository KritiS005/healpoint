import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
  label?: string;
  error?: string;
};

function Input({ className, type, label, id, error, ...props }: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  if (!label) {
    return (
      <input
        id={inputId}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-12 w-full rounded-2xl border border-input bg-background/75 px-4 text-sm shadow-xs transition-all duration-300 placeholder:text-muted-foreground/70 focus:border-ring focus:bg-background focus:ring-4 focus:ring-ring/15 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <div className="grid gap-2">
      <div className="group relative">
        <input
          id={inputId}
          type={type}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "peer h-14 w-full rounded-2xl border border-input bg-background/75 px-4 pb-2 pt-5 text-sm shadow-xs transition-all duration-300 placeholder:text-transparent focus:border-ring focus:bg-background focus:ring-4 focus:ring-ring/15 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:border-destructive focus:ring-destructive/15",
            className,
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="pointer-events-none absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary"
        >
          {label}
        </label>
      </div>
      {error ? (
        <p id={errorId} className="animate-slide-up text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { Input };
