import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { getAlbum } = vi.hoisted(() => ({ getAlbum: vi.fn() }));

vi.mock('@/lib/music', () => ({ musicProvider: { getAlbum } }));
vi.mock('@/lib/rate-limit/http', () => ({
  checkApiRateLimit: vi.fn(async () => ({
    allowed: true,
    remaining: 29,
    retryAfterSeconds: 0,
  })),
}));

import { GET } from '@/app/api/albums/[id]/route';

describe('album detail configuration', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    getAlbum.mockReset();
  });

  it('blocks the provider before retrieving an album when disabled', async () => {
    vi.stubEnv('MUSICBRAINZ_ENABLED', 'false');

    const response = await GET(
      new NextRequest('http://localhost/api/albums/release-id'),
      { params: Promise.resolve({ id: 'release-id' }) },
    );

    expect(response.status).toBe(503);
    expect(getAlbum).not.toHaveBeenCalled();
  });
});
