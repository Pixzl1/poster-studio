import { z } from 'zod';
import type { AlbumData, AlbumSearchResult, Track } from '@/types/music';

const artistCreditSchema = z.object({
  name: z.string(),
  joinphrase: z.string().optional(),
});

const trackSchema = z.object({
  id: z.string().uuid().optional(),
  position: z.number().optional(),
  title: z.string(),
  length: z.number().nonnegative().nullable().optional(),
  recording: z
    .object({
      id: z.string().uuid().optional(),
      title: z.string().optional(),
      length: z.number().nonnegative().nullable().optional(),
    })
    .optional(),
});

export const mbReleaseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  date: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  disambiguation: z.string().optional(),
  barcode: z.string().nullable().optional(),
  score: z.number().optional(),
  'artist-credit': z.array(artistCreditSchema).optional(),
  'track-count': z.number().int().nonnegative().optional(),
  'release-group': z
    .object({
      id: z.string().uuid().optional(),
      'primary-type': z.string().nullable().optional(),
      'secondary-types': z.array(z.string()).optional(),
      'first-release-date': z.string().nullable().optional(),
    })
    .optional(),
  media: z
    .array(z.object({ tracks: z.array(trackSchema).optional() }))
    .optional(),
});

export const mbSearchResponseSchema = z.object({
  releases: z.array(mbReleaseSchema).optional(),
});

export const mbArtistSearchResponseSchema = z.object({
  artists: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        score: z.number().optional(),
        aliases: z.array(z.object({ name: z.string() })).optional(),
      }),
    )
    .optional(),
});

export type MbRelease = z.infer<typeof mbReleaseSchema>;

const artistName = (release: MbRelease) =>
  release['artist-credit']
    ?.map((credit) => `${credit.name}${credit.joinphrase ?? ''}`)
    .join('') || 'Unknown artist';

const releaseYear = (date?: string | null) => {
  const parsed = date?.slice(0, 4);
  return parsed && /^\d{4}$/.test(parsed) ? Number(parsed) : null;
};

export function normalizeSearchRelease(release: MbRelease): AlbumSearchResult {
  return {
    id: release.id,
    releaseGroupId: release['release-group']?.id,
    title: release.title,
    artist: artistName(release),
    year: releaseYear(
      release['release-group']?.['first-release-date'] ?? release.date,
    ),
    country: release.country ?? null,
    status: release.status ?? null,
    primaryType: release['release-group']?.['primary-type'] ?? null,
    secondaryTypes: release['release-group']?.['secondary-types'] ?? [],
    disambiguation: release.disambiguation ?? '',
    trackCount: release['track-count'] ?? null,
    score: release.score,
  };
}

export function normalizeTracks(release: MbRelease): Track[] {
  return (release.media ?? [])
    .flatMap((medium) => medium.tracks ?? [])
    .map((track, index) => ({
      id: track.recording?.id ?? track.id ?? `${release.id}-${index}`,
      position: index + 1,
      title: track.recording?.title ?? track.title,
      durationMs: track.length ?? track.recording?.length ?? null,
    }));
}

export function normalizeAlbum(release: MbRelease): AlbumData {
  const base = normalizeSearchRelease(release);
  return {
    ...base,
    releaseDate: release.date ?? null,
    barcode: release.barcode ?? null,
    tracks: normalizeTracks(release),
    isExplicit: false,
  };
}
