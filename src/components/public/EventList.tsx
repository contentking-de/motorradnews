"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Ticket, ChevronRight, Search, X } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { formatDate } from "@/lib/utils";

type SerializedEvent = {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  endDate: string | null;
  venueName: string;
  venueCity: string;
  venueCountry: string;
  ticketUrl: string | null;
};

function groupByMonth(eventList: SerializedEvent[]): Map<string, SerializedEvent[]> {
  const grouped = new Map<string, SerializedEvent[]>();
  for (const ev of eventList) {
    const key = format(new Date(ev.startDate), "MMMM yyyy", { locale: de });
    const arr = grouped.get(key) ?? [];
    arr.push(ev);
    grouped.set(key, arr);
  }
  return grouped;
}

function EventRow({ ev }: { ev: SerializedEvent }) {
  const date = new Date(ev.startDate);
  const dayStr = format(date, "dd", { locale: de });
  const monthShort = format(date, "MMM", { locale: de });

  return (
    <Link
      href={`/termine-events/${ev.slug}`}
      className="group flex items-center gap-4 rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 transition-colors hover:border-[#E31E24]/30 hover:bg-[#FAFAFA]"
    >
      <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-md bg-[#111111] text-white">
        <span className="text-lg font-bold leading-none">{dayStr}</span>
        <span className="text-[10px] uppercase tracking-wider text-white/70">{monthShort}</span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-display text-sm font-bold leading-snug text-[#111111] group-hover:text-[#E31E24] sm:text-base">
          {ev.title}
        </h3>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#666666] sm:text-sm">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5 shrink-0" />
            {formatDate(ev.startDate)}
            {ev.endDate && new Date(ev.endDate).getTime() !== date.getTime()
              ? ` – ${formatDate(ev.endDate)}`
              : ""}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 shrink-0" />
            {ev.venueCity}{ev.venueCountry !== "Deutschland" ? `, ${ev.venueCountry}` : ""}
          </span>
        </div>
      </div>

      {ev.ticketUrl ? (
        <span className="hidden shrink-0 items-center gap-1 rounded-full bg-[#E31E24]/10 px-2.5 py-1 text-xs font-semibold text-[#E31E24] sm:inline-flex">
          <Ticket className="size-3.5" />
          Tickets
        </span>
      ) : null}

      <ChevronRight className="size-4 shrink-0 text-[#CCCCCC] transition-colors group-hover:text-[#E31E24]" />
    </Link>
  );
}

function MonthSection({ label, eventList }: { label: string; eventList: SerializedEvent[] }) {
  return (
    <div>
      <h3 className="font-display sticky top-16 z-10 border-b border-[#E5E5E5] bg-[#F5F5F5] px-3 py-2 text-sm font-bold uppercase tracking-wider text-[#666666]">
        {label}
        <span className="ml-2 text-xs font-normal text-[#999999]">
          ({eventList.length} {eventList.length === 1 ? "Event" : "Events"})
        </span>
      </h3>
      <div className="mt-2 space-y-2">
        {eventList.map((ev) => (
          <EventRow key={ev.id} ev={ev} />
        ))}
      </div>
    </div>
  );
}

export function EventList({
  upcomingEvents,
  pastEvents,
  submitButton,
}: {
  upcomingEvents: SerializedEvent[];
  pastEvents: SerializedEvent[];
  submitButton?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");

  const normalize = (s: string) => s.toLowerCase().replace(/[äöüß]/g, (c) =>
    ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[c] ?? c
  );

  const filteredUpcoming = useMemo(() => {
    if (!query.trim()) return upcomingEvents;
    const q = normalize(query.trim());
    return upcomingEvents.filter((ev) => {
      const haystack = normalize(
        `${ev.title} ${ev.venueName} ${ev.venueCity} ${ev.venueCountry}`
      );
      return q.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [query, upcomingEvents]);

  const filteredPast = useMemo(() => {
    if (!query.trim()) return pastEvents;
    const q = normalize(query.trim());
    return pastEvents.filter((ev) => {
      const haystack = normalize(
        `${ev.title} ${ev.venueName} ${ev.venueCity} ${ev.venueCountry}`
      );
      return q.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [query, pastEvents]);

  const upcomingByMonth = groupByMonth(filteredUpcoming);
  const pastByMonth = groupByMonth(filteredPast);
  const totalResults = filteredUpcoming.length + filteredPast.length;
  const isSearching = query.trim().length > 0;

  return (
    <>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#999999]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Events durchsuchen – Name, Stadt, Land…"
            className="w-full rounded-lg border border-[#E5E5E5] bg-white py-2.5 pl-10 pr-10 text-sm text-[#111111] placeholder:text-[#999999] focus:border-[#E31E24] focus:outline-none focus:ring-1 focus:ring-[#E31E24]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#999999] hover:text-[#111111]"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        {submitButton && <div className="shrink-0">{submitButton}</div>}
      </div>

      {isSearching && (
        <p className="mt-2 text-sm text-[#666666]">
          {totalResults === 0
            ? "Keine Events gefunden."
            : `${totalResults} ${totalResults === 1 ? "Event" : "Events"} gefunden`}
        </p>
      )}

      {!isSearching && (
        <p className="mt-3 text-sm text-[#666666]">
          {upcomingEvents.length} kommende Veranstaltungen
        </p>
      )}

      {filteredUpcoming.length === 0 && filteredPast.length === 0 && !isSearching ? (
        <p className="mt-10 text-center text-lg text-[#666666]">
          Aktuell sind keine Veranstaltungen geplant.
        </p>
      ) : (
        <>
          {filteredUpcoming.length > 0 && (
            <div className="mt-6 space-y-8">
              {isSearching && filteredPast.length > 0 && (
                <h2 className="font-display text-lg font-bold text-[#111111]">Kommende Events</h2>
              )}
              {[...upcomingByMonth.entries()].map(([month, monthEvents]) => (
                <MonthSection key={month} label={month} eventList={monthEvents} />
              ))}
            </div>
          )}

          {filteredPast.length > 0 && (
            <section className={filteredUpcoming.length > 0 ? "mt-16 border-t border-[#E5E5E5] pt-10" : "mt-6"}>
              <h2 className="font-display text-xl font-bold tracking-tight text-[#111111] md:text-2xl">
                Vergangene Events
              </h2>
              <div className="mt-6 space-y-8">
                {[...pastByMonth.entries()].map(([month, monthEvents]) => (
                  <MonthSection key={month} label={month} eventList={monthEvents} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
