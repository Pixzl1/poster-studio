'use client';

import { Field } from '@/components/editor/MusicContentEditor';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import type { CustomPosterProject } from '@/types/poster';

export function CustomContentEditor({
  project,
  onChange,
}: {
  project: CustomPosterProject;
  onChange(project: CustomPosterProject): void;
}) {
  const { t } = useLanguage();
  const update = (patch: Partial<CustomPosterProject['content']>) =>
    onChange({ ...project, content: { ...project.content, ...patch } });
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {t('custom.content')}
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field
          label={t('custom.title')}
          value={project.content.title}
          onChange={(title) => update({ title })}
        />
        <Field
          label={t('custom.subtitle')}
          value={project.content.subtitle}
          onChange={(subtitle) => update({ subtitle })}
        />
        <Field
          label={t('custom.creator')}
          value={project.content.creator}
          onChange={(creator) => update({ creator })}
        />
        <Field
          label={t('custom.category')}
          value={project.content.category}
          onChange={(category) => update({ category })}
        />
        <Field
          label={t('custom.year')}
          value={project.content.year}
          onChange={(year) => update({ year })}
        />
      </div>
      <label className="mt-3 block text-xs text-[var(--muted)]">
        <span>{t('custom.description')}</span>
        <textarea
          className="mt-1.5 min-h-28 w-full rounded-md border border-[var(--border)] p-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          value={project.content.description}
          onChange={(event) => update({ description: event.target.value })}
        />
      </label>
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            {t('custom.metadata')}
          </h4>
          <button
            type="button"
            className="text-xs font-medium underline underline-offset-4"
            onClick={() =>
              update({
                metadata: [
                  ...project.content.metadata,
                  { id: `meta-${Date.now()}`, label: '', value: '' },
                ],
              })
            }
          >
            {t('custom.addMetadata')}
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {project.content.metadata.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_1.5fr_30px] gap-2"
            >
              <input
                aria-label={`${t('custom.metadataLabel')} ${index + 1}`}
                className="h-10 rounded-md border border-[var(--border)] px-3 text-sm"
                placeholder="Label"
                value={item.label}
                onChange={(event) =>
                  update({
                    metadata: project.content.metadata.map((row) =>
                      row.id === item.id
                        ? { ...row, label: event.target.value }
                        : row,
                    ),
                  })
                }
              />
              <input
                aria-label={`${t('custom.metadataValue')} ${index + 1}`}
                className="h-10 rounded-md border border-[var(--border)] px-3 text-sm"
                placeholder={t('custom.value')}
                value={item.value}
                onChange={(event) =>
                  update({
                    metadata: project.content.metadata.map((row) =>
                      row.id === item.id
                        ? { ...row, value: event.target.value }
                        : row,
                    ),
                  })
                }
              />
              <button
                type="button"
                aria-label={`${t('custom.deleteMetadata')} ${index + 1}`}
                onClick={() =>
                  update({
                    metadata: project.content.metadata.filter(
                      (row) => row.id !== item.id,
                    ),
                  })
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
