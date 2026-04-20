import { db } from "@/db";
import { dealers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

const BASE_URL = "https://motorrad.news";

export async function GET() {
  const activeDealers = await db
    .select({
      slug: dealers.slug,
      updatedAt: dealers.updatedAt,
    })
    .from(dealers)
    .where(eq(dealers.isActive, true))
    .orderBy(asc(dealers.slug));

  const urls = activeDealers.map((dealer) => {
    const lastmod = dealer.updatedAt
      ? `<lastmod>${dealer.updatedAt.toISOString()}</lastmod>`
      : "";
    return `  <url>
    <loc>${BASE_URL}/motorradhaendler/${dealer.slug}</loc>
    ${lastmod}
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/motorradhaendler</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
