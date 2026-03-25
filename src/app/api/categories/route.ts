import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, asc, count } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
});

export async function GET() {
  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        sortOrder: categories.sortOrder,
        createdAt: categories.createdAt,
        articleCount: count(articles.id),
      })
      .from(categories)
      .leftJoin(articles, eq(articles.categoryId, categories.id))
      .groupBy(
        categories.id,
        categories.name,
        categories.slug,
        categories.description,
        categories.sortOrder,
        categories.createdAt
      )
      .orderBy(asc(categories.sortOrder));

    const result = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      sortOrder: r.sortOrder,
      createdAt: r.createdAt,
      articleCount: r.articleCount,
    }));

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Fehler beim Laden der Kategorien" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 });
  }

  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const [created] = await db
      .insert(categories)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        sortOrder: data.sortOrder,
      })
      .returning();

    if (!created) {
      return NextResponse.json(
        { error: "Kategorie konnte nicht erstellt werden" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ...created, articleCount: 0 },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Kategorie konnte nicht erstellt werden" },
      { status: 500 }
    );
  }
}
