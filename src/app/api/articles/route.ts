import { db } from "@/db";
import { articles, categories, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, and, ilike } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

const articleStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const createArticleSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  teaser: z.string().min(1),
  body: z.string().min(1),
  coverImageUrl: z.string().nullable().optional(),
  categoryId: z.string().uuid(),
  status: articleStatusSchema.optional().default("DRAFT"),
});

function mapArticleRow(row: {
  article: typeof articles.$inferSelect;
  categoryName: string;
  authorName: string;
}) {
  const a = row.article;
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    teaser: a.teaser,
    body: a.body,
    coverImageUrl: a.coverImageUrl,
    categoryId: a.categoryId,
    authorId: a.authorId,
    status: a.status,
    publishedAt: a.publishedAt,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    categoryName: row.categoryName,
    authorName: row.authorName,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const authorId = searchParams.get("authorId");

    const conditions = [];
    if (status) {
      const parsed = articleStatusSchema.safeParse(status);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Ungültiger status-Parameter" },
          { status: 400 }
        );
      }
      conditions.push(eq(articles.status, parsed.data));
    }
    if (categoryId) {
      if (!z.string().uuid().safeParse(categoryId).success) {
        return NextResponse.json(
          { error: "Ungültige categoryId" },
          { status: 400 }
        );
      }
      conditions.push(eq(articles.categoryId, categoryId));
    }
    if (search) {
      conditions.push(ilike(articles.title, `%${search}%`));
    }
    if (authorId) {
      if (!z.string().uuid().safeParse(authorId).success) {
        return NextResponse.json(
          { error: "Ungültige authorId" },
          { status: 400 }
        );
      }
      conditions.push(eq(articles.authorId, authorId));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        article: articles,
        categoryName: categories.name,
        authorName: users.name,
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .innerJoin(users, eq(articles.authorId, users.id))
      .where(whereClause)
      .orderBy(desc(articles.createdAt));

    return NextResponse.json(rows.map(mapArticleRow));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Fehler beim Laden der Artikel" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 });
  }

  const parsed = createArticleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const now = new Date();
  const publishedAt =
    data.status === "PUBLISHED" ? now : null;

  try {
    const [inserted] = await db
      .insert(articles)
      .values({
        title: data.title,
        slug: data.slug,
        teaser: data.teaser,
        body: data.body,
        coverImageUrl: data.coverImageUrl ?? null,
        categoryId: data.categoryId,
        authorId: session.user.id,
        status: data.status,
        publishedAt,
        updatedAt: now,
      })
      .returning();

    if (!inserted) {
      return NextResponse.json(
        { error: "Artikel konnte nicht erstellt werden" },
        { status: 500 }
      );
    }

    const [row] = await db
      .select({
        article: articles,
        categoryName: categories.name,
        authorName: users.name,
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .innerJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.id, inserted.id))
      .limit(1);

    if (!row) {
      return NextResponse.json(inserted);
    }

    return NextResponse.json(mapArticleRow(row), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Artikel konnte nicht erstellt werden" },
      { status: 500 }
    );
  }
}
