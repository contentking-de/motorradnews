import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { ArticleCard } from "@/components/public/ArticleCard";
import { db } from "@/db";
import { articles, categories, users } from "@/db/schema";
import { mapRowToPublicArticle } from "@/lib/map-public-article";
import { and, desc, eq, ilike, isNotNull, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Suche: ${q}` : "Suche",
  };
}

export default async function SuchePage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let results: ReturnType<typeof mapRowToPublicArticle>[] = [];

  if (query.length > 0) {
    const pattern = `%${query}%`;
    const rows = await db
      .select()
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .innerJoin(users, eq(articles.authorId, users.id))
      .where(
        and(
          eq(articles.status, "PUBLISHED"),
          isNotNull(articles.publishedAt),
          or(
            ilike(articles.title, pattern),
            ilike(articles.teaser, pattern),
            ilike(articles.body, pattern),
          ),
        ),
      )
      .orderBy(desc(articles.publishedAt))
      .limit(30);

    results = rows.map(mapRowToPublicArticle);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex items-center gap-3">
        <Search className="size-7 shrink-0 text-[#E31E24]" />
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
          {query ? (
            <>
              Suchergebnisse für{" "}
              <span className="text-[#E31E24]">&bdquo;{query}&ldquo;</span>
            </>
          ) : (
            "Suche"
          )}
        </h1>
      </div>

      {query.length > 0 ? (
        results.length > 0 ? (
          <>
            <p className="mt-3 text-sm text-[#666666]">
              {results.length} {results.length === 1 ? "Ergebnis" : "Ergebnisse"} gefunden
            </p>
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {results.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-10 text-center">
            <p className="text-lg text-[#666666]">
              Keine Artikel zu <strong>&bdquo;{query}&ldquo;</strong> gefunden.
            </p>
            <Link
              href="/"
              className="font-display mt-4 inline-block text-sm font-semibold text-[#E31E24] transition-colors hover:text-[#C41A1F]"
            >
              ← Zurück zur Startseite
            </Link>
          </div>
        )
      ) : (
        <p className="mt-6 text-[#666666]">
          Geben Sie einen Suchbegriff ein, um Artikel zu finden.
        </p>
      )}
    </div>
  );
}
