'use client';

import { ArtworkEditor } from '@/components/editor/ArtworkEditor';
import { CustomContentEditor } from '@/components/editor/CustomContentEditor';
import { ModeSelector } from '@/components/editor/ModeSelector';
import { MusicContentEditor } from '@/components/editor/MusicContentEditor';
import { withUserArtwork } from '@/lib/domain/project';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import type { PosterMode, PosterProject, UserArtwork } from '@/types/poster';

export function ContentPanel({
  project,
  appName,
  musicBrainzEnabled,
  onModeChange,
  onChange,
  onLoadingChange,
}: {
  project: PosterProject;
  appName: string;
  musicBrainzEnabled: boolean;
  onModeChange(mode: PosterMode): void;
  onChange(project: PosterProject): void;
  onLoadingChange(loading: boolean): void;
}) {
  const { t } = useLanguage();
  const setArtwork = (artwork: UserArtwork | null) =>
    onChange(withUserArtwork(project, artwork));
  return (
    <section className="min-h-full min-w-0 overflow-x-hidden border-b border-[var(--border)] bg-[var(--surface)] px-5 py-8 lg:border-l lg:px-10 xl:border-r xl:border-b-0 xl:px-10">
      <h1 className="text-[clamp(2.2rem,3vw,3.35rem)] font-semibold leading-[1.05] tracking-[-0.05em]">
        {appName}
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {t('app.tagline')}
      </p>
      <div className="mt-7">
        <ModeSelector value={project.mode} onChange={onModeChange} />
      </div>
      <div className="mt-8 border-t border-[var(--border)] pt-7">
        <ArtworkEditor
          artwork={project.artwork}
          settings={project.artworkSettings}
          format={project.settings.format}
          dpi={project.settings.dpi}
          onArtworkChange={setArtwork}
          onSettingsChange={(artworkSettings) =>
            onChange({ ...project, artworkSettings })
          }
        />
      </div>
      <div className="mt-8 border-t border-[var(--border)] pt-7">
        {project.mode === 'music' ? (
          <MusicContentEditor
            project={project}
            musicBrainzEnabled={musicBrainzEnabled}
            onChange={onChange}
            onLoadingChange={onLoadingChange}
          />
        ) : (
          <CustomContentEditor project={project} onChange={onChange} />
        )}
      </div>
    </section>
  );
}
