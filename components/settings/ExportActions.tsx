'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { DownloadIcon, FileIcon, SpinnerIcon } from '@/components/ui/Icons';
import { calculateImageQuality } from '@/lib/artwork/quality';
import { PRINT_FORMATS } from '@/lib/config/print-formats';
import type {
  BatchExportProgress,
  BatchExportRequest,
} from '@/lib/export/batch';
import {
  PRINT_FORMAT_IDS,
  type PosterDpi,
  type PrintFormatId,
  type UserArtwork,
} from '@/types/poster';

interface Props {
  exporting: 'png' | 'pdf' | 'batch' | null;
  batchProgress: BatchExportProgress | null;
  batchEnabled: boolean;
  artwork: UserArtwork | null;
  dpi: PosterDpi;
  disabled: boolean;
  onExportPng(): void;
  onExportPdf(): void;
  onExportBatch(request: BatchExportRequest): void;
}

export function ExportActions({
  exporting,
  batchProgress,
  batchEnabled,
  artwork,
  dpi,
  disabled,
  onExportPng,
  onExportPdf,
  onExportBatch,
}: Props) {
  const { t } = useLanguage();
  const [batchOpen, setBatchOpen] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<PrintFormatId[]>([
    ...PRINT_FORMAT_IDS,
  ]);
  const [output, setOutput] = useState<'png' | 'pdf' | 'both'>('pdf');
  const lowQualityFormats = artwork
    ? selectedFormats.filter(
        (format) =>
          calculateImageQuality(artwork, format, dpi).status === 'low',
      )
    : [];

  function toggleFormat(format: PrintFormatId) {
    setSelectedFormats((current) =>
      current.includes(format)
        ? current.filter((candidate) => candidate !== format)
        : PRINT_FORMAT_IDS.filter(
            (candidate) => candidate === format || current.includes(candidate),
          ),
    );
  }

  function startBatchExport() {
    onExportBatch({
      formats: selectedFormats,
      fileTypes: output === 'both' ? ['png', 'pdf'] : [output],
    });
  }

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        className="flex h-[54px] w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-45"
        onClick={onExportPng}
        disabled={disabled || exporting !== null}
      >
        {exporting === 'png' ? (
          <SpinnerIcon className="size-[18px] animate-spin" />
        ) : (
          <DownloadIcon className="size-[18px]" />
        )}
        {exporting === 'png' ? t('export.pngLoading') : t('export.png')}
      </button>
      <button
        type="button"
        className="flex h-[54px] w-full items-center justify-center gap-2 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-medium transition-colors hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-45"
        onClick={onExportPdf}
        disabled={disabled || exporting !== null}
      >
        {exporting === 'pdf' ? (
          <SpinnerIcon className="size-[18px] animate-spin" />
        ) : (
          <FileIcon className="size-[18px]" />
        )}
        {exporting === 'pdf' ? t('export.pdfLoading') : t('export.pdf')}
      </button>
      {batchEnabled && (
        <>
          <button
            type="button"
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-medium transition-colors hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-45"
            onClick={() => setBatchOpen((open) => !open)}
            disabled={disabled || exporting !== null}
            aria-expanded={batchOpen}
          >
            <DownloadIcon className="size-[18px]" />
            {t('export.batch')}
          </button>
          {batchOpen && (
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <p className="text-xs leading-5 text-[var(--muted)]">
                {t('export.batchHelp')}
              </p>
              <fieldset className="mt-4">
                <legend className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                  {t('export.formats')}
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {PRINT_FORMAT_IDS.map((formatId) => {
                    const format = PRINT_FORMATS[formatId];
                    return (
                      <label
                        className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-xs"
                        key={formatId}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFormats.includes(formatId)}
                          onChange={() => toggleFormat(formatId)}
                        />
                        <span>{format.name}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <label className="mt-4 block text-xs text-[var(--muted)]">
                <span className="mb-2 block font-semibold uppercase tracking-[0.1em]">
                  {t('export.output')}
                </span>
                <select
                  className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  value={output}
                  onChange={(event) =>
                    setOutput(event.target.value as 'png' | 'pdf' | 'both')
                  }
                >
                  <option value="png">{t('export.outputPng')}</option>
                  <option value="pdf">{t('export.outputPdf')}</option>
                  <option value="both">{t('export.outputBoth')}</option>
                </select>
              </label>
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                {t('export.dpiNotice')} {dpi} DPI.
              </p>
              {lowQualityFormats.length > 0 && (
                <p className="mt-3 rounded-md bg-[var(--warning-surface)] px-3 py-2 text-xs leading-5 text-[var(--warning)]">
                  {t('export.batchQualityWarning')}{' '}
                  {lowQualityFormats
                    .map((format) => PRINT_FORMATS[format].name)
                    .join(', ')}
                </p>
              )}
              <button
                type="button"
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-45"
                onClick={startBatchExport}
                disabled={
                  disabled || exporting !== null || selectedFormats.length === 0
                }
              >
                {exporting === 'batch' ? (
                  <SpinnerIcon className="size-[18px] animate-spin" />
                ) : (
                  <DownloadIcon className="size-[18px]" />
                )}
                {exporting === 'batch' && batchProgress
                  ? `${t('export.batchProgress')} ${batchProgress.current}/${batchProgress.total}`
                  : t('export.batchStart')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
