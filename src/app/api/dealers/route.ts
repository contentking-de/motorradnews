import { db } from "@/db";
import { dealers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc, and, ilike, eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { dealerSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { geocodeAddress } from "@/lib/geocode";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const city = searchParams.get("city");
    const brand = searchParams.get("brand");
    const activeOnly = searchParams.get("active");

    const conditions = [];
    if (search) {
      conditions.push(ilike(dealers.name, `%${search}%`));
    }
    if (city) {
      conditions.push(ilike(dealers.city, `%${city}%`));
    }
    if (brand) {
      conditions.push(ilike(dealers.brand, `%${brand}%`));
    }
    if (activeOnly === "true") {
      conditions.push(eq(dealers.isActive, true));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(dealers)
      .where(whereClause)
      .orderBy(desc(dealers.createdAt));

    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Fehler beim Laden der Händler" },
      { status: 500 },
    );
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
    return NextResponse.json(
      { error: "Ungültiger JSON-Body" },
      { status: 400 },
    );
  }

  const parsed = dealerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validierung fehlgeschlagen",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const now = new Date();

  try {
    const coords = await geocodeAddress(
      data.street || "",
      data.zip || "",
      data.city,
    );

    const [inserted] = await db
      .insert(dealers)
      .values({
        name: data.name,
        slug: data.slug || slugify(data.name),
        brand: data.brand,
        street: data.street || null,
        zip: data.zip || null,
        city: data.city,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        description: data.description || null,
        latitude: coords?.lat ?? null,
        longitude: coords?.lon ?? null,
        logoUrl: data.logoUrl || null,
        isActive: data.isActive ?? true,
        updatedAt: now,
      })
      .returning();

    if (!inserted) {
      return NextResponse.json(
        { error: "Händler konnte nicht erstellt werden" },
        { status: 500 },
      );
    }

    return NextResponse.json(inserted, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Händler konnte nicht erstellt werden" },
      { status: 500 },
    );
  }
}
