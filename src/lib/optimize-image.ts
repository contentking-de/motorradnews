import sharp from "sharp";

const TARGET_WIDTH = 1280;
const MAX_BYTES = 150 * 1024; // 150 KB
const INITIAL_QUALITY = 80;
const MIN_QUALITY = 30;
const QUALITY_STEP = 5;

/**
 * Optimizes an image buffer: resizes to 1280px width (if wider),
 * converts to WebP, and iteratively lowers quality to stay under 150 KB.
 * Returns the optimized buffer.
 */
export async function optimizeImage(
  input: Buffer | ArrayBuffer | Uint8Array,
): Promise<Buffer> {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);

  const meta = await sharp(buf).metadata();
  const needsResize = (meta.width ?? 0) > TARGET_WIDTH;

  let quality = INITIAL_QUALITY;
  let result: Buffer;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let pipeline = sharp(buf);

    if (needsResize) {
      pipeline = pipeline.resize({ width: TARGET_WIDTH, withoutEnlargement: true });
    }

    result = await pipeline
      .webp({ quality, effort: 4 })
      .toBuffer();

    if (result.length <= MAX_BYTES || quality <= MIN_QUALITY) {
      break;
    }

    quality -= QUALITY_STEP;
  }

  return result;
}
