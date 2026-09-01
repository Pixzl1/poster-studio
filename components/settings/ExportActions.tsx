'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';
import { DownloadIcon, FileIcon, SpinnerIcon } from '@/components/ui/Icons';

interface Props {
  exporting: 'png' | 'pdf' | null;
  disabled: boolean;
  onExportPng(): void;
  onExportPdf(): void;
}

export function ExportActions({
  exporting,
  disabled,
  onExportPng,
  onExportPdf,
}: Props) {
  const { t } = useLanguage();
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
    </div>
  );
}
