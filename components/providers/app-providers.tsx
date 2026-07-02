"use client";

import * as React from "react";

import { CustomCursor } from "@/components/system/custom-cursor";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <CustomCursor />
    </ThemeProvider>
  );
}
