'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';
import type { PosterMode } from '@/types/poster';

const modes = [
  {
    id: 'music' as const,
    title: 'mode.music' as const,
    description: 'mode.musicDescription' as const,
  },
  {
    id: 'custom' as const,
    title: 'mode.custom' as const,
    description: 'mode.customDescription' as const,
  },
];

export function ModeSelector({
  value,
  onChange,
}: {
  value: PosterMode;
  onChange(mode: PosterMode): void;
}) {
  const { t } = useLanguage();
  return (
    <fieldset>
      <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {t('mode.legend')}
      </legend>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`rounded-md border p-4 text-left transition-colors ${value === mode.id ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)] hover:border-[var(--border-strong)]'}`}
            aria-pressed={value === mode.id}
            onClick={() => onChange(mode.id)}
          >
            <span className="block text-sm font-semibold">{t(mode.title)}</span>
            <span
              className={`mt-1 block text-xs leading-5 ${value === mode.id ? 'text-white/70' : 'text-[var(--muted)]'}`}
            >
              {t(mode.description)}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
