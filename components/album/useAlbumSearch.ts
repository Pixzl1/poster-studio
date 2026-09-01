'use client';
import { useEffect, useState } from 'react';
import { analytics } from '@/lib/analytics/provider';
import { apiData, isAlbumData, isAlbumSearchResult } from '@/lib/music/guards';
import type { AlbumData, AlbumSearchResult } from '@/types/music';

type SearchStatus = 'idle' | 'loading' | 'error';

export function useAlbumSearch(
  onSelect: (album: AlbumData) => void,
  onSelectionStateChange?: (loading: boolean) => void,
) {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<AlbumSearchResult[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [selecting, setSelecting] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus('loading');
      try {
        const response = await fetch(
          `/api/albums/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error('Search request failed.');
        const data = apiData(await response.json());
        if (!Array.isArray(data) || !data.every(isAlbumSearchResult)) {
          throw new Error('Invalid search response.');
        }
        setResults(data);
        setStatus('idle');
        analytics.track('album_search', { resultCount: data.length });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setResults([]);
          setStatus('error');
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, requestVersion]);

  function setQuery(value: string) {
    setQueryState(value);
    if (value.trim().length < 2) {
      setResults([]);
      setStatus('idle');
    }
  }

  async function select(result: AlbumSearchResult) {
    setSelecting(result.id);
    onSelectionStateChange?.(true);
    try {
      const response = await fetch(`/api/albums/${result.id}`);
      if (!response.ok) throw new Error('Album request failed.');
      const data = apiData(await response.json());
      if (!isAlbumData(data)) throw new Error('Invalid album response.');
      setStatus('idle');
      onSelect(data);
      analytics.track('album_selected', { year: data.year ?? 0 });
    } catch {
      setStatus('error');
    } finally {
      setSelecting(null);
      onSelectionStateChange?.(false);
    }
  }

  function retry() {
    setStatus('idle');
    setRequestVersion((version) => version + 1);
  }

  return { query, setQuery, results, status, selecting, select, retry };
}
