import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { events } from "../src/db/schema";
import Anthropic from "@anthropic-ai/sdk";

const neonSql = neon(process.env.DATABASE_URL!);
const db = drizzle(neonSql);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const BATCH_DELAY_MS = 500;

// ── TipTap JSON helpers ──────────────────────────────────────────────────

type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

function extractPlainText(json: string): string {
  try {
    const doc = JSON.parse(json) as TipTapNode;
    if (!doc?.content) return json;
    return doc.content
      .map((node) => {
        if (node.type === "heading") {
          return (node.content?.map((c) => c.text ?? "").join("") ?? "") + "\n";
        }
        if (node.type === "paragraph") {
          return node.content?.map((c) => c.text ?? "").join("") ?? "";
        }
        if (node.type === "bulletList" || node.type === "orderedList") {
          return (
            node.content
              ?.map((li) => {
                const text = li.content
                  ?.flatMap((p) => p.content?.map((c) => c.text ?? "") ?? [])
                  .join("");
                return `- ${text}`;
              })
              .join("\n") ?? ""
          );
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  } catch {
    return json;
  }
}

function markdownToTiptap(markdown: string): string {
  const lines = markdown.split("\n");
  const content: TipTapNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading
    const headingMatch = line.match(/^(#{2,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      content.push({
        type: "heading",
        attrs: { level },
        content: parseInlineMarks(headingMatch[2].trim()),
      });
      i++;
      continue;
    }

    // Bullet list
    if (line.match(/^[-*]\s+/)) {
      const items: TipTapNode[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        const text = lines[i].replace(/^[-*]\s+/, "");
        items.push({
          type: "listItem",
          content: [{ type: "paragraph", content: parseInlineMarks(text) }],
        });
        i++;
      }
      content.push({ type: "bulletList", content: items });
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      content.push({ type: "horizontalRule" });
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph (collect consecutive non-empty, non-special lines)
    let paraText = line;
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^#{2,3}\s+/) &&
      !lines[i].match(/^[-*]\s+/) &&
      !lines[i].match(/^---+$/)
    ) {
      paraText += " " + lines[i];
      i++;
    }

    content.push({
      type: "paragraph",
      content: parseInlineMarks(paraText.trim()),
    });
  }

  if (content.length === 0) {
    content.push({
      type: "paragraph",
      content: [{ type: "text", text: "Keine Beschreibung verfügbar." }],
    });
  }

  return JSON.stringify({ type: "doc", content });
}

function parseInlineMarks(text: string): TipTapNode[] {
  const nodes: TipTapNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push({ type: "text", text: text.slice(lastIdx, match.index) });
    }
    nodes.push({
      type: "text",
      text: match[1],
      marks: [{ type: "bold" }],
    });
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    nodes.push({ type: "text", text: text.slice(lastIdx) });
  }

  if (nodes.length === 0) {
    nodes.push({ type: "text", text });
  }

  return nodes;
}

// ── Claude rewriting ─────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Du bist Redakteur bei motorrad.news, einem deutschsprachigen Motorrad-Nachrichtenportal.

Deine Aufgabe: Schreibe die Beschreibung eines Motorrad-Events so um, dass sie informativ, gut strukturiert und ansprechend ist.

REGELN:
- Schreibe auf Deutsch, in einem professionellen aber zugänglichen Ton
- Verwende ## für Zwischenüberschriften wo sinnvoll (z.B. "## Programm", "## Strecke & Route", "## Preise", "## Anmeldung")
- Strukturiere den Text klar mit Absätzen
- Verwende Aufzählungslisten (- Punkt) für Aufzählungen wie Preise, Leistungen, Termine
- Behalte alle Fakten (Daten, Orte, Preise, URLs) exakt bei – erfinde nichts dazu
- Entferne überflüssige Wiederholungen und Werbesprache
- Wenn der Originaltext sehr kurz ist (1-2 Sätze), erweitere ihn NICHT künstlich – formuliere ihn nur sauber
- Gib NUR den umgeschriebenen Text zurück, keine Erklärungen oder Meta-Kommentare
- Verwende KEIN H1 (#), nur ## und ### für Überschriften
- Nutze **fett** für wichtige Begriffe`;

async function rewriteDescription(
  title: string,
  plainText: string,
): Promise<string> {
  const userPrompt = `Event-Titel: ${title}

Originalbeschreibung:
${plainText}

Schreibe diese Event-Beschreibung um:`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text ?? plainText;
}

// ── Main ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("✏️  Event-Beschreibungen umschreiben via Claude\n");

  const allEvents = await db
    .select({
      id: events.id,
      title: events.title,
      slug: events.slug,
      description: events.description,
    })
    .from(events)
    .orderBy(events.startDate);

  console.log(`📋 ${allEvents.length} Events geladen\n`);

  let rewritten = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < allEvents.length; i++) {
    const ev = allEvents[i];
    const plainText = extractPlainText(ev.description);

    if (
      plainText.length < 15 ||
      plainText === "Keine Beschreibung verfügbar."
    ) {
      skipped++;
      console.log(
        `  ⏭️  [${i + 1}/${allEvents.length}] "${ev.title}" – zu kurz, übersprungen`,
      );
      continue;
    }

    console.log(
      `  🔄 [${i + 1}/${allEvents.length}] "${ev.title}" (${plainText.length} Zeichen)…`,
    );

    try {
      const rewrittenMarkdown = await rewriteDescription(ev.title, plainText);
      const tiptapJson = markdownToTiptap(rewrittenMarkdown);

      await db
        .update(events)
        .set({ description: tiptapJson, updatedAt: new Date() })
        .where(eq(events.id, ev.id));

      rewritten++;
      const preview = rewrittenMarkdown.slice(0, 80).replace(/\n/g, " ");
      console.log(`       ✅ → ${preview}…`);
    } catch (err: unknown) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`       ❌ Fehler: ${msg}`);

      if (msg.includes("rate_limit") || msg.includes("overloaded")) {
        console.log("       ⏳ Rate-Limit – warte 30 Sekunden…");
        await sleep(30_000);
      }
    }

    await sleep(BATCH_DELAY_MS);
  }

  console.log(`\n🏁 Fertig!`);
  console.log(`   ✅ Umgeschrieben: ${rewritten}`);
  console.log(`   ⏭️  Übersprungen:  ${skipped}`);
  console.log(`   ❌ Fehlgeschlagen: ${failed}`);
}

main().catch((err) => {
  console.error("Fataler Fehler:", err);
  process.exit(1);
});
