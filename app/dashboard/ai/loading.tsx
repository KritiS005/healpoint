export default function Loading() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-28 animate-pulse rounded-[28px] bg-white/60" />
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-[32rem] animate-pulse rounded-[28px] bg-white/60" />
          <div className="h-[32rem] animate-pulse rounded-[28px] bg-white/60" />
        </div>
      </div>
    </div>
  );
}
