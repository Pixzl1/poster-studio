'use client';
import { useState, type RefObject } from 'react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import type {
  BatchExportProgress,
  BatchExportRequest,
} from '@/lib/export/batch';
import {
  batchPosterFilename,
  posterArchiveFilename,
  posterFilename,
} from '@/lib/export/filename';
import { analytics } from '@/lib/analytics/provider';
import { downloadBlob, renderPosterPng } from '@/lib/export/png';
import { ExportError } from '@/lib/export/errors';
import { renderPosterPdfFromPng } from '@/lib/export/pdf';
import { mountPosterForExport } from '@/lib/export/poster-renderer';
import { createZip } from '@/lib/export/zip';
import { logger } from '@/lib/logger';
import { projectCreator, projectTitle } from '@/lib/domain/project';
import type { PosterProject } from '@/types/poster';
export function usePosterExport(
  project: PosterProject,
  posterContainerRef: RefObject<HTMLElement | null>,
) {
  const { language, t } = useLanguage();
  const [exporting, setExporting] = useState<'png' | 'pdf' | 'batch' | null>(
    null,
  );
  const [batchProgress, setBatchProgress] =
    useState<BatchExportProgress | null>(null);
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

  async function runBatch(request: BatchExportRequest) {
    if (
      project.mode !== 'custom' ||
      !project.artwork ||
      request.formats.length === 0 ||
      request.fileTypes.length === 0
    )
      return;
    const total = request.formats.length * request.fileTypes.length;
    const files: Array<{ name: string; data: Blob }> = [];
    const creator = projectCreator(project);
    const title = projectTitle(project);
    let current = 0;
    setExporting('batch');
    setBatchProgress({ current, total });
    setError(null);

    try {
      for (const format of request.formats) {
        const batchProject: PosterProject = {
          ...project,
          settings: { ...project.settings, format },
        };
        const mounted = mountPosterForExport(batchProject);
        try {
          const png = await renderPosterPng(
            mounted.svg,
            batchProject.settings,
            project.artwork.file,
          );
          for (const fileType of request.fileTypes) {
            const data =
              fileType === 'png'
                ? png
                : await renderPosterPdfFromPng(png, batchProject.settings);
            files.push({
              name: batchPosterFilename(
                creator,
                title,
                format,
                project.settings.dpi,
                fileType,
              ),
              data,
            });
            current += 1;
            setBatchProgress({ current, total });
            analytics.track(fileType === 'png' ? 'png_export' : 'pdf_export', {
              format,
              dpi: project.settings.dpi,
            });
          }
        } finally {
          mounted.cleanup();
        }
        await yieldToBrowser();
      }

      downloadBlob(
        await createZip(files),
        posterArchiveFilename(creator, title),
      );
    } catch (caught) {
      logger.error('Poster batch export failed', caught, {
        formats: request.formats.join(','),
        fileTypes: request.fileTypes.join(','),
        dpi: project.settings.dpi,
      });
      setError(
        caught instanceof ExportError && language === 'de'
          ? caught.message
          : t('export.error'),
      );
    } finally {
      setExporting(null);
      setBatchProgress(null);
    }
  }

  return {
    exporting,
    batchProgress,
    error,
    exportPng: () => void run('png'),
    exportPdf: () => void run('pdf'),
    exportBatch: (request: BatchExportRequest) => void runBatch(request),
  };
}

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
