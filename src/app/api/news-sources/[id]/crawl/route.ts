import { db } from "@/db";
import { newsSources } from "@/db/schema";
import { auth } from "@/lib/auth";
import { crawlSource } from "@/lib/crawler";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, ctx: RouteContext) {
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

  const result = await crawlSource(source);

  if (result.error) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
