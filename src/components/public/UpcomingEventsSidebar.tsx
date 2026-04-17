import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { db } from "@/db";
import { events } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { and, asc, eq, gte, isNotNull } from "drizzle-orm";

export async function UpcomingEventsSidebar() {
  const now = new Date();

  const upcoming = await db
    .select({
      title: events.title,
      slug: events.slug,
      startDate: events.startDate,
      venueName: events.venueName,
      venueCity: events.venueCity,
    })
    .from(events)
    .where(
      and(
        eq(events.status, "PUBLISHED"),
        isNotNull(events.publishedAt),
        gte(events.startDate, now),
      ),
    )
    .orderBy(asc(events.startDate))
    .limit(5);

  if (upcoming.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-base font-bold uppercase tracking-wide text-[#111111]">
        Messen &amp; Events
      </h2>
      <ul className="mt-4 space-y-3 border-t border-[#E5E5E5] pt-4">
        {upcoming.map((ev) => (
          <li key={ev.slug}>
            <Link
              href={`/termine-events/${ev.slug}`}
              className="group block rounded-md px-2 py-1.5 transition-colors hover:bg-[#F9F9F9]"
            >
              <p className="font-display line-clamp-2 text-sm font-semibold leading-snug text-[#111111] transition-colors group-hover:text-[#E31E24]">
                {ev.title}
              </p>
              <div className="mt-1 flex flex-col gap-0.5 text-xs text-[#666666]">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3 shrink-0" />
                  {formatDate(ev.startDate)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3 shrink-0" />
                  {ev.venueName}, {ev.venueCity}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/termine-events"
        className="mt-3 inline-block text-sm font-semibold text-[#E31E24] transition-colors hover:text-[#C41A1F]"
      >
        Alle Events →
      </Link>
    </div>
  );
}
