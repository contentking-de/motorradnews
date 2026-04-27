import { db } from "@/db";
import { dealers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

const BRAND_ALIASES: Record<string, string> = {
  HUSQV: "Husqvarna",
  HUSQVARNA: "Husqvarna",
  MVAGUSTA: "MV Agusta",
  "MV AGUSTA": "MV Agusta",
  "HARLEY-DAVIDSON": "Harley-Davidson",
  HARLEY: "Harley-Davidson",
  "ROYAL ENFIELD": "Royal Enfield",
  YAMAHA: "Yamaha",
  KTM: "KTM",
  GASGAS: "GASGAS",
  BMW: "BMW",
  HONDA: "Honda",
  KAWASAKI: "Kawasaki",
  SUZUKI: "Suzuki",
  DUCATI: "Ducati",
  TRIUMPH: "Triumph",
  APRILIA: "Aprilia",
  INDIAN: "Indian",
  BETA: "Beta",
  FANTIC: "Fantic",
  CFMOTO: "CFMOTO",
  ZERO: "Zero",
  VESPA: "Vespa",
  BUELL: "Buell",
  MASH: "Mash",
  SYM: "SYM",
  KEEWAY: "Keeway",
  PEUGEOT: "Peugeot",
  CCM: "CCM",
  SPEEDFIGHT: "Peugeot",
};

function normalizeBrands(raw: string): string {
  return raw
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => BRAND_ALIASES[b.toUpperCase()] ?? b)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(", ");
}

const rowSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  street: z.string().optional().default(""),
  zip: z.coerce.string().optional().default(""),
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
      const normalizedBrand = normalizeBrands(row.brand);
      const zipNorm = row.zip ? String(row.zip).padStart(5, "0") : null;

      const basePart = slugify(row.name);
      const suffix = zipNorm ?? row.city.toLowerCase().replace(/\s+/g, "-");
      const slug = `${basePart}-${suffix}`;

      const [existing] = await db
        .select({ id: dealers.id })
        .from(dealers)
        .where(eq(dealers.slug, slug))
        .limit(1);

      if (existing) {
        await db
          .update(dealers)
          .set({
            name: row.name,
            brand: normalizedBrand,
            street: row.street || null,
            zip: zipNorm,
            city: row.city,
            phone: row.phone || null,
            email: row.email || null,
            website: row.website || null,
            updatedAt: new Date(),
          })
          .where(eq(dealers.id, existing.id));
        imported++;
        continue;
      }

      await db.insert(dealers).values({
        name: row.name,
        slug,
        brand: normalizedBrand,
        street: row.street || null,
        zip: zipNorm,
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
