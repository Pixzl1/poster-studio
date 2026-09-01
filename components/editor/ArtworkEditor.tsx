'use client';

import { useRef, useState } from 'react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import {
  ArtworkValidationError,
  createUserArtwork,
  MAX_ARTWORK_FILE_MB,
} from '@/lib/artwork/user-artwork';
import { calculateImageQuality } from '@/lib/artwork/quality';
import type {
  ArtworkSettings,
  PosterDpi,
  PrintFormatId,
  UserArtwork,
} from '@/types/poster';

export function ArtworkEditor({
  artwork,
  settings,
  format,
  dpi,
  onArtworkChange,
  onSettingsChange,
}: {
  artwork: UserArtwork | null;
  settings: ArtworkSettings;
  format: PrintFormatId;
  dpi: PosterDpi;
  onArtworkChange(artwork: UserArtwork | null): void;
  onSettingsChange(settings: ArtworkSettings): void;
}) {
  const { language, t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const quality = artwork ? calculateImageQuality(artwork, format, dpi) : null;

  async function selectFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      onArtworkChange(await createUserArtwork(file));
    } catch (caught) {
      setError(
        caught instanceof ArtworkValidationError && language === 'de'
          ? caught.message
          : t('artwork.error'),
      );
    }
  }

  return (
    <section aria-labelledby="artwork-heading">
      <div className="flex items-center justify-between gap-4">
        <h3
          id="artwork-heading"
          className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
        >
          {t('artwork.heading')}
        </h3>
        {artwork && (
          <button
            type="button"
            className="text-xs font-medium underline underline-offset-4"
            onClick={() => onArtworkChange(null)}
          >
            {t('artwork.remove')}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(event) => {
          const file = event.target.files?.[0];
          void selectFile(file).finally(() => {
            if (inputRef.current) inputRef.current.value = '';
          });
        }}
      />
      <button
        type="button"
        className="mt-3 flex min-h-[82px] w-full items-center gap-4 rounded-md border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] px-4 text-left transition-colors hover:border-[var(--accent)]"
        onClick={() => inputRef.current?.click()}
      >
        {artwork ? (
          // Blob URLs are browser-local and intentionally bypass Next Image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artwork.objectUrl}
            alt=""
            className="size-14 rounded-sm object-cover"
          />
        ) : (
          <span className="grid size-14 place-items-center rounded-sm border border-[var(--border)] bg-white text-xl">
            +
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">
            {artwork?.fileName ?? t('artwork.upload')}
          </span>
          <span className="mt-1 block text-xs text-[var(--muted)]">
            {t('artwork.formats')} · max. {MAX_ARTWORK_FILE_MB} MB
          </span>
        </span>
      </button>
      <p className="mt-2 text-[11px] leading-4 text-[var(--muted)]">
        {t('artwork.privacy')}
      </p>
      {error && (
        <p className="mt-2 text-xs text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}
      {artwork && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['fit', 'fill'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`h-10 rounded-md border text-sm font-medium ${settings.fitMode === mode ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)]'}`}
                aria-pressed={settings.fitMode === mode}
                onClick={() => onSettingsChange({ ...settings, fitMode: mode })}
              >
                {mode === 'fit' ? t('artwork.fit') : t('artwork.fill')}
              </button>
            ))}
          </div>
          <Control
            label={t('artwork.zoom')}
            value={settings.scale}
            min={1}
            max={4}
            step={0.01}
            display={`${Math.round(settings.scale * 100)} %`}
            onChange={(scale) => onSettingsChange({ ...settings, scale })}
          />
          <Control
            label={t('artwork.horizontal')}
            value={settings.positionX}
            min={-100}
            max={100}
            step={1}
            display={`${settings.positionX}`}
            onChange={(positionX) =>
              onSettingsChange({ ...settings, positionX })
            }
          />
          <Control
            label={t('artwork.vertical')}
            value={settings.positionY}
            min={-100}
            max={100}
            step={1}
            display={`${settings.positionY}`}
            onChange={(positionY) =>
              onSettingsChange({ ...settings, positionY })
            }
          />
          <button
            type="button"
            className="text-xs font-medium underline underline-offset-4"
            onClick={() =>
              onSettingsChange({
                ...settings,
                scale: 1,
                positionX: 0,
                positionY: 0,
              })
            }
          >
            {t('artwork.center')}
          </button>
          <p
            className={`rounded-md px-3 py-2 text-xs leading-5 ${quality?.status === 'low' ? 'bg-[var(--warning-surface)] text-[var(--warning)]' : 'bg-[var(--surface-muted)] text-[var(--muted)]'}`}
          >
            {t('artwork.quality')}:{' '}
            {quality?.status === 'good'
              ? t('artwork.qualityGood')
              : quality?.status === 'fair'
                ? t('artwork.qualityFair')
                : `${artwork.fileName}: ${artwork.width} × ${artwork.height} px · ${t('artwork.qualityLowTarget')} ${quality?.requiredWidth} × ${quality?.requiredHeight} px @ ${dpi} DPI. ${t('artwork.qualityLowEnd')}`}
          </p>
        </div>
      )}
    </section>
  );
}

function Control({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange(value: number): void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs text-[var(--muted)]">
        <span>{label}</span>
        <span>{display}</span>
      </span>
      <input
        className="mt-1.5 w-full"
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
