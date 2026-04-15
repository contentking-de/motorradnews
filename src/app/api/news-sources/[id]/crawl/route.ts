import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const baseUrl = request.nextUrl.origin;

  const res = await fetch(`${baseUrl}/api/cron/crawl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CRON_SECRET ?? ""}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Crawl fehlgeschlagen" },
      { status: 500 }
    );
  }

  const data = await res.json();
  const sourceResult = data.results?.find(
    (r: { sourceId: string }) => r.sourceId === id
  );

  return NextResponse.json(
    sourceResult ?? { sourceId: id, newItems: 0, note: "Quelle nicht aktiv" }
  );
}
