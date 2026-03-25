import type { Metadata } from "next";
import Link from "next/link";
import { ArticleGrid } from "@/components/public/ArticleGrid";
import { CategoryNav } from "@/components/public/CategoryNav";
import { HeroArticle } from "@/components/public/HeroArticle";
import { db } from "@/db";
import { articles, categories, users } from "@/db/schema";
import { mapRowToPublicArticle } from "@/lib/map-public-article";
import { and, asc, count, desc, eq, isNotNull } from "drizzle-orm";

export const metadata: Metadata = {
  title: {
    absolute: "motorrad.news – Motorrad-Nachrichten & Tests",
  },
};

const publishedCondition = and(
  eq(articles.status, "PUBLISHED"),
  isNotNull(articles.publishedAt),
);

export default async function HomePage() {
  const [articleRows, categoriesWithCounts, navCategories] = await Promise.all([
    db
      .select()
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .innerJoin(users, eq(articles.authorId, users.id))
      .where(publishedCondition)
      .orderBy(desc(articles.publishedAt))
      .limit(13),
    db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        sortOrder: categories.sortOrder,
        articleCount: count(articles.id),
      })
      .from(categories)
      .leftJoin(
        articles,
        and(eq(articles.categoryId, categories.id), eq(articles.status, "PUBLISHED")),
      )
      .groupBy(
        categories.id,
        categories.name,
        categories.slug,
        categories.sortOrder,
      )
      .orderBy(asc(categories.sortOrder)),
    db
      .select({
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .orderBy(asc(categories.sortOrder)),
  ]);

  const hasArticles = articleRows.length > 0;
  const heroArticle = articleRows[0] ? mapRowToPublicArticle(articleRows[0]) : null;
  const gridArticles = articleRows.slice(1).map(mapRowToPublicArticle);

  const categoryNavItems = navCategories.map((c) => ({
    name: c.name,
    slug: c.slug,
  }));

  return (
    <>
      {heroArticle ? <HeroArticle article={heroArticle} /> : null}
      <CategoryNav categories={categoryNavItems} />
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:flex lg:gap-10 lg:px-8 lg:py-12">
        <div className="min-w-0 flex-1">
          {!hasArticles ? (
            <p className="font-display text-center text-lg text-[#666666]">
              Noch keine Artikel veröffentlicht.
            </p>
          ) : gridArticles.length > 0 ? (
            <ArticleGrid articles={gridArticles} />
          ) : null}
        </div>
        <aside
          className="mt-10 hidden shrink-0 lg:mt-0 lg:block lg:w-56 xl:w-64"
          aria-label="Kategorien mit Artikelanzahl"
        >
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[#111111]">
            Themen
          </h2>
          <ul className="mt-4 space-y-2 border-t border-[#E5E5E5] pt-4">
            {categoriesWithCounts.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/${c.slug}`}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-[#111111] transition-colors hover:bg-[#F9F9F9] hover:text-[#E31E24]"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="tabular-nums text-[#666666]">{Number(c.articleCount)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
