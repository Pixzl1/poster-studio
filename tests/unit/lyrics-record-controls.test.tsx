import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/components/i18n/LanguageProvider';
import { CustomContentEditor } from '@/components/editor/CustomContentEditor';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { createCustomProject } from '@/lib/domain/project';

function render(template: 'lyrics-record-light' | 'editorial-white') {
  const project = createCustomProject();
  project.settings.template = template;
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

describe('Lyrics Record controls', () => {
  it('extends only the lyrics font-size slider to 300 percent', () => {
    const lyrics = render('lyrics-record-light');
    const editorial = render('editorial-white');

    expect(lyrics).toMatch(
      /<input[^>]*type="range"[^>]*max="300"[^>]*aria-label="Liedtext"/,
    );
    expect(editorial).not.toContain('max="300"');
  });

  it('offers a visible-by-default record-hole option only for Lyrics Record', () => {
    const lyrics = render('lyrics-record-light');
    const label = lyrics.match(
      /<label[^>]*>[\s\S]*?Plattenloch anzeigen<\/span><\/label>/,
    )![0];

    expect(label).toContain('type="checkbox"');
    expect(label).toContain('checked=""');
    expect(render('editorial-white')).not.toContain('Plattenloch anzeigen');
  });

  it('accepts complete long-form lyrics in the editor', () => {
    const project = createCustomProject();
    project.settings.template = 'lyrics-record-light';
    const markup = renderToStaticMarkup(
      <LanguageProvider>
        <CustomContentEditor project={project} onChange={() => {}} />
      </LanguageProvider>,
    );

    expect(markup).toMatch(/<textarea[^>]*maxLength="12000"/);
    expect(markup).toContain('vollständig kreisförmig gesetzt');
  });
});
