export default function AdminArtikelLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6" aria-busy aria-label="Artikel werden geladen">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-8 w-32 animate-pulse rounded-md bg-[#E5E5E5] md:h-9" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-[#F9F9F9] sm:w-40" />
      </div>

      <section
        className="space-y-4 rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] p-4"
        aria-label="Filter"
      >
        <div className="flex items-center gap-2">
          <div className="size-4 shrink-0 animate-pulse rounded bg-[#E5E5E5]" />
          <div className="h-4 w-16 animate-pulse rounded bg-[#E5E5E5]" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-10 w-full animate-pulse rounded-lg bg-white md:col-span-1" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-white" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-white" />
        </div>
      </section>

      <div className="hidden overflow-x-auto rounded-lg border border-[#E5E5E5] bg-white md:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
              {[
                "Titel",
                "Kategorie",
                "Status",
                "Autor",
                "Veröffentlicht",
                "Aktionen",
              ].map((label) => (
                <th
                  key={label}
                  className={`px-4 py-3 ${label === "Aktionen" ? "text-right" : ""}`}
                >
                  <span className="sr-only">{label}</span>
                  <div
                    className={`h-3 animate-pulse rounded bg-[#E5E5E5] ${label === "Aktionen" ? "ml-auto w-16" : "w-20"}`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, row) => (
              <tr
                key={row}
                className="border-b border-[#E5E5E5] last:border-b-0"
              >
                <td className="px-4 py-3">
                  <div className="space-y-1.5">
                    <div className="h-3 w-[min(100%,12rem)] animate-pulse rounded bg-[#E5E5E5]" />
                    <div className="h-2.5 w-32 animate-pulse rounded bg-[#F9F9F9]" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-3 w-24 animate-pulse rounded bg-[#F9F9F9]" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-6 w-28 animate-pulse rounded-full bg-[#E5E5E5]" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-3 w-28 animate-pulse rounded bg-[#F9F9F9]" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-3 w-20 animate-pulse rounded bg-[#E5E5E5]" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <div className="size-9 animate-pulse rounded-lg bg-[#F9F9F9]" />
                    <div className="size-9 animate-pulse rounded-lg bg-[#E5E5E5]" />
                    <div className="size-9 animate-pulse rounded-lg bg-[#F9F9F9]" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <li
            key={i}
            className="rounded-lg border border-[#E5E5E5] bg-white p-4"
          >
            <div className="h-4 w-3/4 animate-pulse rounded bg-[#E5E5E5]" />
            <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-[#F9F9F9]" />
            <div className="mt-4 flex gap-2">
              <div className="h-8 flex-1 animate-pulse rounded-lg bg-[#F9F9F9]" />
              <div className="h-8 w-20 animate-pulse rounded-lg bg-[#E5E5E5]" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
