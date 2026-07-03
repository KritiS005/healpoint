import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BookingShell, type BookingDoctor } from "@/components/booking/booking-shell";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function BookingPage() {
  const supabase = await createServerSupabaseClient();

  // Auth check for header CTA — no redirect, booking page is public
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch verified doctors with their profile name joined
  const { data: rows } = await supabase
    .from("doctors")
    .select("id, specialty, bio, rating, consultation_fee, profiles(full_name)")
    .eq("verified", true)
    .order("rating", { ascending: false });

  const doctors: BookingDoctor[] = (rows ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id as string,
      fullName: (profile?.full_name as string | undefined) ?? "Doctor",
      specialty: row.specialty as string,
      bio: (row.bio as string | undefined) ?? "",
      rating: Number(row.rating ?? 0),
      consultationFee: Number(row.consultation_fee ?? 0),
    };
  });

  const headerCta = user ? (
    <Link href="/dashboard" className={buttonVariants({ variant: "default", size: "default" })}>
      Dashboard
    </Link>
  ) : (
    <Link href="/auth/login" className={buttonVariants({ variant: "default", size: "default" })}>
      Login
    </Link>
  );

  return <BookingShell doctors={doctors} headerCta={headerCta} />;
}
