"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
      <Card className="w-full max-w-2xl border-white/10 bg-background/70 p-2 shadow-[0_20px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-2xl text-white">Set a new password</CardTitle>
          <CardDescription>Choose a strong new password for your HealPoint account.</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <Button type="submit" disabled={loading}>
              {loading ? "Updating password..." : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
