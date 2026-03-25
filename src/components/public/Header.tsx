"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type HeaderCategory = {
  name: string;
  slug: string;
};

export type HeaderProps = {
  categories: HeaderCategory[];
};

export function Header({ categories }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[#E5E5E5] bg-white",
        menuOpen && "shadow-sm",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display shrink-0 text-xl font-semibold tracking-tight text-[#111111] sm:text-2xl"
          onClick={() => setMenuOpen(false)}
        >
          <span className="font-bold text-black">motorrad</span>
          <span className="font-bold text-[#E31E24]">.news</span>
        </Link>

        <nav
          className="font-display hidden items-center justify-center gap-6 text-base font-semibold uppercase tracking-wide text-[#111111] md:flex md:flex-1"
          aria-label="Kategorien"
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="transition-colors hover:text-[#E31E24]"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="font-display flex h-10 w-10 items-center justify-center rounded-md border border-[#E5E5E5] text-[#111111] md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="sr-only">Menü</span>
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "font-display border-t border-[#E5E5E5] bg-white md:hidden",
          menuOpen ? "block" : "hidden",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3 text-base font-semibold uppercase tracking-wide" aria-label="Kategorien mobil">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="rounded-md px-3 py-2 text-[#111111] hover:bg-[#F9F9F9] hover:text-[#E31E24]"
              onClick={() => setMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
