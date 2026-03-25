function ArticleCardSkeleton() {
  return (
    <div className="space-y-3">
      <div
        className="aspect-[16/10] w-full animate-pulse rounded-md bg-[#E5E5E5]"
        aria-hidden
      />
      <div className="space-y-2">
        <div className="h-3 w-4/5 max-w-full animate-pulse rounded bg-[#E5E5E5]" />
        <div className="h-3 w-full animate-pulse rounded bg-[#F9F9F9]" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-[#F9F9F9]" />
      </div>
    </div>
  );
}

export default function CategoryLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div
        className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        aria-busy
        aria-label="Artikel werden geladen"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
