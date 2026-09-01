import { describe, expect, it } from 'vitest';
import { getPosterScale, getTrackLayout } from '@/templates/classic/layout';
import {
  createAlbumCodeMatrix,
  createWaveformHeights,
} from '@/templates/classic/marks';
describe('classic track layout', () => {
  it('uses one column for small albums', () =>
    expect(getTrackLayout(8, 500).columns).toBe(1));
  it('uses an editorial two-column layout for standard albums', () =>
    expect(getTrackLayout(10, 500).columns).toBe(2));
  it('adds columns for long releases', () =>
    expect(getTrackLayout(35, 500).columns).toBe(3));
  it('keeps rows within the available height', () => {
    const layout = getTrackLayout(24, 240);
    expect(layout.rows * layout.lineHeight).toBeLessThanOrEqual(240);
  });
  it('keeps very large releases within the available height', () => {
    const layout = getTrackLayout(200, 400);
    expect(layout.columns).toBe(4);
    expect(layout.rows * layout.lineHeight).toBeLessThanOrEqual(400);
    expect(layout.fontSize).toBeLessThanOrEqual(layout.lineHeight);
  });
  it('scales typography linearly with the physical poster width', () => {
    expect(getPosterScale(2100)).toBe(1);
    expect(getPosterScale(2970)).toBeCloseTo(297 / 210);
    expect(getPosterScale(5000)).toBeCloseTo(500 / 210);

    const a4 = getTrackLayout(10, 500, getPosterScale(2100));
    const a3Scale = getPosterScale(2970);
    const a3 = getTrackLayout(10, 500 * a3Scale, a3Scale);
    expect(a3.fontSize / a4.fontSize).toBeCloseTo(a3Scale);
  });
  it('creates deterministic poster marks without runtime randomness', () => {
    const tracks = [
      { id: 'track-a', position: 1, title: 'A', durationMs: 180_000 },
      { id: 'track-b', position: 2, title: 'B', durationMs: 240_000 },
    ];
    expect(createWaveformHeights(tracks)).toEqual(
      createWaveformHeights(tracks),
    );
    expect(createAlbumCodeMatrix('album-id')).toEqual(
      createAlbumCodeMatrix('album-id'),
    );
    expect(createAlbumCodeMatrix('album-id')).not.toEqual(
      createAlbumCodeMatrix('another-album'),
    );
  });
});
