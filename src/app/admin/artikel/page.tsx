"use client";

import { useCallback, useEffect, useState } from "react";
import { Filter, Plus, Search, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import ArticleTable, {
  type AdminArticleRow,
} from "@/components/admin/ArticleTable";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
};

type ArticleStats = {
  total: number;
  byCategory: { id: string; name: string; count: number }[];
};

const PAGE_SIZE = 25;

const selectClass =
  "w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent";

export default function ArtikelPage() {
  const [articles, setArticles] = useState<AdminArticleRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ArticleStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, categoryFilter]);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("categoryId", categoryFilter);
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String((page - 1) * PAGE_SIZE));
      const res = await fetch(`/api/articles?${params.toString()}`);
      if (!res.ok) {
        throw new Error("load_failed");
      }
      const json = await res.json() as { data?: AdminArticleRow[]; total?: number };
      setArticles(json.data ?? []);
      setTotalArticles(json.total ?? 0);
    } catch {
      setError("Artikel konnten nicht geladen werden.");
      setArticles([]);
      setTotalArticles(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, categoryFilter, page]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) return;
        const data: CategoryOption[] = await res.json();
        setCategories(data);
      } catch {
        /* still show page without category filter options beyond "Alle" */
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/articles/stats");
        if (!res.ok) return;
        const data: ArticleStats = await res.json();
        setStats(data);
      } catch {
        /* stats are non-critical */
      }
    }
    loadStats();
  }, [articles]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
          Artikel
        </h1>
        <Button
          href="/admin/artikel/neu"
          variant="primary"
          size="md"
          className="w-full gap-2 sm:w-auto"
        >
          <Plus className="size-4 shrink-0" aria-hidden />
          Neuer Artikel
        </Button>
      </div>

      {stats && (
        <section className="rounded-lg border border-[#E5E5E5] bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-display font-semibold text-[#111111] mb-3">
            <BarChart3 className="size-4 text-[#666666]" aria-hidden />
            Übersicht
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg bg-[#111111] px-4 py-2.5 text-center min-w-[100px]">
              <p className="text-xl font-bold text-white font-display">{stats.total}</p>
              <p className="text-xs text-white/70">Gesamt</p>
            </div>
            {stats.byCategory.map((cat) => (
              <div
                key={cat.id}
                className="rounded-lg bg-[#F9F9F9] border border-[#E5E5E5] px-4 py-2.5 text-center min-w-[100px]"
              >
                <p className="text-xl font-bold text-[#111111] font-display">{cat.count}</p>
                <p className="text-xs text-[#666666]">{cat.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section
        className={cn(
          "rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] p-4",
          "space-y-4"
        )}
        aria-label="Filter"
      >
        <div className="flex items-center gap-2 text-sm font-display font-semibold text-[#111111]">
          <Filter className="size-4 text-[#666666]" aria-hidden />
          Filter
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative md:col-span-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#666666]"
              aria-hidden
            />
            <Input
              id="article-search"
              type="search"
              placeholder="Titel suchen…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-white"
              aria-label="Titel suchen"
            />
          </div>
          <div>
            <label htmlFor="filter-status" className="sr-only">
              Status
            </label>
            <select
              id="filter-status"
              className={selectClass}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Alle</option>
              <option value="DRAFT">Entwurf</option>
              <option value="PUBLISHED">Veröffentlicht</option>
              <option value="ARCHIVED">Archiviert</option>
            </select>
          </div>
          <div>
            <label htmlFor="filter-category" className="sr-only">
              Kategorie
            </label>
            <select
              id="filter-category"
              className={selectClass}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Alle</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-lg border border-[#E5E5E5] bg-white px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-[#111111]">
            Keine Artikel gefunden
          </p>
          <p className="mt-2 text-sm text-[#666666]">
            Passe die Filter an oder lege einen neuen Artikel an.
          </p>
        </div>
      ) : (
        <ArticleTable articles={articles} onRefresh={loadArticles} />
      )}

      {!loading && totalArticles > PAGE_SIZE && (() => {
        const totalPages = Math.ceil(totalArticles / PAGE_SIZE);
        const from = (page - 1) * PAGE_SIZE + 1;
        const to = Math.min(page * PAGE_SIZE, totalArticles);
        return (
          <nav
            className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
            aria-label="Seitennavigation"
          >
            <p className="text-sm text-[#666666]">
              {from}–{to} von {totalArticles} Artikeln
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white text-[#111111] transition-colors hover:bg-[#F9F9F9] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Vorherige Seite"
              >
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                    acc.push("ellipsis");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "ellipsis" ? (
                    <span key={`e-${idx}`} className="px-1 text-sm text-[#666666]">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      className={cn(
                        "inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                        item === page
                          ? "bg-[#E31E24] text-white"
                          : "border border-[#E5E5E5] bg-white text-[#111111] hover:bg-[#F9F9F9]"
                      )}
                    >
                      {item}
                    </button>
                  ),
                )}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white text-[#111111] transition-colors hover:bg-[#F9F9F9] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Nächste Seite"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </nav>
        );
      })()}
    </div>
  );
}
