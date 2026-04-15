"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Rss, Code2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

type ScrapeConfig = {
  linkSelector?: string;
  titleSelector?: string;
  bodySelector?: string;
  teaserSelector?: string;
};

type Category = { id: string; name: string };
type Author = { id: string; name: string };

type SourceFormProps = {
  sourceId?: string;
};

export default function NewsSourceForm({ sourceId }: SourceFormProps) {
  const router = useRouter();
  const isNew = !sourceId;

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [feedUrl, setFeedUrl] = useState("");
  const [sourceType, setSourceType] = useState<"RSS" | "HTML">("RSS");
  const [isActive, setIsActive] = useState(true);
  const [scrapeConfig, setScrapeConfig] = useState<ScrapeConfig>({});
  const [defaultCategoryId, setDefaultCategoryId] = useState("");
  const [defaultAuthorId, setDefaultAuthorId] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    const [catRes, authorRes] = await Promise.all([
      fetch("/api/categories"),
      fetch("/api/users"),
    ]);
    if (catRes.ok) setCategories(await catRes.json());
    if (authorRes.ok) setAuthors(await authorRes.json());
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    if (!sourceId) return;
    setLoading(true);
    fetch(`/api/news-sources/${sourceId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setName(data.name);
        setUrl(data.url);
        setFeedUrl(data.feedUrl ?? "");
        setSourceType(data.sourceType);
        setIsActive(data.isActive);
        setScrapeConfig(data.scrapeConfig ?? {});
        setDefaultCategoryId(data.defaultCategoryId ?? "");
        setDefaultAuthorId(data.defaultAuthorId ?? "");
      })
      .catch(() => setError("Quelle konnte nicht geladen werden."))
      .finally(() => setLoading(false));
  }, [sourceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      url,
      feedUrl: feedUrl || null,
      sourceType,
      isActive,
      scrapeConfig:
        sourceType === "HTML" &&
        (scrapeConfig.linkSelector ||
          scrapeConfig.titleSelector ||
          scrapeConfig.bodySelector)
          ? scrapeConfig
          : null,
      defaultCategoryId: defaultCategoryId || null,
      defaultAuthorId: defaultAuthorId || null,
    };

    try {
      const res = await fetch(
        sourceId ? `/api/news-sources/${sourceId}` : "/api/news-sources",
        {
          method: sourceId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Fehler beim Speichern");
      }

      router.push("/admin/news-quellen");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  const selectClass =
    "w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent";

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          href="/admin/news-quellen"
          variant="ghost"
          size="sm"
          className="gap-1.5"
        >
          <ArrowLeft className="size-4" />
          Zurück
        </Button>
      </div>

      <h1 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
        {isNew ? "Neue Quelle anlegen" : "Quelle bearbeiten"}
      </h1>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-[#E5E5E5] bg-white p-6 space-y-5">
          <Input
            id="name"
            label="Name der Quelle"
            placeholder="z. B. Motorrad Online"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            id="url"
            label="Website-URL"
            type="url"
            placeholder="https://www.motorradonline.de"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />

          <div>
            <label className="mb-2 block font-display text-sm font-semibold text-[#111111]">
              Quelltyp
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSourceType("RSS")}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors",
                  sourceType === "RSS"
                    ? "border-[#E31E24] bg-red-50 text-[#E31E24]"
                    : "border-[#E5E5E5] bg-white text-[#666666] hover:border-[#999999]"
                )}
              >
                <Rss className="size-4" />
                RSS / Atom Feed
              </button>
              <button
                type="button"
                onClick={() => setSourceType("HTML")}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors",
                  sourceType === "HTML"
                    ? "border-[#E31E24] bg-red-50 text-[#E31E24]"
                    : "border-[#E5E5E5] bg-white text-[#666666] hover:border-[#999999]"
                )}
              >
                <Code2 className="size-4" />
                HTML Scraping
              </button>
            </div>
          </div>

          {sourceType === "RSS" && (
            <Input
              id="feedUrl"
              label="Feed-URL (RSS/Atom)"
              type="url"
              placeholder="https://www.motorradonline.de/feed/"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
            />
          )}

          {sourceType === "HTML" && (
            <div className="space-y-4 rounded-lg border border-dashed border-[#E5E5E5] bg-[#F9F9F9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                CSS-Selektoren für HTML-Scraping
              </p>
              <Input
                id="linkSelector"
                label="Link-Selektor (Artikelliste)"
                placeholder="a.article-link, .news-item a"
                value={scrapeConfig.linkSelector ?? ""}
                onChange={(e) =>
                  setScrapeConfig((c) => ({
                    ...c,
                    linkSelector: e.target.value,
                  }))
                }
              />
              <Input
                id="titleSelector"
                label="Titel-Selektor (Artikelseite)"
                placeholder="h1.article-title, .entry-title"
                value={scrapeConfig.titleSelector ?? ""}
                onChange={(e) =>
                  setScrapeConfig((c) => ({
                    ...c,
                    titleSelector: e.target.value,
                  }))
                }
              />
              <Input
                id="bodySelector"
                label="Body-Selektor (Artikelseite)"
                placeholder=".article-body, .entry-content"
                value={scrapeConfig.bodySelector ?? ""}
                onChange={(e) =>
                  setScrapeConfig((c) => ({
                    ...c,
                    bodySelector: e.target.value,
                  }))
                }
              />
              <Input
                id="teaserSelector"
                label="Teaser-Selektor (optional)"
                placeholder=".article-teaser, .entry-summary"
                value={scrapeConfig.teaserSelector ?? ""}
                onChange={(e) =>
                  setScrapeConfig((c) => ({
                    ...c,
                    teaserSelector: e.target.value,
                  }))
                }
              />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-[#E5E5E5] bg-white p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-[#111111]">
            Standard-Zuordnung
          </h2>

          <div>
            <label
              htmlFor="defaultCategory"
              className="mb-1 block font-display text-sm font-semibold text-[#111111]"
            >
              Standard-Kategorie
            </label>
            <select
              id="defaultCategory"
              className={selectClass}
              value={defaultCategoryId}
              onChange={(e) => setDefaultCategoryId(e.target.value)}
            >
              <option value="">Keine Kategorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="defaultAuthor"
              className="mb-1 block font-display text-sm font-semibold text-[#111111]"
            >
              Standard-Autor
            </label>
            <select
              id="defaultAuthor"
              className={selectClass}
              value={defaultAuthorId}
              onChange={(e) => setDefaultAuthorId(e.target.value)}
            >
              <option value="">Eingeloggter User</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4 rounded border-[#E5E5E5] text-[#E31E24] focus:ring-[#E31E24]"
            />
            <span className="text-sm font-semibold text-[#111111]">
              Quelle ist aktiv (wird beim täglichen Crawl berücksichtigt)
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            href="/admin/news-quellen"
            variant="secondary"
            size="md"
          >
            Abbrechen
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? "Speichert…" : isNew ? "Quelle anlegen" : "Speichern"}
          </Button>
        </div>
      </form>
    </div>
  );
}
