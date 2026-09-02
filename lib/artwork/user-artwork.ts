import type { UserArtwork } from '@/types/poster';
import { extractPaletteFromImage } from '@/lib/artwork/palette';

export const SUPPORTED_ARTWORK_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

const configuredLimit = Number(
  process.env.NEXT_PUBLIC_ARTWORK_MAX_FILE_MB ?? 20,
);
export const MAX_ARTWORK_FILE_MB =
  Number.isFinite(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : 20;
export const MAX_ARTWORK_FILE_BYTES = MAX_ARTWORK_FILE_MB * 1024 * 1024;

export class ArtworkValidationError extends Error {}

export function validateArtworkFileMetadata(
  file: Pick<File, 'type' | 'size'>,
  maxBytes = MAX_ARTWORK_FILE_BYTES,
): void {
  if (
    !SUPPORTED_ARTWORK_TYPES.includes(
      file.type as (typeof SUPPORTED_ARTWORK_TYPES)[number],
    )
  ) {
    throw new ArtworkValidationError(
      'Bitte verwende JPG, PNG, WEBP oder AVIF.',
    );
  }
  if (file.size <= 0 || file.size > maxBytes) {
    throw new ArtworkValidationError(
      `Die Bilddatei darf höchstens ${Math.round(maxBytes / 1024 / 1024)} MB groß sein.`,
    );
  }
}

export async function createUserArtwork(
  file: File,
  maxBytes = MAX_ARTWORK_FILE_BYTES,
): Promise<UserArtwork> {
  validateArtworkFileMetadata(file, maxBytes);
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await decodeImage(objectUrl);
    if (image.naturalWidth < 1 || image.naturalHeight < 1) {
      throw new ArtworkValidationError(
        'Das Bild besitzt keine gültigen Abmessungen.',
      );
    }
    return {
      file,
      objectUrl,
      width: image.naturalWidth,
      height: image.naturalHeight,
      mimeType: file.type,
      fileName: file.name,
      sizeBytes: file.size,
      palette: extractPaletteFromImage(image),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    if (error instanceof ArtworkValidationError) throw error;
    throw new ArtworkValidationError('Das Bild konnte nicht gelesen werden.');
  }
}

async function decodeImage(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image decode failed'));
    image.src = objectUrl;
  });
}
