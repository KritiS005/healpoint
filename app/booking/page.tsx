import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BookingShell, type BookingDoctor } from "@/components/booking/booking-shell";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getPublicDoctors } from "@/lib/doctors/get-public-doctors";

export default async function BookingPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Relational select: doctors → profiles(full_name, avatar_url)
  const doctors: BookingDoctor[] = (await getPublicDoctors()).map((doctor) => ({
    ...doctor,
    bio: doctor.bio ?? "",
  }));

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
