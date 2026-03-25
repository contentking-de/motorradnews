export default function AdminKategorienLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-[#E5E5E5]" />
        <div className="h-10 w-40 animate-pulse rounded-lg bg-[#E5E5E5]" />
      </div>
      <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-white">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[#E5E5E5] px-4 py-4 last:border-b-0"
          >
            <div className="h-5 w-32 animate-pulse rounded bg-[#E5E5E5]" />
            <div className="h-5 w-24 animate-pulse rounded bg-[#F9F9F9]" />
            <div className="hidden h-5 w-48 animate-pulse rounded bg-[#F9F9F9] md:block" />
            <div className="ml-auto flex gap-2">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-[#F9F9F9]" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-[#F9F9F9]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
