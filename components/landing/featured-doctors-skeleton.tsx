export function FeaturedDoctorsSkeleton() {
  return (
    <section className="page-shell py-20 lg:py-28" aria-label="Loading doctors">
      <div className="mb-10 h-24 max-w-2xl animate-pulse rounded-3xl bg-slate-200/70" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="aspect-[3/4] animate-pulse rounded-3xl bg-slate-200/70" />)}
      </div>
    </section>
  );
}
