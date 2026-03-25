import { db } from "@/db";
import { events, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, and, ilike } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

const eventStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional().or(z.literal("")),
  venueName: z.string().min(1).max(255),
  venueAddress: z.string().min(1).max(255),
  venueCity: z.string().min(1).max(100),
  venueCountry: z.string().min(1).max(100),
  ticketUrl: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  status: eventStatusSchema.optional().default("DRAFT"),
});

function mapEventRow(row: {
  event: typeof events.$inferSelect;
  authorName: string;
}) {
  const e = row.event;
  return {
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    startDate: e.startDate,
    endDate: e.endDate,
    venueName: e.venueName,
    venueAddress: e.venueAddress,
    venueCity: e.venueCity,
    venueCountry: e.venueCountry,
    ticketUrl: e.ticketUrl,
    coverImageUrl: e.coverImageUrl,
    status: e.status,
    authorId: e.authorId,
    publishedAt: e.publishedAt,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    authorName: row.authorName,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const conditions = [];
    if (status) {
      const parsed = eventStatusSchema.safeParse(status);
      if (!parsed.success) {
        return NextResponse.json({ error: "Ungültiger status-Parameter" }, { status: 400 });
      }
      conditions.push(eq(events.status, parsed.data));
    }
    if (search) {
      conditions.push(ilike(events.title, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({ event: events, authorName: users.name })
      .from(events)
      .innerJoin(users, eq(events.authorId, users.id))
      .where(whereClause)
      .orderBy(desc(events.startDate));

    return NextResponse.json(rows.map(mapEventRow));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Fehler beim Laden der Events" }, { status: 500 });
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

  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const now = new Date();
  const publishedAt = data.status === "PUBLISHED" ? now : null;

  try {
    const [inserted] = await db
      .insert(events)
      .values({
        title: data.title,
        slug: data.slug,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        venueCity: data.venueCity,
        venueCountry: data.venueCountry,
        ticketUrl: data.ticketUrl || null,
        coverImageUrl: data.coverImageUrl || null,
        status: data.status,
        authorId: session.user.id,
        publishedAt,
        updatedAt: now,
      })
      .returning();

    if (!inserted) {
      return NextResponse.json({ error: "Event konnte nicht erstellt werden" }, { status: 500 });
    }

    const [row] = await db
      .select({ event: events, authorName: users.name })
      .from(events)
      .innerJoin(users, eq(events.authorId, users.id))
      .where(eq(events.id, inserted.id))
      .limit(1);

    return NextResponse.json(row ? mapEventRow(row) : inserted, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Event konnte nicht erstellt werden" }, { status: 500 });
  }
}
