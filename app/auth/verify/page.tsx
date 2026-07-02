"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="mx-auto flex min-h-screen items-center justify-center px-6 py-16 text-sm text-muted-foreground">Loading…</div>}>
      <VerifyPageContent />
    </Suspense>
  );
}

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
      <Card className="w-full max-w-2xl border-white/10 bg-background/70 p-2 shadow-[0_20px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-2xl text-white">Check your inbox</CardTitle>
          <CardDescription>
            We sent a verification link to {email}. Open it to confirm your account and continue to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-6 pb-6">
          <p className="text-sm leading-7 text-muted-foreground">
            If you do not see the email, please check spam or wait a moment before requesting another link.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`}>Back to sign in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
