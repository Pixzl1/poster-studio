import { describe, expect, it } from 'vitest';
import { rankAlbums, scoreAlbum } from '@/lib/music/ranking';
import type { AlbumSearchResult } from '@/types/music';
const album = (
  overrides: Partial<AlbumSearchResult> = {},
): AlbumSearchResult => ({
  id: crypto.randomUUID(),
  title: 'Blue',
  artist: 'Joni Mitchell',
  year: 1971,
  country: 'XW',
  status: 'Official',
  primaryType: 'Album',
  secondaryTypes: [],
  disambiguation: '',
  trackCount: 10,
  ...overrides,
});
describe('album ranking', () => {
  it('prefers exact official albums', () => {
    expect(
      scoreAlbum(album(), { title: 'Blue', artist: 'Joni Mitchell' }),
    ).toBeGreaterThan(
      scoreAlbum(album({ status: 'Bootleg' }), {
        title: 'Blue',
        artist: 'Joni Mitchell',
      }),
    );
  });
  it('penalizes deluxe and remastered editions', () => {
    expect(scoreAlbum(album(), { title: 'Blue' })).toBeGreaterThan(
      scoreAlbum(album({ title: 'Blue Deluxe Remastered' }), { title: 'Blue' }),
    );
  });
  it('sorts the strongest candidate first', () => {
    expect(
      rankAlbums([album({ title: 'Blue Deluxe' }), album()], {
        title: 'Blue',
      })[0]?.title,
    ).toBe('Blue');
  });
  it('prioritizes an exact artist discography for artist searches', () => {
    const ranked = rankAlbums(
      [
        album({ title: 'Eminem', artist: 'Various Artists' }),
        album({ title: 'The Marshall Mathers LP', artist: 'Eminem' }),
      ],
      { title: 'Eminem' },
    );
    expect(ranked[0]?.title).toBe('The Marshall Mathers LP');
  });
  it('filters singles when enough album candidates are available', () => {
    const albums = Array.from({ length: 6 }, (_, index) =>
      album({
        id: `album-${index}`,
        title: `Album ${index}`,
        releaseGroupId: `group-${index}`,
      }),
    );
    const ranked = rankAlbums(
      [
        ...albums,
        album({
          id: 'single',
          title: 'Single',
          primaryType: 'Single',
          releaseGroupId: 'single-group',
        }),
      ],
      { title: 'Artist' },
    );
    expect(ranked).toHaveLength(6);
    expect(ranked.every((result) => result.primaryType === 'Album')).toBe(true);
  });
  it('filters unofficial releases when enough official albums are available', () => {
    const official = Array.from({ length: 6 }, (_, index) =>
      album({
        id: `official-${index}`,
        title: `Official ${index}`,
        releaseGroupId: `official-group-${index}`,
      }),
    );
    const ranked = rankAlbums(
      [
        ...official,
        album({
          id: 'bootleg',
          title: 'Bootleg',
          status: 'Bootleg',
          releaseGroupId: 'bootleg-group',
        }),
      ],
      { title: 'Artist' },
    );
    expect(ranked).toHaveLength(6);
    expect(ranked.every((result) => result.status === 'Official')).toBe(true);
  });
  it('keeps only the strongest release from a release group', () => {
    const ranked = rankAlbums(
      [
        album({ releaseGroupId: 'same', title: 'Blue Deluxe' }),
        album({ releaseGroupId: 'same', title: 'Blue' }),
      ],
      { title: 'Blue' },
    );
    expect(ranked).toHaveLength(1);
    expect(ranked[0]?.title).toBe('Blue');
  });
  it('prefers the earliest official edition within a release group', () => {
    const ranked = rankAlbums(
      [
        album({
          id: 'reissue',
          year: 2005,
          country: 'XW',
          releaseGroupId: 'same',
        }),
        album({
          id: 'original',
          year: 1996,
          country: 'US',
          releaseGroupId: 'same',
        }),
      ],
      { title: 'Blue' },
    );
    expect(ranked[0]?.id).toBe('original');
  });
  it('deduplicates equivalent releases without a release group id', () => {
    expect(
      rankAlbums(
        [
          album({ releaseGroupId: undefined }),
          album({ releaseGroupId: undefined }),
        ],
        { title: 'Blue' },
      ),
    ).toHaveLength(1);
  });
});
