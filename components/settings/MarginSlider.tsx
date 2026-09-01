'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';

interface Props {
  value: number;
  onChange(value: number): void;
}

export function MarginSlider({ value, onChange }: Props) {
  const { language, t } = useLanguage();
  return (
    <input
      className="w-full"
      type="range"
      min="6"
      max="30"
      step="1"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      aria-label={t('margin.aria')}
      aria-valuetext={`${value} ${language === 'de' ? 'Millimeter' : 'millimetres'}`}
    />
  );
}
