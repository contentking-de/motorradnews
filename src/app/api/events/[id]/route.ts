import { db } from "@/db";
import { events, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

const eventStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const updateEventSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().optional().or(z.literal("")).nullable(),
  venueName: z.string().min(1).max(255).optional(),
  venueAddress: z.string().min(1).max(255).optional(),
  venueCity: z.string().min(1).max(100).optional(),
  venueCountry: z.string().min(1).max(100).optional(),
  ticketUrl: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  status: eventStatusSchema.optional(),
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

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
  }

  try {
    const [row] = await db
      .select({ event: events, authorName: users.name })
      .from(events)
      .innerJoin(users, eq(events.authorId, users.id))
      .where(eq(events.id, id))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Event nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json(mapEventRow(row));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Fehler beim Laden des Events" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
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

  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const [existing] = await db.select().from(events).where(eq(events.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ error: "Event nicht gefunden" }, { status: 404 });
    }

    if (session.user.role === "EDITOR" && existing.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const patch = parsed.data;
    const now = new Date();
    const newStatus = patch.status ?? existing.status;
    let publishedAt = existing.publishedAt;
    if (newStatus === "PUBLISHED" && !publishedAt) {
      publishedAt = now;
    }

    const updateValues: Partial<typeof events.$inferInsert> = { updatedAt: now };

    if (patch.title !== undefined) updateValues.title = patch.title;
    if (patch.slug !== undefined) updateValues.slug = patch.slug;
    if (patch.description !== undefined) updateValues.description = patch.description;
    if (patch.startDate !== undefined) updateValues.startDate = new Date(patch.startDate);
    if (patch.endDate !== undefined) updateValues.endDate = patch.endDate ? new Date(patch.endDate) : null;
    if (patch.venueName !== undefined) updateValues.venueName = patch.venueName;
    if (patch.venueAddress !== undefined) updateValues.venueAddress = patch.venueAddress;
    if (patch.venueCity !== undefined) updateValues.venueCity = patch.venueCity;
    if (patch.venueCountry !== undefined) updateValues.venueCountry = patch.venueCountry;
    if (patch.ticketUrl !== undefined) updateValues.ticketUrl = patch.ticketUrl;
    if (patch.coverImageUrl !== undefined) updateValues.coverImageUrl = patch.coverImageUrl;
    if (patch.status !== undefined) updateValues.status = patch.status;
    updateValues.publishedAt = publishedAt;

    await db.update(events).set(updateValues).where(eq(events.id, id));

    const [row] = await db
      .select({ event: events, authorName: users.name })
      .from(events)
      .innerJoin(users, eq(events.authorId, users.id))
      .where(eq(events.id, id))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Event nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json(mapEventRow(row));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Event konnte nicht aktualisiert werden" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
  }

  try {
    const [existing] = await db.select().from(events).where(eq(events.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ error: "Event nicht gefunden" }, { status: 404 });
    }

    if (session.user.role === "EDITOR" && existing.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(events).where(eq(events.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Event konnte nicht gelöscht werden" }, { status: 500 });
  }
}
