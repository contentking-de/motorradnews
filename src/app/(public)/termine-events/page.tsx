import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { SubmitEventModal } from "@/components/public/SubmitEventModal";
import { EventList } from "@/components/public/EventList";
import { db } from "@/db";
import { events } from "@/db/schema";
import { and, asc, desc, eq, gte, lt, isNotNull } from "drizzle-orm";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Motorrad-Termine & Events: Messen, Treffen & Ausfahrten",
  description:
    "Alle Motorrad-Termine auf einen Blick: Messen, Treffen, Ausfahrten und Festivals in Deutschland und Europa. Finde Events in deiner Nähe auf motorrad.news.",
  alternates: { canonical: "/termine-events" },
  openGraph: {
    type: "website",
    title: "Motorrad-Termine & Events: Messen, Treffen & Ausfahrten",
    description:
      "Alle Motorrad-Termine auf einen Blick: Messen, Treffen, Ausfahrten und Festivals in Deutschland und Europa. Finde Events in deiner Nähe auf motorrad.news.",
    url: "/termine-events",
  },
};

export default async function EventsListingPage() {
  const now = new Date();

  const selectFields = {
    id: events.id,
    title: events.title,
    slug: events.slug,
    startDate: events.startDate,
    endDate: events.endDate,
    venueName: events.venueName,
    venueCity: events.venueCity,
    venueCountry: events.venueCountry,
    ticketUrl: events.ticketUrl,
  };

  const [upcomingRaw, pastRaw] = await Promise.all([
    db
      .select(selectFields)
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
      .select(selectFields)
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

  const serialize = (list: typeof upcomingRaw) =>
    list.map((ev) => ({
      ...ev,
      startDate: ev.startDate.toISOString(),
      endDate: ev.endDate?.toISOString() ?? null,
    }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex items-center gap-3">
        <CalendarDays className="size-7 shrink-0 text-[#E31E24]" />
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
          Termine &amp; Events
        </h1>
      </div>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#666666] md:text-lg">
        Messen, Treffen, Ausfahrten und Festivals – alle wichtigen Motorrad-Termine auf einen Blick. Finde Events in deiner Nähe oder plane deine nächste Biker-Reise.
      </p>

      <EventList
        upcomingEvents={serialize(upcomingRaw)}
        pastEvents={serialize(pastRaw)}
        submitButton={<SubmitEventModal />}
      />
    </div>
  );
}
