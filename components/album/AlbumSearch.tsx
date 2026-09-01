'use client';
import { useState } from 'react';
import { AlbumResultCard } from '@/components/album/AlbumResultCard';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { CloseIcon, SearchIcon } from '@/components/ui/Icons';
import type { AlbumData } from '@/types/music';
import { useAlbumSearch } from './useAlbumSearch';

interface Props {
  selectedAlbumId?: string;
  onSelect(album: AlbumData): void;
  onSelectionStateChange?(loading: boolean): void;
}
export function AlbumSearch({
  selectedAlbumId,
  onSelect,
  onSelectionStateChange,
}: Props) {
  const { t } = useLanguage();
  const {
    query,
    setQuery: setSearchQuery,
    results,
    status,
    selecting,
    select,
    retry,
  } = useAlbumSearch(onSelect, onSelectionStateChange);
  const [visibleCount, setVisibleCount] = useState(12);
  const visibleResults = results.slice(0, visibleCount);

  function setQuery(value: string) {
    setVisibleCount(12);
    setSearchQuery(value);
  }

  return (
    <section
      className="min-w-0 max-w-full overflow-hidden"
      aria-label={t('album.searchAria')}
    >
      <label className="sr-only" htmlFor="album-search">
        {t('album.searchPlaceholder')}
      </label>
      <div className="flex h-12 items-center gap-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-4 transition-colors focus-within:border-[var(--accent)]">
        <SearchIcon className="size-5 shrink-0 text-[var(--muted)]" />
        <input
          type="search"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--subtle)]"
          id="album-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('album.searchPlaceholder')}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="grid size-7 place-items-center rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            onClick={() => setQuery('')}
            aria-label={t('album.clear')}
          >
            <CloseIcon className="size-4" />
          </button>
        )}
      </div>
      <div className="mt-5" aria-live="polite" aria-busy={status === 'loading'}>
        {status === 'loading' && <SearchSkeleton />}
        {status === 'error' && (
          <div
            className="flex items-center justify-between gap-4 rounded-md border border-[color:var(--danger)]/20 bg-[var(--danger-surface)] p-4 text-sm text-[var(--danger)]"
            role="alert"
          >
            <span>{t('album.error')}</span>
            <button
              type="button"
              className="shrink-0 font-medium underline underline-offset-4"
              onClick={retry}
            >
              {t('album.retry')}
            </button>
          </div>
        )}
        {status === 'idle' &&
          query.trim().length >= 2 &&
          results.length === 0 && (
            <p className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted)]">
              {t('album.none')}
            </p>
          )}
        {query.trim().length < 2 && (
          <p className="w-full text-sm leading-6 text-[var(--muted)]">
            {t('album.minimum')}
          </p>
        )}
        {status === 'idle' && results.length > 0 && (
          <p className="mb-7 text-sm text-[var(--muted)]">
            {visibleResults.length === results.length
              ? `${results.length} ${t('album.results')}`
              : `${visibleResults.length} ${t('album.ofResults')} ${results.length} ${t('album.results')}`}
          </p>
        )}
        {(status === 'idle' || (status === 'error' && results.length > 0)) && (
          <ul className="grid min-w-0 max-w-full gap-2">
            {visibleResults.map((result) => (
              <li className="min-w-0 max-w-full" key={result.id}>
                <AlbumResultCard
                  album={result}
                  selected={selectedAlbumId === result.id}
                  loading={selecting === result.id}
                  disabled={selecting !== null}
                  onSelect={() => void select(result)}
                />
              </li>
            ))}
          </ul>
        )}
        {(status === 'idle' || (status === 'error' && results.length > 0)) &&
          visibleResults.length < results.length && (
            <button
              type="button"
              className="mt-9 h-11 w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-medium transition-colors hover:bg-[var(--surface-muted)]"
              onClick={() => setVisibleCount((count) => count + 12)}
            >
              {t('album.showMore')}
            </button>
          )}
      </div>
    </section>
  );
}

function SearchSkeleton() {
  const { t } = useLanguage();
  return (
    <div className="grid gap-2" aria-label={t('album.loading')}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div className="animate-pulse" key={item}>
          <span className="block h-[78px] rounded-md bg-[var(--surface-muted)]" />
        </div>
      ))}
    </div>
  );
}
