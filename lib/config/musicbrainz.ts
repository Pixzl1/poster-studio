export function isMusicBrainzEnabled(): boolean {
  return process.env.MUSICBRAINZ_ENABLED?.trim().toLowerCase() !== 'false';
}
