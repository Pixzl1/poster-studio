'use client';
import { useState, type RefObject } from 'react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { posterFilename } from '@/lib/export/filename';
import { analytics } from '@/lib/analytics/provider';
import { downloadBlob, renderPosterPng } from '@/lib/export/png';
import { ExportError } from '@/lib/export/errors';
import { logger } from '@/lib/logger';
import { projectCreator, projectTitle } from '@/lib/domain/project';
import type { PosterProject } from '@/types/poster';
export function usePosterExport(
  project: PosterProject,
  posterContainerRef: RefObject<HTMLElement | null>,
) {
  const { language, t } = useLanguage();
  const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const svg = () =>
    posterContainerRef.current?.querySelector<SVGSVGElement>('svg') ?? null;
  async function run(type: 'png' | 'pdf') {
    const poster = svg();
    if (!poster || !project.artwork) return;
    setExporting(type);
    setError(null);
    try {
      const blob =
        type === 'png'
          ? await renderPosterPng(
              poster,
              project.settings,
              project.artwork.file,
            )
          : await (
              await import('@/lib/export/pdf')
            ).renderPosterPdf(poster, project.settings, project.artwork.file);
      downloadBlob(
        blob,
        posterFilename(projectCreator(project), projectTitle(project), type),
      );
      analytics.track(type === 'png' ? 'png_export' : 'pdf_export', {
        format: project.settings.format,
        dpi: project.settings.dpi,
      });
    } catch (caught) {
      logger.error('Poster export failed', caught, {
        type,
        format: project.settings.format,
        dpi: project.settings.dpi,
      });
      setError(
        caught instanceof ExportError && language === 'de'
          ? caught.message
          : t('export.error'),
      );
    } finally {
      setExporting(null);
    }
  }
  return {
    exporting,
    error,
    exportPng: () => void run('png'),
    exportPdf: () => void run('pdf'),
  };
}
