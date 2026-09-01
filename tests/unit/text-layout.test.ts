import { describe, expect, it } from 'vitest';
import { wrapText, wrapTextLines } from '@/lib/domain/text-layout';

describe('poster text layout', () => {
  it('uses the available line length before wrapping', () => {
    expect(wrapText('A concise editorial description', 40)).toEqual([
      'A concise editorial description',
    ]);
  });

  it('splits unusually long tokens without overflowing', () => {
    const lines = wrapText('abcdefghijklmnopqrstuvwxyz', 10);
    expect(lines).toEqual(['abcdefghij', 'klmnopqrst', 'uvwxyz']);
  });

  it('preserves explicit paragraph breaks', () => {
    expect(wrapText('First paragraph\nSecond paragraph', 30)).toEqual([
      'First paragraph',
      'Second paragraph',
    ]);
    expect(wrapText('First paragraph\n\nSecond paragraph', 30)).toEqual([
      'First paragraph',
      '',
      'Second paragraph',
    ]);
  });

  it('limits poster headings to the requested number of lines', () => {
    expect(
      wrapTextLines(
        'World of Warcraft The War Within Original Soundtrack',
        18,
        2,
      ),
    ).toEqual(['World of Warcraft', 'The War Within Or…']);
  });
});
