import type { Track } from '@/types/music';

export function parseTrackDuration(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (match) {
    const hours = Number(match[1] ?? 0);
    const minutes = Number(match[2]);
    const seconds = Number(match[3]);
    if ((Boolean(match[1]) && minutes > 59) || seconds > 59) return null;
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }
  const short = /^(\d+):(\d{2})$/.exec(trimmed);
  if (!short || Number(short[2]) > 59) return null;
  return (Number(short[1]) * 60 + Number(short[2])) * 1000;
}

export function parseTracklistText(value: string): Track[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const withoutNumber = line.replace(/^\s*\d+\s*[.)-]?\s*/, '');
      const parts = withoutNumber.split(/\s*\|\s*/);
      const durationText = parts.length > 1 ? (parts.pop() ?? '') : '';
      const title = parts.join(' | ').trim();
      return {
        id: `manual-${index + 1}-${title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .slice(0, 32)}`,
        position: index + 1,
        title,
        durationMs: parseTrackDuration(durationText),
      };
    })
    .filter((track) => track.title.length > 0);
}

export function reorderTracks(
  tracks: Track[],
  fromIndex: number,
  toIndex: number,
): Track[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= tracks.length ||
    toIndex >= tracks.length
  ) {
    return tracks;
  }
  const next = [...tracks];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((track, index) => ({ ...track, position: index + 1 }));
}
