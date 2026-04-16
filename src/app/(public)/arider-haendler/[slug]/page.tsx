import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Store,
  ChevronLeft,
  Navigation,
} from "lucide-react";
import { db } from "@/db";
import { dealers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { DealerMapWrapper } from "@/components/public/DealerMapWrapper";

export const revalidate = 60;

type Props = Readonly<{ params: Promise<{ slug: string }> }>;

async function geocode(
  street: string,
  zip: string,
  city: string,
): Promise<{ lat: number; lon: number } | null> {
  function parseCoords(data: unknown): { lat: number; lon: number } | null {
    if (!Array.isArray(data) || !data.length) return null;
    const first = data[0] as Record<string, unknown>;
    const lat = parseFloat(String(first?.lat ?? ""));
    const lon = parseFloat(String(first?.lon ?? ""));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  }

  try {
    const fullQuery = `${street}, ${zip} ${city}, Deutschland`;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({ q: fullQuery, format: "json", limit: "1" }),
      {
        headers: { "User-Agent": "motorrad-news/1.0 (https://motorrad.news)" },
        next: { revalidate: 86400 },
      },
    );
    if (res.ok) {
      const coords = parseCoords(await res.json());
      if (coords) return coords;
    }

    const cityQuery = `${zip} ${city}, Deutschland`;
    const fallback = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({ q: cityQuery, format: "json", limit: "1" }),
      {
        headers: { "User-Agent": "motorrad-news/1.0 (https://motorrad.news)" },
        next: { revalidate: 86400 },
      },
    );
    if (fallback.ok) {
      return parseCoords(await fallback.json());
    }

    return null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [d] = await db
    .select()
    .from(dealers)
    .where(and(eq(dealers.slug, slug), eq(dealers.isActive, true)))
    .limit(1);

  if (!d) return { title: "Händler" };

  return {
    title: `${d.name} – Arider Händler in ${d.city}`,
    description: `${d.name} – Autorisierter ${d.brand}-Händler in ${d.zip ? `${d.zip} ` : ""}${d.city}.${d.street ? ` Adresse: ${d.street}.` : ""}`,
  };
}

export default async function DealerDetailPage({ params }: Props) {
  const { slug } = await params;
  const [d] = await db
    .select()
    .from(dealers)
    .where(and(eq(dealers.slug, slug), eq(dealers.isActive, true)))
    .limit(1);

  if (!d) notFound();

  const coords = d.street || d.zip
    ? await geocode(d.street ?? "", d.zip ?? "", d.city)
    : await geocode("", "", d.city);

  const addressParts = [d.street, [d.zip, d.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${addressParts}, Deutschland`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: d.name,
    address: {
      "@type": "PostalAddress",
      ...(d.street ? { streetAddress: d.street } : {}),
      ...(d.zip ? { postalCode: d.zip } : {}),
      addressLocality: d.city,
      addressCountry: "DE",
    },
    ...(d.phone ? { telephone: d.phone } : {}),
    ...(d.email ? { email: d.email } : {}),
    ...(d.website ? { url: d.website } : {}),
    ...(coords
      ? { geo: { "@type": "GeoCoordinates", latitude: coords.lat, longitude: coords.lon } }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <nav className="mb-8" aria-label="Brotkrumen">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-[#666666]">
            <li>
              <Link href="/" className="hover:text-[#E31E24] transition-colors">
                Startseite
              </Link>
            </li>
            <li aria-hidden className="text-[#999999]">/</li>
            <li>
              <Link
                href="/arider-haendler"
                className="hover:text-[#E31E24] transition-colors"
              >
                Arider Händler
              </Link>
            </li>
            <li aria-hidden className="text-[#999999]">/</li>
            <li className="text-[#111111] font-medium truncate">{d.name}</li>
          </ol>
        </nav>

        <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-[#E31E24] to-[#C41A1F] px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Store className="size-7 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {d.name}
                </h1>
                <p className="mt-1 text-white/80">
                  {d.brand.includes(",") ? "Händler" : `${d.brand}-Händler`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-5">
            <div className="p-6 sm:p-8 space-y-6 lg:col-span-2">
              <section>
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[#111111] mb-3">
                  Adresse
                </h2>
                  <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-[#E31E24]" />
                  <div
                    className="text-[#111111]"
                    itemScope
                    itemType="https://schema.org/PostalAddress"
                  >
                    {d.street && <p itemProp="streetAddress">{d.street}</p>}
                    <p>
                      {d.zip && (
                        <>
                          <span itemProp="postalCode">{d.zip}</span>{" "}
                        </>
                      )}
                      <span itemProp="addressLocality">{d.city}</span>
                    </p>
                  </div>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#111111] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333333]"
                >
                  <Navigation className="size-4" />
                  Route planen
                </a>
              </section>

              {(d.phone || d.email || d.website) && (
                <section>
                  <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[#111111] mb-3">
                    Kontakt
                  </h2>
                  <div className="space-y-3">
                    {d.phone && (
                      <a
                        href={`tel:${d.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-3 text-[#111111] hover:text-[#E31E24] transition-colors"
                      >
                        <Phone className="size-5 shrink-0 text-[#E31E24]" />
                        {d.phone}
                      </a>
                    )}
                    {d.email && (
                      <a
                        href={`mailto:${d.email}`}
                        className="flex items-center gap-3 text-[#111111] hover:text-[#E31E24] transition-colors"
                      >
                        <Mail className="size-5 shrink-0 text-[#E31E24]" />
                        {d.email}
                      </a>
                    )}
                    {d.website && (
                      <a
                        href={d.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-[#111111] hover:text-[#E31E24] transition-colors"
                      >
                        <Globe className="size-5 shrink-0 text-[#E31E24]" />
                        {d.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>

            <div className="border-t border-[#E5E5E5] p-6 sm:p-8 lg:col-span-3 lg:border-l lg:border-t-0">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[#111111] mb-3">
                Standort
              </h2>
              {coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lon) ? (
                <DealerMapWrapper
                  lat={coords.lat}
                  lon={coords.lon}
                  name={d.name}
                  address={addressParts}
                />
              ) : (
                <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] sm:h-80">
                  <MapPin className="size-8 text-[#999999]" />
                  <p className="text-sm text-[#666666]">
                    Karte konnte nicht geladen werden.
                  </p>
                  <a
                    href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(addressParts)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E31E24] hover:underline"
                  >
                    Auf OpenStreetMap anzeigen
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-[#E5E5E5] px-6 py-4 sm:px-8">
            <Link
              href="/arider-haendler"
              className="inline-flex items-center gap-2 font-display text-sm font-semibold text-[#E31E24] hover:text-[#C41A1F] transition-colors"
            >
              <ChevronLeft className="size-4" />
              Alle Händler anzeigen
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
