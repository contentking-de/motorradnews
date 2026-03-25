"use client";

import { useCallback, useEffect, useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
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

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("categoryId", categoryFilter);
      const q = params.toString();
      const res = await fetch(q ? `/api/articles?${q}` : "/api/articles");
      if (!res.ok) {
        throw new Error("load_failed");
      }
      const data: AdminArticleRow[] = await res.json();
      setArticles(data);
    } catch {
      setError("Artikel konnten nicht geladen werden.");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, categoryFilter]);

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
    </div>
  );
}
