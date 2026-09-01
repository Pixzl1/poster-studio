'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';
import { CheckIcon } from '@/components/ui/Icons';
import { normalizePosterLink } from '@/lib/domain/poster-link';
import {
  QR_CODE_POSITIONS,
  type PosterSettings,
  type QrCodePosition,
} from '@/types/poster';

interface Props {
  settings: PosterSettings;
  onChange<K extends keyof PosterSettings>(
    key: K,
    value: PosterSettings[K],
  ): void;
}

export function QrCodeSettings({ settings, onChange }: Props) {
  const { t } = useLanguage();
  const normalizedLink = normalizePosterLink(settings.albumCodeUrl);
  return (
    <div className="space-y-4">
      <label className="flex min-h-6 cursor-pointer items-center gap-3 text-sm">
        <span className="relative shrink-0">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={settings.showAlbumCode}
            onChange={(event) =>
              onChange('showAlbumCode', event.target.checked)
            }
          />
          <span className="block size-5 rounded-[4px] border border-[var(--border-strong)] bg-white transition-colors peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)] peer-focus-visible:ring-offset-2" />
          <CheckIcon className="pointer-events-none absolute left-1 top-1 hidden size-3 text-white peer-checked:block" />
        </span>
        <span>{t('qr.show')}</span>
      </label>
      {settings.showAlbumCode && (
        <>
          <label className="block text-xs text-[var(--muted)]">
            <span>{t('qr.link')}</span>
            <input
              type="url"
              className="mt-1.5 h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              placeholder="https://…"
              maxLength={2048}
              value={settings.albumCodeUrl}
              onChange={(event) => onChange('albumCodeUrl', event.target.value)}
              aria-describedby="album-code-link-help"
            />
            <span
              id="album-code-link-help"
              className={`mt-1.5 block leading-5 ${settings.albumCodeUrl && !normalizedLink ? 'text-[var(--danger)]' : ''}`}
            >
              {settings.albumCodeUrl && !normalizedLink
                ? t('qr.invalid')
                : t('qr.help')}
            </span>
          </label>
          {settings.template === 'gallery' && (
            <fieldset>
              <legend className="text-xs text-[var(--muted)]">
                {t('qr.position')}
              </legend>
              <div className="mt-2 grid grid-cols-3 overflow-hidden rounded-md border border-[var(--border)]">
                {QR_CODE_POSITIONS.map((position) => (
                  <PositionButton
                    key={position}
                    position={position}
                    selected={settings.albumCodePosition === position}
                    label={t(`qr.${position}`)}
                    onClick={() => onChange('albumCodePosition', position)}
                  />
                ))}
              </div>
            </fieldset>
          )}
        </>
      )}
    </div>
  );
}

function PositionButton({
  position,
  selected,
  label,
  onClick,
}: {
  position: QrCodePosition;
  selected: boolean;
  label: string;
  onClick(): void;
}) {
  return (
    <button
      type="button"
      className={`h-10 border-r border-[var(--border)] text-xs font-medium transition-colors last:border-r-0 ${selected ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] hover:bg-[var(--surface-muted)]'}`}
      data-position={position}
      aria-pressed={selected}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
