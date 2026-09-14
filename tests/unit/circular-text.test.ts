import { describe, expect, it } from 'vitest';
import {
  fitCircularText,
  layoutCircularText,
} from '@/lib/domain/circular-text';

describe('circular text layout', () => {
  it('normalizes whitespace and distributes the complete text across rings', () => {
    const rings = layoutCircularText(
      'First line\nwith   deliberate spacing and enough words to wrap',
      [120, 100, 80],
      10,
    );

    expect(rings.map((ring) => ring.text).join(' ')).toBe(
      'First line with deliberate spacing and enough words to wrap',
    );
    expect(rings.every((ring) => !ring.truncated)).toBe(true);
  });

  it('marks text that exceeds the final available ring', () => {
    const rings = layoutCircularText('word '.repeat(200), [50, 40], 18);

    expect(rings).toHaveLength(2);
    expect(rings.at(-1)?.text).toMatch(/…$/);
    expect(rings.at(-1)?.truncated).toBe(true);
  });

  it('can deliberately spread short text over several rings', () => {
    const rings = layoutCircularText(
      'Friends carry each other through the dark and always find their way home',
      [120, 90, 60],
      12,
      true,
    );

    expect(rings).toHaveLength(3);
    expect(rings.map((ring) => ring.text).join(' ')).toBe(
      'Friends carry each other through the dark and always find their way home',
    );
  });

  it('reduces the effective font size instead of dropping long lyrics', () => {
    const source = 'A complete lyric line with several words. '.repeat(150);
    const normalized = source.replaceAll(/\s+/g, ' ').trim();
    const layout = fitCircularText(source, {
      outerRadius: 765,
      innerRadius: 258,
      requestedFontSize: 26.25,
      minimumFontSize: 7,
      preferredRingCount: 36,
    });

    expect(normalized.length).toBeGreaterThan(6000);
    expect(layout.wasReduced).toBe(true);
    expect(layout.fontSize).toBeLessThan(26.25);
    expect(layout.rings.every((ring) => !ring.truncated)).toBe(true);
    expect(layout.rings.map((ring) => ring.text).join(' ')).toBe(normalized);
  });

  it('returns no rings for empty text or an invalid font size', () => {
    expect(layoutCircularText('   ', [100], 12)).toEqual([]);
    expect(layoutCircularText('Lyrics', [100], 0)).toEqual([]);
  });
});
