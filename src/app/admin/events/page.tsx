"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { cn, formatDate } from "@/lib/utils";

type EventRow = {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  endDate: string | null;
  venueName: string;
  venueCity: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  authorName: string;
};

const statusLabels: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Entwurf", className: "bg-yellow-100 text-yellow-800" },
  PUBLISHED: { label: "Veröffentlicht", className: "bg-green-100 text-green-800" },
  ARCHIVED: { label: "Archiviert", className: "bg-gray-100 text-gray-600" },
};

const selectClass =
  "w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent";

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      const q = params.toString();
      const res = await fetch(q ? `/api/events?${q}` : "/api/events");
      if (!res.ok) throw new Error("load_failed");
      setEvents(await res.json());
    } catch {
      setError("Events konnten nicht geladen werden.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Event „${title}" wirklich löschen?`)) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      loadEvents();
    } catch {
      alert("Löschen fehlgeschlagen.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
          Messen &amp; Events
        </h1>
        <Button href="/admin/events/neu" variant="primary" size="md" className="w-full gap-2 sm:w-auto">
          <Plus className="size-4 shrink-0" aria-hidden />
          Neues Event
        </Button>
      </div>

      <section className="rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] p-4 space-y-4" aria-label="Filter">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#666666]" aria-hidden />
            <Input id="event-search" type="search" placeholder="Titel suchen…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9 bg-white" aria-label="Titel suchen" />
          </div>
          <select id="filter-status" className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Alle Status</option>
            <option value="DRAFT">Entwurf</option>
            <option value="PUBLISHED">Veröffentlicht</option>
            <option value="ARCHIVED">Archiviert</option>
          </select>
        </div>
      </section>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : events.length === 0 ? (
        <div className="rounded-lg border border-[#E5E5E5] bg-white px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-[#111111]">Keine Events gefunden</p>
          <p className="mt-2 text-sm text-[#666666]">Passe die Filter an oder lege ein neues Event an.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#E5E5E5] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
              <tr>
                <th className="px-4 py-3 font-display font-semibold text-[#111111]">Event</th>
                <th className="px-4 py-3 font-display font-semibold text-[#111111] hidden sm:table-cell">Datum</th>
                <th className="px-4 py-3 font-display font-semibold text-[#111111] hidden md:table-cell">Ort</th>
                <th className="px-4 py-3 font-display font-semibold text-[#111111]">Status</th>
                <th className="px-4 py-3 text-right font-display font-semibold text-[#111111]">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {events.map((ev) => {
                const s = statusLabels[ev.status] ?? statusLabels.DRAFT;
                return (
                  <tr key={ev.id} className="hover:bg-[#F9F9F9] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#111111]">{ev.title}</p>
                      <p className="mt-0.5 text-xs text-[#666666]">{ev.authorName}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-[#666666]">
                        <CalendarDays className="size-3.5" />
                        {formatDate(ev.startDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-[#666666]">
                        <MapPin className="size-3.5" />
                        {ev.venueName}, {ev.venueCity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", s.className)}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/events/${ev.id}`} className="rounded-md p-1.5 text-[#666666] hover:bg-[#F9F9F9] hover:text-[#E31E24]" title="Bearbeiten">
                          <Pencil className="size-4" />
                        </Link>
                        <button type="button" onClick={() => handleDelete(ev.id, ev.title)} className="rounded-md p-1.5 text-[#666666] hover:bg-red-50 hover:text-red-600" title="Löschen">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
