import type { MetadataRoute } from "next";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { and, asc, desc, eq, isNotNull } from "drizzle-orm";

const BASE_URL = "https://motorrad.news";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/impressum`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/datenschutz`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const [allCategories, publishedArticles] = await Promise.all([
      db
        .select({ slug: categories.slug, createdAt: categories.createdAt })
        .from(categories)
        .orderBy(asc(categories.sortOrder)),
      db
        .select({
          slug: articles.slug,
          publishedAt: articles.publishedAt,
          updatedAt: articles.updatedAt,
        })
        .from(articles)
        .where(and(eq(articles.status, "PUBLISHED"), isNotNull(articles.publishedAt)))
        .orderBy(desc(articles.publishedAt)),
    ]);

    const categoryPages: MetadataRoute.Sitemap = allCategories.map((c) => ({
      url: `${BASE_URL}/${c.slug}`,
      lastModified: c.createdAt,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    const articlePages: MetadataRoute.Sitemap = publishedArticles.map((a) => ({
      url: `${BASE_URL}/artikel/${a.slug}`,
      lastModified: a.updatedAt ?? a.publishedAt ?? undefined,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticPages, ...categoryPages, ...articlePages];
  } catch {
    return staticPages;
  }
}
