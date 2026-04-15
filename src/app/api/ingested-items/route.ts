import { db } from "@/db";
import { ingestedItems, newsSources } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const sourceId = searchParams.get("sourceId");
  const status = searchParams.get("status");

  try {
    const conditions = [];
    if (sourceId) conditions.push(eq(ingestedItems.sourceId, sourceId));
    if (status)
      conditions.push(
        eq(
          ingestedItems.status,
          status as
            | "NEW"
            | "REWRITING"
            | "REWRITTEN"
            | "ARTICLE_CREATED"
            | "FAILED"
            | "SKIPPED"
        )
      );

    const rows = await db
      .select({
        item: ingestedItems,
        sourceName: newsSources.name,
      })
      .from(ingestedItems)
      .leftJoin(newsSources, eq(ingestedItems.sourceId, newsSources.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(ingestedItems.fetchedAt))
      .limit(200);

    const mapped = rows.map((r) => ({
      ...r.item,
      sourceName: r.sourceName,
    }));

    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Laden" },
      { status: 500 }
    );
  }
}
