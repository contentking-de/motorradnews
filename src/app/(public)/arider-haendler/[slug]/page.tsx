import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Phone, Mail, Globe, Store, ChevronLeft } from "lucide-react";
import { db } from "@/db";
import { dealers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const revalidate = 60;

type Props = Readonly<{ params: Promise<{ slug: string }> }>;

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
    description: `${d.name} – Autorisierter ${d.brand}-Händler in ${d.zip} ${d.city}. Adresse: ${d.street}.`,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: d.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: d.street,
      postalCode: d.zip,
      addressLocality: d.city,
      addressCountry: "DE",
    },
    ...(d.phone ? { telephone: d.phone } : {}),
    ...(d.email ? { email: d.email } : {}),
    ...(d.website ? { url: d.website } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <nav className="mb-8" aria-label="Brotkrumen">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-[#666666]">
            <li>
              <Link href="/" className="hover:text-[#E31E24] transition-colors">
                Startseite
              </Link>
            </li>
            <li aria-hidden className="text-[#999999]">
              /
            </li>
            <li>
              <Link
                href="/arider-haendler"
                className="hover:text-[#E31E24] transition-colors"
              >
                Arider Händler
              </Link>
            </li>
            <li aria-hidden className="text-[#999999]">
              /
            </li>
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
                <p className="mt-1 text-white/80">{d.brand}-Händler</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
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
                  <p itemProp="streetAddress">{d.street}</p>
                  <p>
                    <span itemProp="postalCode">{d.zip}</span>{" "}
                    <span itemProp="addressLocality">{d.city}</span>
                  </p>
                </div>
              </div>
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

            <div className="pt-4 border-t border-[#E5E5E5]">
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
      </div>
    </>
  );
}
