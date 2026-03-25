import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Ticket, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { events } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { ArticleBody } from "@/components/public/ArticleBody";

export const revalidate = 60;

type Props = Readonly<{ params: Promise<{ slug: string }> }>;

function extractPlainText(json: string): string {
  try {
    const doc = JSON.parse(json) as { content?: { content?: { text?: string }[] }[] };
    if (!doc?.content) return json;
    return doc.content
      .flatMap((node) => node.content?.map((c) => c.text ?? "") ?? [])
      .join(" ")
      .trim();
  } catch {
    return json;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [ev] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);

  if (!ev || ev.status !== "PUBLISHED" || !ev.publishedAt) {
    return { title: "Event" };
  }

  return {
    title: ev.title,
    description: extractPlainText(ev.description).slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const [ev] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);

  if (!ev || ev.status !== "PUBLISHED" || !ev.publishedAt) {
    notFound();
  }

  const startIso = ev.startDate.toISOString();
  const endIso = ev.endDate?.toISOString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.title,
    description: extractPlainText(ev.description),
    startDate: startIso,
    ...(endIso ? { endDate: endIso } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(ev.coverImageUrl ? { image: ev.coverImageUrl } : {}),
    location: {
      "@type": "Place",
      name: ev.venueName,
      address: {
        "@type": "PostalAddress",
        streetAddress: ev.venueAddress,
        addressLocality: ev.venueCity,
        addressCountry: ev.venueCountry,
      },
    },
    ...(ev.ticketUrl
      ? {
          offers: {
            "@type": "Offer",
            url: ev.ticketUrl,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    organizer: {
      "@type": "Organization",
      name: "motorrad.news",
      url: "https://motorrad.news",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="flex flex-1 flex-col text-[#111111]">
        <section className="relative min-h-[min(50vh,400px)] w-full overflow-hidden bg-[#111111]">
          {ev.coverImageUrl ? (
            <Image
              src={ev.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#111111]" aria-hidden />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" aria-hidden />

          <div className="relative z-10 flex min-h-[min(50vh,400px)] flex-col justify-end px-4 pb-10 pt-24 sm:px-6 sm:pb-12 lg:mx-auto lg:max-w-7xl lg:px-8 lg:pb-16">
            <nav className="mb-6 text-sm text-white/70" aria-label="Brotkrumen">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="transition-colors hover:text-white">Startseite</Link>
                </li>
                <li aria-hidden className="text-white/40">/</li>
                <li>
                  <Link href="/messen-events" className="transition-colors hover:text-white">Messen &amp; Events</Link>
                </li>
              </ol>
            </nav>

            <span className="font-display mb-3 inline-flex w-fit items-center gap-1.5 rounded bg-[#E31E24] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white sm:text-sm">
              <CalendarDays className="size-3.5" />
              Event
            </span>

            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              {ev.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/85 sm:text-base">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {formatDate(ev.startDate)}
                {ev.endDate ? ` – ${formatDate(ev.endDate)}` : ""}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {ev.venueName}, {ev.venueCity}
              </span>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:flex lg:gap-10 lg:px-8 lg:py-12">
          <div className="min-w-0 flex-1">
            <div className="prose prose-lg mx-auto max-w-3xl text-[#111111] lg:mx-0">
              <ArticleBody content={ev.description} />
            </div>
          </div>

          <aside className="mt-10 shrink-0 lg:mt-0 lg:w-72" aria-label="Event-Details">
            <div className="sticky top-20 space-y-6 rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] p-5">
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[#111111]">
                  Datum &amp; Zeit
                </h2>
                <p className="mt-2 flex items-start gap-2 text-sm text-[#111111]">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#E31E24]" />
                  <span>
                    {formatDate(ev.startDate)}
                    {ev.endDate ? (
                      <>
                        <br />
                        bis {formatDate(ev.endDate)}
                      </>
                    ) : null}
                  </span>
                </p>
              </div>

              <div itemScope itemType="https://schema.org/Place">
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[#111111]">
                  Veranstaltungsort
                </h2>
                <div className="mt-2 flex items-start gap-2 text-sm text-[#111111]">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#E31E24]" />
                  <span
                    itemScope
                    itemType="https://schema.org/PostalAddress"
                    itemProp="address"
                  >
                    <strong itemProp="name">{ev.venueName}</strong>
                    <br />
                    <span itemProp="streetAddress">{ev.venueAddress}</span>
                    <br />
                    <span itemProp="addressLocality">{ev.venueCity}</span>,{" "}
                    <span itemProp="addressCountry">{ev.venueCountry}</span>
                  </span>
                </div>
              </div>

              {ev.ticketUrl ? (
                <a
                  href={ev.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display flex items-center justify-center gap-2 rounded-lg bg-[#E31E24] px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#C41A1F]"
                >
                  <Ticket className="size-4" />
                  Tickets kaufen
                  <ExternalLink className="size-3.5" />
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
