export default function AdminRedakteureLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#E5E5E5]" />
        <div className="h-10 w-44 animate-pulse rounded-lg bg-[#E5E5E5]" />
      </div>
      <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-white">
        <div className="border-b border-[#E5E5E5] bg-[#F9F9F9] px-4 py-3">
          <div className="flex gap-8">
            {["w-24", "w-40", "w-20", "w-16", "w-20"].map((w, i) => (
              <div key={i} className={`h-4 ${w} animate-pulse rounded bg-[#E5E5E5]`} />
            ))}
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-8 border-b border-[#E5E5E5] px-4 py-4 last:border-b-0"
          >
            <div className="h-5 w-28 animate-pulse rounded bg-[#E5E5E5]" />
            <div className="h-5 w-44 animate-pulse rounded bg-[#F9F9F9]" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-[#F9F9F9]" />
            <div className="h-6 w-14 animate-pulse rounded-full bg-[#F9F9F9]" />
            <div className="h-8 w-20 animate-pulse rounded-lg bg-[#F9F9F9]" />
          </div>
        ))}
      </div>
    </div>
  );
}
