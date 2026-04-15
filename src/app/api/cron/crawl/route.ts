import { db } from "@/db";
import { newsSources } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { crawlSource } from "@/lib/crawler";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sources = await db
    .select()
    .from(newsSources)
    .where(eq(newsSources.isActive, true));

  const results = await Promise.all(sources.map(crawlSource));

  return NextResponse.json({ success: true, results });
}
