import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import { db } from "@/db";
import { dealers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { Suspense } from "react";
import DealerSearch from "@/components/public/DealerSearch";
import { AllDealersMapWrapper } from "@/components/public/AllDealersMapWrapper";
import type { DealerPin } from "@/components/public/AllDealersMap";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Motorradhändler Verzeichnis",
  description:
    "Finde deinen Arider-Händler in deiner Nähe. Alle autorisierten Händler auf einen Blick.",
};

type Props = {
  searchParams: Promise<{ q?: string; brand?: string }>;
};

export default async function DealersListingPage({ searchParams }: Props) {
  const { q, brand } = await searchParams;
  const searchTerm = q?.trim() ?? "";
  const brandFilter = brand?.trim() ?? "";

  const allDealers = await db
    .select()
    .from(dealers)
    .where(eq(dealers.isActive, true))
    .orderBy(asc(dealers.zip));

  const allBrands = [
    ...new Set(
      allDealers.flatMap((d) =>
        d.brand
          ? d.brand.split(",").map((b) => b.trim()).filter(Boolean)
          : [],
      ),
    ),
  ].sort();

  const filtered = allDealers.filter((d) => {
    if (brandFilter) {
      const dealerBrands = d.brand
        ? d.brand.split(",").map((b) => b.trim().toLowerCase())
        : [];
      if (!dealerBrands.includes(brandFilter.toLowerCase())) return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const haystack = [d.name, d.city, d.zip, d.street, d.brand]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  const mapPins: DealerPin[] = filtered
    .filter((d) => d.latitude != null && d.longitude != null)
    .map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      brand: d.brand,
      city: d.city,
      lat: d.latitude!,
      lon: d.longitude!,
    }));

  const grouped = new Map<string, typeof filtered>();
  for (const d of filtered) {
    const prefix = d.zip ? d.zip.slice(0, 1) : "?";
    const region = regionName(prefix);
    if (!grouped.has(region)) grouped.set(region, []);
    grouped.get(region)!.push(d);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/arider-logo.svg"
            alt="aRider"
            width={140}
            height={40}
            className="h-10 w-auto"
          />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
              Motorradhändler Verzeichnis
            </h1>
            <p className="mt-1 text-sm text-[#666666]">
              {allDealers.length} autorisierte Händler in Deutschland
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <DealerSearch
          brands={allBrands}
          totalCount={allDealers.length}
          filteredCount={filtered.length}
        />
      </Suspense>

      {mapPins.length > 0 && (
        <div className="mt-8">
          <AllDealersMapWrapper dealers={mapPins} />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-lg text-[#666666]">
          {searchTerm || brandFilter
            ? "Keine Händler für diese Suche gefunden."
            : "Aktuell sind keine Händler gelistet."}
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {Array.from(grouped.entries()).map(([region, regionDealers]) => (
            <section key={region}>
              <h2 className="font-display text-lg font-bold tracking-tight text-[#111111] border-b border-[#E5E5E5] pb-2 mb-4">
                {region}
                <span className="ml-2 text-sm font-normal text-[#666666]">
                  ({regionDealers.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {regionDealers.map((d) => (
                  <Link
                    key={d.id}
                    href={`/arider-haendler/${d.slug}`}
                    className="group flex flex-col rounded-lg border border-[#E5E5E5] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E31E24]/30 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E31E24] border-2 border-white shadow-md">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-bold text-[#111111] leading-snug group-hover:text-[#E31E24] transition-colors">
                          {d.name}
                        </h3>
                        <p className="mt-1 text-sm text-[#666666]">{d.brand}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-start gap-2 text-sm text-[#666666]">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-[#999999]" />
                      <span>
                        {d.street && (
                          <>
                            {d.street}
                            <br />
                          </>
                        )}
                        {d.zip ? `${d.zip} ${d.city}` : d.city}
                      </span>
                    </div>
                    {d.phone && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-[#666666]">
                        <Phone className="size-4 shrink-0 text-[#999999]" />
                        {d.phone}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function regionName(plzPrefix: string): string {
  const regions: Record<string, string> = {
    "0": "Sachsen / Thüringen",
    "1": "Berlin / Brandenburg",
    "2": "Hamburg / Schleswig-Holstein / Mecklenburg-Vorpommern",
    "3": "Niedersachsen / Bremen",
    "4": "Nordrhein-Westfalen (West)",
    "5": "Nordrhein-Westfalen (Süd) / Rheinland-Pfalz",
    "6": "Hessen / Saarland / Rheinland-Pfalz",
    "7": "Baden-Württemberg",
    "8": "Bayern (Süd)",
    "9": "Bayern (Nord) / Thüringen",
    "?": "Ohne PLZ-Zuordnung",
  };
  return regions[plzPrefix] ?? `PLZ-Bereich ${plzPrefix}`;
}
