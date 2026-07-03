export default function Loading() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-28 animate-pulse rounded-[28px] bg-white/60" />
        <div className="h-64 animate-pulse rounded-[28px] bg-white/60" />
      </div>
    </div>
  );
}
