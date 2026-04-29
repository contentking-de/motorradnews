import { db } from "@/db";
import { articles, categories, users } from "@/db/schema";
import { and, desc, eq, ilike, isNotNull, ne, or } from "drizzle-orm";
import { mapRowToPublicArticle } from "@/lib/map-public-article";
import type { PublicArticle } from "@/components/public/ArticleCard";

const STOP_WORDS = new Set([
  // Deutsche Stoppwörter
  "der", "die", "das", "den", "dem", "des",
  "ein", "eine", "einer", "einem", "einen", "eines",
  "und", "oder", "aber", "doch", "noch", "auch",
  "ist", "sind", "war", "wird", "hat", "haben", "sein", "wird",
  "von", "vom", "zum", "zur", "für", "mit", "bei", "nach",
  "auf", "aus", "über", "unter", "vor", "hinter", "zwischen",
  "ins", "ans",
  "im", "am",
  "als", "wie", "wenn", "weil",
  "nicht", "sich", "ich", "du", "er", "sie", "es", "wir", "ihr",
  "was", "wer", "wo", "dass",
  "nur", "schon", "mehr", "sehr", "gut",
  "kann", "will", "soll", "muss", "darf",
  "alle", "alles", "kein", "keine", "keiner",
  "werden", "wurde", "wurden",
  "seinen", "seiner", "seine", "ihren", "ihrer", "ihre",
  "dieses", "diesem", "dieser", "diese", "jetzt", "hier",
  "nun", "dann", "denn", "dort",
  "neue", "neuen", "neuer", "neues", "neuem",
  // Englische Stoppwörter (für gemischte Titel)
  "the", "and", "for", "with", "from", "this", "that",
]);

const MIN_WORD_LENGTH = 3;

export function extractKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-zäöüß0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((w) => w.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(w));
}

export async function findRelatedByTitle(
  articleId: string,
  title: string,
  limit = 3,
): Promise<PublicArticle[]> {
  const keywords = extractKeywords(title);
  if (keywords.length === 0) return [];

  const matchConditions = keywords.map((kw) =>
    ilike(articles.title, `%${kw}%`),
  );

  const rows = await db
    .select()
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .innerJoin(users, eq(articles.authorId, users.id))
    .where(
      and(
        ne(articles.id, articleId),
        eq(articles.status, "PUBLISHED"),
        isNotNull(articles.publishedAt),
        or(...matchConditions),
      ),
    )
    .orderBy(desc(articles.publishedAt))
    .limit(50);

  const scored = rows.map((row) => {
    const titleLower = row.articles.title.toLowerCase();
    const score = keywords.filter((kw) => titleLower.includes(kw)).length;
    return { row, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aDate = a.row.articles.publishedAt?.getTime() ?? 0;
    const bDate = b.row.articles.publishedAt?.getTime() ?? 0;
    return bDate - aDate;
  });

  return scored.slice(0, limit).map((s) => mapRowToPublicArticle(s.row));
}
