import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_POSTER_SETTINGS,
  PRINT_FORMATS,
} from '@/lib/config/print-formats';
import { DEFAULT_ARTWORK_SETTINGS } from '@/lib/domain/project';
import {
  CUSTOM_POSTER_TEMPLATES,
  MUSIC_POSTER_TEMPLATES,
} from '@/templates/registry';
import type { AlbumData } from '@/types/music';
import type { UserArtwork } from '@/types/poster';

const album: AlbumData = {
  id: 'release-id',
  releaseGroupId: 'group-id',
  title: 'Midnight Echoes',
  artist: 'Nova Vale',
  year: 2026,
  country: 'XW',
  status: 'Official',
  primaryType: 'Album',
  secondaryTypes: [],
  disambiguation: '',
  trackCount: 10,
  releaseDate: '2026-01-16',
  barcode: null,
  isExplicit: false,
  tracks: Array.from({ length: 10 }, (_, index) => ({
    id: `track-${index}`,
    position: index + 1,
    title: `Track ${index + 1}`,
    durationMs: 180_000 + index * 1_000,
  })),
};

const artwork: UserArtwork = {
  file: {} as File,
  objectUrl: 'blob:local-artwork',
  width: 1600,
  height: 1200,
  mimeType: 'image/jpeg',
  fileName: 'artwork.jpg',
  sizeBytes: 1024,
};

describe('poster template rendering', () => {
  it.each(
    Object.keys(MUSIC_POSTER_TEMPLATES) as Array<
      keyof typeof MUSIC_POSTER_TEMPLATES
    >,
  )('renders %s as deterministic SVG', (template) => {
    const Template = MUSIC_POSTER_TEMPLATES[template].component;
    const markup = renderToStaticMarkup(
      <Template
        album={album}
        artwork={null}
        artworkSettings={DEFAULT_ARTWORK_SETTINGS}
        settings={{ ...DEFAULT_POSTER_SETTINGS, template }}
      />,
    );
    expect(markup).toContain('<svg');
    expect(markup).toContain('viewBox="0 0 2100 2970"');
    expect(markup).not.toMatch(/NaN|Infinity/);
  });

  it.each(Object.keys(PRINT_FORMATS))(
    'keeps the gallery composition valid for %s',
    (format) => {
      const markup = renderToStaticMarkup(
        <MUSIC_POSTER_TEMPLATES.gallery.component
          album={album}
          artwork={null}
          artworkSettings={DEFAULT_ARTWORK_SETTINGS}
          settings={{
            ...DEFAULT_POSTER_SETTINGS,
            template: 'gallery',
            format: format as keyof typeof PRINT_FORMATS,
          }}
        />,
      );
      expect(markup).not.toMatch(/NaN|Infinity/);
    },
  );

  it.each(['gallery', 'noir', 'chromatic-index'] as const)(
    'wraps a long %s title and applies its title scale',
    (template) => {
      const Template = MUSIC_POSTER_TEMPLATES[template].component;
      const markup = renderToStaticMarkup(
        <Template
          album={{
            ...album,
            title: 'World of Warcraft The War Within Original Game Soundtrack',
          }}
          artwork={null}
          artworkSettings={DEFAULT_ARTWORK_SETTINGS}
          settings={{
            ...DEFAULT_POSTER_SETTINGS,
            template,
            typography: {
              ...DEFAULT_POSTER_SETTINGS.typography,
              musicTitleScale: 1.25,
            },
          }}
        />,
      );

      expect(markup).toContain(`data-poster-title="${template}"`);
      expect(markup).toContain('data-title-lines="2"');
      expect(markup.match(/<tspan/g)?.length).toBeGreaterThanOrEqual(2);
    },
  );

  it('renders the artwork palette in Chromatic Index', () => {
    const ChromaticIndex = MUSIC_POSTER_TEMPLATES['chromatic-index'].component;
    const markup = renderToStaticMarkup(
      <ChromaticIndex
        album={album}
        artwork={{
          ...artwork,
          palette: ['#101820', '#234f91', '#704c91', '#ca5364', '#e98a42'],
        }}
        artworkSettings={DEFAULT_ARTWORK_SETTINGS}
        settings={{
          ...DEFAULT_POSTER_SETTINGS,
          template: 'chromatic-index',
          albumCodeUrl: 'https://example.com/chromatic-index',
        }}
      />,
    );

    expect(markup).toContain(
      'data-artwork-palette="#101820,#234f91,#704c91,#ca5364,#e98a42"',
    );
    expect(markup).toContain('data-poster-title="chromatic-index"');
    expect(markup).toContain('data-album-code="qr"');
    expect(markup).toContain('data-year-alignment="qr-visible-edge"');
    expect(markup).not.toMatch(/NaN|Infinity/);
  });

  it('can hide the Chromatic Index palette without hiding the waveform or QR code', () => {
    const Template = MUSIC_POSTER_TEMPLATES['chromatic-index'].component;
    const markup = renderToStaticMarkup(
      <Template
        album={album}
        artwork={artwork}
        artworkSettings={DEFAULT_ARTWORK_SETTINGS}
        settings={{
          ...DEFAULT_POSTER_SETTINGS,
          template: 'chromatic-index',
          showArtworkPalette: false,
          albumCodeUrl: 'https://example.com/listen',
        }}
      />,
    );
    expect(markup).not.toContain('data-artwork-palette');
    expect(markup).toContain('data-album-code="qr"');
    expect(markup).toContain('data-poster-waveform="true"');
  });

  it.each(
    Object.keys(MUSIC_POSTER_TEMPLATES) as Array<
      keyof typeof MUSIC_POSTER_TEMPLATES
    >,
  )(
    'does not render a placeholder dash for a missing year in %s',
    (template) => {
      const Template = MUSIC_POSTER_TEMPLATES[template].component;
      const markup = renderToStaticMarkup(
        <Template
          album={{ ...album, year: null }}
          artwork={null}
          artworkSettings={DEFAULT_ARTWORK_SETTINGS}
          settings={{ ...DEFAULT_POSTER_SETTINGS, template }}
        />,
      );

      expect(markup).not.toContain('>—<');
    },
  );

  it.each(['editorial-dark', 'editorial-white'] as const)(
    'renders the custom %s template',
    (template) => {
      const Template = CUSTOM_POSTER_TEMPLATES[template].component;
      const markup = renderToStaticMarkup(
        <Template
          content={{
            title: 'The Last Horizon',
            subtitle: 'A Custom Story',
            creator: 'Studio North',
            category: 'Game',
            year: '2026',
            description: 'A concise editorial description.',
            metadata: [],
          }}
          artwork={null}
          artworkSettings={DEFAULT_ARTWORK_SETTINGS}
          settings={{ ...DEFAULT_POSTER_SETTINGS, template }}
        />,
      );
      expect(markup).toContain(
        template === 'editorial-dark'
          ? 'Editorial Dark Poster'
          : 'Editorial White Poster',
      );
      expect(markup).toContain('A Custom Story');
      expect(markup).toContain('Studio North');
      expect(markup).not.toContain('#c06b48');
      expect(markup).not.toMatch(/NaN|Infinity/);
    },
  );

  it('renders a real QR mark only for a valid configured link', () => {
    const markup = renderToStaticMarkup(
      <MUSIC_POSTER_TEMPLATES.classic.component
        album={album}
        artwork={null}
        artworkSettings={DEFAULT_ARTWORK_SETTINGS}
        settings={{
          ...DEFAULT_POSTER_SETTINGS,
          albumCodeUrl: 'https://example.com/listen',
        }}
      />,
    );
    expect(markup).toContain('data-album-code="qr"');
    expect(markup.match(/<rect/g)?.length).toBeGreaterThan(100);
  });

  it('uses white Classic paper and derives Mono and Bloom from its composition', () => {
    const classic = renderToStaticMarkup(
      <MUSIC_POSTER_TEMPLATES.classic.component
        album={album}
        artwork={artwork}
        artworkSettings={DEFAULT_ARTWORK_SETTINGS}
        settings={DEFAULT_POSTER_SETTINGS}
      />,
    );
    const mono = renderToStaticMarkup(
      <MUSIC_POSTER_TEMPLATES.mono.component
        album={album}
        artwork={artwork}
        artworkSettings={DEFAULT_ARTWORK_SETTINGS}
        settings={{ ...DEFAULT_POSTER_SETTINGS, template: 'mono' }}
      />,
    );
    const bloom = renderToStaticMarkup(
      <MUSIC_POSTER_TEMPLATES.bloom.component
        album={album}
        artwork={artwork}
        artworkSettings={DEFAULT_ARTWORK_SETTINGS}
        settings={{ ...DEFAULT_POSTER_SETTINGS, template: 'bloom' }}
      />,
    );

    expect(classic).toContain('fill="#ffffff"');
    expect(mono).toContain('classic-artwork-foreground');
    expect(bloom).toContain('bloom-background-blur');
    expect(bloom.match(/data-export-href/g)?.length).toBe(2);
  });

  it.each([
    'classic',
    'chromatic-index',
    'gallery',
    'noir',
    'mono',
    'bloom',
  ] as const)(
    'renders the configured QR code in the visible %s music style',
    (template) => {
      const Template = MUSIC_POSTER_TEMPLATES[template].component;
      const markup = renderToStaticMarkup(
        <Template
          album={{ ...album, disambiguation: 'Collector Edition' }}
          artwork={null}
          artworkSettings={DEFAULT_ARTWORK_SETTINGS}
          settings={{
            ...DEFAULT_POSTER_SETTINGS,
            template,
            albumCodeUrl:
              'https://music.example/listen?album=midnight-echoes#player',
          }}
        />,
      );
      expect(markup).toContain('data-album-code="qr"');
      expect(markup).toContain('data-background="transparent"');
      expect(markup).not.toMatch(/SCAN \/ (PLAY|OPEN)/);
      if (template === 'gallery') {
        expect(markup).toContain('COLLECTOR EDITION');
        expect(markup).toContain('2026');
      }
    },
  );

  it.each(['editorial-dark', 'editorial-white'] as const)(
    'renders a transparent QR lockup in the custom %s template',
    (template) => {
      const Template = CUSTOM_POSTER_TEMPLATES[template].component;
      const markup = renderToStaticMarkup(
        <Template
          content={{
            title: 'Open Frame',
            subtitle: '',
            creator: 'Studio North',
            category: '',
            year: '2026',
            description: '',
            metadata: [],
          }}
          artwork={null}
          artworkSettings={DEFAULT_ARTWORK_SETTINGS}
          settings={{
            ...DEFAULT_POSTER_SETTINGS,
            template,
            albumCodeUrl: 'https://example.com/open',
          }}
        />,
      );
      expect(markup).toContain('data-background="transparent"');
      expect(markup).not.toMatch(/SCAN \/ (PLAY|OPEN)/);
    },
  );

  it('uses light QR modules on the Noir background', () => {
    const markup = renderToStaticMarkup(
      <MUSIC_POSTER_TEMPLATES.noir.component
        album={album}
        artwork={null}
        artworkSettings={DEFAULT_ARTWORK_SETTINGS}
        settings={{
          ...DEFAULT_POSTER_SETTINGS,
          template: 'noir',
          albumCodeUrl: 'https://example.com/noir',
        }}
      />,
    );
    expect(markup).toMatch(/data-album-code="qr"[^>]*fill="#f2f1ec"/);
  });

  it('keeps three optional Custom metadata rows visible beside the QR code', () => {
    const EditorialDark = CUSTOM_POSTER_TEMPLATES['editorial-dark'].component;
    const markup = renderToStaticMarkup(
      <EditorialDark
        content={{
          title: 'Metadata Study',
          subtitle: '',
          creator: 'Studio North',
          category: 'Game',
          year: '2026',
          description: '',
          metadata: [
            { id: 'platform', label: 'Platform', value: 'PC' },
            { id: 'developer', label: 'Developer', value: 'Studio North' },
            { id: 'release', label: 'Release', value: '2026' },
          ],
        }}
        artwork={null}
        artworkSettings={DEFAULT_ARTWORK_SETTINGS}
        settings={{
          ...DEFAULT_POSTER_SETTINGS,
          template: 'editorial-dark',
          albumCodeUrl: 'https://example.com/open',
        }}
      />,
    );
    expect(markup.match(/data-custom-metadata="optional"/g)).toHaveLength(3);
    expect(markup).toContain('PLATFORM');
    expect(markup).toContain('DEVELOPER');
    expect(markup).toContain('RELEASE');
  });

  it('renders explicit Custom description line breaks as separate SVG lines', () => {
    const EditorialWhite = CUSTOM_POSTER_TEMPLATES['editorial-white'].component;
    const markup = renderToStaticMarkup(
      <EditorialWhite
        content={{
          title: 'Line Study',
          subtitle: '',
          creator: 'Studio North',
          category: '',
          year: '2026',
          description: 'First deliberate line\nSecond deliberate line',
          metadata: [],
        }}
        artwork={null}
        artworkSettings={DEFAULT_ARTWORK_SETTINGS}
        settings={{
          ...DEFAULT_POSTER_SETTINGS,
          template: 'editorial-white',
        }}
      />,
    );
    expect(markup).toContain('First deliberate line</tspan>');
    expect(markup).toContain('Second deliberate line</tspan>');
  });

  it('wraps and clips uninterrupted Custom description text inside the poster', () => {
    const EditorialDark = CUSTOM_POSTER_TEMPLATES['editorial-dark'].component;
    const uninterruptedText = 'a'.repeat(240);
    const markup = renderToStaticMarkup(
      <EditorialDark
        content={{
          title: 'Boundary Study',
          subtitle: '',
          creator: '',
          category: '',
          year: '',
          description: uninterruptedText,
          metadata: [],
        }}
        artwork={null}
        artworkSettings={DEFAULT_ARTWORK_SETTINGS}
        settings={{
          ...DEFAULT_POSTER_SETTINGS,
          template: 'editorial-dark',
        }}
      />,
    );

    expect(markup).toContain('data-custom-description="true"');
    expect(markup).toContain(
      'clip-path="url(#editorial-dark-description-clip)"',
    );
    expect(markup).not.toContain(uninterruptedText);
    expect(markup).not.toContain('>—<');
  });

  it('applies independent Custom typography scales to every content group', () => {
    const EditorialWhite = CUSTOM_POSTER_TEMPLATES['editorial-white'].component;
    const markup = renderToStaticMarkup(
      <EditorialWhite
        content={{
          title: 'Typography Study',
          subtitle: 'Independent subtitle',
          creator: 'Studio North',
          category: 'Editorial',
          year: '2026',
          description: 'Every content group can be resized independently.',
          metadata: [{ id: 'format', label: 'Format', value: 'Print' }],
        }}
        artwork={null}
        artworkSettings={DEFAULT_ARTWORK_SETTINGS}
        settings={{
          ...DEFAULT_POSTER_SETTINGS,
          template: 'editorial-white',
          typography: {
            musicTitleScale: 1,
            customTitleScale: 1.1,
            customSubtitleScale: 1.2,
            customCreatorScale: 1.3,
            customDescriptionScale: 1.4,
            customMetadataScale: 1.5,
          },
        }}
      />,
    );

    for (const group of [
      'title',
      'subtitle',
      'creator',
      'year',
      'description',
      'metadata-label',
      'metadata-value',
    ]) {
      expect(markup).toContain(`data-custom-typography="${group}"`);
    }
  });
});
