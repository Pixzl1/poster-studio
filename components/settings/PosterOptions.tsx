'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';
import type { PosterSettings } from '@/types/poster';
import { CheckIcon } from '@/components/ui/Icons';
import type { MessageKey } from '@/lib/i18n/messages';

interface Props {
  settings: PosterSettings;
  onChange<K extends keyof PosterSettings>(
    key: K,
    value: PosterSettings[K],
  ): void;
}
const primaryOptions = [['showTracklist', 'options.tracklist']] as const;

const detailOptions = [
  ['showDurations', 'options.durations'],
  ['showReleaseDate', 'options.releaseDate'],
  ['showTotalRuntime', 'options.runtime'],
  ['showWaveform', 'options.waveform'],
] as const;

type BooleanSettingKey =
  (typeof primaryOptions)[number][0] | (typeof detailOptions)[number][0];

export function PosterOptions({ settings, onChange }: Props) {
  const { t } = useLanguage();
  return (
    <div>
      <div className="space-y-3.5">
        {primaryOptions.map(([key, label]) => (
          <OptionRow
            key={key}
            settingKey={key}
            label={t(label as MessageKey)}
            settings={settings}
            onChange={onChange}
          />
        ))}
      </div>
      <details className="group relative">
        <summary className="absolute -top-[4.6rem] right-0 cursor-pointer text-xs text-[var(--muted)] marker:text-[var(--subtle)]">
          {t('options.more')}
        </summary>
        <div className="mt-3.5 space-y-3.5 border-t border-[var(--border)] pt-3.5 pl-0.5">
          {detailOptions.map(([key, label]) => (
            <OptionRow
              key={key}
              settingKey={key}
              label={t(label as MessageKey)}
              settings={settings}
              onChange={onChange}
            />
          ))}
        </div>
      </details>
    </div>
  );
}

function OptionRow({
  settingKey,
  label,
  settings,
  onChange,
}: {
  settingKey: BooleanSettingKey;
  label: string;
  settings: PosterSettings;
  onChange(key: BooleanSettingKey, value: boolean): void;
}) {
  const disabled = settingKey === 'showDurations' && !settings.showTracklist;
  return (
    <label
      className={`flex min-h-6 cursor-pointer items-center gap-3 text-sm ${disabled ? 'cursor-not-allowed text-[var(--subtle)]' : ''}`}
    >
      <span className="relative shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={Boolean(settings[settingKey])}
          onChange={(event) => onChange(settingKey, event.target.checked)}
          disabled={disabled}
        />
        <span className="block size-5 rounded-[4px] border border-[var(--border-strong)] bg-white transition-colors peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)] peer-focus-visible:ring-offset-2 peer-disabled:opacity-50" />
        <CheckIcon className="pointer-events-none absolute left-1 top-1 hidden size-3 text-white peer-checked:block" />
      </span>
      <span>{label}</span>
    </label>
  );
}
