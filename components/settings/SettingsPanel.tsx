'use client';

import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { ExportActions } from '@/components/settings/ExportActions';
import { FormatSelector } from '@/components/settings/FormatSelector';
import { MarginSlider } from '@/components/settings/MarginSlider';
import { PosterOptions } from '@/components/settings/PosterOptions';
import { QrCodeSettings } from '@/components/settings/QrCodeSettings';
import { ResolutionSelector } from '@/components/settings/ResolutionSelector';
import { SelectedAlbum } from '@/components/settings/SelectedAlbum';
import { SettingSection } from '@/components/settings/SettingSection';
import { StyleSelector } from '@/components/settings/StyleSelector';
import { TypographyControls } from '@/components/settings/TypographyControls';
import { isProjectExportable } from '@/lib/domain/project';
import type { PosterProject, PosterSettings } from '@/types/poster';

interface Props {
  project: PosterProject;
  onChange(project: PosterProject): void;
  onExportPng(): void;
  onExportPdf(): void;
  exporting: 'png' | 'pdf' | null;
}

export function SettingsPanel({
  project,
  onChange,
  onExportPng,
  onExportPdf,
  exporting,
}: Props) {
  const { t } = useLanguage();
  const update = <K extends keyof PosterSettings>(
    key: K,
    value: PosterSettings[K],
  ) =>
    onChange({ ...project, settings: { ...project.settings, [key]: value } });
  const settings = project.settings;

  return (
    <aside
      className="bg-[var(--surface)] px-5 py-8 lg:px-7 lg:py-8 xl:px-9 xl:py-6"
      aria-labelledby="settings-heading"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="settings-heading"
          className="text-2xl font-semibold tracking-[-0.04em]"
        >
          {t('settings.heading')}
        </h2>
        <LanguageSwitcher />
      </div>
      <div className="mt-6 space-y-6">
        <SettingSection title={t('settings.project')}>
          <SelectedAlbum project={project} />
        </SettingSection>
        <SettingSection title={t('settings.style')}>
          <StyleSelector
            value={settings.template}
            mode={project.mode}
            onChange={(value) => update('template', value)}
          />
        </SettingSection>
        {(project.mode === 'custom' ||
          settings.template === 'gallery' ||
          settings.template === 'noir' ||
          settings.template === 'chromatic-index') && (
          <SettingSection title={t('settings.typography')}>
            <TypographyControls
              mode={project.mode}
              template={settings.template}
              value={settings.typography}
              onChange={(value) => update('typography', value)}
            />
          </SettingSection>
        )}
        <SettingSection title={t('settings.format')}>
          <FormatSelector
            value={settings.format}
            onChange={(value) => update('format', value)}
          />
        </SettingSection>
        <SettingSection
          title={t('settings.margin')}
          value={`${settings.marginMm} mm`}
        >
          <MarginSlider
            value={settings.marginMm}
            onChange={(value) => update('marginMm', value)}
          />
        </SettingSection>
        {project.mode === 'music' && (
          <SettingSection title={t('settings.options')}>
            <PosterOptions settings={settings} onChange={update} />
          </SettingSection>
        )}
        <SettingSection title={t('settings.qr')}>
          <QrCodeSettings settings={settings} onChange={update} />
        </SettingSection>
        <SettingSection title={t('settings.resolution')}>
          <ResolutionSelector
            value={settings.dpi}
            onChange={(value) => update('dpi', value)}
          />
        </SettingSection>
        <div className="pt-4">
          <ExportActions
            exporting={exporting}
            disabled={!isProjectExportable(project)}
            onExportPng={onExportPng}
            onExportPdf={onExportPdf}
          />
        </div>
      </div>
    </aside>
  );
}
