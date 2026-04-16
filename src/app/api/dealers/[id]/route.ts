import { db } from "@/db";
import { dealers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { dealerSchema } from "@/lib/validations";

const updateDealerSchema = dealerSchema.partial();

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
  }

  try {
    const [row] = await db
      .select()
      .from(dealers)
      .where(eq(dealers.id, id))
      .limit(1);

    if (!row) {
      return NextResponse.json(
        { error: "Händler nicht gefunden" },
        { status: 404 },
      );
    }

    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Fehler beim Laden des Händlers" },
      { status: 500 },
    );
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
    return NextResponse.json(
      { error: "Ungültiger JSON-Body" },
      { status: 400 },
    );
  }

  const parsed = updateDealerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validierung fehlgeschlagen",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const [existing] = await db
      .select()
      .from(dealers)
      .where(eq(dealers.id, id))
      .limit(1);
    if (!existing) {
      return NextResponse.json(
        { error: "Händler nicht gefunden" },
        { status: 404 },
      );
    }

    const patch = parsed.data;
    const updateValues: Partial<typeof dealers.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (patch.name !== undefined) updateValues.name = patch.name;
    if (patch.slug !== undefined) updateValues.slug = patch.slug;
    if (patch.brand !== undefined) updateValues.brand = patch.brand;
    if (patch.street !== undefined) updateValues.street = patch.street;
    if (patch.zip !== undefined) updateValues.zip = patch.zip;
    if (patch.city !== undefined) updateValues.city = patch.city;
    if (patch.phone !== undefined) updateValues.phone = patch.phone || null;
    if (patch.email !== undefined) updateValues.email = patch.email || null;
    if (patch.website !== undefined)
      updateValues.website = patch.website || null;
    if (patch.logoUrl !== undefined)
      updateValues.logoUrl = patch.logoUrl || null;
    if (patch.isActive !== undefined) updateValues.isActive = patch.isActive;

    await db.update(dealers).set(updateValues).where(eq(dealers.id, id));

    const [updated] = await db
      .select()
      .from(dealers)
      .where(eq(dealers.id, id))
      .limit(1);

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Händler konnte nicht aktualisiert werden" },
      { status: 500 },
    );
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
    const [existing] = await db
      .select()
      .from(dealers)
      .where(eq(dealers.id, id))
      .limit(1);
    if (!existing) {
      return NextResponse.json(
        { error: "Händler nicht gefunden" },
        { status: 404 },
      );
    }

    await db.delete(dealers).where(eq(dealers.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Händler konnte nicht gelöscht werden" },
      { status: 500 },
    );
  }
}
