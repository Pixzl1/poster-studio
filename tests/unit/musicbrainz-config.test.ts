import { afterEach, describe, expect, it, vi } from 'vitest';
import { isMusicBrainzEnabled } from '@/lib/config/musicbrainz';
import { createCustomProject, createMusicProject } from '@/lib/domain/project';

describe('MusicBrainz configuration', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('is enabled when MUSICBRAINZ_ENABLED is missing', () => {
    vi.stubEnv('MUSICBRAINZ_ENABLED', undefined);
    expect(isMusicBrainzEnabled()).toBe(true);
  });

  it('is enabled when MUSICBRAINZ_ENABLED=true', () => {
    vi.stubEnv('MUSICBRAINZ_ENABLED', 'true');
    expect(isMusicBrainzEnabled()).toBe(true);
  });

  it('is disabled when MUSICBRAINZ_ENABLED=false', () => {
    vi.stubEnv('MUSICBRAINZ_ENABLED', 'false');
    expect(isMusicBrainzEnabled()).toBe(false);
  });

  it('does not affect Manual or Custom poster projects when disabled', () => {
    vi.stubEnv('MUSICBRAINZ_ENABLED', 'false');

    expect(createMusicProject().metadataSource).toBe('manual');
    expect(createCustomProject().mode).toBe('custom');
  });
});
