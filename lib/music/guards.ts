import type { AlbumData, AlbumSearchResult, Track } from '@/types/music';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNullableString = (value: unknown): value is string | null =>
  typeof value === 'string' || value === null;

const isNullableNumber = (value: unknown): value is number | null =>
  typeof value === 'number' || value === null;

export function isAlbumSearchResult(
  value: unknown,
): value is AlbumSearchResult {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.artist === 'string' &&
    isNullableNumber(value.year) &&
    isNullableString(value.country) &&
    isNullableString(value.status) &&
    isNullableString(value.primaryType) &&
    Array.isArray(value.secondaryTypes) &&
    value.secondaryTypes.every((item) => typeof item === 'string') &&
    typeof value.disambiguation === 'string' &&
    isNullableNumber(value.trackCount)
  );
}

function isTrack(value: unknown): value is Track {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.position === 'number' &&
    Number.isInteger(value.position) &&
    value.position > 0 &&
    typeof value.title === 'string' &&
    isNullableNumber(value.durationMs) &&
    (value.durationMs === null || value.durationMs >= 0)
  );
}

export function isAlbumData(value: unknown): value is AlbumData {
  return (
    isRecord(value) &&
    isAlbumSearchResult(value) &&
    isNullableString(value.releaseDate) &&
    isNullableString(value.barcode) &&
    Array.isArray(value.tracks) &&
    value.tracks.every(isTrack) &&
    typeof value.isExplicit === 'boolean'
  );
}

export function apiData(payload: unknown): unknown {
  if (!isRecord(payload) || !('data' in payload)) {
    throw new Error('Invalid API response.');
  }
  return payload.data;
}
