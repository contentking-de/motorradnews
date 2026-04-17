import Image from "next/image";
import Link from "next/link";
import { formatDate, truncate } from "@/lib/utils";

export type PublicArticle = {
  title: string;
  slug: string;
  teaser: string;
  coverImageUrl: string | null;
  categoryName: string;
  categorySlug: string;
  authorName: string;
  authorAvatarUrl: string | null;
  publishedAt: Date | string;
};

export type ArticleCardProps = {
  article: PublicArticle;
};

export function ArticleCard({ article }: ArticleCardProps) {
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

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#E5E5E5] bg-white transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F9F9F9]">
        <Link href={`/${categorySlug}/${slug}`} className="absolute inset-0 z-0 block" aria-label={title}>
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5] to-[#F9F9F9]" aria-hidden />
          )}
        </Link>
        <Link
          href={`/${categorySlug}`}
          className="font-display absolute left-3 top-3 z-10 inline-block rounded bg-[#E31E24] px-2 py-1 text-xs font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
        >
          {categoryName}
        </Link>
      </div>

      <Link href={`/${categorySlug}/${slug}`} className="flex flex-1 flex-col gap-3 p-4">
        <h2 className="font-display text-lg font-bold leading-snug text-[#111111] group-hover:text-[#E31E24] md:text-xl">
          {title}
        </h2>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-[#666666]">
          {truncate(teaser, 160)}
        </p>
        <div className="flex items-center gap-3 border-t border-[#E5E5E5] pt-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#E5E5E5]">
            {authorAvatarUrl ? (
              <Image
                src={authorAvatarUrl}
                alt=""
                fill
                className="object-cover"
                sizes="36px"
                unoptimized
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-xs font-bold text-[#666666]"
                aria-hidden
              >
                {authorName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#111111]">{authorName}</p>
            <time
              className="text-xs text-[#666666]"
              dateTime={typeof publishedAt === "string" ? publishedAt : publishedAt.toISOString()}
            >
              {formatDate(publishedAt)}
            </time>
          </div>
        </div>
      </Link>
    </article>
  );
}
