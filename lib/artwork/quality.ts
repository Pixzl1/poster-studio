import { PRINT_FORMATS } from '@/lib/config/print-formats';
import { pixelDimensions } from '@/lib/domain/print';
import type { PosterDpi, PrintFormatId, UserArtwork } from '@/types/poster';

export type ImageQuality = 'good' | 'fair' | 'low';

export function calculateImageQuality(
  artwork: Pick<UserArtwork, 'width' | 'height'>,
  formatId: PrintFormatId,
  dpi: PosterDpi,
): {
  status: ImageQuality;
  ratio: number;
  requiredWidth: number;
  requiredHeight: number;
} {
  const format = PRINT_FORMATS[formatId];
  const required = pixelDimensions(format.widthMm, format.heightMm, dpi);
  const ratio = Math.min(
    artwork.width / required.width,
    artwork.height / required.height,
  );
  return {
    ratio,
    status: ratio >= 0.8 ? 'good' : ratio >= 0.5 ? 'fair' : 'low',
    requiredWidth: required.width,
    requiredHeight: required.height,
  };
}
