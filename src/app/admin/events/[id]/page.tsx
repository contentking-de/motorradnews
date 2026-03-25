import { EventForm, type EventFormEvent } from "@/components/admin/EventForm";
import { getRequestBaseUrl } from "@/lib/server-base-url";
import { notFound } from "next/navigation";

export default async function EditEventPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const base = await getRequestBaseUrl();

  const res = await fetch(`${base}/api/events/${id}`, { cache: "no-store" });

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Event konnte nicht geladen werden.");

  const raw = (await res.json()) as EventFormEvent;

  const event: EventFormEvent = {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description,
    startDate: raw.startDate,
    endDate: raw.endDate,
    venueName: raw.venueName,
    venueAddress: raw.venueAddress,
    venueCity: raw.venueCity,
    venueCountry: raw.venueCountry,
    ticketUrl: raw.ticketUrl,
    coverImageUrl: raw.coverImageUrl,
    status: raw.status,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-[#111111]">
        Event bearbeiten
      </h1>
      <EventForm event={event} />
    </div>
  );
}
