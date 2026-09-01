'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { formatDuration } from '@/lib/domain/duration';
import {
  parseTrackDuration,
  parseTracklistText,
  reorderTracks,
} from '@/lib/domain/tracklist';
import type { Track } from '@/types/music';

export function TracklistEditor({
  tracks,
  onChange,
}: {
  tracks: Track[];
  onChange(tracks: Track[]): void;
}) {
  const { t } = useLanguage();
  const [bulk, setBulk] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [dragged, setDragged] = useState<number | null>(null);

  const normalize = (items: Track[]) =>
    items.map((track, index) => ({ ...track, position: index + 1 }));
  const update = (index: number, patch: Partial<Track>) =>
    onChange(
      tracks.map((track, current) =>
        current === index ? { ...track, ...patch } : track,
      ),
    );

  return (
    <div>
      <div className="space-y-2">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            draggable
            onDragStart={() => setDragged(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragged !== null)
                onChange(reorderTracks(tracks, dragged, index));
              setDragged(null);
            }}
            className="grid grid-cols-[24px_1fr_68px_76px] items-center gap-2 rounded-md border border-[var(--border)] p-2"
          >
            <button
              type="button"
              className="cursor-grab text-[var(--subtle)]"
              aria-label={`Track ${index + 1} ${t('track.move')}`}
            >
              ⋮⋮
            </button>
            <input
              aria-label={`${t('track.title')} ${index + 1}`}
              className="min-w-0 bg-transparent text-sm outline-none"
              value={track.title}
              onChange={(event) => update(index, { title: event.target.value })}
            />
            <input
              aria-label={`${t('track.duration')} ${index + 1}`}
              className="w-full rounded border border-[var(--border)] px-2 py-1 text-xs"
              defaultValue={
                track.durationMs === null
                  ? ''
                  : formatDuration(track.durationMs)
              }
              placeholder="3:42"
              onBlur={(event) =>
                update(index, {
                  durationMs: parseTrackDuration(event.target.value),
                })
              }
            />
            <span className="flex items-center justify-end gap-1">
              <button
                type="button"
                className="size-6 text-[var(--muted)] disabled:opacity-30"
                disabled={index === 0}
                aria-label={`Track ${index + 1} ${t('track.up')}`}
                onClick={() =>
                  onChange(reorderTracks(tracks, index, index - 1))
                }
              >
                ↑
              </button>
              <button
                type="button"
                className="size-6 text-[var(--muted)] disabled:opacity-30"
                disabled={index === tracks.length - 1}
                aria-label={`Track ${index + 1} ${t('track.down')}`}
                onClick={() =>
                  onChange(reorderTracks(tracks, index, index + 1))
                }
              >
                ↓
              </button>
              <button
                type="button"
                className="size-6 text-lg text-[var(--muted)]"
                aria-label={`Track ${index + 1} ${t('track.delete')}`}
                onClick={() =>
                  onChange(
                    normalize(tracks.filter((_, current) => current !== index)),
                  )
                }
              >
                ×
              </button>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium">
        <button
          type="button"
          className="underline underline-offset-4"
          onClick={() =>
            onChange([
              ...tracks,
              {
                id: `manual-${Date.now()}`,
                position: tracks.length + 1,
                title: t('track.new'),
                durationMs: null,
              },
            ])
          }
        >
          {t('track.add')}
        </button>
        <button
          type="button"
          className="underline underline-offset-4"
          onClick={() => setShowBulk((value) => !value)}
        >
          {t('track.import')}
        </button>
      </div>
      {showBulk && (
        <div className="mt-3">
          <textarea
            className="min-h-28 w-full rounded-md border border-[var(--border)] p-3 text-sm"
            value={bulk}
            onChange={(event) => setBulk(event.target.value)}
            placeholder={'1. Starboy | 3:50\n2. Party Monster | 4:09'}
          />
          <button
            type="button"
            className="mt-2 h-10 rounded-md bg-[var(--accent)] px-4 text-xs font-medium text-white"
            onClick={() => {
              onChange(parseTracklistText(bulk));
              setShowBulk(false);
            }}
          >
            {t('track.apply')}
          </button>
        </div>
      )}
    </div>
  );
}
