import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { ArticleCard, type PublicArticle } from "./ArticleCard";

type CategorySectionProps = {
  slug: string;
  heading: string;
  subtext: string;
  articles: PublicArticle[];
  icon?: LucideIcon;
};

export function CategorySection({
  slug,
  heading,
  subtext,
  articles,
  icon: Icon,
}: CategorySectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="border-b border-[#E5E5E5] pb-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {Icon && <Icon className="size-6 text-[#E31E24]" aria-hidden />}
            <h2 className="font-display text-xl font-bold tracking-tight text-[#111111] md:text-2xl">
              {heading}
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#666666]">
            {subtext}
          </p>
        </div>
        <Link
          href={`/${slug}`}
          className="hidden shrink-0 items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-semibold text-[#111111] transition-colors hover:border-[#E31E24] hover:text-[#E31E24] sm:flex"
        >
          Alle Artikel
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      <div className="mt-5 flex justify-center sm:hidden">
        <Link
          href={`/${slug}`}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#E31E24] hover:text-[#b8181c]"
        >
          Alle Artikel
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
