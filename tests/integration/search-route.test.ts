import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const { searchAlbums } = vi.hoisted(() => ({ searchAlbums: vi.fn() }));
vi.mock('@/lib/music', () => ({ musicProvider: { searchAlbums } }));
vi.mock('@/lib/rate-limit/http', () => ({
  checkApiRateLimit: vi.fn(async () => ({
    allowed: true,
    remaining: 29,
    retryAfterSeconds: 0,
  })),
}));
import { GET } from '@/app/api/albums/search/route';
describe('album search endpoint', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    searchAlbums.mockReset();
  });
  it('returns normalized results', async () => {
    searchAlbums.mockResolvedValue([{ id: 'release', title: 'Blue' }]);
    const response = await GET(
      new NextRequest('http://localhost/api/albums/search?q=Blue'),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: [{ id: 'release', title: 'Blue' }],
    });
  });
  it('rejects a short query', async () => {
    const response = await GET(
      new NextRequest('http://localhost/api/albums/search?q=x'),
    );
    expect(response.status).toBe(400);
  });
  it('preserves MusicBrainz search when explicitly enabled', async () => {
    vi.stubEnv('MUSICBRAINZ_ENABLED', 'true');
    searchAlbums.mockResolvedValue([{ id: 'release', title: 'Blue' }]);

    const response = await GET(
      new NextRequest('http://localhost/api/albums/search?q=Blue'),
    );

    expect(response.status).toBe(200);
    expect(searchAlbums).toHaveBeenCalledOnce();
  });
  it('blocks the provider before making a request when disabled', async () => {
    vi.stubEnv('MUSICBRAINZ_ENABLED', 'false');

    const response = await GET(
      new NextRequest('http://localhost/api/albums/search?q=Blue'),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: {
        code: 'MUSICBRAINZ_DISABLED',
        message: 'MusicBrainz is unavailable for this installation.',
      },
    });
    expect(searchAlbums).not.toHaveBeenCalled();
  });
});
