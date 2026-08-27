import sharp from 'sharp';

/**
 * Automatically crops baked-in white/near-white or transparent padding
 * from an image buffer before uploading to Supabase Storage.
 *
 * @param buffer - Raw image Buffer
 * @param threshold - Tolerance for near-white pixel variation (default: 25)
 * @returns Trimmed Buffer (or original Buffer if trim is unneeded/fails)
 */
export async function trimImagePadding(buffer: Buffer, threshold = 25): Promise<Buffer> {
  try {
    const metaBefore = await sharp(buffer).metadata();
    if (!metaBefore.width || !metaBefore.height) return buffer;

    const trimmed = await sharp(buffer)
      .trim({ background: '#ffffff', threshold })
      .toBuffer();

    const metaAfter = await sharp(trimmed).metadata();
    const widthSaved = metaBefore.width - (metaAfter.width || metaBefore.width);
    const heightSaved = metaBefore.height - (metaAfter.height || metaBefore.height);

    // Only return trimmed buffer if at least 5px of padding was removed
    if (widthSaved >= 5 || heightSaved >= 5) {
      return trimmed;
    }
    return buffer;
  } catch (err) {
    // Fall back safely to original buffer if sharp encounters an unsupported format
    return buffer;
  }
}
