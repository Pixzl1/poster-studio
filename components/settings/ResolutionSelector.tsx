'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';
import type { PosterDpi } from '@/types/poster';

interface Props {
  value: PosterDpi;
  onChange(value: PosterDpi): void;
}

export function ResolutionSelector({ value, onChange }: Props) {
  const { t } = useLanguage();
  const options: PosterDpi[] = [150, 300];
  return (
    <div>
      <div className="grid grid-cols-2 overflow-hidden rounded-md border border-[var(--border)]">
        {options.map((dpi) => (
          <button
            key={dpi}
            type="button"
            className={`h-12 text-sm font-medium transition-colors first:border-r first:border-[var(--border)] ${value === dpi ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]'}`}
            onClick={() => onChange(dpi)}
            aria-pressed={value === dpi}
          >
            {dpi}
          </button>
        ))}
      </div>
      <p className="sr-only">
        {value === 300
          ? `300 DPI · ${t('resolution.print')}`
          : `150 DPI · ${t('resolution.screen')}`}
      </p>
    </div>
  );
}
