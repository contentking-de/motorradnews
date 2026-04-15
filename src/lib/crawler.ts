import { db } from "@/db";
import { newsSources, ingestedItems } from "@/db/schema";
import { eq } from "drizzle-orm";

type Source = typeof newsSources.$inferSelect;

export type CrawlResult = {
  sourceId: string;
  name: string;
  newItems: number;
  error?: string;
};

export async function crawlSource(source: Source): Promise<CrawlResult> {
  try {
    let newItems = 0;

    if (source.sourceType === "RSS") {
      newItems = await crawlRSS(source);
    } else {
      newItems = await crawlHTML(source);
    }

    await db
      .update(newsSources)
      .set({ lastCrawledAt: new Date(), updatedAt: new Date() })
      .where(eq(newsSources.id, source.id));

    return { sourceId: source.id, name: source.name, newItems };
  } catch (err) {
    return {
      sourceId: source.id,
      name: source.name,
      newItems: 0,
      error: err instanceof Error ? err.message : "Unbekannter Fehler",
    };
  }
}

const MAX_NEW_ITEMS_PER_SOURCE = 5;

async function crawlRSS(source: Source): Promise<number> {
  const feedUrl = source.feedUrl ?? source.url;
  const res = await fetch(feedUrl, {
    headers: { "User-Agent": "MotorradNews-Crawler/1.0" },
  });

  if (!res.ok) throw new Error(`Feed-Abruf fehlgeschlagen: ${res.status}`);

  const xml = await res.text();
  const items = parseRSSItems(xml);
  let newCount = 0;

  for (const item of items.slice(0, 20)) {
    if (newCount >= MAX_NEW_ITEMS_PER_SOURCE) break;
    if (!item.link) continue;

    const [existing] = await db
      .select({ id: ingestedItems.id })
      .from(ingestedItems)
      .where(eq(ingestedItems.externalUrl, item.link))
      .limit(1);

    if (existing) continue;

    let fullBody = item.description ?? "";

    try {
      const articleRes = await fetch(item.link, {
        headers: { "User-Agent": "MotorradNews-Crawler/1.0" },
      });
      if (articleRes.ok) {
        const html = await articleRes.text();
        const scraped = extractMainContent(html);
        if (scraped && scraped.length > fullBody.length) {
          fullBody = scraped;
        }
      }
    } catch {
      // keep the feed description as fallback
    }

    await db.insert(ingestedItems).values({
      sourceId: source.id,
      externalUrl: item.link,
      originalTitle: item.title ?? null,
      originalBody: fullBody || null,
      status: "NEW",
    });

    newCount++;
  }

  return newCount;
}

async function crawlHTML(source: Source): Promise<number> {
  const config = source.scrapeConfig
    ? JSON.parse(source.scrapeConfig)
    : null;

  if (!config?.linkSelector) {
    throw new Error("Kein Link-Selektor konfiguriert");
  }

  const listRes = await fetch(source.url, {
    headers: { "User-Agent": "MotorradNews-Crawler/1.0" },
  });

  if (!listRes.ok)
    throw new Error(`Seitenabruf fehlgeschlagen: ${listRes.status}`);

  const listHtml = await listRes.text();
  const links = extractLinks(listHtml, config.linkSelector, source.url);
  let newCount = 0;

  for (const link of links.slice(0, 20)) {
    if (newCount >= MAX_NEW_ITEMS_PER_SOURCE) break;
    const [existing] = await db
      .select({ id: ingestedItems.id })
      .from(ingestedItems)
      .where(eq(ingestedItems.externalUrl, link))
      .limit(1);

    if (existing) continue;

    try {
      const articleRes = await fetch(link, {
        headers: { "User-Agent": "MotorradNews-Crawler/1.0" },
      });
      if (!articleRes.ok) continue;

      const articleHtml = await articleRes.text();
      const title = config.titleSelector
        ? extractBySelector(articleHtml, config.titleSelector)
        : extractTitle(articleHtml);
      const body = config.bodySelector
        ? extractBySelector(articleHtml, config.bodySelector)
        : extractMainContent(articleHtml);

      await db.insert(ingestedItems).values({
        sourceId: source.id,
        externalUrl: link,
        originalTitle: title ?? null,
        originalBody: body ?? null,
        status: "NEW",
      });

      newCount++;
    } catch {
      continue;
    }
  }

  return newCount;
}

// --- Minimal XML/HTML parsing helpers (no external dependency) ---

function parseRSSItems(
  xml: string
): { title?: string; link?: string; description?: string }[] {
  const items: { title?: string; link?: string; description?: string }[] = [];

  const isAtom =
    xml.includes("<feed") &&
    xml.includes('xmlns="http://www.w3.org/2005/Atom"');

  if (isAtom) {
    const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const title = extractTag(entry, "title");
      const link =
        extractAttr(entry, "link", "href") ?? extractTag(entry, "link");
      const description =
        extractTag(entry, "content") ?? extractTag(entry, "summary");
      items.push({ title, link, description });
    }
  } else {
    const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      const title = extractTag(item, "title");
      const link = extractTag(item, "link");
      const description =
        extractTag(item, "description") ??
        extractTag(item, "content:encoded");
      items.push({ title, link, description });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string | undefined {
  const cdataRegex = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`,
    "i"
  );
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : undefined;
}

function extractAttr(
  xml: string,
  tag: string,
  attr: string
): string | undefined {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "i");
  const match = regex.exec(xml);
  return match ? match[1] : undefined;
}

function extractLinks(
  html: string,
  _selectorHint: string,
  baseUrl: string
): string[] {
  const hrefRegex = /<a[^>]+href="([^"]+)"/gi;
  const links: string[] = [];
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    let href = match[1];
    if (href.startsWith("/")) {
      try {
        href = new URL(href, baseUrl).href;
      } catch {
        continue;
      }
    }
    if (href.startsWith("http")) links.push(href);
  }

  const base = new URL(baseUrl).hostname;
  return [
    ...new Set(links.filter((l) => new URL(l).hostname.includes(base))),
  ];
}

function extractTitle(html: string): string | undefined {
  const match = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  return match ? stripTags(match[1]).trim() : undefined;
}

function extractMainContent(html: string): string | undefined {
  const ldJson = extractFromLdJson(html);
  if (ldJson && ldJson.length > 100) return ldJson;

  const nextData = extractFromNextData(html);
  if (nextData && nextData.length > 100) return nextData;

  const articleMatch = /<article[^>]*>([\s\S]*?)<\/article>/i.exec(html);
  if (articleMatch) return stripTags(articleMatch[1]).trim();

  const mainMatch = /<main[^>]*>([\s\S]*?)<\/main>/i.exec(html);
  if (mainMatch) return stripTags(mainMatch[1]).trim();

  return undefined;
}

function extractFromLdJson(html: string): string | undefined {
  const ldJsonRegex =
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = ldJsonRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item.articleBody) return item.articleBody;
        if (item["@graph"]) {
          for (const node of item["@graph"]) {
            if (node.articleBody) return node.articleBody;
          }
        }
      }
    } catch {
      continue;
    }
  }
  return undefined;
}

function extractFromNextData(html: string): string | undefined {
  const nextDataMatch =
    /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i.exec(html);
  if (!nextDataMatch) return undefined;

  try {
    const data = JSON.parse(nextDataMatch[1]);
    const text = JSON.stringify(data);
    const bodyMatch = /"(?:articleBody|body|content|text)":\s*"([^"]{200,})"/i.exec(text);
    if (bodyMatch) return bodyMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  } catch {
    // ignore
  }
  return undefined;
}

function extractBySelector(
  html: string,
  selector: string
): string | undefined {
  const tag = selector.replace(/^[.#]/, "");
  const classMatch = selector.startsWith(".")
    ? new RegExp(
        `<[^>]+class="[^"]*${tag}[^"]*"[^>]*>([\\s\\S]*?)<\\/`,
        "i"
      ).exec(html)
    : null;
  if (classMatch) return stripTags(classMatch[1]).trim();

  const tagMatch = new RegExp(
    `<${tag}[^>]*>([\\s\\S]*?)</${tag}>`,
    "i"
  ).exec(html);
  return tagMatch ? stripTags(tagMatch[1]).trim() : undefined;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
