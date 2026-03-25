import { auth } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Ungültige multipart/form-data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Feld „file“ fehlt oder ist keine Datei" },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Datei ist zu groß (max. 10 MB)" },
      { status: 400 }
    );
  }

  const type = file.type || "application/octet-stream";
  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json(
      { error: "Nur JPEG-, PNG-, GIF- und WebP-Bilder sind erlaubt" },
      { status: 400 }
    );
  }

  const ext = EXT_BY_MIME[type];
  const buffer = Buffer.from(await file.arrayBuffer());
  const baseName =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const filename = `${baseName}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(filepath, buffer);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Upload konnte nicht gespeichert werden" },
      { status: 500 }
    );
  }

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
}
