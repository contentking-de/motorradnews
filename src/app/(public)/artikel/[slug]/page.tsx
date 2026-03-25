import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, Gauge, Wrench, Compass, Flag, type LucideIcon } from "lucide-react";
import { ArticleBody } from "@/components/public/ArticleBody";
import { ArticleCard } from "@/components/public/ArticleCard";
import { db } from "@/db";
import { articles, categories, users } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { mapRowToPublicArticle } from "@/lib/map-public-article";
import { and, asc, count, desc, eq, isNotNull, ne } from "drizzle-orm";
import { UpcomingEventsSidebar } from "@/components/public/UpcomingEventsSidebar";

const iconBySlug: Record<string, LucideIcon> = {
  neuheiten: Sparkles,
  tests: Gauge,
  technik: Wrench,
  reisen: Compass,
  motorsport: Flag,
};

type Props = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [row] = await db
    .select({
      title: articles.title,
      teaser: articles.teaser,
      status: articles.status,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1);

  if (!row || row.status !== "PUBLISHED" || !row.publishedAt) {
    return { title: "Artikel" };
  }

  return {
    title: row.title,
    description: row.teaser,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  const [row] = await db
    .select()
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .innerJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.slug, slug))
    .limit(1);

  const publishedAt = row?.articles.publishedAt;
  if (
    !row ||
    row.articles.status !== "PUBLISHED" ||
    !publishedAt
  ) {
    notFound();
  }

  const article = row.articles;
  const category = row.categories;
  const author = row.users;

  const [relatedRows, allCategories] = await Promise.all([
    db
      .select()
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .innerJoin(users, eq(articles.authorId, users.id))
      .where(
        and(
          eq(articles.categoryId, category.id),
          ne(articles.id, article.id),
          eq(articles.status, "PUBLISHED"),
          isNotNull(articles.publishedAt),
        ),
      )
      .orderBy(desc(articles.publishedAt))
      .limit(3),
    db
      .select({
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
      .groupBy(categories.name, categories.slug, categories.sortOrder)
      .orderBy(asc(categories.sortOrder)),
  ]);

  const relatedArticles = relatedRows.map(mapRowToPublicArticle);
  const dateIso = publishedAt instanceof Date ? publishedAt.toISOString() : new Date(publishedAt).toISOString();

  return (
    <article className="flex flex-1 flex-col text-[#111111]">
      <section className="relative min-h-[min(70vh,560px)] w-full overflow-hidden bg-[#111111]">
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#111111]" aria-hidden />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20"
          aria-hidden
        />

        <div className="relative z-10 flex min-h-[min(70vh,560px)] flex-col justify-end px-4 pb-10 pt-24 sm:px-6 sm:pb-12 lg:mx-auto lg:max-w-7xl lg:px-8 lg:pb-16">
          <nav className="mb-6 text-sm text-white/70" aria-label="Brotkrumen">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Startseite
                </Link>
              </li>
              <li aria-hidden className="text-white/40">/</li>
              <li>
                <Link
                  href={`/${category.slug}`}
                  className="transition-colors hover:text-white"
                >
                  {category.name}
                </Link>
              </li>
            </ol>
          </nav>

          <Link
            href={`/${category.slug}`}
            className="font-display mb-3 inline-flex w-fit rounded bg-[#E31E24] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 sm:mb-4 sm:text-sm"
          >
            {category.name}
          </Link>

          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            {article.title}
          </h1>

          {article.teaser ? (
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/85 sm:mt-4 sm:text-lg md:text-xl">
              {article.teaser}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/30 bg-white/10 sm:h-12 sm:w-12">
              {author.avatarUrl ? (
                <Image
                  src={author.avatarUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="48px"
                  unoptimized
                />
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center font-display text-sm font-bold text-white sm:text-base"
                  aria-hidden
                >
                  {author.name.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-white sm:text-base">{author.name}</p>
              <time className="text-sm text-white/70" dateTime={dateIso}>
                {formatDate(publishedAt)}
              </time>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:flex lg:gap-10 lg:px-8 lg:py-12">
        <div className="min-w-0 flex-1">
          <div className="prose prose-lg mx-auto max-w-3xl text-[#111111] lg:mx-0">
            <ArticleBody content={article.body} />
          </div>
        </div>

        <aside className="mt-10 shrink-0 lg:mt-0 lg:w-64 xl:w-72" aria-label="Sidebar">
          <div className="sticky top-20 space-y-8">
            <div>
              <h2 className="font-display text-base font-bold uppercase tracking-wide text-[#111111]">
                Themen
              </h2>
              <ul className="mt-4 space-y-2 border-t border-[#E5E5E5] pt-4">
                {allCategories.map((c) => {
                  const Icon = iconBySlug[c.slug];
                  const active = c.slug === category.slug;
                  return (
                    <li key={c.slug}>
                      <Link
                        href={`/${c.slug}`}
                        className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                          active
                            ? "bg-[#E31E24]/10 font-semibold text-[#E31E24]"
                            : "text-[#111111] hover:bg-[#F9F9F9] hover:text-[#E31E24]"
                        }`}
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

            {relatedArticles.length > 0 ? (
              <div>
                <h2 className="font-display text-base font-bold uppercase tracking-wide text-[#111111]">
                  Neueste aus {category.name}
                </h2>
                <ul className="mt-4 space-y-4 border-t border-[#E5E5E5] pt-4">
                  {relatedArticles.map((a) => (
                    <li key={a.slug}>
                      <Link href={`/artikel/${a.slug}`} className="group flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[#F9F9F9]">
                          {a.coverImageUrl ? (
                            <Image
                              src={a.coverImageUrl}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-200 group-hover:scale-105"
                              sizes="64px"
                              unoptimized
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5] to-[#F9F9F9]" aria-hidden />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display line-clamp-2 text-sm font-semibold leading-snug text-[#111111] transition-colors group-hover:text-[#E31E24]">
                            {a.title}
                          </p>
                          <time
                            className="mt-1 block text-xs text-[#666666]"
                            dateTime={typeof a.publishedAt === "string" ? a.publishedAt : a.publishedAt.toISOString()}
                          >
                            {formatDate(a.publishedAt)}
                          </time>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <UpcomingEventsSidebar />
          </div>
        </aside>
      </div>

      {relatedArticles.length > 0 ? (
        <section
          className="border-t border-[#E5E5E5] bg-[#F9F9F9] py-12 sm:py-16"
          aria-labelledby="related-heading"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2
              id="related-heading"
              className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl"
            >
              Ähnliche Artikel
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
