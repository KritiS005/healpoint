"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="mx-auto flex min-h-screen items-center justify-center px-6 py-16 text-sm text-muted-foreground">Loading…</div>}>
      <SignUpPageContent />
    </Suspense>
  );
}

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("patient"); // Added state for role
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify?redirectTo=${encodeURIComponent(redirectTo)}`,
        data: { 
          full_name: fullName,
          role: role // Passed the selected role to user metadata
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user?.identities?.length === 0) {
      setError("A user with this email already exists. Please log in instead.");
      setLoading(false);
      return;
    }

    router.push(`/auth/verify?email=${encodeURIComponent(email)}&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
            <span className="size-2 rounded-full bg-emerald-400" />
            Secure onboarding for patients, doctors, and admins
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Create your HealPoint account</h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              Join the platform for AI-assisted care, booking, and health insights with a modern, secure sign-up flow.
            </p>
          </div>
        </div>

        <Card className="border-white/10 bg-background/70 p-2 shadow-[0_20px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
          <CardHeader className="px-6 pt-6">
            <CardTitle className="text-2xl text-white">Sign up</CardTitle>
            <CardDescription>Start with your email and a secure password.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              
              {/* Added native select to match Input styling without needing extra shadcn components */}
              <div className="grid gap-2">
                <label className="text-sm font-medium text-white">Role</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>

              {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
              <Button type="submit" className="mt-2" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <p className="mt-6 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href={`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`} className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}