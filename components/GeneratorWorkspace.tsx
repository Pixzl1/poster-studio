'use client';

import { useEffect, useRef, useState } from 'react';
import { ContentPanel } from '@/components/editor/ContentPanel';
import { PosterWorkspace } from '@/components/poster/PosterWorkspace';
import { usePosterExport } from '@/components/poster/usePosterExport';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import {
  createPosterDrafts,
  getPosterDraft,
  replacePosterDraft,
} from '@/lib/domain/project-drafts';
import type { PosterMode, PosterProject } from '@/types/poster';

export function GeneratorWorkspace({
  appName,
  musicBrainzEnabled,
}: {
  appName: string;
  musicBrainzEnabled: boolean;
}) {
  const [activeMode, setActiveMode] = useState<PosterMode>('music');
  const [drafts, setDrafts] = useState(createPosterDrafts);
  const project = getPosterDraft(drafts, activeMode);
  const [posterLoading, setPosterLoading] = useState(false);
  const posterContainerRef = useRef<HTMLDivElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const { exporting, error, exportPng, exportPdf } = usePosterExport(
    project,
    posterContainerRef,
  );

  useEffect(
    () => () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  function updateProject(next: PosterProject) {
    const previousUrl = getPosterDraft(drafts, next.mode).artwork?.objectUrl;
    const nextUrl = next.artwork?.objectUrl ?? null;
    const otherMode: PosterMode = next.mode === 'music' ? 'custom' : 'music';
    const otherUrl = getPosterDraft(drafts, otherMode).artwork?.objectUrl;
    if (previousUrl && previousUrl !== nextUrl && previousUrl !== otherUrl) {
      URL.revokeObjectURL(previousUrl);
      objectUrlsRef.current.delete(previousUrl);
    }
    if (nextUrl) objectUrlsRef.current.add(nextUrl);
    setDrafts((current) => replacePosterDraft(current, next));
  }

  function changeMode(mode: PosterMode) {
    setPosterLoading(false);
    setActiveMode(mode);
  }

  return (
    <>
      <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,46fr)_minmax(440px,54fr)] xl:h-dvh xl:max-h-dvh xl:min-h-0 xl:grid-cols-[minmax(0,36.5fr)_minmax(0,37.2fr)_minmax(320px,26.3fr)] xl:overflow-hidden">
        <div className="order-1 min-w-0 bg-[var(--surface)] md:order-2 lg:order-none lg:col-start-2 lg:row-start-1 xl:col-start-2 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:overscroll-contain">
          <ContentPanel
            appName={appName}
            musicBrainzEnabled={musicBrainzEnabled}
            project={project}
            onModeChange={changeMode}
            onChange={updateProject}
            onLoadingChange={setPosterLoading}
          />
        </div>
        <div className="order-2 md:order-1 lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1 xl:h-full xl:min-h-0 xl:row-span-1">
          <PosterWorkspace
            project={project}
            loading={posterLoading}
            posterRef={posterContainerRef}
          />
        </div>
        <div className="order-3 border-t border-[var(--border)] bg-[var(--surface)] lg:col-start-2 lg:row-start-2 xl:col-start-3 xl:row-start-1 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:overscroll-contain xl:border-t-0">
          <SettingsPanel
            project={project}
            onChange={updateProject}
            onExportPng={exportPng}
            onExportPdf={exportPdf}
            exporting={exporting}
          />
          {error && (
            <p
              className="mx-5 mb-6 rounded-md border border-[color:var(--danger)]/20 bg-[var(--danger-surface)] p-3 text-sm leading-5 text-[var(--danger)] lg:mx-7"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
