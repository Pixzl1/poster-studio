import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryCacheProvider } from '@/lib/cache/memory';
import { MusicBrainzProvider } from '@/lib/music/musicbrainz';
import type { RequestScheduler } from '@/lib/music/throttle';

const releaseId = 'f5093c06-23e3-404f-aeaa-40f72885ee3a';
const artistId = '410c9baf-5469-44f6-9852-826524b80c61';

function immediateScheduler(onSchedule?: () => void): RequestScheduler {
  return {
    async schedule<T>(request: () => Promise<T>): Promise<T> {
      onSchedule?.();
      return request();
    },
  };
}

describe('MusicBrainz provider', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('escapes search phrases, identifies the app, and caches results', async () => {
    vi.stubEnv('MUSICBRAINZ_USER_AGENT', 'PosterTests/1.0 (test@example.com)');
    const fetcher = vi.fn<typeof fetch>(async (url) =>
      String(url).includes('/artist?')
        ? Response.json({
            artists: [
              {
                id: artistId,
                name: 'Rare Blue',
                score: 100,
                aliases: [{ name: 'Blue "Rare"' }],
              },
            ],
          })
        : Response.json({
            releases: [{ id: releaseId, title: 'Blue "Rare"' }],
          }),
    );
    const provider = new MusicBrainzProvider(
      new MemoryCacheProvider(),
      fetcher,
      immediateScheduler(),
    );

    await provider.searchAlbums('Blue "Rare"');
    await provider.searchAlbums('Blue "Rare"');

    expect(fetcher).toHaveBeenCalledTimes(2);
    const [url, init] = fetcher.mock.calls[1] ?? [];
    expect(String(url)).toContain('release%3A%22Blue+%5C%22Rare%5C%22%22');
    expect(String(url)).toContain('artist%3A%22Blue+%5C%22Rare%5C%22%22');
    expect(String(url)).toContain('track%3A%22Blue+%5C%22Rare%5C%22%22');
    expect(String(url)).toContain('limit=100');
    expect(String(url)).toContain(`arid%3A%22${artistId}%22`);
    expect(String(url)).toContain('type%3Aalbum');
    expect(new Headers(init?.headers).get('user-agent')).toBe(
      'PosterTests/1.0 (test@example.com)',
    );
  });

  it('schedules every retry through the throttle', async () => {
    let scheduled = 0;
    const fetcher = vi.fn<typeof fetch>(async () =>
      Response.json({}, { status: 429, headers: { 'Retry-After': '1' } }),
    );
    const provider = new MusicBrainzProvider(
      new MemoryCacheProvider(),
      fetcher,
      immediateScheduler(() => {
        scheduled += 1;
      }),
      async () => undefined,
    );

    await expect(provider.searchAlbums('Blue')).rejects.toMatchObject({
      code: 'MUSICBRAINZ_RATE_LIMIT',
    });
    expect(scheduled).toBe(3);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('fails fast instead of retrying before a long Retry-After window', async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      Response.json({}, { status: 429, headers: { 'Retry-After': '60' } }),
    );
    const provider = new MusicBrainzProvider(
      new MemoryCacheProvider(),
      fetcher,
      immediateScheduler(),
      async () => undefined,
    );

    await expect(provider.searchAlbums('Blue')).rejects.toMatchObject({
      code: 'MUSICBRAINZ_RATE_LIMIT',
    });
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
