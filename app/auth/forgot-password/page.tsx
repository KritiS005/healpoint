"use client";

import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("A password reset email has been sent to your inbox.");
    setLoading(false);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
      <Card className="w-full max-w-2xl border-white/10 bg-background/70 p-2 shadow-[0_20px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-2xl text-white">Reset your password</CardTitle>
          <CardDescription>Enter your email and we will send you a reset link.</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            {message ? <p className="text-sm font-medium text-emerald-400">{message}</p> : null}
            <Button type="submit" disabled={loading}>
              {loading ? "Sending reset link..." : "Send reset link"}
            </Button>
          </form>
          <Link href="/auth/login" className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
