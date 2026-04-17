import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const userRoleSchema = z.enum(["ADMIN", "EDITOR"]);

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  role: userRoleSchema.optional().default("EDITOR"),
  isActive: z.boolean().optional().default(true),
  avatarUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
});

const updateUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  password: z.string().min(8).max(128).optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
  bio: z.string().nullable().optional(),
});

function toPublicUser(row: typeof users.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatarUrl,
    bio: row.bio,
    isActive: row.isActive,
    createdAt: row.createdAt,
  };
}

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const rows = await db.select().from(users);
    return NextResponse.json(rows.map(toPublicUser));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Fehler beim Laden der Benutzer" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 });
  }

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(data.password, 12);

    const [created] = await db
      .insert(users)
      .values({
        name: data.name,
        slug: slugify(data.name),
        email: data.email,
        passwordHash,
        role: data.role,
        isActive: data.isActive,
        avatarUrl: data.avatarUrl ?? null,
        bio: data.bio ?? null,
      })
      .returning();

    if (!created) {
      return NextResponse.json(
        { error: "Benutzer konnte nicht erstellt werden" },
        { status: 500 }
      );
    }

    return NextResponse.json(toPublicUser(created), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Benutzer konnte nicht erstellt werden" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 });
  }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id, name, email, password, role, isActive, bio } = parsed.data;
  if (name === undefined && email === undefined && password === undefined && role === undefined && isActive === undefined && bio === undefined) {
    return NextResponse.json(
      { error: "Mindestens ein Feld zum Aktualisieren ist erforderlich" },
      { status: 400 }
    );
  }

  try {
    const updateValues: Partial<typeof users.$inferInsert> = {};
    if (name !== undefined) {
      updateValues.name = name;
      updateValues.slug = slugify(name);
    }
    if (email !== undefined) updateValues.email = email;
    if (password !== undefined) updateValues.passwordHash = await bcrypt.hash(password, 12);
    if (role !== undefined) updateValues.role = role;
    if (isActive !== undefined) updateValues.isActive = isActive;
    if (bio !== undefined) updateValues.bio = bio;

    const [updated] = await db
      .update(users)
      .set(updateValues)
      .where(eq(users.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(toPublicUser(updated));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Benutzer konnte nicht aktualisiert werden" },
      { status: 500 }
    );
  }
}
