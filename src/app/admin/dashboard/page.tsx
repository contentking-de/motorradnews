"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  FileText,
  FolderOpen,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { formatDateShort } from "@/lib/utils";

type ArticleApiRow = {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  authorName: string;
  createdAt: string;
  publishedAt: string | null;
};

type CategoryApiRow = {
  id: string;
};

function statusBadgeVariant(
  status: ArticleApiRow["status"]
): "success" | "warning" | "default" {
  if (status === "PUBLISHED") return "success";
  if (status === "DRAFT") return "warning";
  return "default";
}

function statusLabel(status: ArticleApiRow["status"]): string {
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

const cardClass =
  "rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm transition-shadow hover:shadow-md";

export default function DashboardPage() {
  const [articles, setArticles] = useState<ArticleApiRow[]>([]);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        fetch("/api/articles"),
        fetch("/api/categories"),
      ]);
      if (!articlesRes.ok) throw new Error("articles");
      if (!categoriesRes.ok) throw new Error("categories");
      const articlesData: { data: ArticleApiRow[]; total: number } = await articlesRes.json();
      const categoriesData: CategoryApiRow[] = await categoriesRes.json();
      setArticles(articlesData.data);
      setCategoryCount(categoriesData.length);
    } catch {
      setError("Daten konnten nicht geladen werden.");
      setArticles([]);
      setCategoryCount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = articles.length;
  const published = articles.filter((a) => a.status === "PUBLISHED").length;
  const drafts = articles.filter((a) => a.status === "DRAFT").length;
  const categories = categoryCount ?? 0;

  const recent = articles.slice(0, 10);

  const statCards: {
    label: string;
    value: number;
    icon: typeof FileText;
  }[] = [
    { label: "Artikel gesamt", value: total, icon: FileText },
    { label: "Veröffentlicht", value: published, icon: CheckCircle },
    { label: "Entwürfe", value: drafts, icon: Clock },
    { label: "Kategorien", value: categories, icon: FolderOpen },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#666666]">
          Überblick über Artikel und Kategorien
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <section aria-label="Kennzahlen">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {statCards.map(({ label, value, icon: Icon }) => (
                <div key={label} className={cardClass}>
                  <div className="flex flex-col gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#F9F9F9]">
                      <Icon
                        className="size-5 text-[#E31E24]"
                        aria-hidden
                      />
                    </div>
                    <p className="font-display text-3xl font-bold tabular-nums text-[#111111] md:text-4xl">
                      {value}
                    </p>
                    <p className="text-sm font-medium text-[#666666]">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="recent-articles-heading">
            <h2
              id="recent-articles-heading"
              className="font-display text-lg font-bold text-[#111111]"
            >
              Letzte Artikel
            </h2>
            <p className="mt-0.5 text-sm text-[#666666]">
              Die zehn zuletzt angelegten Artikel
            </p>

            {recent.length === 0 ? (
              <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-white px-6 py-12 text-center shadow-sm">
                <p className="text-sm text-[#666666]">Noch keine Artikel.</p>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
                      <th className="font-display px-4 py-3 font-semibold text-[#111111]">
                        Titel
                      </th>
                      <th className="font-display px-4 py-3 font-semibold text-[#111111]">
                        Status
                      </th>
                      <th className="font-display px-4 py-3 font-semibold text-[#111111]">
                        Autor
                      </th>
                      <th className="font-display px-4 py-3 font-semibold text-[#111111]">
                        Datum
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((article) => (
                      <tr
                        key={article.id}
                        className="border-b border-[#E5E5E5] transition-colors last:border-b-0 hover:bg-[#F9F9F9]"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/artikel/${article.id}`}
                            className="font-medium text-[#111111] underline-offset-2 hover:text-[#E31E24] hover:underline"
                          >
                            {article.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusBadgeVariant(article.status)}>
                            {statusLabel(article.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[#666666]">
                          {article.authorName}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-[#666666]">
                          {formatDateShort(article.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
