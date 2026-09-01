'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';
import type { Language } from '@/lib/i18n/messages';

const options: Language[] = ['de', 'en'];

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <fieldset>
      <legend className="sr-only">{t('language.label')}</legend>
      <div className="flex overflow-hidden rounded-md border border-[var(--border)]">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`h-8 min-w-10 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${language === option ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-muted)]'}`}
            aria-pressed={language === option}
            aria-label={t(option === 'de' ? 'language.de' : 'language.en')}
            onClick={() => setLanguage(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
