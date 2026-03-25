"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/suche?q=${encodeURIComponent(q)}`);
    closeSearch();
    setMenuOpen(false);
  }

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
          <Link
            href="/messen-events"
            className="transition-colors hover:text-[#E31E24]"
          >
            Events
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Suchen…"
                className="h-10 w-40 rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] px-3 text-sm text-[#111111] outline-none transition-all placeholder:text-[#999999] focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24] sm:w-56"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="flex h-10 w-10 items-center justify-center rounded-md text-[#666666] transition-colors hover:text-[#111111]"
                aria-label="Suche schließen"
              >
                <X className="size-5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={openSearch}
              className="flex h-10 w-10 items-center justify-center rounded-md text-[#111111] transition-colors hover:text-[#E31E24]"
              aria-label="Suche öffnen"
            >
              <Search className="size-5" />
            </button>
          )}

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
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "font-display border-t border-[#E5E5E5] bg-white md:hidden",
          menuOpen ? "block" : "hidden",
        )}
      >
        <div className="px-4 pt-3">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#999999]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Artikel suchen…"
                className="h-10 w-full rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] pl-9 pr-3 text-sm text-[#111111] outline-none placeholder:text-[#999999] focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24]"
              />
            </div>
          </form>
        </div>
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
          <Link
            href="/messen-events"
            className="rounded-md px-3 py-2 text-[#111111] hover:bg-[#F9F9F9] hover:text-[#E31E24]"
            onClick={() => setMenuOpen(false)}
          >
            Events
          </Link>
        </nav>
      </div>
    </header>
  );
}
