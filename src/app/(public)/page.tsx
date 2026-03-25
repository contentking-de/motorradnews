import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Gauge, Wrench, Compass, Flag, CalendarDays, type LucideIcon } from "lucide-react";
import { ArticleGrid } from "@/components/public/ArticleGrid";
import { CategoryNav } from "@/components/public/CategoryNav";
import { HeroArticle } from "@/components/public/HeroArticle";
import { UpcomingEventsSidebar } from "@/components/public/UpcomingEventsSidebar";
import { db } from "@/db";
import { articles, categories, users } from "@/db/schema";
import { mapRowToPublicArticle } from "@/lib/map-public-article";
import { and, asc, count, desc, eq, isNotNull } from "drizzle-orm";

const iconBySlug: Record<string, LucideIcon> = {
  neuheiten: Sparkles,
  tests: Gauge,
  technik: Wrench,
  reisen: Compass,
  motorsport: Flag,
};

export const metadata: Metadata = {
  title: {
    absolute: "motorrad.news – Motorrad-Nachrichten & Tests",
  },
};

export const revalidate = 60;

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
          className="mt-10 hidden shrink-0 space-y-8 lg:mt-0 lg:block lg:w-56 xl:w-64"
          aria-label="Kategorien mit Artikelanzahl"
        >
          <h2 className="font-display text-base font-bold uppercase tracking-wide text-[#111111]">
            Themen
          </h2>
          <ul className="mt-4 space-y-2 border-t border-[#E5E5E5] pt-4">
            {categoriesWithCounts.map((c) => {
              const Icon = iconBySlug[c.slug];
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
          <UpcomingEventsSidebar />
        </aside>
      </div>

      <section className="border-t border-[#E5E5E5] bg-[#F9F9F9]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
            Willkommen bei motorrad<span className="text-[#E31E24]">.news</span>
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#444444] sm:text-lg">
            Dein digitales Zuhause für alles rund ums Motorrad. Wir liefern dir täglich
            aktuelle Nachrichten, fundierte Testberichte und spannende Reisereportagen aus
            der Welt auf zwei Rädern.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-[#E5E5E5] bg-white p-6">
              <Sparkles className="size-7 text-[#E31E24]" aria-hidden />
              <h3 className="font-display mt-3 text-lg font-bold text-[#111111]">News &amp; Neuheiten</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#666666]">
                Neue Modelle, Rückrufe, Branchennews und alles, was die Motorrad-Welt bewegt — kompakt und aktuell.
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E5E5] bg-white p-6">
              <Gauge className="size-7 text-[#E31E24]" aria-hidden />
              <h3 className="font-display mt-3 text-lg font-bold text-[#111111]">Tests &amp; Fahrberichte</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#666666]">
                Ehrliche Testberichte, Vergleichstests und Erfahrungen aus erster Hand — damit du das richtige Bike findest.
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E5E5] bg-white p-6">
              <Compass className="size-7 text-[#E31E24]" aria-hidden />
              <h3 className="font-display mt-3 text-lg font-bold text-[#111111]">Reiseberichte &amp; Touren</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#666666]">
                Inspirierende Reiserouten, Tourentipps und Erlebnisse von Bikern für Biker — von Alpenpass bis Küstenstraße.
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E5E5] bg-white p-6">
              <Wrench className="size-7 text-[#E31E24]" aria-hidden />
              <h3 className="font-display mt-3 text-lg font-bold text-[#111111]">Tipps &amp; Ratgeber</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#666666]">
                Praxisnahe Technik-Tipps, Pflegeanleitungen und Ratgeber rund um Wartung, Zubehör und Ausrüstung.
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E5E5] bg-white p-6">
              <CalendarDays className="size-7 text-[#E31E24]" aria-hidden />
              <h3 className="font-display mt-3 text-lg font-bold text-[#111111]">Messen &amp; Events</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#666666]">
                Messekalender, Motorradtreffen und Events — verpasse keine Veranstaltung in deiner Nähe.
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E5E5] bg-white p-6">
              <Flag className="size-7 text-[#E31E24]" aria-hidden />
              <h3 className="font-display mt-3 text-lg font-bold text-[#111111]">Motorsport</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#666666]">
                MotoGP, Superbike-WM und nationale Rennserien — Ergebnisse, Analysen und Hintergründe vom Rennsport.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
