import { describe, expect, it } from 'vitest';
import { mmToPixels, pixelDimensions } from '@/lib/domain/print';
describe('print conversion', () => {
  it('converts A4 at 300 DPI exactly', () =>
    expect(pixelDimensions(210, 297, 300)).toEqual({
      width: 2480,
      height: 3508,
    }));
  it('converts one inch', () => expect(mmToPixels(25.4, 150)).toBe(150));
});
