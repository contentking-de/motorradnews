"use client";

import { useState } from "react";
import Link from "next/link";
import { useConsent, type ConsentState } from "@/lib/consent";
import { cn } from "@/lib/utils";
import { Settings2, Shield } from "lucide-react";

type CategoryInfo = {
  key: keyof ConsentState;
  label: string;
  description: string;
  required?: boolean;
};

const CATEGORIES: CategoryInfo[] = [
  {
    key: "necessary",
    label: "Notwendig",
    description:
      "Diese Cookies sind für den Betrieb der Website unbedingt erforderlich und können nicht deaktiviert werden.",
    required: true,
  },
  {
    key: "statistics",
    label: "Statistik",
    description:
      "Statistische Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.",
  },
  {
    key: "marketing",
    label: "Marketing",
    description:
      "Marketing-Cookies werden verwendet, um Besuchern relevante Werbeanzeigen bereitzustellen.",
  },
];

export function CookieBanner() {
  const { showBanner, consent, accept, acceptAll, rejectAll } = useConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [localState, setLocalState] = useState<ConsentState>({
    necessary: true,
    statistics: consent?.statistics ?? false,
    marketing: consent?.marketing ?? false,
  });

  if (!showBanner) return null;

  function handleToggle(key: keyof ConsentState) {
    if (key === "necessary") return;
    setLocalState((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSaveSelection() {
    accept(localState);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="w-full max-w-lg rounded-xl border border-[#E5E5E5] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Cookie-Einstellungen"
      >
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E31E24]/10">
              <Shield className="size-5 text-[#E31E24]" />
            </div>
            <h2 className="font-display text-lg font-bold text-[#111111]">
              Wir respektieren Ihre Privatsphäre
            </h2>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[#666666]">
            Wir verwenden Cookies und ähnliche Technologien, um Ihnen ein
            optimales Erlebnis zu bieten. Einige sind technisch notwendig,
            andere helfen uns, unsere Website zu verbessern und Ihnen relevante
            Inhalte anzuzeigen. Sie können Ihre Einwilligung jederzeit
            anpassen.{" "}
            <Link
              href="/datenschutz"
              className="text-[#E31E24] underline hover:text-[#C41A1F]"
            >
              Datenschutzerklärung
            </Link>
          </p>

          {showDetails && (
            <div className="mt-4 space-y-3 rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] p-4">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat.key}
                  className={cn(
                    "flex items-start gap-3",
                    cat.required && "cursor-default"
                  )}
                >
                  <span className="relative mt-0.5 flex h-5 w-9 shrink-0">
                    <input
                      type="checkbox"
                      checked={cat.required ? true : localState[cat.key]}
                      disabled={cat.required}
                      onChange={() => handleToggle(cat.key)}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "block h-5 w-9 rounded-full transition-colors",
                        cat.required
                          ? "bg-[#E31E24]/60"
                          : "bg-[#E5E5E5] peer-checked:bg-[#E31E24]"
                      )}
                    />
                    <span
                      className={cn(
                        "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                        (cat.required || localState[cat.key]) &&
                          "translate-x-4"
                      )}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#111111]">
                        {cat.label}
                      </span>
                      {cat.required && (
                        <span className="rounded bg-[#E5E5E5] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#666666]">
                          Immer aktiv
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-[#666666]">
                      {cat.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={acceptAll}
              className="font-display flex-1 rounded-lg bg-[#E31E24] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#C41A1F]"
            >
              Alle akzeptieren
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className="font-display flex-1 rounded-lg border border-[#E5E5E5] bg-white px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#111111] transition-colors hover:bg-[#F9F9F9]"
            >
              Nur notwendige
            </button>
          </div>

          <div className="mt-3 flex justify-center">
            {showDetails ? (
              <button
                type="button"
                onClick={handleSaveSelection}
                className="font-display inline-flex items-center gap-1.5 text-sm font-semibold text-[#E31E24] transition-colors hover:text-[#C41A1F]"
              >
                <Settings2 className="size-4" />
                Auswahl speichern
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="font-display inline-flex items-center gap-1.5 text-sm font-semibold text-[#666666] transition-colors hover:text-[#111111]"
              >
                <Settings2 className="size-4" />
                Individuell anpassen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
