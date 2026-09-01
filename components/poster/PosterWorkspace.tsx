'use client';

import type { CSSProperties, RefObject } from 'react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { PosterDocument } from '@/components/poster/PosterDocument';
import { DiscIcon } from '@/components/ui/Icons';
import { PRINT_FORMATS } from '@/lib/config/print-formats';
import type { PosterProject } from '@/types/poster';

interface Props {
  project: PosterProject;
  loading: boolean;
  posterRef: RefObject<HTMLDivElement | null>;
}

type PosterStyle = CSSProperties & { '--poster-ratio': number };

export function PosterWorkspace({ project, loading, posterRef }: Props) {
  const { t } = useLanguage();
  const format = PRINT_FORMATS[project.settings.format];
  const style: PosterStyle = {
    aspectRatio: format.aspectRatio,
    '--poster-ratio': format.aspectRatio,
  };

  return (
    <section
      className="flex min-h-[34rem] bg-[var(--surface)] py-2 pl-[14px] pr-1 lg:sticky lg:top-0 lg:h-dvh lg:min-h-0"
      aria-label={t('preview.aria')}
    >
      <div className="flex min-h-0 flex-1 items-start justify-center pt-1.5">
        <div
          ref={posterRef}
          className="poster-frame overflow-hidden border border-[var(--border)] bg-white shadow-[0_2px_10px_rgba(30,30,28,0.035)]"
          style={style}
        >
          {loading ? (
            <PosterSkeleton />
          ) : project.artwork || project.content.title ? (
            <PosterDocument project={project} className="block h-full w-full" />
          ) : (
            <EmptyPoster />
          )}
        </div>
      </div>
    </section>
  );
}

function EmptyPoster() {
  const { t } = useLanguage();
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#faf9f5] px-[12%] text-center">
      <span className="grid size-14 place-items-center rounded-full border border-[var(--border)] text-[var(--muted)]">
        <DiscIcon className="size-7" />
      </span>
      <p className="mt-5 text-base font-medium tracking-[-0.02em]">
        {t('preview.emptyTitle')}
      </p>
      <p className="mt-2 max-w-[24ch] text-xs leading-5 text-[var(--muted)]">
        {t('preview.emptyDescription')}
      </p>
    </div>
  );
}

function PosterSkeleton() {
  const { t } = useLanguage();
  return (
    <div
      className="h-full animate-pulse bg-[#faf9f5] p-[7%]"
      aria-label={t('preview.loading')}
    >
      <div className="aspect-square w-full bg-[var(--surface-muted)]" />
      <div className="mt-[7%] h-[3.5%] w-3/5 rounded-sm bg-[var(--surface-muted)]" />
      <div className="mt-[3%] h-[2%] w-2/5 rounded-sm bg-[var(--surface-muted)]" />
      <div className="mt-[7%] h-px w-full bg-[var(--border)]" />
      <div className="mt-[6%] space-y-[4%]">
        {[72, 88, 64, 81, 70].map((width) => (
          <div
            key={width}
            className="h-[1.5%] rounded-sm bg-[var(--surface-muted)]"
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
    </div>
  );
}
