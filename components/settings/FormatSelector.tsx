'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';
import { PRINT_FORMATS } from '@/lib/config/print-formats';
import { isPrintFormatId, type PrintFormatId } from '@/types/poster';

interface Props {
  value: PrintFormatId;
  onChange(value: PrintFormatId): void;
}

export function FormatSelector({ value, onChange }: Props) {
  const { t } = useLanguage();
  return (
    <select
      className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none transition-colors focus:border-[var(--accent)]"
      value={value}
      aria-label={t('format.aria')}
      onChange={(event) => {
        if (isPrintFormatId(event.target.value)) onChange(event.target.value);
      }}
    >
      {Object.values(PRINT_FORMATS).map((format) => (
        <option key={format.id} value={format.id}>
          {format.name} · {format.widthMm} × {format.heightMm} mm
        </option>
      ))}
    </select>
  );
}
