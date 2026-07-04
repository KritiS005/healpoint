"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { DOCTOR_SPECIALTIES } from "@/lib/constants/specialties";

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
  const [role, setRole] = React.useState("patient");

  // Doctor-specific fields
  const [specialty, setSpecialty] = React.useState<string>(DOCTOR_SPECIALTIES[0]);
  const [bio, setBio] = React.useState("");
  const [consultationFee, setConsultationFee] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Store doctor fields in user_metadata so the auth callback can
    // insert the doctors row AFTER email verification (when profiles row exists)
    const metadata: Record<string, unknown> = { full_name: fullName, role };
    if (role === "doctor") {
      metadata.specialty = specialty;
      metadata.bio = bio;
      metadata.consultation_fee_paise = Math.round(parseFloat(consultationFee) * 100);
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        data: metadata,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
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

              <div className="grid gap-2">
                <label className="text-sm font-medium text-white">Role</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>

              {role === "doctor" && (
                <>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-white">Specialty</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                    >
                      {DOCTOR_SPECIALTIES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <Input label="Bio (short description)" value={bio} onChange={(e) => setBio(e.target.value)} required />
                  <Input label="Consultation fee (₹)" type="number" min="1" step="1" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} required />
                </>
              )}

              {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
              <Button type="submit" className="mt-2" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <p className="mt-6 text-sm text-muted-foreground">
              Already have an account?{" "}
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
