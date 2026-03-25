export default function ArticleLoading() {
  return (
    <article
      className="flex flex-1 flex-col text-[#111111]"
      aria-busy
      aria-label="Artikel wird geladen"
    >
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-3 w-20 animate-pulse rounded bg-[#E5E5E5]" />
          <span className="text-[#E5E5E5]" aria-hidden>
            /
          </span>
          <div className="h-3 w-28 animate-pulse rounded bg-[#F9F9F9]" />
          <span className="text-[#E5E5E5]" aria-hidden>
            /
          </span>
          <div className="h-3 w-36 max-w-[min(100%,14rem)] animate-pulse rounded bg-[#F9F9F9]" />
        </div>
      </div>

      <div
        className="mt-6 aspect-video w-full animate-pulse bg-[#E5E5E5] sm:mt-8"
        aria-hidden
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="h-6 w-28 animate-pulse rounded-md bg-[#F9F9F9]" />

        <div className="mt-4 space-y-3">
          <div className="h-9 w-full animate-pulse rounded bg-[#E5E5E5] md:h-10" />
          <div className="h-9 w-11/12 animate-pulse rounded bg-[#F9F9F9] md:h-10" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-[#E5E5E5] pb-6">
          <div
            className="size-12 shrink-0 animate-pulse rounded-full bg-[#E5E5E5] ring-1 ring-[#E5E5E5]"
            aria-hidden
          />
          <div className="space-y-2">
            <div className="h-4 w-36 animate-pulse rounded bg-[#E5E5E5]" />
            <div className="h-3 w-28 animate-pulse rounded bg-[#F9F9F9]" />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-[#E5E5E5]" />
          <div className="h-4 w-full animate-pulse rounded bg-[#F9F9F9]" />
          <div className="h-4 w-[92%] animate-pulse rounded bg-[#F9F9F9]" />
          <div className="h-4 w-full animate-pulse rounded bg-[#E5E5E5]" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-[#F9F9F9]" />
          <div className="h-4 w-full animate-pulse rounded bg-[#F9F9F9]" />
          <div className="h-4 w-[88%] animate-pulse rounded bg-[#E5E5E5]" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-[#F9F9F9]" />
        </div>
      </div>
    </article>
  );
}
