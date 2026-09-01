import type { MusicProvider } from './provider';
import { MusicBrainzProvider } from './musicbrainz';

type MusicProviderId = 'musicbrainz';

const providerFactories: Record<MusicProviderId, () => MusicProvider> = {
  musicbrainz: () => new MusicBrainzProvider(),
};

function configuredProviderId(): MusicProviderId {
  const configured = process.env.MUSIC_PROVIDER ?? 'musicbrainz';
  if (isMusicProviderId(configured)) return configured;
  throw new Error(`Unsupported music provider: ${configured}`);
}

function isMusicProviderId(value: string): value is MusicProviderId {
  return Object.hasOwn(providerFactories, value);
}

export const musicProvider: MusicProvider =
  providerFactories[configuredProviderId()]();
