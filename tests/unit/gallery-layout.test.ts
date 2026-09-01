import { describe, expect, it } from 'vitest';
import { getGalleryCodeX } from '@/templates/gallery/GalleryTemplate';

describe('Gallery QR placement', () => {
  it('places the code left, centered, or right within the poster margins', () => {
    expect(getGalleryCodeX('left', 2100, 160, 220)).toBe(160);
    expect(getGalleryCodeX('center', 2100, 160, 220)).toBe(940);
    expect(getGalleryCodeX('right', 2100, 160, 220)).toBe(1720);
  });
});
