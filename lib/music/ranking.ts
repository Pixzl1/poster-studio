import type { AlbumSearchResult } from '@/types/music';
export interface RankingIntent {
  title: string;
  artist?: string;
}
const normalize = (value: string) =>
  value
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const unwanted =
  /\b(deluxe|anniversary|remaster(?:ed)?|clean|dolby atmos|expanded|compilation)\b/i;

export function scoreAlbum(
  album: AlbumSearchResult,
  intent: RankingIntent,
): number {
  const title = normalize(album.title);
  const wantedTitle = normalize(intent.title);
  const artist = normalize(album.artist);
  let score = 0;
  if (title === wantedTitle) score += 45;
  else if (title.includes(wantedTitle) || wantedTitle.includes(title))
    score += 18;
  const resolvedArtist = intent.artist ? normalize(intent.artist) : undefined;
  if (resolvedArtist && artist === resolvedArtist) score += 60;
  if (artist === wantedTitle) score += resolvedArtist ? 20 : 52;
  else if (artist.includes(wantedTitle) || wantedTitle.includes(artist))
    score += 20;
  if (album.primaryType?.toLowerCase() === 'album') score += 24;
  if (album.status?.toLowerCase() === 'official') score += 12;
  if (album.country === 'XW') score += 8;
  if (album.trackCount && album.trackCount > 0) score += 5;
  if (album.secondaryTypes.some((type) => type.toLowerCase() === 'compilation'))
    score -= 24;
  if (unwanted.test(`${album.title} ${album.disambiguation}`)) score -= 28;
  return score + (album.score ?? 0) / 10;
}

export function rankAlbums(
  albums: AlbumSearchResult[],
  intent: RankingIntent,
): AlbumSearchResult[] {
  const earliestYearByGroup = new Map<string, number>();
  for (const album of albums) {
    if (!album.releaseGroupId || album.year === null) continue;
    const earliest = earliestYearByGroup.get(album.releaseGroupId);
    if (earliest === undefined || album.year < earliest) {
      earliestYearByGroup.set(album.releaseGroupId, album.year);
    }
  }
  const ranked = albums
    .map((album) => {
      const originalReleaseBonus =
        album.releaseGroupId &&
        album.year !== null &&
        earliestYearByGroup.get(album.releaseGroupId) === album.year
          ? 18
          : 0;
      return {
        ...album,
        score: scoreAlbum(album, intent) + originalReleaseBonus,
      };
    })
    .sort(
      (a, b) =>
        (b.score ?? 0) - (a.score ?? 0) || (a.year ?? 9999) - (b.year ?? 9999),
    );

  const primaryAlbums = ranked.filter(
    (album) => album.primaryType?.toLowerCase() === 'album',
  );
  const officialAlbums = primaryAlbums.filter(
    (album) => album.status?.toLowerCase() === 'official',
  );
  const candidates =
    officialAlbums.length >= 6
      ? officialAlbums
      : primaryAlbums.length >= 6
        ? primaryAlbums
        : ranked;

  const seenAlbums = new Set<string>();
  return candidates.filter((album) => {
    const identity =
      album.releaseGroupId ??
      `${normalize(album.artist)}|${normalize(album.title)}|${album.year ?? ''}`;
    if (seenAlbums.has(identity)) return false;
    seenAlbums.add(identity);
    return true;
  });
}
