"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { X, CalendarPlus, Loader2, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";

const inputClass =
  "w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm text-[#111111] placeholder:text-[#999999] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#E31E24] transition-colors";

const labelClass =
  "mb-1 block text-sm font-display font-semibold text-[#111111]";

export function SubmitEventModal() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [venueCountry, setVenueCountry] = useState("Deutschland");
  const [ticketUrl, setTicketUrl] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setVenueName("");
    setVenueAddress("");
    setVenueCity("");
    setVenueCountry("Deutschland");
    setTicketUrl("");
    setSubmitterName("");
    setSubmitterEmail("");
    setError(null);
    setSuccess(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    if (success) resetForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          startDate,
          endDate: endDate || "",
          venueName: venueName.trim(),
          venueAddress: venueAddress.trim(),
          venueCity: venueCity.trim(),
          venueCountry: venueCountry.trim(),
          ticketUrl: ticketUrl.trim() || "",
          submitterName: submitterName.trim(),
          submitterEmail: submitterEmail.trim(),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          typeof data.error === "string" ? data.error : "Einreichung fehlgeschlagen"
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="gap-2"
        onClick={() => {
          resetForm();
          setOpen(true);
        }}
      >
        <CalendarPlus className="size-5" />
        Dein Event einreichen
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-xl border-b border-[#E5E5E5] bg-white px-6 py-4">
              <h2 className="font-display text-xl font-bold text-[#111111]">
                Event einreichen
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md p-1.5 text-[#666666] transition-colors hover:bg-[#F9F9F9] hover:text-[#111111]"
                aria-label="Schließen"
              >
                <X className="size-5" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
                <CheckCircle2 className="size-16 text-green-500" />
                <h3 className="font-display text-xl font-bold text-[#111111]">
                  Vielen Dank!
                </h3>
                <p className="max-w-md text-[#666666]">
                  Dein Event wurde erfolgreich eingereicht und wird von unserem
                  Team geprüft. Nach Freigabe erscheint es auf der
                  Veranstaltungsseite.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleClose}
                  className="mt-4"
                >
                  Schließen
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
                {error && (
                  <p
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <p className="text-sm text-[#666666]">
                  Reiche dein Motorrad-Event ein! Nach einer kurzen Prüfung durch
                  unser Team wird es auf der Seite veröffentlicht.
                </p>

                {/* Kontaktdaten */}
                <fieldset className="space-y-4 rounded-lg border border-[#E5E5E5] p-4">
                  <legend className="font-display text-sm font-bold text-[#111111] px-1">
                    Deine Kontaktdaten
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="submit-name" className={labelClass}>
                        Name *
                      </label>
                      <input
                        id="submit-name"
                        type="text"
                        value={submitterName}
                        onChange={(e) => setSubmitterName(e.target.value)}
                        required
                        maxLength={100}
                        className={inputClass}
                        placeholder="Dein Name"
                      />
                    </div>
                    <div>
                      <label htmlFor="submit-email" className={labelClass}>
                        E-Mail *
                      </label>
                      <input
                        id="submit-email"
                        type="email"
                        value={submitterEmail}
                        onChange={(e) => setSubmitterEmail(e.target.value)}
                        required
                        className={inputClass}
                        placeholder="deine@email.de"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Event-Details */}
                <div>
                  <label htmlFor="submit-title" className={labelClass}>
                    Event-Titel *
                  </label>
                  <input
                    id="submit-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={255}
                    className={inputClass}
                    placeholder="z.B. Motorradtreffen am Nürburgring"
                  />
                </div>

                <div>
                  <label htmlFor="submit-desc" className={labelClass}>
                    Beschreibung *
                  </label>
                  <textarea
                    id="submit-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    maxLength={5000}
                    rows={4}
                    className={inputClass}
                    placeholder="Worum geht es bei deinem Event? Was erwartet die Besucher?"
                  />
                </div>

                {/* Datum */}
                <fieldset className="space-y-4 rounded-lg border border-[#E5E5E5] p-4">
                  <legend className="font-display text-sm font-bold text-[#111111] px-1">
                    Datum &amp; Zeit
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="submit-start" className={labelClass}>
                        Beginn *
                      </label>
                      <input
                        id="submit-start"
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="submit-end" className={labelClass}>
                        Ende (optional)
                      </label>
                      <input
                        id="submit-end"
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Veranstaltungsort */}
                <fieldset className="space-y-4 rounded-lg border border-[#E5E5E5] p-4">
                  <legend className="font-display text-sm font-bold text-[#111111] px-1">
                    Veranstaltungsort
                  </legend>
                  <div>
                    <label htmlFor="submit-venue" className={labelClass}>
                      Name der Location *
                    </label>
                    <input
                      id="submit-venue"
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      required
                      maxLength={255}
                      className={inputClass}
                      placeholder="z.B. Messe München"
                    />
                  </div>
                  <div>
                    <label htmlFor="submit-address" className={labelClass}>
                      Adresse *
                    </label>
                    <input
                      id="submit-address"
                      type="text"
                      value={venueAddress}
                      onChange={(e) => setVenueAddress(e.target.value)}
                      required
                      maxLength={255}
                      className={inputClass}
                      placeholder="Straße und Hausnummer"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="submit-city" className={labelClass}>
                        Stadt *
                      </label>
                      <input
                        id="submit-city"
                        type="text"
                        value={venueCity}
                        onChange={(e) => setVenueCity(e.target.value)}
                        required
                        maxLength={100}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="submit-country" className={labelClass}>
                        Land *
                      </label>
                      <input
                        id="submit-country"
                        type="text"
                        value={venueCountry}
                        onChange={(e) => setVenueCountry(e.target.value)}
                        required
                        maxLength={100}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="submit-ticket" className={labelClass}>
                    Ticket-URL (optional)
                  </label>
                  <input
                    id="submit-ticket"
                    type="url"
                    value={ticketUrl}
                    onChange={(e) => setTicketUrl(e.target.value)}
                    className={inputClass}
                    placeholder="https://tickets.example.com"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-[#E5E5E5] pt-5">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                    disabled={submitting}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    className="gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Wird gesendet…
                      </>
                    ) : (
                      "Event einreichen"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
