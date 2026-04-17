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
          <Link href="/barrierefreiheit" className="text-white/80 transition-colors hover:text-white">
            Barrierefreiheit
          </Link>
          <button
            type="button"
            onClick={openSettings}
            className="inline-flex items-center gap-1.5 text-white/80 transition-colors hover:text-white"
          >
            <Settings2 className="size-3.5" />
            Cookie-Einstellungen
          </button>
          <a
            href="https://x.com/DE_motorradnews"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1.5 text-white/80 transition-colors hover:text-white"
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Twitter/X
          </a>
        </nav>
      </div>
    </footer>
  );
}
