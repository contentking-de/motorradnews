"use client";

import Link from "next/link";
import { useConsent } from "@/lib/consent";
import { Settings2 } from "lucide-react";

export function Footer() {
  const { openSettings } = useConsent();

  return (
    <footer className="mt-auto bg-[#111111] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="font-display text-sm text-white/90">
          © 2025 motorrad.news
        </p>
        <nav className="font-display flex flex-wrap items-center gap-6 text-sm font-semibold uppercase tracking-wide">
          <Link href="/impressum" className="text-white/80 transition-colors hover:text-white">
            Impressum
          </Link>
          <Link href="/datenschutz" className="text-white/80 transition-colors hover:text-white">
            Datenschutz
          </Link>
          <button
            type="button"
            onClick={openSettings}
            className="inline-flex items-center gap-1.5 text-white/80 transition-colors hover:text-white"
          >
            <Settings2 className="size-3.5" />
            Cookie-Einstellungen
          </button>
        </nav>
      </div>
    </footer>
  );
}
