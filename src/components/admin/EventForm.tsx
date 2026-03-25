"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { slugify } from "@/lib/utils";
import { eventSchema } from "@/lib/validations";

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [] });

function normalizeDescription(desc: string | undefined): string {
  if (!desc || desc.trim() === "") return EMPTY_DOC;
  try {
    const parsed = JSON.parse(desc) as { type?: string };
    if (parsed && typeof parsed === "object" && parsed.type === "doc") return desc;
  } catch { /* kein JSON */ }
  return EMPTY_DOC;
}

export type EventFormEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string | Date;
  endDate: string | Date | null;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueCountry: string;
  ticketUrl: string | null;
  coverImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const STATUS_OPTIONS = [
  { value: "DRAFT" as const, label: "Entwurf" },
  { value: "PUBLISHED" as const, label: "Veröffentlicht" },
  { value: "ARCHIVED" as const, label: "Archiviert" },
];

const selectClass =
  "w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent transition-colors";

const inputClass =
  "w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm text-[#111111] placeholder:text-[#999999] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#E31E24] transition-colors";

function toDatetimeLocal(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface EventFormProps {
  event?: EventFormEvent;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const isEdit = Boolean(event);

  const [title, setTitle] = useState(event?.title ?? "");
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [description, setDescription] = useState(() =>
    normalizeDescription(event?.description)
  );
  const [startDate, setStartDate] = useState(toDatetimeLocal(event?.startDate));
  const [endDate, setEndDate] = useState(toDatetimeLocal(event?.endDate));
  const [venueName, setVenueName] = useState(event?.venueName ?? "");
  const [venueAddress, setVenueAddress] = useState(event?.venueAddress ?? "");
  const [venueCity, setVenueCity] = useState(event?.venueCity ?? "");
  const [venueCountry, setVenueCountry] = useState(event?.venueCountry ?? "Deutschland");
  const [ticketUrl, setTicketUrl] = useState(event?.ticketUrl ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(event?.coverImageUrl ?? "");
  const [status, setStatus] = useState<EventFormEvent["status"]>(event?.status ?? "DRAFT");

  const slugTouchedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouchedRef.current) setSlug(slugify(v));
  };

  const onSlugChange = (v: string) => {
    slugTouchedRef.current = true;
    setSlug(v);
  };

  const submitEvent = async (nextStatus: EventFormEvent["status"]) => {
    setError(null);

    const parsed = eventSchema.safeParse({
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      startDate,
      endDate: endDate || "",
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim(),
      venueCity: venueCity.trim(),
      venueCountry: venueCountry.trim(),
      ticketUrl: ticketUrl.trim() || "",
      coverImageUrl: coverImageUrl.trim() || "",
      status: nextStatus,
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setError(first?.message ?? "Bitte Eingaben prüfen.");
      return;
    }

    const payload = {
      ...parsed.data,
      ticketUrl: parsed.data.ticketUrl || null,
      coverImageUrl: parsed.data.coverImageUrl || null,
      endDate: parsed.data.endDate || null,
    };

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/events/${event!.id}` : "/api/events";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Speichern fehlgeschlagen.");
        return;
      }
      router.push("/admin/events");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <Input id="event-title" label="Titel" value={title} onChange={(e) => onTitleChange(e.target.value)} required maxLength={255} />

      <Input id="event-slug" label="Slug" value={slug} onChange={(e) => onSlugChange(e.target.value)} required maxLength={255} spellCheck={false} />

      <div className="w-full">
        <span className="mb-1 block text-sm font-display font-semibold text-[#111111]">
          Beschreibung
        </span>
        <ArticleEditor content={description} onChange={setDescription} />
      </div>

      <fieldset className="space-y-4 rounded-lg border border-[#E5E5E5] p-4">
        <legend className="font-display text-sm font-bold text-[#111111] px-1">Datum &amp; Zeit</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-start" className="mb-1 block text-sm font-display font-semibold text-[#111111]">Beginn</label>
            <input id="event-start" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="event-end" className="mb-1 block text-sm font-display font-semibold text-[#111111]">Ende (optional)</label>
            <input id="event-end" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-[#E5E5E5] p-4">
        <legend className="font-display text-sm font-bold text-[#111111] px-1">Veranstaltungsort</legend>
        <Input id="event-venue" label="Name der Location" value={venueName} onChange={(e) => setVenueName(e.target.value)} required maxLength={255} placeholder="z.B. Messe München" />
        <Input id="event-address" label="Adresse" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} required maxLength={255} placeholder="Straße und Hausnummer" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="event-city" label="Stadt" value={venueCity} onChange={(e) => setVenueCity(e.target.value)} required maxLength={100} />
          <Input id="event-country" label="Land" value={venueCountry} onChange={(e) => setVenueCountry(e.target.value)} required maxLength={100} />
        </div>
      </fieldset>

      <Input id="event-ticket" label="Ticket-URL (optional)" value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} placeholder="https://tickets.example.com/…" />

      <div className="w-full">
        <label htmlFor="event-status" className="mb-1 block text-sm font-display font-semibold text-[#111111]">Status</label>
        <select id="event-status" className={selectClass} value={status} onChange={(e) => setStatus(e.target.value as EventFormEvent["status"])}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <ImageUploader value={coverImageUrl} onChange={setCoverImageUrl} label="Event-/Venuefoto" />

      <div className="flex flex-wrap gap-3 pt-2">
        {isEdit ? (
          <Button type="button" variant="primary" disabled={submitting} onClick={() => submitEvent(status)}>
            {submitting ? "Wird gespeichert…" : "Änderungen speichern"}
          </Button>
        ) : (
          <>
            <Button type="button" variant="secondary" disabled={submitting} onClick={() => submitEvent("DRAFT")}>
              {submitting ? "Wird gespeichert…" : "Als Entwurf speichern"}
            </Button>
            <Button type="button" variant="primary" disabled={submitting} onClick={() => submitEvent("PUBLISHED")}>
              {submitting ? "Wird gespeichert…" : "Veröffentlichen"}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
