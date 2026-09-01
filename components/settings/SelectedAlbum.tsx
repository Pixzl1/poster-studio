'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';
import { DiscIcon } from '@/components/ui/Icons';
import type { PosterProject } from '@/types/poster';

export function SelectedAlbum({ project }: { project: PosterProject }) {
  const { t } = useLanguage();
  const title = project.content.title.trim() || t('project.untitled');
  const creator =
    project.mode === 'music'
      ? project.content.artist.trim() || t('project.music')
      : project.content.creator.trim() ||
        project.content.category.trim() ||
        t('project.custom');
  return (
    <div className="flex min-h-[76px] items-center gap-3.5 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="relative size-[52px] shrink-0 overflow-hidden rounded-sm bg-[var(--surface-muted)]">
        {project.artwork ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.artwork.objectUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full place-items-center text-[var(--subtle)]">
            <DiscIcon className="size-5" />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-medium">{title}</p>
        <p className="mt-0.5 truncate text-sm text-[var(--muted)]">
          {project.mode === 'music'
            ? `${creator}${project.content.year ? ` · ${project.content.year}` : ''}`
            : `${creator} · Custom`}
        </p>
      </div>
    </div>
  );
}
