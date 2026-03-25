import type { PublicArticle } from "@/components/public/ArticleCard";

type ArticleJoinRow = {
  articles: {
    title: string;
    slug: string;
    teaser: string;
    coverImageUrl: string | null;
    publishedAt: Date | null;
  };
  categories: { name: string; slug: string };
  users: { name: string; avatarUrl: string | null };
};

export function mapRowToPublicArticle(row: ArticleJoinRow): PublicArticle {
  const publishedAt = row.articles.publishedAt;
  if (!publishedAt) {
    throw new Error("Veröffentlichte Artikel benötigen publishedAt.");
  }
  return {
    title: row.articles.title,
    slug: row.articles.slug,
    teaser: row.articles.teaser,
    coverImageUrl: row.articles.coverImageUrl,
    categoryName: row.categories.name,
    categorySlug: row.categories.slug,
    authorName: row.users.name,
    authorAvatarUrl: row.users.avatarUrl,
    publishedAt,
  };
}
