import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/card";
import { getPublicDoctors } from "@/lib/doctors/get-public-doctors";
import { formatFeeFromPaise } from "@/lib/format-fee";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export async function FeaturedDoctorsSection() {
  const doctors = await getPublicDoctors(6);

  return (
    <section id="doctors" className="page-shell relative overflow-hidden py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle,_rgba(31,111,235,0.08),_transparent_70%)]" />
      <div className="relative z-10 mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#1f6feb]">Doctors</p>
          <h2 className="text-section text-slate-800 font-bold leading-tight">Meet the physicians on HealPoint.</h2>
        </div>
        <Link href="/booking" className="text-sm font-semibold text-[#1f6feb] hover:underline">View all doctors →</Link>
      </div>

      {doctors.length === 0 ? (
        <div className="relative z-10 rounded-3xl border border-white/80 bg-white/80 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <h3 className="text-xl font-semibold text-slate-800">Doctors are joining soon</h3>
          <p className="mt-2 text-sm text-slate-600">Please check back soon, or browse consultations when the directory is available.</p>
          <Button asChild className="mt-5"><Link href="/booking">Go to booking</Link></Button>
        </div>
      ) : (
        <div className="relative z-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <PremiumCard key={doctor.id} className="group h-full overflow-hidden border border-white/80 bg-white/80 p-0 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-100">
                {doctor.avatarUrl ? (
                  <Image src={doctor.avatarUrl} alt={`${doctor.fullName} profile`} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                ) : (
                  <span className="grid size-24 place-items-center rounded-full bg-[#1f6feb]/10 text-2xl font-semibold text-[#1f6feb]">{initials(doctor.fullName)}</span>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div><h3 className="text-xl font-semibold text-slate-800">{doctor.fullName}</h3><p className="mt-1 text-xs font-medium text-[#1f6feb]/80">{doctor.specialty}</p></div>
                  {doctor.rating > 0 ? <Badge variant="cyan" className="border-[#1f6feb]/20">{doctor.rating.toFixed(1)}</Badge> : null}
                </div>
                {doctor.bio ? <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{doctor.bio}</p> : null}
                {formatFeeFromPaise(doctor.consultationFee) ? <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-600">Consultation fee <span className="font-semibold text-slate-800">{formatFeeFromPaise(doctor.consultationFee)}</span></p> : null}
                <Button asChild className="mt-6 w-full"><Link href="/booking">Book consultation</Link></Button>
              </div>
            </PremiumCard>
          ))}
        </div>
      )}
    </section>
  );
}
