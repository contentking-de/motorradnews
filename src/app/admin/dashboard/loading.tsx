const cardClass =
  "rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8" aria-busy aria-label="Dashboard wird geladen">
      <div className="space-y-2">
        <div className="h-8 w-48 max-w-full animate-pulse rounded-md bg-[#E5E5E5] md:h-9" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-[#F9F9F9]" />
      </div>

      <section aria-label="Kennzahlen">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={cardClass}>
              <div className="flex flex-col gap-3">
                <div className="size-11 shrink-0 animate-pulse rounded-lg bg-[#F9F9F9]" />
                <div className="h-9 w-16 animate-pulse rounded bg-[#E5E5E5] md:h-10" />
                <div className="h-3 w-28 animate-pulse rounded bg-[#F9F9F9]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-skeleton-heading">
        <div className="h-5 w-40 animate-pulse rounded bg-[#E5E5E5]" id="recent-skeleton-heading" />
        <div className="mt-1 h-3 w-56 animate-pulse rounded bg-[#F9F9F9]" />
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
                {["Titel", "Status", "Autor", "Datum"].map((label) => (
                  <th key={label} className="px-4 py-3">
                    <span className="sr-only">{label}</span>
                    <div className="h-3 w-16 animate-pulse rounded bg-[#E5E5E5]" />
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
                    <div className="h-3 w-[min(100%,12rem)] animate-pulse rounded bg-[#E5E5E5]" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-24 animate-pulse rounded-full bg-[#F9F9F9]" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-28 animate-pulse rounded bg-[#F9F9F9]" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-20 animate-pulse rounded bg-[#E5E5E5]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
