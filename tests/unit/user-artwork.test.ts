import { describe, expect, it } from 'vitest';
import { calculateImageQuality } from '@/lib/artwork/quality';
import {
  DEFAULT_ARTWORK_PALETTE,
  extractDominantPalette,
} from '@/lib/artwork/palette';
import {
  ArtworkValidationError,
  validateArtworkFileMetadata,
} from '@/lib/artwork/user-artwork';
import { DEFAULT_ARTWORK_SETTINGS } from '@/lib/domain/project';
import { getArtworkPlacement } from '@/templates/shared/elements';

describe('user artwork', () => {
  it('accepts supported local image metadata', () => {
    expect(() =>
      validateArtworkFileMetadata({ type: 'image/png', size: 1024 }, 2048),
    ).not.toThrow();
  });
  it('rejects unsupported or oversized files', () => {
    expect(() =>
      validateArtworkFileMetadata({ type: 'image/gif', size: 100 }, 2048),
    ).toThrow(ArtworkValidationError);
    expect(() =>
      validateArtworkFileMetadata({ type: 'image/jpeg', size: 4096 }, 2048),
    ).toThrow(ArtworkValidationError);
  });
  it('calculates print quality against format and DPI', () => {
    expect(
      calculateImageQuality({ width: 4000, height: 6000 }, 'a4', 300),
    ).toEqual(
      expect.objectContaining({
        status: 'good',
        requiredWidth: 2480,
        requiredHeight: 3508,
      }),
    );
    expect(
      calculateImageQuality({ width: 600, height: 800 }, 'a3', 300).status,
    ).toBe('low');
  });
  it('uses the same deterministic artwork placement for preview and export', () => {
    const placement = getArtworkPlacement(
      { width: 1000, height: 500 },
      {
        ...DEFAULT_ARTWORK_SETTINGS,
        fitMode: 'fill',
        scale: 1.5,
        positionX: 25,
      },
      0,
      0,
      400,
      400,
    );
    expect(placement).toEqual({ x: -300, y: -100, width: 1200, height: 600 });
  });

  it('extracts a stable five-color palette from local pixel data', () => {
    const colors = [
      [10, 20, 40],
      [30, 80, 180],
      [105, 65, 150],
      [210, 80, 90],
      [240, 145, 65],
    ];
    const pixels = new Uint8ClampedArray(
      colors.flatMap(([red, green, blue]) =>
        Array.from({ length: 20 }, () => [red, green, blue, 255]).flat(),
      ),
    );

    const palette = extractDominantPalette(pixels);

    expect(palette).toHaveLength(5);
    expect(new Set(palette).size).toBe(5);
    expect(palette[0]).toBe('#0a1428');
    expect(palette.at(-1)).toBe('#f09141');
  });

  it('falls back to the editorial palette for transparent artwork', () => {
    expect(extractDominantPalette(new Uint8ClampedArray(40))).toEqual([
      ...DEFAULT_ARTWORK_PALETTE,
    ]);
  });
});
