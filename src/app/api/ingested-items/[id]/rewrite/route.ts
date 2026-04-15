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

  if (!item.originalTitle || !item.originalBody) {
    return NextResponse.json(
      { error: "Kein Originalinhalt vorhanden" },
      { status: 400 }
    );
  }

  await db
    .update(ingestedItems)
    .set({ status: "REWRITING" })
    .where(eq(ingestedItems.id, id));

  try {
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
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Originaltitel: ${item.originalTitle}\n\nOriginaltext:\n${item.originalBody}`,
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
    const toolBlock = data.content.find(
      (b: { type: string }) => b.type === "tool_use"
    );
    if (!toolBlock?.input) {
      throw new Error("Keine strukturierte Antwort von Claude erhalten");
    }
    const content = toolBlock.input;

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
