"use client";

import { useConsent } from "@/lib/consent";
import { Settings2 } from "lucide-react";

export function CookieSettingsButton() {
  const { openSettings } = useConsent();

  return (
    <button
      type="button"
      onClick={openSettings}
      className="font-display inline-flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] px-4 py-2.5 text-sm font-semibold text-[#111111] transition-colors hover:border-[#E31E24] hover:text-[#E31E24]"
    >
      <Settings2 className="size-4" />
      Cookie-Einstellungen ändern
    </button>
  );
}
