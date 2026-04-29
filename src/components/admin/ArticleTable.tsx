"use client";

import Link from "next/link";
import { useState } from "react";
import { Archive, Pencil, Trash2, Globe, AlertTriangle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cn, formatDateShort } from "@/lib/utils";

export type AdminArticleRow = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  categoryName: string;
  authorName: string;
  publishedAt: string | null;
  googleIndexedAt: string | null;
  googleIndexingError: string | null;
  createdAt: string;
};

type ArticleTableProps = {
  articles: AdminArticleRow[];
  onRefresh: () => void | Promise<void>;
};

function statusBadgeVariant(
  status: AdminArticleRow["status"]
): "success" | "warning" | "default" {
  if (status === "PUBLISHED") return "success";
  if (status === "DRAFT") return "warning";
  return "default";
}

function statusLabel(status: AdminArticleRow["status"]): string {
  switch (status) {
    case "PUBLISHED":
      return "Veröffentlicht";
    case "DRAFT":
      return "Entwurf";
    case "ARCHIVED":
      return "Archiviert";
    default:
      return status;
  }
}

function IndexingBadge({
  status,
  googleIndexedAt,
  googleIndexingError,
}: Pick<AdminArticleRow, "status" | "googleIndexedAt" | "googleIndexingError">) {
  if (status !== "PUBLISHED") return null;

  if (googleIndexingError) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-display font-semibold text-red-800"
        title={`Fehler: ${googleIndexingError}`}
      >
        <AlertTriangle className="size-3" aria-hidden />
        Fehler
      </span>
    );
  }

  if (googleIndexedAt) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-display font-semibold text-green-800"
        title={`Indexiert am ${formatDateShort(googleIndexedAt)}`}
      >
        <Globe className="size-3" aria-hidden />
        Indexiert
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#F9F9F9] px-2 py-0.5 text-xs font-display font-semibold text-[#666666]">
      <Globe className="size-3" aria-hidden />
      Ausstehend
    </span>
  );
}

export default function ArticleTable({ articles, onRefresh }: ArticleTableProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleArchive(id: string) {
    setPendingId(id);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(
          typeof err?.error === "string"
            ? err.error
            : "Archivieren ist fehlgeschlagen."
        );
        return;
      }
      await onRefresh();
    } catch {
      alert("Archivieren ist fehlgeschlagen.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: string, title: string) {
    const ok = window.confirm(
      `Artikel „${title}“ wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
    );
    if (!ok) return;

    setPendingId(id);
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(
          typeof err?.error === "string"
            ? err.error
            : "Löschen ist fehlgeschlagen."
        );
        return;
      }
      await onRefresh();
    } catch {
      alert("Löschen ist fehlgeschlagen.");
    } finally {
      setPendingId(null);
    }
  }

  const rowHover = "transition-colors hover:bg-[#F9F9F9]";

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-[#E5E5E5] bg-white">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
              <th className="font-display px-4 py-3 font-semibold text-[#111111]">
                Titel
              </th>
              <th className="font-display px-4 py-3 font-semibold text-[#111111]">
                Kategorie
              </th>
              <th className="font-display px-4 py-3 font-semibold text-[#111111]">
                Status
              </th>
              <th className="font-display px-4 py-3 font-semibold text-[#111111]">
                Google
              </th>
              <th className="font-display px-4 py-3 font-semibold text-[#111111]">
                Autor
              </th>
              <th className="font-display px-4 py-3 font-semibold text-[#111111]">
                Veröffentlicht
              </th>
              <th className="font-display px-4 py-3 font-semibold text-[#111111] text-right">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => {
              const busy = pendingId === article.id;
              const published =
                article.publishedAt != null
                  ? formatDateShort(article.publishedAt)
                  : "-";
              return (
                <tr
                  key={article.id}
                  className={cn("border-b border-[#E5E5E5] last:border-b-0", rowHover)}
                >
                  <td className="px-4 py-3">
                    <div className="max-w-[240px]">
                      <p className="font-medium text-[#111111] line-clamp-2">
                        {article.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#666666] truncate">
                        {article.slug}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#666666]">
                    {article.categoryName}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(article.status)}>
                      {statusLabel(article.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <IndexingBadge
                      status={article.status}
                      googleIndexedAt={article.googleIndexedAt}
                      googleIndexingError={article.googleIndexingError}
                    />
                  </td>
                  <td className="px-4 py-3 text-[#666666]">
                    {article.authorName}
                  </td>
                  <td className="px-4 py-3 text-[#666666] tabular-nums">
                    {published}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/artikel/${article.id}`}
                        className="inline-flex size-9 items-center justify-center rounded-lg text-[#666666] hover:bg-[#F9F9F9] hover:text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:ring-offset-1"
                        title="Bearbeiten"
                        aria-label="Bearbeiten"
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="size-9 shrink-0 p-0"
                        disabled={busy || article.status === "ARCHIVED"}
                        title="Archivieren"
                        aria-label="Archivieren"
                        onClick={() => handleArchive(article.id)}
                      >
                        <Archive className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="size-9 shrink-0 p-0 text-[#666666] hover:text-red-700"
                        disabled={busy}
                        title="Löschen"
                        aria-label="Löschen"
                        onClick={() => handleDelete(article.id, article.title)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-3 md:hidden">
        {articles.map((article) => {
          const busy = pendingId === article.id;
          const published =
            article.publishedAt != null
              ? formatDateShort(article.publishedAt)
              : "-";
          return (
            <li
              key={article.id}
              className="rounded-lg border border-[#E5E5E5] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-2">
                <div>
                  <p className="font-display font-semibold text-[#111111] leading-snug">
                    {article.title}
                  </p>
                  <p className="mt-1 text-xs text-[#666666]">{article.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#666666]">
                  <span>{article.categoryName}</span>
                  <span aria-hidden>·</span>
                  <span>{article.authorName}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusBadgeVariant(article.status)}>
                      {statusLabel(article.status)}
                    </Badge>
                    <IndexingBadge
                      status={article.status}
                      googleIndexedAt={article.googleIndexedAt}
                      googleIndexingError={article.googleIndexingError}
                    />
                  </div>
                  <span className="text-sm tabular-nums text-[#666666]">
                    Veröffentlicht: {published}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/admin/artikel/${article.id}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] px-3 py-2 text-sm font-display font-semibold text-[#111111] hover:bg-white"
                  >
                    <Pencil className="size-4" aria-hidden />
                    Bearbeiten
                  </Link>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shrink-0 px-3"
                    disabled={busy || article.status === "ARCHIVED"}
                    onClick={() => handleArchive(article.id)}
                    aria-label="Archivieren"
                  >
                    <Archive className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    className="shrink-0 px-3"
                    disabled={busy}
                    onClick={() => handleDelete(article.id, article.title)}
                    aria-label="Löschen"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
