import { describe, expect, it } from 'vitest';
import {
  parseTrackDuration,
  parseTracklistText,
  reorderTracks,
} from '@/lib/domain/tracklist';

describe('manual tracklist', () => {
  it('parses track durations', () => {
    expect(parseTrackDuration('3:50')).toBe(230_000);
    expect(parseTrackDuration('1:02:03')).toBe(3_723_000);
    expect(parseTrackDuration('3:99')).toBeNull();
  });
  it('imports numbered text with optional durations', () => {
    const tracks = parseTracklistText(
      '1. Starboy | 3:50\n2. Party Monster | 4:09\n3. Instrumental',
    );
    expect(tracks).toHaveLength(3);
    expect(tracks[1]).toMatchObject({
      position: 2,
      title: 'Party Monster',
      durationMs: 249_000,
    });
    expect(tracks[2]?.durationMs).toBeNull();
  });
  it('reorders and renumbers tracks', () => {
    const tracks = parseTracklistText('1. A | 1:00\n2. B | 2:00\n3. C | 3:00');
    const reordered = reorderTracks(tracks, 2, 0);
    expect(reordered.map((track) => track.title)).toEqual(['C', 'A', 'B']);
    expect(reordered.map((track) => track.position)).toEqual([1, 2, 3]);
  });
});
