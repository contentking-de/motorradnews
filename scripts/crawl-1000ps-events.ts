import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, sql } from "drizzle-orm";
import { events, users } from "../src/db/schema";
import slugifyLib from "slugify";
import { Window } from "happy-dom";

const BASE_URL = "https://www.1000ps.de";
const LIST_URL = `${BASE_URL}/motorrad-terminkalender`;
const TOTAL_PAGES = 13;
const DELAY_MS = 800;

const neonSql = neon(process.env.DATABASE_URL!);
const db = drizzle(neonSql);

const umlautMap: Record<string, string> = {
  ä: "ae", ö: "oe", ü: "ue",
  Ä: "Ae", Ö: "Oe", Ü: "Ue",
  ß: "ss",
};

function makeSlug(text: string): string {
  let normalized = text;
  for (const [umlaut, replacement] of Object.entries(umlautMap)) {
    normalized = normalized.replaceAll(umlaut, replacement);
  }
  return slugifyLib(normalized, { lower: true, strict: true });
}

function cleanText(raw: string): string {
  return raw
    // Remove inline JS blocks
    .replace(/\(function\s*\(\)\s*\{[\s\S]*?\}\)\s*\(\)/g, "")
    .replace(/var\s+dataLayer[\s\S]*?;/g, "")
    .replace(/window\.\w+[\s\S]*?;/g, "")
    .replace(/console\.log\([\s\S]*?\);/g, "")
    .replace(/document\.getElementById\([\s\S]*?\);/g, "")
    .replace(/if\s*\([\s\S]*?\)\s*\{[\s\S]*?\}/g, "")
    // Remove ad-related class references
    .replace(/MPS_\w+/g, "")
    .replace(/SDM_\w+/g, "")
    .replace(/1000ps\.de_\w+/g, "")
    // Clean up excessive whitespace
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function textToTiptapJson(text: string): string {
  const cleaned = cleanText(text);
  const paragraphs = cleaned
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 3 && !p.match(/^(function|var |window\.|if \(|else |throw |})/) && !p.includes("loadApgc"));
  if (paragraphs.length === 0) {
    paragraphs.push(text.replace(/\n/g, " ").trim().slice(0, 200) || "Keine Beschreibung verfügbar.");
  }
  const content = paragraphs.map((p) => ({
    type: "paragraph" as const,
    content: [{ type: "text" as const, text: p }],
  }));
  return JSON.stringify({ type: "doc", content });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseDocument(html: string) {
  const window = new Window();
  window.document.write(html);
  const doc = window.document;

  // Strip all script and style elements BEFORE any text extraction
  for (const tag of [...doc.querySelectorAll("script, style, noscript, iframe")]) {
    tag.remove();
  }

  return doc;
}

const germanMonths: Record<string, number> = {
  januar: 0, februar: 1, "m\u00e4rz": 2, mrz: 2, april: 3,
  mai: 4, juni: 5, juli: 6, august: 7, september: 8,
  oktober: 9, november: 10, dezember: 11,
  jan: 0, feb: 1, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, okt: 9, nov: 10, dez: 11,
};

function parseGermanDate(text: string): Date | null {
  const cleaned = text.replace(/^(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag),?\s*/i, "").trim();
  const match = cleaned.match(
    /(\d{1,2})\.\s*(\w+)\.?\s*(\d{4})?\s*(?:(\d{1,2}):(\d{2}))?/
  );
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const monthStr = match[2].toLowerCase();
  const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
  const hours = match[4] ? parseInt(match[4], 10) : 0;
  const minutes = match[5] ? parseInt(match[5], 10) : 0;

  const month = germanMonths[monthStr];
  if (month === undefined) return null;

  return new Date(year, month, day, hours, minutes);
}

interface CrawledEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueCountry: string;
  ticketUrl: string | null;
  coverImageUrl: string | null;
  sourceUrl: string;
}

// ── Step 1: Collect all detail-page URLs from the paginated list ─────────

async function fetchDetailUrls(): Promise<string[]> {
  const urls: string[] = [];

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const url = page === 1 ? LIST_URL : `${LIST_URL}-seite-${page}`;
    console.log(`📄 Lade Listenseite ${page}/${TOTAL_PAGES}: ${url}`);

    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  ⚠️  Seite ${page} fehlgeschlagen: ${res.status}`);
      continue;
    }

    const html = await res.text();
    const doc = parseDocument(html);
    const links = doc.querySelectorAll('a[href*="/motorrad-termine-"]');

    for (const link of links) {
      const href = link.getAttribute("href");
      if (!href || href.includes("terminkalender")) continue;
      const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
      if (!urls.includes(fullUrl)) {
        urls.push(fullUrl);
      }
    }

    console.log(`  → ${urls.length} URLs bisher gesammelt`);
    await sleep(DELAY_MS);
  }

  return urls;
}

// ── Step 2: Parse a single detail page ───────────────────────────────────

function mapRegionToCountry(regionText: string): string {
  const lower = regionText.toLowerCase();
  const austrianStates = [
    "wien", "niederösterreich", "oberösterreich", "steiermark",
    "kärnten", "salzburg", "tirol", "vorarlberg", "burgenland",
  ];
  const swissCantons = [
    "zürich", "bern", "luzern", "uri", "schwyz", "obwalden", "nidwalden",
    "glarus", "zug", "freiburg", "solothurn", "basel-stadt", "basel-landschaft",
    "schaffhausen", "appenzell", "st. gallen", "graubünden", "aargau",
    "thurgau", "tessin", "waadt", "wallis", "neuenburg", "genf", "jura",
  ];

  if (austrianStates.some((s) => lower.includes(s)) || lower.includes("österreich")) {
    return "Österreich";
  }
  if (swissCantons.some((s) => lower.includes(s)) || lower.includes("schweiz")) {
    return "Schweiz";
  }
  return "Deutschland";
}

function extractDescription(doc: ReturnType<typeof parseDocument>): string {
  const h2 = doc.querySelector("h2");
  if (!h2) return "";

  // Walk siblings after h2 until we hit h3 "Veranstalter" or footer
  const parts: string[] = [];
  let node = h2.nextElementSibling ?? h2.nextSibling;

  if (!node && h2.parentElement) {
    node = h2.parentElement.nextElementSibling;
  }

  const visited = new Set<Node>();

  while (node) {
    if (visited.has(node)) break;
    visited.add(node);

    const el = node as unknown as Element;
    const tagName = (el.tagName ?? "").toLowerCase();
    const text = (el.textContent ?? "").trim();

    if (tagName === "h3" || tagName === "h2") break;
    if (text.startsWith("Veranstalter") || text.startsWith("Kontaktieren")) break;
    if (text === "Alle Angaben ohne Gewähr. Tippfehler und Irrtümer vorbehalten.") break;

    const className = (el.className ?? el.getAttribute?.("class") ?? "").toString().toLowerCase();
    if (className.includes("ad") || className.includes("partner") || className.includes("footer") || className.includes("nav")) {
      node = el.nextElementSibling ?? el.nextSibling;
      continue;
    }

    if (text.length > 3) {
      const cleaned = text.replace(/^Veranstaltungs-Art:\s*[^\n]+\n?/i, "").trim();
      if (cleaned.length > 3) {
        parts.push(cleaned);
      }
    }

    node = el.nextElementSibling ?? el.nextSibling;
  }

  // Fallback: extract body text between h2 and "Veranstalter"
  if (parts.length === 0) {
    const bodyText = doc.body?.textContent ?? "";
    const h2Text = doc.querySelector("h2")?.textContent?.trim() ?? "";
    const h2Idx = bodyText.indexOf(h2Text);
    const veranstalterIdx = bodyText.indexOf("Veranstalter");
    const haftungIdx = bodyText.indexOf("Alle Angaben ohne Gewähr");
    const endIdx = veranstalterIdx > 0 ? veranstalterIdx : haftungIdx > 0 ? haftungIdx : -1;

    if (h2Idx >= 0 && endIdx > h2Idx) {
      let rawDesc = bodyText.slice(h2Idx + h2Text.length, endIdx).trim();
      rawDesc = rawDesc.replace(/^Veranstaltungs-Art:\s*[^\n]+\n?/i, "").trim();
      if (rawDesc.length > 10) {
        parts.push(rawDesc);
      }
    }
  }

  // Apply JS cleanup to the joined text
  let result = parts.join("\n\n");
  result = cleanText(result);

  // Remove leading nav/breadcrumb fragments (short lines before real content)
  const lines = result.split("\n");
  let startIdx = 0;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length < 30 && !line.includes(" ") && lines.length > i + 1) {
      startIdx = i + 1;
    } else {
      break;
    }
  }
  if (startIdx > 0) {
    result = lines.slice(startIdx).join("\n");
  }

  return result.trim();
}

async function fetchEventDetail(url: string): Promise<CrawledEvent | null> {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  ⚠️  Detail fehlgeschlagen ${url}: ${res.status}`);
    return null;
  }

  const html = await res.text();
  const doc = parseDocument(html);

  const title = doc.querySelector("h1")?.textContent?.trim() ?? "";
  if (!title) return null;

  // Date parsing from h2
  const h2 = doc.querySelector("h2")?.textContent?.trim() ?? "";
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (h2.includes(" bis ")) {
    const [startPart, endPart] = h2.split(" bis ");
    startDate = parseGermanDate(startPart);
    endDate = parseGermanDate(endPart);
  } else {
    startDate = parseGermanDate(h2);
  }

  if (!startDate) {
    console.warn(`  ⚠️  Kein Datum gefunden für "${title}" – übersprungen`);
    return null;
  }

  const description = extractDescription(doc) || `Motorrad-Event: ${title}`;

  // Location from Google Maps link
  let venueCity = "";
  let venueAddress = "";
  let venueName = "";
  let venueCountry = "Deutschland";

  const mapsLink = doc.querySelector('a[href*="maps.google"]');
  if (mapsLink) {
    const addressText = mapsLink.textContent?.trim() ?? "";
    const parts = addressText.split(/\s{2,}|\n/).map((s: string) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      venueAddress = parts.slice(0, -1).join(", ");
      venueCity = parts[parts.length - 1];
    } else if (parts.length === 1) {
      // Single string: try to split at last space-separated word
      const words = parts[0].split(/\s+/);
      if (words.length > 1) {
        venueCity = words[words.length - 1];
        venueAddress = parts[0];
      } else {
        venueCity = parts[0];
        venueAddress = parts[0];
      }
    }
  }

  // Clean up venueCity: remove zip codes that got concatenated
  venueCity = venueCity.replace(/^\d{5,}\s*/, "").replace(/,\s*$/, "").trim();
  venueAddress = venueAddress.replace(/,\s*$/, "").trim();

  // Detect country from venue location, NOT the full page (footer contains "Österreich"/"Schweiz" links)
  const locationContext = [venueCity, venueAddress, venueName].join(" ");
  venueCountry = mapRegionToCountry(locationContext);

  if (!venueName) venueName = venueCity || title;
  if (!venueAddress) venueAddress = venueCity || "-";
  if (!venueCity) venueCity = "-";

  // Cover image
  let coverImageUrl: string | null = null;
  const ogImage = doc.querySelector('meta[property="og:image"]');
  if (ogImage) {
    const content = ogImage.getAttribute("content");
    if (content && !content.includes("logo") && !content.includes("default")) {
      coverImageUrl = content.startsWith("http") ? content : `${BASE_URL}${content}`;
    }
  }

  // Ticket / booking URL
  let ticketUrl: string | null = null;
  const allLinks = doc.querySelectorAll("a[href]");
  for (const link of allLinks) {
    const href = link.getAttribute("href") ?? "";
    const text = (link as unknown as { textContent: string }).textContent?.toLowerCase() ?? "";
    if (
      (text.includes("ticket") || text.includes("buchen") || text.includes("buchung") || text.includes("anmeld")) &&
      href.startsWith("http") &&
      !href.includes("1000ps.de")
    ) {
      ticketUrl = href;
      break;
    }
  }

  return {
    title,
    description,
    startDate,
    endDate,
    venueName,
    venueAddress,
    venueCity,
    venueCountry,
    ticketUrl,
    coverImageUrl,
    sourceUrl: url,
  };
}

// ── Step 3: Store / update events in the database ────────────────────────

async function getAdminUserId(): Promise<string> {
  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "ADMIN"))
    .limit(1);
  if (!admin) throw new Error("Kein ADMIN-User gefunden – bitte zuerst einen anlegen.");
  return admin.id;
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = makeSlug(base);
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const [existing] = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
    suffix++;
  }
}

async function upsertEvents(crawled: CrawledEvent[], authorId: string) {
  let inserted = 0;
  let updated = 0;
  let failed = 0;

  for (const ev of crawled) {
    const tiptapDesc = textToTiptapJson(ev.description);

    try {
      // Update ALL existing events with this title
      const existing = await db
        .select({ id: events.id, slug: events.slug })
        .from(events)
        .where(eq(events.title, ev.title));

      if (existing.length > 0) {
        for (const row of existing) {
          await db
            .update(events)
            .set({
              description: tiptapDesc,
              startDate: ev.startDate,
              endDate: ev.endDate,
              venueName: ev.venueName,
              venueAddress: ev.venueAddress,
              venueCity: ev.venueCity,
              venueCountry: ev.venueCountry,
              ticketUrl: ev.ticketUrl,
              coverImageUrl: ev.coverImageUrl,
              updatedAt: new Date(),
            })
            .where(eq(events.id, row.id));
        }
        updated += existing.length;
        console.log(`  🔄 "${ev.title}" aktualisiert (${existing.length}x)`);
      } else {
        const slug = await uniqueSlug(ev.title);
        await db.insert(events).values({
          title: ev.title,
          slug,
          description: tiptapDesc,
          startDate: ev.startDate,
          endDate: ev.endDate,
          venueName: ev.venueName,
          venueAddress: ev.venueAddress,
          venueCity: ev.venueCity,
          venueCountry: ev.venueCountry,
          ticketUrl: ev.ticketUrl,
          coverImageUrl: ev.coverImageUrl,
          status: "PUBLISHED",
          authorId,
          publishedAt: new Date(),
        });
        inserted++;
        console.log(`  ✅ "${ev.title}" neu eingefügt`);
      }
    } catch (err: unknown) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ Fehler bei "${ev.title}":`, msg);
    }
  }

  return { inserted, updated, failed };
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("🏍️  1000PS Event-Crawler gestartet\n");

  const adminId = await getAdminUserId();
  console.log(`👤 Admin-User ID: ${adminId}\n`);

  console.log("── Schritt 1: Detail-URLs sammeln ──\n");
  const detailUrls = await fetchDetailUrls();
  console.log(`\n🔗 ${detailUrls.length} Event-URLs gefunden\n`);

  console.log("── Schritt 2: Detail-Seiten crawlen ──\n");
  const crawledEvents: CrawledEvent[] = [];

  for (let i = 0; i < detailUrls.length; i++) {
    const url = detailUrls[i];
    console.log(`🔍 [${i + 1}/${detailUrls.length}] ${url}`);

    const event = await fetchEventDetail(url);
    if (event) {
      crawledEvents.push(event);
      const descPreview = event.description.slice(0, 80).replace(/\n/g, " ");
      console.log(`  → "${event.title}" | ${descPreview}…`);
    }
    await sleep(DELAY_MS);
  }

  console.log(`\n📋 ${crawledEvents.length} Events erfolgreich geparst\n`);

  console.log("── Schritt 3: In Datenbank speichern/aktualisieren ──\n");
  const { inserted, updated, failed } = await upsertEvents(crawledEvents, adminId);

  console.log(`\n🏁 Fertig!`);
  console.log(`   ✅ Neu eingefügt:   ${inserted}`);
  console.log(`   🔄 Aktualisiert:    ${updated}`);
  console.log(`   ❌ Fehlgeschlagen:  ${failed}`);
}

main().catch((err) => {
  console.error("Fataler Fehler:", err);
  process.exit(1);
});
