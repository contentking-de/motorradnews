"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  SkipForward,
  RefreshCw,
  Download,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { cn, formatRelative } from "@/lib/utils";

type IngestedItem = {
  id: string;
  sourceId: string;
  externalUrl: string;
  originalTitle: string | null;
  originalBody: string | null;
  rewrittenTitle: string | null;
  rewrittenTeaser: string | null;
  rewrittenBody: string | null;
  status:
    | "NEW"
    | "REWRITING"
    | "REWRITTEN"
    | "ARTICLE_CREATED"
    | "FAILED"
    | "SKIPPED";
  articleId: string | null;
  errorMessage: string | null;
  fetchedAt: string;
  rewrittenAt: string | null;
  sourceName: string | null;
};

const statusConfig: Record<
  string,
  { label: string; className: string; icon: typeof AlertCircle }
> = {
  NEW: { label: "Neu", className: "bg-blue-100 text-blue-800", icon: RefreshCw },
  REWRITING: {
    label: "Wird umgeschrieben…",
    className: "bg-yellow-100 text-yellow-800",
    icon: Loader2,
  },
  REWRITTEN: {
    label: "Umgeschrieben",
    className: "bg-green-100 text-green-800",
    icon: Sparkles,
  },
  ARTICLE_CREATED: {
    label: "Artikel erstellt",
    className: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Fehler",
    className: "bg-red-100 text-red-800",
    icon: AlertCircle,
  },
  SKIPPED: {
    label: "Übersprungen",
    className: "bg-gray-100 text-gray-600",
    icon: SkipForward,
  },
};

type Props = { params: Promise<{ id: string }> };

export default function IngestedItemsPage({ params }: Props) {
  const { id: sourceId } = use(params);
  const [items, setItems] = useState<IngestedItem[]>([]);
  const [sourceName, setSourceName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [crawling, setCrawling] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ sourceId });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/ingested-items?${params}`);
      if (!res.ok) throw new Error();
      const data: IngestedItem[] = await res.json();
      setItems(data);
      if (data.length > 0 && data[0].sourceName) {
        setSourceName(data[0].sourceName);
      }
    } catch {
      setError("Items konnten nicht geladen werden.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [sourceId, statusFilter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (!sourceName) {
      fetch(`/api/news-sources/${sourceId}`)
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setSourceName(data.name);
          }
        })
        .catch(() => {});
    }
  }, [sourceId, sourceName]);

  async function handleCrawlNow() {
    setCrawling(true);
    try {
      const res = await fetch(`/api/news-sources/${sourceId}/crawl`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      alert(
        data.newItems > 0
          ? `${data.newItems} neue Items gefunden!`
          : "Keine neuen Items gefunden."
      );
      await loadItems();
    } catch {
      alert("Crawl fehlgeschlagen.");
    } finally {
      setCrawling(false);
    }
  }

  async function handleRewrite(itemId: string) {
    setProcessingIds((s) => new Set(s).add(itemId));
    try {
      const res = await fetch(`/api/ingested-items/${itemId}/rewrite`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Fehler");
      }
      await loadItems();
    } catch (err) {
      alert(
        `KI-Umschreibung fehlgeschlagen: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`
      );
      await loadItems();
    } finally {
      setProcessingIds((s) => {
        const next = new Set(s);
        next.delete(itemId);
        return next;
      });
    }
  }

  async function handleRescrape(itemId: string) {
    setProcessingIds((s) => new Set(s).add(itemId));
    try {
      const res = await fetch(`/api/ingested-items/${itemId}/rescrape`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Fehler");
      }
      const data = await res.json();
      alert(`Inhalt neu gescrapt! (${data.bodyLength} Zeichen)`);
      await loadItems();
    } catch (err) {
      alert(
        `Scraping fehlgeschlagen: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`
      );
    } finally {
      setProcessingIds((s) => {
        const next = new Set(s);
        next.delete(itemId);
        return next;
      });
    }
  }

  async function handleCreateArticle(itemId: string) {
    setProcessingIds((s) => new Set(s).add(itemId));
    try {
      const res = await fetch(
        `/api/ingested-items/${itemId}/create-article`,
        { method: "POST", credentials: "include" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Fehler");
      }
      const data = await res.json();
      alert(`Artikel als Entwurf erstellt! (ID: ${data.articleId})`);
      await loadItems();
    } catch (err) {
      alert(
        `Artikel-Erstellung fehlgeschlagen: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`
      );
    } finally {
      setProcessingIds((s) => {
        const next = new Set(s);
        next.delete(itemId);
        return next;
      });
    }
  }

  const selectClass =
    "w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
            Importierte News
          </h1>
          {sourceName && (
            <p className="mt-1 text-sm text-[#666666]">
              Quelle: {sourceName}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleCrawlNow}
            disabled={crawling}
            className="gap-2"
          >
            {crawling ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Jetzt crawlen
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => loadItems()}
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            Aktualisieren
          </Button>
        </div>
      </div>

      <section
        className="rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] p-4"
        aria-label="Filter"
      >
        <select
          className={selectClass}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Alle Status</option>
          <option value="NEW">Neu</option>
          <option value="REWRITTEN">Umgeschrieben</option>
          <option value="ARTICLE_CREATED">Artikel erstellt</option>
          <option value="FAILED">Fehler</option>
          <option value="SKIPPED">Übersprungen</option>
        </select>
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
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-[#E5E5E5] bg-white px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-[#111111]">
            Keine importierten Items
          </p>
          <p className="mt-2 text-sm text-[#666666]">
            Der Crawler hat noch keine Inhalte von dieser Quelle gefunden.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const sc = statusConfig[item.status] ?? statusConfig.NEW;
            const StatusIcon = sc.icon;
            const isProcessing = processingIds.has(item.id);
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-lg border border-[#E5E5E5] bg-white transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          sc.className
                        )}
                      >
                        <StatusIcon
                          className={cn(
                            "size-3",
                            item.status === "REWRITING" && "animate-spin"
                          )}
                        />
                        {sc.label}
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold text-[#111111]">
                      {item.originalTitle ?? "Kein Titel"}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#666666]">
                      <span>{formatRelative(item.fetchedAt)}</span>
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-[#E31E24]"
                      >
                        <ExternalLink className="size-3" />
                        Original
                      </a>
                      {item.articleId && (
                        <Link
                          href={`/admin/artikel/${item.articleId}`}
                          className="inline-flex items-center gap-1 text-[#E31E24] hover:underline"
                        >
                          <FileText className="size-3" />
                          Zum Artikel
                        </Link>
                      )}
                    </div>
                    {item.errorMessage && (
                      <p className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700">
                        {item.errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {(item.status === "NEW" || item.status === "FAILED") && (
                      <>
                        {!item.originalBody && (
                          <span className="text-xs text-amber-600 font-semibold">
                            Kein Inhalt
                          </span>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRescrape(item.id)}
                          disabled={isProcessing}
                          className="gap-1.5"
                          title="Artikelseite erneut scrapen"
                        >
                          {isProcessing ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Download className="size-3.5" />
                          )}
                          Scrapen
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRewrite(item.id)}
                          disabled={isProcessing}
                          className="gap-1.5"
                        >
                          {isProcessing ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="size-3.5" />
                          )}
                          KI umschreiben
                        </Button>
                      </>
                    )}
                    {item.status === "REWRITTEN" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : item.id)
                          }
                        >
                          {isExpanded ? "Vorschau schließen" : "Vorschau"}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCreateArticle(item.id)}
                          disabled={isProcessing}
                          className="gap-1.5"
                        >
                          {isProcessing ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <FileText className="size-3.5" />
                          )}
                          Als Entwurf anlegen
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {isExpanded && item.rewrittenBody && (
                  <div className="border-t border-[#E5E5E5] bg-[#F9F9F9] p-4">
                    <h4 className="font-display text-lg font-bold text-[#111111]">
                      {item.rewrittenTitle}
                    </h4>
                    {item.rewrittenTeaser && (
                      <p className="mt-1 text-sm font-medium italic text-[#666666]">
                        {item.rewrittenTeaser}
                      </p>
                    )}
                    <div
                      className="prose prose-sm mt-3 max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: item.rewrittenBody,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
