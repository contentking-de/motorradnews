"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  Pencil,
  Plus,
  Rss,
  Search,
  Code2,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { cn, formatRelative } from "@/lib/utils";

type SourceRow = {
  id: string;
  name: string;
  url: string;
  feedUrl: string | null;
  sourceType: "RSS" | "HTML";
  isActive: boolean;
  categoryName: string | null;
  authorName: string | null;
  lastCrawledAt: string | null;
  createdAt: string;
};

export default function NewsQuellenPage() {
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crawlingIds, setCrawlingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      300
    );
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const loadSources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      const q = params.toString();
      const res = await fetch(
        q ? `/api/news-sources?${q}` : "/api/news-sources"
      );
      if (!res.ok) throw new Error("load_failed");
      setSources(await res.json());
    } catch {
      setError("Quellen konnten nicht geladen werden.");
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Quelle „${name}" wirklich löschen? Alle importierten Items werden ebenfalls gelöscht.`))
      return;
    try {
      const res = await fetch(`/api/news-sources/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      loadSources();
    } catch {
      alert("Löschen fehlgeschlagen.");
    }
  }

  async function handleCrawl(id: string) {
    setCrawlingIds((s) => new Set(s).add(id));
    try {
      const res = await fetch(`/api/news-sources/${id}/crawl`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.error) {
        alert(`Crawl-Fehler: ${data.error}`);
      } else {
        alert(
          data.newItems > 0
            ? `${data.newItems} neue Items gefunden!`
            : "Keine neuen Items gefunden."
        );
      }
      loadSources();
    } catch {
      alert("Crawl fehlgeschlagen.");
    } finally {
      setCrawlingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/news-sources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (!res.ok) throw new Error();
      loadSources();
    } catch {
      alert("Status konnte nicht geändert werden.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
          News-Quellen
        </h1>
        <Button
          href="/admin/news-quellen/neu"
          variant="primary"
          size="md"
          className="w-full gap-2 sm:w-auto"
        >
          <Plus className="size-4 shrink-0" aria-hidden />
          Neue Quelle
        </Button>
      </div>

      <section
        className="rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] p-4"
        aria-label="Filter"
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#666666]"
            aria-hidden
          />
          <Input
            id="source-search"
            type="search"
            placeholder="Quelle suchen…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-white pl-9"
            aria-label="Quelle suchen"
          />
        </div>
      </section>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded-lg border border-[#E5E5E5] bg-white px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-[#111111]">
            Keine Quellen gefunden
          </p>
          <p className="mt-2 text-sm text-[#666666]">
            Lege eine neue News-Quelle an, um mit dem Crawlen zu beginnen.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#E5E5E5] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
              <tr>
                <th className="px-4 py-3 font-display font-semibold text-[#111111]">
                  Quelle
                </th>
                <th className="hidden px-4 py-3 font-display font-semibold text-[#111111] sm:table-cell">
                  Typ
                </th>
                <th className="hidden px-4 py-3 font-display font-semibold text-[#111111] md:table-cell">
                  Kategorie
                </th>
                <th className="px-4 py-3 font-display font-semibold text-[#111111]">
                  Status
                </th>
                <th className="hidden px-4 py-3 font-display font-semibold text-[#111111] lg:table-cell">
                  Letzter Crawl
                </th>
                <th className="px-4 py-3 text-right font-display font-semibold text-[#111111]">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {sources.map((src) => (
                <tr
                  key={src.id}
                  className="transition-colors hover:bg-[#F9F9F9]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Globe className="size-4 shrink-0 text-[#666666]" />
                      <div>
                        <Link
                          href={`/admin/news-quellen/${src.id}`}
                          className="font-semibold text-[#111111] hover:text-[#E31E24]"
                        >
                          {src.name}
                        </Link>
                        <p className="mt-0.5 truncate text-xs text-[#666666]">
                          {src.url}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        src.sourceType === "RSS"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-purple-100 text-purple-800"
                      )}
                    >
                      {src.sourceType === "RSS" ? (
                        <Rss className="size-3" />
                      ) : (
                        <Code2 className="size-3" />
                      )}
                      {src.sourceType}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-[#666666] md:table-cell">
                    {src.categoryName ?? "–"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleActive(src.id, src.isActive)
                      }
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                        src.isActive
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                      title={
                        src.isActive
                          ? "Aktiv – Klicken zum Deaktivieren"
                          : "Inaktiv – Klicken zum Aktivieren"
                      }
                    >
                      {src.isActive ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <XCircle className="size-3" />
                      )}
                      {src.isActive ? "Aktiv" : "Inaktiv"}
                    </button>
                  </td>
                  <td className="hidden px-4 py-3 text-[#666666] lg:table-cell">
                    {src.lastCrawledAt
                      ? formatRelative(src.lastCrawledAt)
                      : "Noch nie"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleCrawl(src.id)}
                        disabled={crawlingIds.has(src.id)}
                        className="rounded-md p-1.5 text-[#666666] hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                        title="Jetzt crawlen"
                      >
                        {crawlingIds.has(src.id) ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <RefreshCw className="size-4" />
                        )}
                      </button>
                      <Link
                        href={`/admin/news-quellen/${src.id}/items`}
                        className="rounded-md p-1.5 text-[#666666] hover:bg-[#F9F9F9] hover:text-[#E31E24]"
                        title="Importierte Items"
                      >
                        <Rss className="size-4" />
                      </Link>
                      <Link
                        href={`/admin/news-quellen/${src.id}`}
                        className="rounded-md p-1.5 text-[#666666] hover:bg-[#F9F9F9] hover:text-[#E31E24]"
                        title="Bearbeiten"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(src.id, src.name)}
                        className="rounded-md p-1.5 text-[#666666] hover:bg-red-50 hover:text-red-600"
                        title="Löschen"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
