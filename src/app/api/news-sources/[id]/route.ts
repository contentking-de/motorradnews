import { db } from "@/db";
import { newsSources } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

const updateSourceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  url: z.string().url().optional(),
  feedUrl: z.string().url().nullable().optional(),
  sourceType: z.enum(["RSS", "HTML"]).optional(),
  isActive: z.boolean().optional(),
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

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const [source] = await db
    .select()
    .from(newsSources)
    .where(eq(newsSources.id, id))
    .limit(1);

  if (!source) {
    return NextResponse.json(
      { error: "Quelle nicht gefunden" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ...source,
    scrapeConfig: source.scrapeConfig
      ? JSON.parse(source.scrapeConfig)
      : null,
  });
}

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    const body = await request.json();
    const data = updateSourceSchema.parse(body);

    const values: Record<string, unknown> = { updatedAt: new Date() };

    if (data.name !== undefined) values.name = data.name;
    if (data.url !== undefined) values.url = data.url;
    if (data.feedUrl !== undefined) values.feedUrl = data.feedUrl;
    if (data.sourceType !== undefined) values.sourceType = data.sourceType;
    if (data.isActive !== undefined) values.isActive = data.isActive;
    if (data.scrapeConfig !== undefined) {
      values.scrapeConfig = data.scrapeConfig
        ? JSON.stringify(data.scrapeConfig)
        : null;
    }
    if (data.defaultCategoryId !== undefined)
      values.defaultCategoryId = data.defaultCategoryId;
    if (data.defaultAuthorId !== undefined)
      values.defaultAuthorId = data.defaultAuthorId;

    const [updated] = await db
      .update(newsSources)
      .set(values)
      .where(eq(newsSources.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Quelle nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...updated,
      scrapeConfig: updated.scrapeConfig
        ? JSON.parse(updated.scrapeConfig)
        : null,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validierungsfehler", details: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const [deleted] = await db
    .delete(newsSources)
    .where(eq(newsSources.id, id))
    .returning();

  if (!deleted) {
    return NextResponse.json(
      { error: "Quelle nicht gefunden" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
