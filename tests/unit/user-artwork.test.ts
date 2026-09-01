import { describe, expect, it } from 'vitest';
import { calculateImageQuality } from '@/lib/artwork/quality';
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
});
