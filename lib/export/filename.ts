export function posterFilename(
  artist: string,
  title: string,
  extension: 'png' | 'pdf',
): string {
  const base =
    `${artist}-${title}`
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'album-poster';
  return `${base}.${extension}`;
}
