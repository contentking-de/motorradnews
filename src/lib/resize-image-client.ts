const MAX_WIDTH = 1280;
const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB — safely under Vercel's 4.5 MB body limit
const INITIAL_QUALITY = 0.85;
const MIN_QUALITY = 0.4;
const QUALITY_STEP = 0.05;

/**
 * Resizes and compresses an image file in the browser using Canvas API.
 * Returns a File that is guaranteed to be under 4 MB (Vercel body limit).
 * The server-side pipeline handles final WebP conversion + 150 KB target.
 */
export async function resizeImageClient(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  let targetW = width;
  let targetH = height;

  if (width > MAX_WIDTH) {
    targetW = MAX_WIDTH;
    targetH = Math.round((height / width) * MAX_WIDTH);
  }

  const canvas = new OffscreenCanvas(targetW, targetH);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  let quality = INITIAL_QUALITY;
  let blob: Blob;

  while (true) {
    blob = await canvas.convertToBlob({ type: "image/jpeg", quality });

    if (blob.size <= MAX_SIZE_BYTES || quality <= MIN_QUALITY) {
      break;
    }
    quality -= QUALITY_STEP;
  }

  const name = file.name.replace(/\.[^.]+$/, ".jpg");
  return new File([blob], name, { type: "image/jpeg" });
}
