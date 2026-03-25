import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleGrid } from "@/components/public/ArticleGrid";
import { CategoryNav } from "@/components/public/CategoryNav";
import { db } from "@/db";
import { articles, categories, users } from "@/db/schema";
import { mapRowToPublicArticle } from "@/lib/map-public-article";
import { and, asc, desc, eq, isNotNull } from "drizzle-orm";

export const revalidate = 60;

type Props = Readonly<{
  params: Promise<{ category: string }>;
}>;

const defaultDescription =
  "Motorrad-Nachrichten, Tests und Hintergründe auf motorrad.news.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!row) {
    return { title: "Kategorie" };
  }

  return {
    title: row.name,
    description: row.description?.trim() || `${row.name} – ${defaultDescription}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!category) {
    notFound();
  }

  const [articleRows, navCategories] = await Promise.all([
    db
      .select()
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .innerJoin(users, eq(articles.authorId, users.id))
      .where(
        and(
          eq(articles.categoryId, category.id),
          eq(articles.status, "PUBLISHED"),
          isNotNull(articles.publishedAt),
        ),
      )
      .orderBy(desc(articles.publishedAt)),
    db
      .select({
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .orderBy(asc(categories.sortOrder)),
  ]);

  const gridArticles = articleRows.map(mapRowToPublicArticle);
  const categoryNavItems = navCategories.map((c) => ({
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#111111] md:text-4xl">
            {category.name}
          </h1>
          {category.description ? (
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#666666] md:text-lg">
              {category.description}
            </p>
          ) : null}
          <p className="mt-4 text-sm text-[#666666]">
            <Link href="/" className="font-medium text-[#E31E24] underline-offset-2 hover:underline">
              Zur Startseite
            </Link>
          </p>
        </div>
      </div>
      <CategoryNav categories={categoryNavItems} activeSlug={category.slug} />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        {gridArticles.length > 0 ? (
          <ArticleGrid articles={gridArticles} />
        ) : (
          <p className="font-display text-center text-lg text-[#666666]">
            In dieser Kategorie gibt es noch keine veröffentlichten Artikel.
          </p>
        )}
      </div>
    </div>
  );
}
