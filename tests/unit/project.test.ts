import { describe, expect, it } from 'vitest';
import {
  createCustomProject,
  createMusicProject,
  DEFAULT_ARTWORK_SETTINGS,
  withUserArtwork,
} from '@/lib/domain/project';
import type { UserArtwork } from '@/types/poster';
import {
  customPosterContentSchema,
  musicPosterContentSchema,
  posterProjectSchema,
} from '@/lib/domain/project-validation';

describe('poster project validation', () => {
  it('validates MusicPosterContent', () => {
    expect(
      musicPosterContentSchema.safeParse(createMusicProject().content).success,
    ).toBe(true);
  });

  it('starts Music posters in manual-entry mode', () => {
    const project = createMusicProject();

    expect(project.metadataSource).toBe('manual');
  });

  it('sets uploaded artwork and resets its transformation atomically', () => {
    const project = createMusicProject();
    project.artworkSettings = {
      fitMode: 'fill',
      scale: 2,
      positionX: 30,
      positionY: -20,
    };
    const artwork: UserArtwork = {
      file: {} as File,
      objectUrl: 'blob:uploaded-artwork',
      width: 1600,
      height: 1600,
      mimeType: 'image/png',
      fileName: 'cover.png',
      sizeBytes: 1024,
    };

    const next = withUserArtwork(project, artwork);

    expect(next.artwork).toBe(artwork);
    expect(next.artworkSettings).toEqual(DEFAULT_ARTWORK_SETTINGS);
    expect(next.mode).toBe('music');
  });
  it('validates CustomPosterContent', () => {
    expect(
      customPosterContentSchema.safeParse(createCustomProject().content)
        .success,
    ).toBe(true);
  });
  it('preserves the discriminated project modes', () => {
    expect(posterProjectSchema.parse(createMusicProject()).mode).toBe('music');
    expect(posterProjectSchema.parse(createCustomProject()).mode).toBe(
      'custom',
    );
  });
  it('rejects content from the wrong mode', () => {
    expect(
      posterProjectSchema.safeParse({ ...createMusicProject(), mode: 'custom' })
        .success,
    ).toBe(false);
  });
  it('rejects templates assigned to the wrong mode', () => {
    const music = createMusicProject();
    expect(
      posterProjectSchema.safeParse({
        ...music,
        settings: { ...music.settings, template: 'editorial-dark' },
      }).success,
    ).toBe(false);
    expect(
      posterProjectSchema.safeParse({
        ...music,
        settings: { ...music.settings, template: 'editorial-white' },
      }).success,
    ).toBe(false);

    const custom = createCustomProject();
    expect(
      posterProjectSchema.safeParse({
        ...custom,
        settings: { ...custom.settings, template: 'editorial-white' },
      }).success,
    ).toBe(true);
  });
});
