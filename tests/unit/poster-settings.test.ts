import { describe, expect, it } from 'vitest';
import { DEFAULT_POSTER_SETTINGS } from '@/lib/config/print-formats';
import { validatePosterSettings } from '@/lib/domain/poster-settings';
import { POSTER_TEMPLATE_IDS, type PosterSettings } from '@/types/poster';
describe('poster settings validation', () => {
  it('defaults older settings to a visible palette and preserves an explicit choice', () => {
    const legacy: Partial<PosterSettings> = { ...DEFAULT_POSTER_SETTINGS };
    delete legacy.showArtworkPalette;
    expect(validatePosterSettings(legacy).showArtworkPalette).toBe(true);
    expect(
      validatePosterSettings({ ...legacy, showArtworkPalette: false })
        .showArtworkPalette,
    ).toBe(false);
    expect(() =>
      validatePosterSettings({ ...legacy, showArtworkPalette: 'false' }),
    ).toThrow();
  });
  it('defaults older settings to a visible record hole and preserves an explicit choice', () => {
    const legacy: Partial<PosterSettings> = { ...DEFAULT_POSTER_SETTINGS };
    delete legacy.showRecordHole;
    expect(validatePosterSettings(legacy).showRecordHole).toBe(true);
    expect(
      validatePosterSettings({ ...legacy, showRecordHole: false })
        .showRecordHole,
    ).toBe(false);
  });
  it('accepts defaults', () =>
    expect(validatePosterSettings(DEFAULT_POSTER_SETTINGS)).toEqual(
      DEFAULT_POSTER_SETTINGS,
    ));
  it('rejects unsupported DPI', () =>
    expect(() =>
      validatePosterSettings({ ...DEFAULT_POSTER_SETTINGS, dpi: 600 }),
    ).toThrow());
  it('rejects unsafe margins', () =>
    expect(() =>
      validatePosterSettings({ ...DEFAULT_POSTER_SETTINGS, marginMm: 100 }),
    ).toThrow());
  it('accepts the extended lyrics scale without extending other typography ranges', () => {
    expect(
      validatePosterSettings({
        ...DEFAULT_POSTER_SETTINGS,
        typography: {
          ...DEFAULT_POSTER_SETTINGS.typography,
          customDescriptionScale: 3,
        },
      }).typography.customDescriptionScale,
    ).toBe(3);
    expect(() =>
      validatePosterSettings({
        ...DEFAULT_POSTER_SETTINGS,
        typography: {
          ...DEFAULT_POSTER_SETTINGS.typography,
          musicTitleScale: 0.55,
        },
      }),
    ).toThrow();
  });
  it('accepts every Gallery QR position and rejects unknown positions', () => {
    for (const albumCodePosition of ['left', 'center', 'right'] as const) {
      expect(
        validatePosterSettings({
          ...DEFAULT_POSTER_SETTINGS,
          albumCodePosition,
        }).albumCodePosition,
      ).toBe(albumCodePosition);
    }
    expect(() =>
      validatePosterSettings({
        ...DEFAULT_POSTER_SETTINGS,
        albumCodePosition: 'floating',
      }),
    ).toThrow();
  });
  it.each(POSTER_TEMPLATE_IDS)('accepts the %s template', (template) => {
    expect(
      validatePosterSettings({ ...DEFAULT_POSTER_SETTINGS, template }).template,
    ).toBe(template);
  });
  it('rejects an unknown template', () => {
    expect(() =>
      validatePosterSettings({
        ...DEFAULT_POSTER_SETTINGS,
        template: 'unknown',
      }),
    ).toThrow();
  });
  it('requires explicit visibility settings for decorative poster marks', () => {
    const withoutWaveform: Partial<PosterSettings> = {
      ...DEFAULT_POSTER_SETTINGS,
    };
    delete withoutWaveform.showWaveform;
    expect(() => validatePosterSettings(withoutWaveform)).toThrow();
  });
});
