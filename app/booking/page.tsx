import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BookingShell, type BookingDoctor } from "@/components/booking/booking-shell";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function BookingPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Relational select: doctors → profiles(full_name, avatar_url)
  const { data: rows, error } = await supabase
    .from("doctors")
    .select("id, specialty, bio, rating, consultation_fee, profiles(full_name, avatar_url)")
    .order("rating", { ascending: false });

  if (error) {
    console.error("[BookingPage] doctors fetch error:", error.message);
  }

  const doctors: BookingDoctor[] = (rows ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id as string,
      fullName: (profile?.full_name as string | undefined) ?? "Doctor",
      avatarUrl: (profile?.avatar_url as string | undefined) ?? null,
      specialty: row.specialty as string,
      bio: (row.bio as string | undefined) ?? "",
      rating: Number(row.rating ?? 0),
      consultationFee: Number(row.consultation_fee ?? 0),
    };
  });

  // Build dynamic specialty list from actual data
  const specialties = ["All", ...Array.from(new Set(doctors.map((d) => d.specialty))).sort()];

  const headerCta = user ? (
    <Link href="/dashboard" className={buttonVariants({ variant: "default", size: "default" })}>
      Dashboard
    </Link>
  ) : (
    <Link href="/auth/login" className={buttonVariants({ variant: "default", size: "default" })}>
      Login
    </Link>
  );

  return <BookingShell doctors={doctors} specialties={specialties} headerCta={headerCta} />;
}
