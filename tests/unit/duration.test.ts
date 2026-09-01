import { describe, expect, it } from 'vitest';
import { formatDuration, totalRuntime } from '@/lib/domain/duration';
describe('duration utilities', () => {
  it('formats track duration', () =>
    expect(formatDuration(245000)).toBe('4:05'));
  it('handles missing durations', () =>
    expect(formatDuration(null)).toBe('—:—'));
  it('calculates known runtime', () =>
    expect(
      totalRuntime([
        { id: '1', position: 1, title: 'A', durationMs: 1000 },
        { id: '2', position: 2, title: 'B', durationMs: null },
      ]),
    ).toBe(1000));
});
