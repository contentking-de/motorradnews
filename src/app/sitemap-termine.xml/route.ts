import { db } from "@/db";
import { events } from "@/db/schema";
import { and, asc, eq, isNotNull } from "drizzle-orm";

const BASE_URL = "https://www.motorrad.news";

export const revalidate = 3600;

export async function GET() {
  const publishedEvents = await db
    .select({
      slug: events.slug,
      updatedAt: events.updatedAt,
      publishedAt: events.publishedAt,
      startDate: events.startDate,
    })
    .from(events)
    .where(and(eq(events.status, "PUBLISHED"), isNotNull(events.publishedAt)))
    .orderBy(asc(events.startDate));

  const urls = publishedEvents.map((ev) => {
    const lastmod = ev.updatedAt ?? ev.publishedAt ?? ev.startDate;
    return `  <url>
    <loc>${BASE_URL}/termine-events/${ev.slug}</loc>
    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/termine-events</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
