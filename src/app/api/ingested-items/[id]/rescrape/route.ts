import { db } from "@/db";
import { ingestedItems } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

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

  try {
    const res = await fetch(item.externalUrl, {
      headers: { "User-Agent": "MotorradNews-Crawler/1.0" },
    });

    if (!res.ok) {
      throw new Error(`Seitenabruf fehlgeschlagen: ${res.status}`);
    }

    const html = await res.text();

    const title = extractTitle(html) ?? item.originalTitle;
    const body = extractMainContent(html);

    if (!body || body.length < 50) {
      throw new Error(
        "Konnte keinen Artikelinhalt extrahieren. Die Seite rendert den Content möglicherweise nur per JavaScript."
      );
    }

    const [updated] = await db
      .update(ingestedItems)
      .set({
        originalTitle: title,
        originalBody: body,
        status: "NEW",
        errorMessage: null,
      })
      .where(eq(ingestedItems.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      titleLength: title?.length ?? 0,
      bodyLength: body.length,
      item: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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
