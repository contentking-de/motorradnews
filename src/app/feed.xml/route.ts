import { db } from "@/db";
import { articles, categories, users } from "@/db/schema";
import { and, desc, eq, isNotNull } from "drizzle-orm";

const BASE_URL = "https://motorrad.news";
const FEED_TITLE = "motorrad.news";
const FEED_DESCRIPTION =
  "Aktuelle Motorrad-News, Tests und Neuheiten aus der Welt der Zweiräder.";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const publishedArticles = await db
    .select({
      title: articles.title,
      slug: articles.slug,
      teaser: articles.teaser,
      coverImageUrl: articles.coverImageUrl,
      publishedAt: articles.publishedAt,
      categorySlug: categories.slug,
      authorName: users.name,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .innerJoin(users, eq(articles.authorId, users.id))
    .where(and(eq(articles.status, "PUBLISHED"), isNotNull(articles.publishedAt)))
    .orderBy(desc(articles.publishedAt))
    .limit(50);

  const items = publishedArticles.map((a) => {
    const link = `${BASE_URL}/${a.categorySlug}/${a.slug}`;
    const pubDate = a.publishedAt
      ? new Date(a.publishedAt).toUTCString()
      : "";
    const imageTag = a.coverImageUrl
      ? `<enclosure url="${escapeXml(a.coverImageUrl)}" type="image/jpeg" />`
      : "";

    return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(a.teaser)}</description>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(a.authorName)}</dc:creator>
      ${imageTag}
    </item>`;
  });

  const lastBuildDate = publishedArticles[0]?.publishedAt
    ? new Date(publishedArticles[0].publishedAt).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${FEED_TITLE}</title>
    <link>${BASE_URL}</link>
    <description>${FEED_DESCRIPTION}</description>
    <language>de-de</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=3600",
    },
  });
}
