import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { users, articles, categories } from "@/db/schema";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { ArticleCard } from "@/components/public/ArticleCard";
import { mapRowToPublicArticle } from "@/lib/map-public-article";

export const revalidate = 60;

type Props = Readonly<{ params: Promise<{ slug: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [author] = await db
    .select({ name: users.name, bio: users.bio, avatarUrl: users.avatarUrl })
    .from(users)
    .where(and(eq(users.slug, slug), eq(users.isActive, true)))
    .limit(1);

  if (!author) return { title: "Autor" };

  const description = author.bio
    ? author.bio.slice(0, 160)
    : `Alle Artikel von ${author.name} auf motorrad.news`;

  return {
    title: author.name,
    description,
    alternates: { canonical: `/autor/${slug}` },
    openGraph: {
      type: "profile",
      title: author.name,
      description,
      ...(author.avatarUrl ? { images: [{ url: author.avatarUrl }] } : {}),
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;

  const [author] = await db
    .select()
    .from(users)
    .where(and(eq(users.slug, slug), eq(users.isActive, true)))
    .limit(1);

  if (!author) notFound();

  const authorArticles = await db
    .select()
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .innerJoin(users, eq(articles.authorId, users.id))
    .where(
      and(
        eq(articles.authorId, author.id),
        eq(articles.status, "PUBLISHED"),
        isNotNull(articles.publishedAt),
      ),
    )
    .orderBy(desc(articles.publishedAt));

  const publicArticles = authorArticles.map(mapRowToPublicArticle);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `https://www.motorrad.news/autor/${slug}`,
    ...(author.bio ? { description: author.bio } : {}),
    ...(author.avatarUrl ? { image: author.avatarUrl } : {}),
    worksFor: {
      "@type": "Organization",
      name: "motorrad.news",
      url: "https://www.motorrad.news",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-1 flex-col text-[#111111]">
        <section className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <nav className="mb-8 text-sm text-[#666666]" aria-label="Brotkrumen">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="transition-colors hover:text-[#E31E24]">
                    Startseite
                  </Link>
                </li>
                <li aria-hidden className="text-[#999999]">/</li>
                <li className="font-medium text-[#111111]">{author.name}</li>
              </ol>
            </nav>

            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#E5E5E5] shadow-md sm:h-28 sm:w-28">
                {author.avatarUrl ? (
                  <Image
                    src={author.avatarUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="112px"
                    priority
                    unoptimized
                  />
                ) : (
                  <span
                    className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-[#666666]"
                    aria-hidden
                  >
                    {author.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
                  {author.name}
                </h1>
                {author.bio ? (
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#444444]">
                    {author.bio}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-[#666666]">
                  {publicArticles.length}{" "}
                  {publicArticles.length === 1 ? "Artikel" : "Artikel"} veröffentlicht
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
            Artikel von {author.name}
          </h2>

          {publicArticles.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {publicArticles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-[#666666]">
              Noch keine veröffentlichten Artikel.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
