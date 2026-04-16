"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";

type Props = {
  brands: string[];
  totalCount: number;
  filteredCount: number;
};

export default function DealerSearch({ brands, totalCount, filteredCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const activeBrand = searchParams.get("brand") ?? "";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router],
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const hasFilters = q.length > 0 || activeBrand.length > 0;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#999999]" />
          <input
            type="text"
            placeholder="Händler, Stadt oder PLZ suchen…"
            defaultValue={q}
            onChange={(e) => updateParams("q", e.target.value)}
            className="w-full rounded-lg border border-[#E5E5E5] bg-white py-2.5 pl-10 pr-4 text-sm text-[#111111] placeholder:text-[#999999] focus:border-[#E31E24] focus:outline-none focus:ring-2 focus:ring-[#E31E24]/20 transition-colors"
          />
        </div>

        <select
          value={activeBrand}
          onChange={(e) => updateParams("brand", e.target.value)}
          className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-2.5 text-sm text-[#111111] focus:border-[#E31E24] focus:outline-none focus:ring-2 focus:ring-[#E31E24]/20 transition-colors sm:w-52"
        >
          <option value="">Alle Marken</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#666666] transition-colors hover:bg-[#F9F9F9] hover:text-[#111111]"
          >
            <X className="size-4" />
            Zurücksetzen
          </button>
        )}
      </div>

      {hasFilters && (
        <p className="text-sm text-[#666666]">
          {isPending ? (
            "Suche…"
          ) : (
            <>
              {filteredCount} von {totalCount} Händler
              {filteredCount !== 1 ? "n" : ""} gefunden
            </>
          )}
        </p>
      )}
    </div>
  );
}
