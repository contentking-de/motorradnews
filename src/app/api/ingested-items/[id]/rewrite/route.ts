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
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY nicht konfiguriert");
    }

    const systemPrompt = `Du bist ein professioneller Motorrad-Journalist für ein deutschsprachiges Motorrad-Nachrichtenportal.
Schreibe den folgenden Nachrichtenartikel komplett um. Der neue Artikel soll:
- Eigenständig formuliert sein (kein Copy-Paste)
- Den gleichen Sachverhalt korrekt wiedergeben
- In professionellem, lebendigem Deutsch geschrieben sein
- Für Motorrad-Enthusiasten ansprechend sein

Antworte AUSSCHLIESSLICH im folgenden JSON-Format:
{
  "title": "Neuer einzigartiger Titel",
  "teaser": "Ein kurzer Teaser-Text (1-2 Sätze, max 200 Zeichen)",
  "body": "Der vollständige Artikeltext als HTML (verwende <p>, <h2>, <h3>, <strong>, <em>, <ul>, <li> Tags)"
}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Originaltitel: ${item.originalTitle}\n\nOriginaltext:\n${item.originalBody}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`OpenAI API Fehler: ${res.status} – ${errBody}`);
    }

    const data = await res.json();
    const content = JSON.parse(data.choices[0].message.content);

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
