import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/components/i18n/LanguageProvider';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { createCustomProject, createMusicProject } from '@/lib/domain/project';
import type { PosterProject } from '@/types/poster';

function render(project: PosterProject) {
  return renderToStaticMarkup(
    <LanguageProvider>
      <SettingsPanel
        project={project}
        onChange={() => {}}
        onExportPng={() => {}}
        onExportPdf={() => {}}
        exporting={null}
      />
    </LanguageProvider>,
  );
}

describe('palette visibility control', () => {
  it.each(['editorial-dark', 'editorial-white', 'chromatic-index'] as const)(
    'offers an enabled-by-default checkbox for %s',
    (template) => {
      const project =
        template === 'chromatic-index'
          ? createMusicProject()
          : createCustomProject();
      project.settings.template = template;
      const markup = render(project);
      expect(markup).toContain('Farbbar anzeigen');
      const label = markup.match(
        /<label[^>]*>[\s\S]*?Farbbar anzeigen<\/span><\/label>/,
      )![0];
      expect(label).toContain('type="checkbox"');
      expect(label).toContain('checked=""');
      project.settings.showArtworkPalette = false;
      const hiddenLabel = render(project).match(
        /<label[^>]*>[\s\S]*?Farbbar anzeigen<\/span><\/label>/,
      )![0];
      expect(hiddenLabel).not.toContain('checked=""');
    },
  );
  it('does not offer a palette control for Classic', () => {
    expect(render(createMusicProject())).not.toContain('Farbbar anzeigen');
  });
});
