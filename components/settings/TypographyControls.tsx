'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';
import type {
  PosterMode,
  PosterTemplateId,
  PosterTypographySettings,
} from '@/types/poster';

interface Props {
  mode: PosterMode;
  template: PosterTemplateId;
  value: PosterTypographySettings;
  onChange(value: PosterTypographySettings): void;
}

type TypographyKey = keyof PosterTypographySettings;

export function TypographyControls({ mode, template, value, onChange }: Props) {
  const { t } = useLanguage();
  const controls: Array<{
    key: TypographyKey;
    label: Parameters<typeof t>[0];
  }> =
    mode === 'music'
      ? [{ key: 'musicTitleScale', label: 'typography.title' }]
      : [
          { key: 'customTitleScale', label: 'typography.title' },
          { key: 'customSubtitleScale', label: 'typography.subtitle' },
          { key: 'customCreatorScale', label: 'typography.creator' },
          {
            key: 'customDescriptionScale',
            label: 'typography.description',
          },
          { key: 'customMetadataScale', label: 'typography.metadata' },
        ];

  if (mode === 'music' && template !== 'gallery' && template !== 'noir') {
    return null;
  }

  return (
    <div className="space-y-4">
      {controls.map((control) => {
        const percentage = Math.round(value[control.key] * 100);
        return (
          <label className="block" key={control.key}>
            <span className="mb-2 flex items-center justify-between gap-4 text-xs text-[var(--muted)]">
              <span>{t(control.label)}</span>
              <span className="tabular-nums">{percentage} %</span>
            </span>
            <input
              className="w-full"
              type="range"
              min="60"
              max="150"
              step="5"
              value={percentage}
              onChange={(event) =>
                onChange({
                  ...value,
                  [control.key]: Number(event.target.value) / 100,
                })
              }
              aria-label={t(control.label)}
              aria-valuetext={`${percentage} percent`}
            />
          </label>
        );
      })}
    </div>
  );
}
