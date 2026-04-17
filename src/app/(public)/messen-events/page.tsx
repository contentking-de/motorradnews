import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { SubmitEventModal } from "@/components/public/SubmitEventModal";
import { db } from "@/db";
import { events } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { and, asc, desc, eq, gte, lt, isNotNull } from "drizzle-orm";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Messen & Events",
  description: "Motorrad-Messen, Events und Veranstaltungen",
  alternates: { canonical: "/messen-events" },
  openGraph: {
    type: "website",
    title: "Messen & Events",
    description: "Motorrad-Messen, Events und Veranstaltungen",
  },
};

export default async function EventsListingPage() {
  const now = new Date();

  const [upcomingEvents, pastEvents] = await Promise.all([
    db
      .select()
      .from(events)
      .where(
        and(
          eq(events.status, "PUBLISHED"),
          isNotNull(events.publishedAt),
          gte(events.startDate, now),
        ),
      )
      .orderBy(asc(events.startDate)),
    db
      .select()
      .from(events)
      .where(
        and(
          eq(events.status, "PUBLISHED"),
          isNotNull(events.publishedAt),
          lt(events.startDate, now),
        ),
      )
      .orderBy(desc(events.startDate)),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-7 shrink-0 text-[#E31E24]" />
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
            Motorrad Termine, Messen und Events – Veranstaltungskalender
          </h1>
        </div>
        <SubmitEventModal />
      </div>

      {upcomingEvents.length === 0 ? (
        <p className="mt-10 text-center text-lg text-[#666666]">
          Aktuell sind keine Veranstaltungen geplant.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((ev) => (
            <Link
              key={ev.id}
              href={`/messen-events/${ev.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-[#E5E5E5] bg-white transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F9F9F9]">
                {ev.coverImageUrl ? (
                  <Image
                    src={ev.coverImageUrl}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#E5E5E5] to-[#F9F9F9]">
                    <CalendarDays className="size-10 text-[#999999]" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <h2 className="font-display text-lg font-bold leading-snug text-[#111111] group-hover:text-[#E31E24]">
                  {ev.title}
                </h2>
                <div className="flex flex-col gap-1.5 text-sm text-[#666666]">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4 shrink-0" />
                    {formatDate(ev.startDate)}
                    {ev.endDate ? ` – ${formatDate(ev.endDate)}` : ""}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 shrink-0" />
                    {ev.venueName}, {ev.venueCity}
                  </span>
                </div>
                {ev.ticketUrl ? (
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#E31E24]">
                    <Ticket className="size-4" />
                    Tickets verfügbar
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}

      {pastEvents.length > 0 && (
        <section className="mt-16 border-t border-[#E5E5E5] pt-10">
          <h2 className="font-display text-xl font-bold tracking-tight text-[#111111] md:text-2xl">
            Vergangene Events &amp; Termine
          </h2>
          <div className="mt-6 space-y-3">
            {pastEvents.map((ev) => (
              <Link
                key={ev.id}
                href={`/messen-events/${ev.slug}`}
                className="group flex items-center gap-4 rounded-lg border border-[#E5E5E5] bg-white p-4 transition-colors hover:border-[#E31E24]/30 hover:bg-[#F9F9F9]"
              >
                {ev.coverImageUrl ? (
                  <div className="relative hidden size-16 shrink-0 overflow-hidden rounded-md sm:block">
                    <Image
                      src={ev.coverImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="hidden size-16 shrink-0 items-center justify-center rounded-md bg-[#F9F9F9] sm:flex">
                    <CalendarDays className="size-6 text-[#999999]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-bold text-[#111111] group-hover:text-[#E31E24]">
                    {ev.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#666666]">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5 shrink-0" />
                      {formatDate(ev.startDate)}
                      {ev.endDate ? ` – ${formatDate(ev.endDate)}` : ""}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5 shrink-0" />
                      {ev.venueName}, {ev.venueCity}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
