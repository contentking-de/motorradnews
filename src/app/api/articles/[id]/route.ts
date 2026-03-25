import { db } from "@/db";
import { articles, categories, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

const articleStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const updateArticleSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  teaser: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  coverImageUrl: z.string().nullable().optional(),
  categoryId: z.string().uuid().optional(),
  status: articleStatusSchema.optional(),
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

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
  }

  try {
    const [row] = await db
      .select({
        article: articles,
        categoryName: categories.name,
        authorName: users.name,
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .innerJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.id, id))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Artikel nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json(mapArticleRow(row));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Fehler beim Laden des Artikels" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 });
  }

  const parsed = updateArticleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const [existing] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Artikel nicht gefunden" }, { status: 404 });
    }

    if (
      session.user.role === "EDITOR" &&
      existing.authorId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const patch = parsed.data;
    const now = new Date();
    const newStatus = patch.status ?? existing.status;
    let publishedAt = existing.publishedAt;

    if (newStatus === "PUBLISHED" && !publishedAt) {
      publishedAt = now;
    }

    const updateValues: Partial<typeof articles.$inferInsert> = {
      updatedAt: now,
    };

    if (patch.title !== undefined) updateValues.title = patch.title;
    if (patch.slug !== undefined) updateValues.slug = patch.slug;
    if (patch.teaser !== undefined) updateValues.teaser = patch.teaser;
    if (patch.body !== undefined) updateValues.body = patch.body;
    if (patch.coverImageUrl !== undefined)
      updateValues.coverImageUrl = patch.coverImageUrl;
    if (patch.categoryId !== undefined) updateValues.categoryId = patch.categoryId;
    if (patch.status !== undefined) updateValues.status = patch.status;
    updateValues.publishedAt = publishedAt;

    await db.update(articles).set(updateValues).where(eq(articles.id, id));

    const [row] = await db
      .select({
        article: articles,
        categoryName: categories.name,
        authorName: users.name,
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .innerJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.id, id))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Artikel nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json(mapArticleRow(row));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Artikel konnte nicht aktualisiert werden" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Artikel nicht gefunden" }, { status: 404 });
    }

    if (session.user.role === "EDITOR" && existing.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(articles).where(eq(articles.id, id));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Artikel konnte nicht gelöscht werden" },
      { status: 500 }
    );
  }
}
