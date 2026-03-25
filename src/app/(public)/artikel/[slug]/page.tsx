import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/public/ArticleBody";
import { ArticleCard } from "@/components/public/ArticleCard";
import { db } from "@/db";
import { articles, categories, users } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { mapRowToPublicArticle } from "@/lib/map-public-article";
import { and, desc, eq, isNotNull, ne } from "drizzle-orm";

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

  const relatedRows = await db
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
    .limit(3);

  const relatedArticles = relatedRows.map(mapRowToPublicArticle);
  const dateIso = publishedAt instanceof Date ? publishedAt.toISOString() : new Date(publishedAt).toISOString();

  return (
    <article className="flex flex-1 flex-col text-[#111111]">
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav className="text-sm text-[#666666]" aria-label="Brotkrumen">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-[#E31E24]">
                Startseite
              </Link>
            </li>
            <li aria-hidden className="text-[#E5E5E5]">
              /
            </li>
            <li>
              <Link
                href={`/${category.slug}`}
                className="transition-colors hover:text-[#E31E24]"
              >
                {category.name}
              </Link>
            </li>
            <li aria-hidden className="text-[#E5E5E5]">
              /
            </li>
            <li className="font-medium text-[#111111]" aria-current="page">
              {article.title}
            </li>
          </ol>
        </nav>
      </div>

      {article.coverImageUrl ? (
        <div className="relative mt-6 aspect-[21/9] w-full overflow-hidden bg-[#111111] sm:mt-8 sm:aspect-[3/1]">
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized
          />
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Link
          href={`/${category.slug}`}
          className="font-display inline-block rounded bg-[#E31E24] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
        >
          {category.name}
        </Link>

        <h1 className="font-display mt-4 text-3xl font-bold leading-tight tracking-tight text-[#111111] md:text-4xl lg:text-5xl">
          {article.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-[#E5E5E5] pb-6">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#F9F9F9] ring-1 ring-[#E5E5E5]">
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
                className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-[#666666]"
                aria-hidden
              >
                {author.name.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-display text-base font-semibold text-[#111111]">{author.name}</p>
            <time className="text-sm text-[#666666]" dateTime={dateIso}>
              {formatDate(publishedAt)}
            </time>
          </div>
        </div>

        <div className="prose prose-lg mt-8 max-w-none text-[#111111]">
          <ArticleBody content={article.body} />
        </div>
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
