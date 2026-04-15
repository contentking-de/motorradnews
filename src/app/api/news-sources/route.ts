import { db } from "@/db";
import { newsSources, categories, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, ilike } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

const createSourceSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url(),
  feedUrl: z.string().url().nullable().optional(),
  sourceType: z.enum(["RSS", "HTML"]),
  isActive: z.boolean().optional().default(true),
  scrapeConfig: z
    .object({
      linkSelector: z.string().optional(),
      titleSelector: z.string().optional(),
      bodySelector: z.string().optional(),
      teaserSelector: z.string().optional(),
    })
    .nullable()
    .optional(),
  defaultCategoryId: z.string().uuid().nullable().optional(),
  defaultAuthorId: z.string().uuid().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? "";

  try {
    const conditions = [];
    if (search) conditions.push(ilike(newsSources.name, `%${search}%`));

    const rows = await db
      .select({
        source: newsSources,
        categoryName: categories.name,
        authorName: users.name,
      })
      .from(newsSources)
      .leftJoin(categories, eq(newsSources.defaultCategoryId, categories.id))
      .leftJoin(users, eq(newsSources.defaultAuthorId, users.id))
      .where(conditions.length ? conditions[0] : undefined)
      .orderBy(desc(newsSources.createdAt));

    const mapped = rows.map((r) => ({
      id: r.source.id,
      name: r.source.name,
      url: r.source.url,
      feedUrl: r.source.feedUrl,
      sourceType: r.source.sourceType,
      isActive: r.source.isActive,
      scrapeConfig: r.source.scrapeConfig
        ? JSON.parse(r.source.scrapeConfig)
        : null,
      defaultCategoryId: r.source.defaultCategoryId,
      defaultAuthorId: r.source.defaultAuthorId,
      categoryName: r.categoryName ?? null,
      authorName: r.authorName ?? null,
      lastCrawledAt: r.source.lastCrawledAt,
      createdAt: r.source.createdAt,
      updatedAt: r.source.updatedAt,
    }));

    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Laden der Quellen" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createSourceSchema.parse(body);

    const [created] = await db
      .insert(newsSources)
      .values({
        name: data.name,
        url: data.url,
        feedUrl: data.feedUrl ?? null,
        sourceType: data.sourceType,
        isActive: data.isActive,
        scrapeConfig: data.scrapeConfig
          ? JSON.stringify(data.scrapeConfig)
          : null,
        defaultCategoryId: data.defaultCategoryId ?? null,
        defaultAuthorId: data.defaultAuthorId ?? null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validierungsfehler", details: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Quelle" },
      { status: 500 }
    );
  }
}
