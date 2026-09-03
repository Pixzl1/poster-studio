import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ARTWORK_PALETTE,
  normalizeArtworkPalette,
} from '@/lib/artwork/palette';
import {
  DEFAULT_POSTER_SETTINGS,
  PRINT_FORMATS,
} from '@/lib/config/print-formats';
import { DEFAULT_ARTWORK_SETTINGS } from '@/lib/domain/project';
import { CUSTOM_POSTER_TEMPLATES } from '@/templates/registry';
import type {
  CustomPosterContent,
  PrintFormatId,
  UserArtwork,
} from '@/types/poster';

const palette = ['#102030', '#245678', '#8060a0', '#ee9988', '#ddeeff'];
const artwork: UserArtwork = {
  file: {} as File,
  objectUrl: 'blob:local-editorial-artwork',
  width: 1800,
  height: 1600,
  mimeType: 'image/png',
  fileName: 'editorial.png',
  sizeBytes: 1024,
  palette,
};
const content: CustomPosterContent = {
  title: 'The Last Horizon',
  subtitle: 'Beyond the familiar',
  creator: 'Studio North',
  year: '2026',
  description: 'A study in color.\nA second deliberate line.',
  category: '',
  metadata: [
    { id: 'medium', label: 'Medium', value: 'Digital art' },
    { id: 'collection', label: 'Collection', value: 'Horizons' },
    { id: 'edition', label: 'Edition', value: '01' },
  ],
};

function attribute(tag: string, name: string): number {
  const value = tag.match(new RegExp(`(?:^|\\s)${name}="([^"]+)"`))?.[1];
  expect(value, `${name} must be present on ${tag}`).toBeDefined();
  return Number(value);
}

describe('editorial artwork palette', () => {
  it('retains uploaded colors and safely normalizes missing or invalid palettes', () => {
    expect(normalizeArtworkPalette(palette)).toEqual(palette);
    expect(normalizeArtworkPalette(undefined)).toEqual(DEFAULT_ARTWORK_PALETTE);
    expect(normalizeArtworkPalette([])).toEqual(DEFAULT_ARTWORK_PALETTE);
    const normalized = normalizeArtworkPalette([
      '#102030',
      'red',
      '#102030',
      'url(https://example.com)',
    ]);
    expect(normalized).toHaveLength(5);
    expect(normalized[0]).toBe('#102030');
    expect(normalized.every((color) => /^#[0-9a-f]{6}$/i.test(color))).toBe(
      true,
    );
  });

  for (const template of ['editorial-dark', 'editorial-white'] as const) {
    const Template = CUSTOM_POSTER_TEMPLATES[template].component;
    it(`${template}: hides the palette, closes the gap and restores it without changing the colors`, () => {
      const render = (visible: boolean) =>
        renderToStaticMarkup(
          <Template
            content={content}
            artwork={artwork}
            artworkSettings={DEFAULT_ARTWORK_SETTINGS}
            settings={{
              ...DEFAULT_POSTER_SETTINGS,
              template,
              showArtworkPalette: visible,
            }}
          />,
        );
      const shown = render(true);
      const hidden = render(false);
      expect(hidden).not.toContain('data-artwork-palette');
      for (const group of ['subtitle', 'creator', 'description']) {
        const tag = new RegExp(
          `<text[^>]*data-custom-typography="${group}"[^>]*>`,
        );
        expect(attribute(hidden.match(tag)![0], 'y')).toBeLessThan(
          attribute(shown.match(tag)![0], 'y'),
        );
      }
      expect(hidden).toContain('Beyond the familiar');
      expect(hidden).toContain('Studio North');
      expect(hidden.match(/data-custom-metadata="optional"/g)).toHaveLength(3);
      expect(render(true)).toBe(shown);
    });
    it.each(Object.keys(PRINT_FORMATS) as PrintFormatId[])(
      `${template}: keeps five swatches between title and details on %s`,
      (format) => {
        for (const titleScale of [0.6, 1, 1.5]) {
          const settings = {
            ...DEFAULT_POSTER_SETTINGS,
            template,
            format,
            albumCodeUrl: 'https://example.com/horizons',
            typography: {
              ...DEFAULT_POSTER_SETTINGS.typography,
              customTitleScale: titleScale,
            },
          };
          const markup = renderToStaticMarkup(
            <Template
              content={content}
              artwork={artwork}
              artworkSettings={DEFAULT_ARTWORK_SETTINGS}
              settings={settings}
            />,
          );
          const group = markup.match(
            /<g data-artwork-palette="([^"]+)">([\s\S]*?)<\/g>/,
          );
          expect(group?.[1]).toBe(palette.join(','));
          const swatches = group![2].match(/<rect[^>]+>/g)!;
          expect(swatches).toHaveLength(5);
          const title = markup.match(
            /<text data-custom-typography="title"[^>]+>/,
          )![0];
          const subtitle = markup.match(
            /<text data-custom-typography="subtitle"[^>]+>/,
          )![0];
          const margin = settings.marginMm * 10;
          const contentWidth = PRINT_FORMATS[format].widthMm * 10 - margin * 2;
          expect(attribute(swatches[0], 'x')).toBe(margin);
          expect(
            attribute(swatches[4], 'x') + attribute(swatches[4], 'width'),
          ).toBeCloseTo(margin + contentWidth * 0.68);
          expect(attribute(swatches[0], 'y')).toBeGreaterThan(
            attribute(title, 'y') + attribute(title, 'font-size') * 0.2,
          );
          expect(
            attribute(subtitle, 'y') - attribute(subtitle, 'font-size'),
          ).toBeGreaterThan(
            attribute(swatches[0], 'y') + attribute(swatches[0], 'height'),
          );
          expect(markup).toContain('Beyond the familiar');
          expect(markup).toContain('Studio North');
          expect(markup).toContain('A second deliberate line.</tspan>');
          expect(markup.match(/data-custom-metadata="optional"/g)).toHaveLength(
            3,
          );
          expect(markup).toContain('data-background="transparent"');
          expect(markup).not.toMatch(/NaN|Infinity/);
          // Export serializes this exact SVG; palette rectangles need no browser-only processing.
          expect(
            renderToStaticMarkup(
              <Template
                content={content}
                artwork={artwork}
                artworkSettings={DEFAULT_ARTWORK_SETTINGS}
                settings={{ ...settings, dpi: 300 }}
              />,
            ),
          ).toBe(markup);
        }
      },
    );

    it(`${template}: updates colors when artwork is replaced and handles removal`, () => {
      const render = (image: UserArtwork | null) =>
        renderToStaticMarkup(
          <Template
            content={content}
            artwork={image}
            artworkSettings={DEFAULT_ARTWORK_SETTINGS}
            settings={{ ...DEFAULT_POSTER_SETTINGS, template }}
          />,
        );
      const replacement = [...palette].reverse();
      expect(render({ ...artwork, palette: replacement })).toContain(
        `data-artwork-palette="${replacement.join(',')}"`,
      );
      expect(render(null)).toContain(
        `data-artwork-palette="${DEFAULT_ARTWORK_PALETTE.join(',')}"`,
      );
    });
  }
});
