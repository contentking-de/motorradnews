import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        count: count(articles.id),
      })
      .from(categories)
      .leftJoin(articles, eq(articles.categoryId, categories.id))
      .groupBy(categories.id, categories.name)
      .orderBy(categories.name);

    const total = rows.reduce((sum, r) => sum + r.count, 0);

    const [{ value: totalResult } = { value: total }] = await db
      .select({ value: count() })
      .from(articles);

    return NextResponse.json({
      total: totalResult,
      byCategory: rows
        .filter((r) => r.count > 0)
        .map((r) => ({
          id: r.categoryId,
          name: r.categoryName,
          count: r.count,
        })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Fehler beim Laden der Statistiken" },
      { status: 500 },
    );
  }
}
