import type { Metadata } from "next";
import Link from "next/link";
import { CategorySection } from "@/components/public/CategorySection";
import { CategoryNav } from "@/components/public/CategoryNav";
import { HeroArticle } from "@/components/public/HeroArticle";
import { UpcomingEventsSidebar } from "@/components/public/UpcomingEventsSidebar";
import { PresseSidebar } from "@/components/public/PresseSidebar";
import { PoweredBySidebar } from "@/components/public/PoweredBySidebar";
import { categoryIconBySlug } from "@/lib/category-icons";
import { categoryMetaBySlug } from "@/lib/category-meta";
import { db } from "@/db";
import { articles, categories, users } from "@/db/schema";
import { mapRowToPublicArticle } from "@/lib/map-public-article";
import { and, asc, count, desc, eq, isNotNull } from "drizzle-orm";
import { sortByPrioritySlugs } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    absolute: "Motorrad News, Nachrichten & Termine - motorrad.news",
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Motorrad News, Nachrichten & Termine - motorrad.news",
    description:
      "Das Motorrad-Nachrichtenportal: Neuheiten, Tests, Technik, Reisen und Motorsport.",
    url: "https://www.motorrad.news",
    siteName: "motorrad.news",
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Motorrad News, Nachrichten & Termine - motorrad.news",
    description:
      "Das Motorrad-Nachrichtenportal: Neuheiten, Tests, Technik, Reisen und Motorsport.",
  },
};

export const revalidate = 60;

const publishedCondition = and(
  eq(articles.status, "PUBLISHED"),
  isNotNull(articles.publishedAt),
);

export default async function HomePage() {
  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  const [heroRow, categoriesWithCounts, navCategories, ...categoryArticleResults] =
    await Promise.all([
      db
        .select()
        .from(articles)
        .innerJoin(categories, eq(articles.categoryId, categories.id))
        .innerJoin(users, eq(articles.authorId, users.id))
        .where(publishedCondition)
        .orderBy(desc(articles.publishedAt))
        .limit(1)
        .then((rows) => rows[0] ?? null),
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
        .select({ name: categories.name, slug: categories.slug })
        .from(categories)
        .orderBy(asc(categories.sortOrder)),
      ...allCategories.map((cat) =>
        db
          .select()
          .from(articles)
          .innerJoin(categories, eq(articles.categoryId, categories.id))
          .innerJoin(users, eq(articles.authorId, users.id))
          .where(and(publishedCondition, eq(articles.categoryId, cat.id)))
          .orderBy(desc(articles.publishedAt))
          .limit(3),
      ),
    ]);

  const heroArticle = heroRow ? mapRowToPublicArticle(heroRow) : null;

  const categorySections = sortByPrioritySlugs(
    allCategories.map((cat, i) => {
      const rows = categoryArticleResults[i] ?? [];
      const meta = categoryMetaBySlug[cat.slug];
      return {
        slug: cat.slug,
        heading: meta?.heading ?? cat.name,
        subtext: meta?.subtext ?? cat.description ?? "",
        articles: rows.map(mapRowToPublicArticle),
      };
    }),
  );

  const categoryNavItems = sortByPrioritySlugs(
    navCategories.map((c) => ({
      name: c.name,
      slug: c.slug,
    })),
  );

  const hasAnyArticles = categorySections.some((s) => s.articles.length > 0);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "motorrad.news",
    url: "https://www.motorrad.news",
    logo: "https://www.motorrad.news/motorrad_news_logo.png",
    description:
      "Das Motorrad-Nachrichtenportal: Neuheiten, Tests, Technik, Reisen und Motorsport.",
    parentOrganization: {
      "@type": "Organization",
      name: "Arider GmbH",
      url: "https://www.arider.com",
    },
    sameAs: [
      "https://www.facebook.com/profile.php?id=61568992082136",
      "https://x.com/DE_motorradnews",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {heroArticle && <HeroArticle article={heroArticle} />}
      <CategoryNav categories={categoryNavItems} />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:flex lg:gap-10 lg:px-8 lg:py-12">
        <div className="min-w-0 flex-1">
          {!hasAnyArticles ? (
            <p className="font-display text-center text-lg text-[#666666]">
              Noch keine Artikel veröffentlicht.
            </p>
          ) : (
            <div className="space-y-12">
              {categorySections.map((section) => (
                <CategorySection
                  key={section.slug}
                  slug={section.slug}
                  heading={section.heading}
                  subtext={section.subtext}
                  articles={section.articles}
                  icon={categoryIconBySlug[section.slug]}
                />
              ))}
            </div>
          )}
        </div>

        <aside
          className="mt-10 hidden shrink-0 space-y-8 lg:sticky lg:top-24 lg:mt-0 lg:block lg:w-56 lg:self-start xl:w-64"
          aria-label="Kategorien mit Artikelanzahl"
        >
          <div>
            <h2 className="font-display text-base font-bold uppercase tracking-wide text-[#111111]">
              Themen
            </h2>
            <ul className="mt-4 space-y-2 border-t border-[#E5E5E5] pt-4">
              {sortByPrioritySlugs(categoriesWithCounts).map((c) => {
                const Icon = categoryIconBySlug[c.slug];
                return (
                  <li key={c.slug}>
                    <Link
                      href={`/${c.slug}`}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-[#111111] transition-colors hover:bg-[#F9F9F9] hover:text-[#E31E24]"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        {Icon && <Icon className="size-4 shrink-0 opacity-70" aria-hidden />}
                        {c.name}
                      </span>
                      <span className="tabular-nums text-[#666666]">{Number(c.articleCount)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <UpcomingEventsSidebar />
          <PresseSidebar />
          <PoweredBySidebar />
        </aside>
      </div>
    </>
  );
}
