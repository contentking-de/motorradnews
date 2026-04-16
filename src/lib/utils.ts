import slugifyLib from "slugify";
import { format, formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const umlautMap: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  Ä: "Ae",
  Ö: "Oe",
  Ü: "Ue",
  ß: "ss",
};

export function slugify(text: string): string {
  let normalized = text;
  for (const [umlaut, replacement] of Object.entries(umlautMap)) {
    normalized = normalized.replaceAll(umlaut, replacement);
  }
  return slugifyLib(normalized, { lower: true, strict: true });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d. MMMM yyyy", { locale: de });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd.MM.yyyy", { locale: de });
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: de });
}

export function truncate(text: string, length: number = 160): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "…";
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

const PRIORITY_SLUGS = ["motorsport", "offroad"];

export function sortByPrioritySlugs<T extends { slug: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aIdx = PRIORITY_SLUGS.indexOf(a.slug);
    const bIdx = PRIORITY_SLUGS.indexOf(b.slug);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return 0;
  });
}
