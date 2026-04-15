import { db } from "@/db";
import { events, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const submitEventSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(255),
  description: z.string().min(1, "Beschreibung ist erforderlich").max(5000),
  startDate: z.string().min(1, "Startdatum ist erforderlich"),
  endDate: z.string().optional().or(z.literal("")),
  venueName: z.string().min(1, "Veranstaltungsort ist erforderlich").max(255),
  venueAddress: z.string().min(1, "Adresse ist erforderlich").max(255),
  venueCity: z.string().min(1, "Stadt ist erforderlich").max(100),
  venueCountry: z.string().min(1, "Land ist erforderlich").max(100),
  ticketUrl: z.string().url("Ungültige URL").optional().or(z.literal("")),
  submitterName: z.string().min(1, "Name ist erforderlich").max(100),
  submitterEmail: z.string().email("Ungültige E-Mail-Adresse"),
});

function textToTiptapJson(text: string): string {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const content = paragraphs.map((p) => ({
    type: "paragraph" as const,
    content: [{ type: "text" as const, text: p }],
  }));

  return JSON.stringify({ type: "doc", content });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungültiger JSON-Body" },
      { status: 400 }
    );
  }

  const parsed = submitEventSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Validierung fehlgeschlagen" },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const [admin] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "ADMIN"))
      .limit(1);

    if (!admin) {
      return NextResponse.json(
        { error: "System-Fehler: Kein Admin-Benutzer gefunden" },
        { status: 500 }
      );
    }

    let baseSlug = slugify(data.title);
    let slug = baseSlug;
    let suffix = 1;
    while (true) {
      const [existing] = await db
        .select({ id: events.id })
        .from(events)
        .where(eq(events.slug, slug))
        .limit(1);
      if (!existing) break;
      slug = `${baseSlug}-${++suffix}`;
    }

    const descriptionDoc = textToTiptapJson(
      `${data.description}\n\n---\nEingereicht von: ${data.submitterName} (${data.submitterEmail})`
    );

    await db.insert(events).values({
      title: `[Einreichung] ${data.title}`,
      slug,
      description: descriptionDoc,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      venueName: data.venueName,
      venueAddress: data.venueAddress,
      venueCity: data.venueCity,
      venueCountry: data.venueCountry,
      ticketUrl: data.ticketUrl || null,
      coverImageUrl: null,
      status: "DRAFT",
      authorId: admin.id,
      publishedAt: null,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    console.error("Event-Einreichung fehlgeschlagen:", e);
    return NextResponse.json(
      { error: "Beim Speichern ist ein Fehler aufgetreten" },
      { status: 500 }
    );
  }
}
