import { describe, expect, it } from 'vitest';
import { DEFAULT_POSTER_SETTINGS } from '@/lib/config/print-formats';
import { validatePosterSettings } from '@/lib/domain/poster-settings';
import { POSTER_TEMPLATE_IDS, type PosterSettings } from '@/types/poster';
describe('poster settings validation', () => {
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
  it('accepts safe typography scales and rejects values outside the UI range', () => {
    expect(
      validatePosterSettings({
        ...DEFAULT_POSTER_SETTINGS,
        typography: {
          ...DEFAULT_POSTER_SETTINGS.typography,
          customDescriptionScale: 1.5,
        },
      }).typography.customDescriptionScale,
    ).toBe(1.5);
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
