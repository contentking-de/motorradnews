import { db } from "@/db";
import { ingestedItems, articles, newsSources } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { slugify } from "@/lib/utils";
import { htmlToTiptapJson } from "@/lib/tiptap";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const [item] = await db
    .select()
    .from(ingestedItems)
    .where(eq(ingestedItems.id, id))
    .limit(1);

  if (!item) {
    return NextResponse.json({ error: "Item nicht gefunden" }, { status: 404 });
  }

  if (item.status !== "REWRITTEN" || !item.rewrittenTitle || !item.rewrittenBody) {
    return NextResponse.json(
      { error: "Artikel wurde noch nicht umgeschrieben" },
      { status: 400 }
    );
  }

  if (item.articleId) {
    return NextResponse.json(
      { error: "Artikel wurde bereits erstellt" },
      { status: 400 }
    );
  }

  const [source] = await db
    .select()
    .from(newsSources)
    .where(eq(newsSources.id, item.sourceId))
    .limit(1);

  const categoryId = source?.defaultCategoryId;
  const authorId = source?.defaultAuthorId ?? session.user.id;

  if (!categoryId) {
    return NextResponse.json(
      { error: "Keine Standard-Kategorie für diese Quelle konfiguriert" },
      { status: 400 }
    );
  }

  try {
    let baseSlug = slugify(item.rewrittenTitle);
    let slug = baseSlug;
    let suffix = 1;

    while (true) {
      const [existing] = await db
        .select({ id: articles.id })
        .from(articles)
        .where(eq(articles.slug, slug))
        .limit(1);
      if (!existing) break;
      slug = `${baseSlug}-${++suffix}`;
    }

    const [article] = await db
      .insert(articles)
      .values({
        title: item.rewrittenTitle,
        slug,
        teaser: item.rewrittenTeaser ?? "",
        body: htmlToTiptapJson(item.rewrittenBody),
        categoryId,
        authorId,
        status: "DRAFT",
      })
      .returning();

    await db
      .update(ingestedItems)
      .set({ status: "ARTICLE_CREATED", articleId: article.id })
      .where(eq(ingestedItems.id, id));

    return NextResponse.json({
      success: true,
      articleId: article.id,
      slug: article.slug,
    });
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Artikels" },
      { status: 500 }
    );
  }
}
