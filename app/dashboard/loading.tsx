export default function DashboardLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <div className="w-full animate-pulse rounded-[28px] bg-white/60 lg:w-72 lg:h-[480px]" />
        <div className="flex-1 space-y-6">
          <div className="h-28 animate-pulse rounded-[28px] bg-white/60" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-[28px] bg-white/60" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-[28px] bg-white/60" />
        </div>
      </div>
    </div>
  );
}
