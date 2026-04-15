import { db } from "@/db";
import { ingestedItems } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

const MIN_BODY_LENGTH = 200;

export async function POST(_request: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const [item] = await db
    .select()
    .from(ingestedItems)
    .where(eq(ingestedItems.id, id))
    .limit(1);

  if (!item) {
    return NextResponse.json({ error: "Item nicht gefunden" }, { status: 404 });
  }

  await db
    .update(ingestedItems)
    .set({ status: "REWRITING" })
    .where(eq(ingestedItems.id, id));

  try {
    let originalTitle = item.originalTitle ?? "";
    let originalBody = item.originalBody ?? "";

    if (!originalBody || originalBody.length < MIN_BODY_LENGTH) {
      const scraped = await scrapeArticle(item.externalUrl);
      if (scraped.title && (!originalTitle || originalTitle.length < scraped.title.length)) {
        originalTitle = scraped.title;
      }
      if (scraped.body && scraped.body.length > originalBody.length) {
        originalBody = scraped.body;
      }

      await db
        .update(ingestedItems)
        .set({
          originalTitle: originalTitle || item.originalTitle,
          originalBody: originalBody || item.originalBody,
        })
        .where(eq(ingestedItems.id, id));
    }

    if (!originalBody || originalBody.length < 50) {
      throw new Error(
        "Kein ausreichender Artikelinhalt gefunden. Die Seite rendert den Content möglicherweise nur per JavaScript."
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY nicht konfiguriert");
    }

    const systemPrompt = `Du bist ein professioneller Motorrad-Journalist für ein deutschsprachiges Motorrad-Nachrichtenportal.
Schreibe den folgenden Nachrichtenartikel komplett um. Der neue Artikel soll:
- Eigenständig formuliert sein (kein Copy-Paste)
- Den gleichen Sachverhalt korrekt wiedergeben
- In professionellem, lebendigem Deutsch geschrieben sein
- Für Motorrad-Enthusiasten ansprechend sein

Nutze das Tool "save_article", um den umgeschriebenen Artikel zu speichern.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 16384,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Originaltitel: ${originalTitle}\n\nOriginaltext:\n${originalBody}`,
          },
        ],
        tools: [
          {
            name: "save_article",
            description:
              "Speichert den umgeschriebenen Artikel mit Titel, Teaser und Body.",
            input_schema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Neuer einzigartiger Titel",
                },
                teaser: {
                  type: "string",
                  description:
                    "Kurzer Teaser-Text (1-2 Sätze, max 200 Zeichen)",
                },
                body: {
                  type: "string",
                  description:
                    "Vollständiger Artikeltext als HTML (mit <p>, <h2>, <h3>, <strong>, <em>, <ul>, <li> Tags)",
                },
              },
              required: ["title", "teaser", "body"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "save_article" },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Claude API Fehler: ${res.status} – ${errBody}`);
    }

    const data = await res.json();

    if (data.stop_reason === "max_tokens") {
      throw new Error("Claude-Antwort wurde abgeschnitten (max_tokens erreicht). Bitte erneut versuchen.");
    }

    const toolBlock = data.content.find(
      (b: { type: string }) => b.type === "tool_use"
    );
    if (!toolBlock?.input) {
      throw new Error("Keine strukturierte Antwort von Claude erhalten");
    }
    const content = toolBlock.input;

    if (!content.body || content.body.length < 50) {
      throw new Error("Claude hat keinen Artikeltext geliefert. Bitte erneut versuchen.");
    }

    const [updated] = await db
      .update(ingestedItems)
      .set({
        rewrittenTitle: content.title,
        rewrittenTeaser: content.teaser,
        rewrittenBody: content.body,
        status: "REWRITTEN",
        rewrittenAt: new Date(),
      })
      .where(eq(ingestedItems.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unbekannter Fehler";

    await db
      .update(ingestedItems)
      .set({ status: "FAILED", errorMessage: message })
      .where(eq(ingestedItems.id, id));

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function scrapeArticle(
  url: string
): Promise<{ title?: string; body?: string }> {
  const res = await fetch(url, {
    headers: { "User-Agent": "MotorradNews-Crawler/1.0" },
  });

  if (!res.ok) return {};

  const html = await res.text();

  const title = extractTitle(html);
  const body = extractMainContent(html);

  return { title, body };
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
    const bodyMatch =
      /"(?:articleBody|body|content|text)":\s*"([^"]{200,})"/i.exec(text);
    if (bodyMatch)
      return bodyMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  } catch {
    // ignore
  }
  return undefined;
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
