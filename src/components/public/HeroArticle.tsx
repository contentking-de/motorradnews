import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { PublicArticle } from "./ArticleCard";

export type HeroArticleProps = {
  article: PublicArticle;
};

export function HeroArticle({ article }: HeroArticleProps) {
  const {
    title,
    slug,
    teaser,
    coverImageUrl,
    categoryName,
    categorySlug,
    authorName,
    authorAvatarUrl,
    publishedAt,
  } = article;

  const dateIso = typeof publishedAt === "string" ? publishedAt : publishedAt.toISOString();

  return (
    <section className="relative min-h-[min(70vh,560px)] w-full overflow-hidden bg-[#111111]">
      {coverImageUrl ? (
        <Image
          src={coverImageUrl}
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
        <Link
          href={`/${categorySlug}`}
          className="font-display mb-3 inline-flex w-fit rounded bg-[#E31E24] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 sm:mb-4 sm:text-sm"
        >
          {categoryName}
        </Link>

        <Link href={`/${categorySlug}/${slug}`} className="group block">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="transition-colors group-hover:text-white/95">{title}</span>
          </h1>
        </Link>

        <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/85 sm:mt-4 sm:text-lg md:text-xl">
          {teaser}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/30 bg-white/10 sm:h-12 sm:w-12">
            {authorAvatarUrl ? (
              <Image
                src={authorAvatarUrl}
                alt=""
                fill
                className="object-cover"
                sizes="48px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white sm:text-base">
                {authorName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-white sm:text-base">{authorName}</p>
            <time className="text-sm text-white/70" dateTime={dateIso}>
              {formatDate(publishedAt)}
            </time>
          </div>
        </div>
      </div>
    </section>
  );
}
