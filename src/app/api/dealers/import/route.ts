import { db } from "@/db";
import { dealers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

const rowSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  street: z.string().min(1),
  zip: z.coerce.string().min(1),
  city: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
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

  const arraySchema = z.array(rowSchema);
  const parsed = arraySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validierung fehlgeschlagen",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const rows = parsed.data;
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      let slug = slugify(row.name);
      const [existing] = await db
        .select({ id: dealers.id })
        .from(dealers)
        .where(eq(dealers.slug, slug))
        .limit(1);
      if (existing) {
        slug = `${slug}-${String(row.zip).padStart(5, "0")}`;
      }

      await db.insert(dealers).values({
        name: row.name,
        slug,
        brand: row.brand,
        street: row.street,
        zip: String(row.zip).padStart(5, "0"),
        city: row.city,
        phone: row.phone || null,
        email: row.email || null,
        website: row.website || null,
        isActive: true,
      });
      imported++;
    } catch (e) {
      skipped++;
      errors.push(`${row.name}: ${e instanceof Error ? e.message : "Unbekannter Fehler"}`);
    }
  }

  return NextResponse.json({ imported, skipped, errors });
}
