'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';
import { SpinnerIcon } from '@/components/ui/Icons';
import type { AlbumSearchResult } from '@/types/music';

interface Props {
  album: AlbumSearchResult;
  selected: boolean;
  loading: boolean;
  disabled: boolean;
  onSelect(): void;
}

export function AlbumResultCard({
  album,
  selected,
  loading,
  disabled,
  onSelect,
}: Props) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      className={`group flex min-h-[78px] w-full min-w-0 max-w-full items-center justify-between gap-4 overflow-hidden rounded-md border px-4 py-3 text-left transition-colors disabled:cursor-wait disabled:opacity-60 ${selected ? 'border-[var(--accent)] bg-[var(--surface-muted)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'}`}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${album.title} ${t('album.by')} ${album.artist}${album.year ? `, ${album.year}` : ''}`}
    >
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="block truncate text-sm font-semibold uppercase tracking-[0.04em] text-[var(--foreground)]">
          {album.title}
        </span>
        <span className="mt-1 block truncate text-sm text-[var(--muted)]">
          {album.artist}
          {album.year ? ` · ${album.year}` : ''}
        </span>
        <span className="mt-1 block truncate text-xs text-[var(--subtle)]">
          {album.primaryType ?? 'Album'} · {album.trackCount ?? '—'}{' '}
          {t('album.tracks')}
        </span>
      </span>
      {loading && <SpinnerIcon className="size-5 shrink-0 animate-spin" />}
    </button>
  );
}
