import { describe, expect, it } from 'vitest';
import {
  mbSearchResponseSchema,
  normalizeAlbum,
  normalizeSearchRelease,
} from '@/lib/music/normalize';
import { isAlbumData } from '@/lib/music/guards';
describe('MusicBrainz response normalization', () => {
  it('normalizes nested recordings into provider-independent album data', () => {
    const result = normalizeAlbum({
      id: '123',
      title: 'Kind of Blue',
      date: '1959-08-17',
      status: 'Official',
      country: 'US',
      'artist-credit': [{ name: 'Miles Davis' }],
      'release-group': { id: 'group', 'primary-type': 'Album' },
      media: [
        {
          tracks: [
            { id: 'track', position: 1, title: 'So What', length: 562000 },
          ],
        },
      ],
    });
    expect(result).toMatchObject({
      artist: 'Miles Davis',
      year: 1959,
      releaseDate: '1959-08-17',
    });
    expect(result.tracks[0]).toMatchObject({
      title: 'So What',
      durationMs: 562000,
    });
  });
  it('rejects malformed upstream payloads before normalization', () => {
    expect(() =>
      mbSearchResponseSchema.parse({ releases: [{ id: 42, title: null }] }),
    ).toThrow();
  });

  it('normalizes albums without attaching third-party artwork', () => {
    const releaseId = '4671ab19-6e97-4d1b-a1ac-d12667645b72';
    const releaseGroupId = '836f349a-0434-3e8b-a0bc-261f77a9f99c';
    const result = normalizeAlbum({
      id: releaseId,
      title: 'Hotel California',
      'release-group': { id: releaseGroupId },
    });

    expect(isAlbumData(result)).toBe(true);
  });
  it('uses the original release-group year for later editions', () => {
    const releaseId = '4671ab19-6e97-4d1b-a1ac-d12667645b72';
    const releaseGroupId = '836f349a-0434-3e8b-a0bc-261f77a9f99c';
    const result = normalizeSearchRelease({
      id: releaseId,
      title: 'All Eyez on Me',
      date: '2005-01-01',
      'release-group': {
        id: releaseGroupId,
        'primary-type': 'Album',
        'first-release-date': '1996-02-13',
      },
    });
    expect(result.year).toBe(1996);
  });
});
