import type { Track } from '@/types/music';
export function formatDuration(durationMs: number | null): string {
  if (durationMs === null || durationMs < 0) return '—:—';
  const seconds = Math.round(durationMs / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
export function totalRuntime(tracks: Track[]): number {
  return tracks.reduce((total, track) => total + (track.durationMs ?? 0), 0);
}
export function formatRuntime(durationMs: number): string {
  const seconds = Math.round(durationMs / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
}
