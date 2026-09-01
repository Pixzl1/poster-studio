import { cache } from '@/lib/cache';
import type { CacheProvider } from '@/lib/cache/provider';
import { logger } from '@/lib/logger';
import type { AlbumData, AlbumSearchResult } from '@/types/music';
import { ZodError, type ZodType } from 'zod';
import {
  AlbumNotFoundError,
  MusicBrainzRateLimitError,
  MusicProviderError,
} from './errors';
import {
  mbArtistSearchResponseSchema,
  mbReleaseSchema,
  mbSearchResponseSchema,
  normalizeAlbum,
  normalizeSearchRelease,
} from './normalize';
import type { MusicProvider } from './provider';
import { rankAlbums } from './ranking';
import { escapeLucenePhrase, isValidMbid } from './identifiers';
import { musicBrainzThrottle, type RequestScheduler } from './throttle';

const BASE_URL = 'https://musicbrainz.org/ws/2';
const SEARCH_RESULT_LIMIT = 100;
const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export class MusicBrainzProvider implements MusicProvider {
  readonly name = 'musicbrainz';
  constructor(
    private readonly cacheProvider: CacheProvider = cache,
    private readonly fetcher: typeof fetch = fetch,
    private readonly throttle: RequestScheduler = musicBrainzThrottle,
    private readonly backoff: (milliseconds: number) => Promise<void> = delay,
  ) {}

  async searchAlbums(query: string): Promise<AlbumSearchResult[]> {
    const normalizedQuery = query.trim();
    const key = `mb:search:v11:${normalizedQuery.toLowerCase()}`;
    const cached = await this.cacheProvider.get<AlbumSearchResult[]>(key);
    if (cached) return cached;
    const phrase = escapeLucenePhrase(normalizedQuery);
    const artist = await this.resolveArtist(normalizedQuery, phrase);
    const artistClause = artist ? `arid:"${artist.id}"^8 OR ` : '';
    const params = new URLSearchParams({
      query: `(${artistClause}artist:"${phrase}"^5 OR release:"${phrase}"^4 OR track:"${phrase}") AND type:album`,
      fmt: 'json',
      limit: String(SEARCH_RESULT_LIMIT),
    });
    const response = await this.request(
      `/release?${params}`,
      mbSearchResponseSchema,
    );
    const results = rankAlbums(
      (response.releases ?? []).map(normalizeSearchRelease),
      { title: normalizedQuery, artist: artist?.name },
    );
    await this.cacheProvider.set(key, results, 60 * 15);
    return results;
  }

  private async resolveArtist(
    normalizedQuery: string,
    escapedPhrase: string,
  ): Promise<{ id: string; name: string } | undefined> {
    const params = new URLSearchParams({
      query: `(artist:"${escapedPhrase}"^4 OR alias:"${escapedPhrase}"^6)`,
      fmt: 'json',
      limit: '5',
    });
    const response = await this.request(
      `/artist?${params}`,
      mbArtistSearchResponseSchema,
    );
    const wanted = searchable(normalizedQuery);
    const artist = response.artists?.find((candidate) => {
      if ((candidate.score ?? 0) < 40) return false;
      return (
        searchable(candidate.name) === wanted ||
        candidate.aliases?.some((alias) => searchable(alias.name) === wanted)
      );
    });
    return artist ? { id: artist.id, name: artist.name } : undefined;
  }

  async getAlbum(id: string): Promise<AlbumData> {
    if (!isValidMbid(id)) throw new AlbumNotFoundError();
    const key = `mb:album:v4:${id}`;
    const cached = await this.cacheProvider.get<AlbumData>(key);
    if (cached) return cached;
    const release = await this.request(
      `/release/${id}?inc=recordings+artist-credits+release-groups+media&fmt=json`,
      mbReleaseSchema,
    );
    const album = normalizeAlbum(release);
    await this.cacheProvider.set(key, album, 60 * 60 * 12);
    return album;
  }

  async getTracks(id: string) {
    return (await this.getAlbum(id)).tracks;
  }
  private async request<T>(path: string, schema: ZodType<T>): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await this.fetchAttempt(path);
        if (response.status === 404) throw new AlbumNotFoundError();
        if (response.status === 429 && attempt === 2)
          throw new MusicBrainzRateLimitError();
        if (
          (response.status === 429 || response.status >= 500) &&
          attempt < 2
        ) {
          const retryDelay = this.retryDelay(response, attempt);
          if (response.status === 429 && retryDelay === null) {
            throw new MusicBrainzRateLimitError();
          }
          await this.backoff(retryDelay ?? 400 * 2 ** attempt);
          continue;
        }
        if (!response.ok)
          throw new MusicProviderError(
            `MusicBrainz returned HTTP ${response.status}.`,
          );
        return schema.parse(await response.json());
      } catch (error) {
        if (error instanceof ZodError) {
          throw new MusicProviderError(
            'MusicBrainz returned an invalid response.',
            { cause: error },
          );
        }
        if (
          error instanceof MusicProviderError ||
          error instanceof AlbumNotFoundError ||
          error instanceof MusicBrainzRateLimitError
        )
          throw error;
        if (attempt === 2)
          throw new MusicProviderError(undefined, { cause: error });
        logger.warn('MusicBrainz request failed; retrying', {
          attempt: attempt + 1,
        });
        await this.backoff(400 * 2 ** attempt);
      }
    }
    throw new MusicProviderError();
  }

  private fetchAttempt(path: string): Promise<Response> {
    return this.throttle.schedule(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8_000);
      try {
        return await this.fetcher(`${BASE_URL}${path}`, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'User-Agent': this.userAgent(),
          },
        });
      } finally {
        clearTimeout(timeout);
      }
    });
  }

  private retryDelay(response: Response, attempt: number): number | null {
    const retryAfter = response.headers.get('retry-after');
    if (!retryAfter) return 400 * 2 ** attempt;

    const seconds = Number(retryAfter);
    const delayMs = Number.isFinite(seconds)
      ? seconds * 1000
      : Date.parse(retryAfter) - Date.now();
    if (!Number.isFinite(delayMs) || delayMs <= 0) return 400 * 2 ** attempt;
    return delayMs <= 10_000 ? delayMs : null;
  }

  private userAgent(): string {
    return (
      process.env.MUSICBRAINZ_USER_AGENT ||
      `${process.env.APP_NAME || 'PosterStudio'}/1.0 (${process.env.MUSICBRAINZ_CONTACT_EMAIL || 'contact@example.invalid'})`
    );
  }
}

function searchable(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
