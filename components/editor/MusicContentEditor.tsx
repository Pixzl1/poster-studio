'use client';

import { AlbumSearch } from '@/components/album/AlbumSearch';
import { TracklistEditor } from '@/components/editor/TracklistEditor';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import type { AlbumData } from '@/types/music';
import type { MusicPosterProject } from '@/types/poster';

const MUSICBRAINZ_DATA_LICENSE_URL =
  'https://musicbrainz.org/doc/About/Data_License';

export function MusicContentEditor({
  project,
  musicBrainzEnabled,
  onChange,
  onLoadingChange,
}: {
  project: MusicPosterProject;
  musicBrainzEnabled: boolean;
  onChange(project: MusicPosterProject): void;
  onLoadingChange(loading: boolean): void;
}) {
  const { t } = useLanguage();
  const setSource = (metadataSource: MusicPosterProject['metadataSource']) =>
    onChange({ ...project, metadataSource });
  const updateContent = (patch: Partial<MusicPosterProject['content']>) =>
    onChange({ ...project, content: { ...project.content, ...patch } });
  const importAlbum = (album: AlbumData) =>
    onChange({
      ...project,
      metadataSource: 'musicbrainz',
      content: {
        ...project.content,
        albumId: album.id,
        title: album.title,
        artist: album.artist,
        year: album.year,
        releaseDate: album.releaseDate,
        tracks: album.tracks,
        isExplicit: album.isExplicit,
      },
    });

  return (
    <div className="space-y-7">
      <section>
        <SectionTitle>{t('music.albumData')}</SectionTitle>
        <div
          className={`mt-3 grid overflow-hidden rounded-md border border-[var(--border)] ${musicBrainzEnabled ? 'grid-cols-2' : 'grid-cols-1'}`}
        >
          <SourceButton
            selected={project.metadataSource === 'manual'}
            onClick={() => setSource('manual')}
          >
            {t('music.manual')}
          </SourceButton>
          {musicBrainzEnabled && (
            <SourceButton
              selected={project.metadataSource === 'musicbrainz'}
              onClick={() => setSource('musicbrainz')}
            >
              {t('music.automatic')}
            </SourceButton>
          )}
        </div>
        {musicBrainzEnabled && project.metadataSource === 'musicbrainz' && (
          <div className="mt-3 w-full">
            <p className="mb-4 w-full text-xs leading-5 text-[var(--muted)]">
              {t('music.automaticHelpBefore')}
              <a
                className="font-medium text-[var(--foreground)] underline underline-offset-2"
                href={MUSICBRAINZ_DATA_LICENSE_URL}
                target="_blank"
                rel="noreferrer"
              >
                {t('music.automaticHelpLink')}
              </a>
              {t('music.automaticHelpAfter')}
            </p>
            <AlbumSearch
              selectedAlbumId={project.content.albumId ?? undefined}
              onSelect={importAlbum}
              onSelectionStateChange={onLoadingChange}
            />
          </div>
        )}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field
            label={t('music.albumTitle')}
            value={project.content.title}
            onChange={(title) => updateContent({ title })}
          />
          <Field
            label={t('music.artist')}
            value={project.content.artist}
            onChange={(artist) => updateContent({ artist })}
          />
          <Field
            label={t('music.subtitle')}
            value={project.content.subtitle}
            onChange={(subtitle) => updateContent({ subtitle })}
          />
          <label className="block text-xs text-[var(--muted)]">
            <span>{t('music.year')}</span>
            <input
              key={project.content.albumId ?? 'manual-year'}
              className="mt-1.5 h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              defaultValue={project.content.year?.toString() ?? ''}
              inputMode="numeric"
              onChange={(event) => {
                const value = event.target.value.trim();
                if (value === '' || /^\d{4}$/.test(value)) {
                  updateContent({ year: value ? Number(value) : null });
                }
              }}
            />
          </label>
          <Field
            label={t('music.releaseDate')}
            value={project.content.releaseDate ?? ''}
            onChange={(releaseDate) =>
              updateContent({ releaseDate: releaseDate || null })
            }
          />
        </div>
      </section>
      <section>
        <SectionTitle>{t('music.tracklist')}</SectionTitle>
        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
          {t('music.importedEditable')}
        </p>
        <div className="mt-4">
          <TracklistEditor
            tracks={project.content.tracks}
            onChange={(tracks) => updateContent({ tracks })}
          />
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
      {children}
    </h3>
  );
}

function SourceButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick(): void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`h-11 text-xs font-medium transition-colors ${selected ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--surface-muted)]'}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <label className="block text-xs text-[var(--muted)]">
      <span>{label}</span>
      <input
        className="mt-1.5 h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
