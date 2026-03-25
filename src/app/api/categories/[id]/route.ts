import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, count } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Kategorie nicht gefunden" },
        { status: 404 }
      );
    }

    const patch = parsed.data;
    const updateValues: Partial<typeof categories.$inferInsert> = {};
    if (patch.name !== undefined) updateValues.name = patch.name;
    if (patch.slug !== undefined) updateValues.slug = patch.slug;
    if (patch.description !== undefined)
      updateValues.description = patch.description;
    if (patch.sortOrder !== undefined) updateValues.sortOrder = patch.sortOrder;

    if (Object.keys(updateValues).length === 0) {
      return NextResponse.json(existing);
    }

    const [updated] = await db
      .update(categories)
      .set(updateValues)
      .where(eq(categories.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Kategorie nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Kategorie konnte nicht aktualisiert werden" },
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

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Kategorie nicht gefunden" },
        { status: 404 }
      );
    }

    const [{ articleCount }] = await db
      .select({ articleCount: count() })
      .from(articles)
      .where(eq(articles.categoryId, id));

    if (articleCount > 0) {
      return NextResponse.json(
        {
          error:
            "Kategorie kann nicht gelöscht werden, solange Artikel zugeordnet sind",
        },
        { status: 400 }
      );
    }

    await db.delete(categories).where(eq(categories.id, id));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Kategorie konnte nicht gelöscht werden" },
      { status: 500 }
    );
  }
}
