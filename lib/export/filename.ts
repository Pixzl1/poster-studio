export function posterFilename(
  artist: string,
  title: string,
  extension: 'png' | 'pdf',
): string {
  const base = posterFileBase(artist, title);
  return `${base}.${extension}`;
}

export function batchPosterFilename(
  artist: string,
  title: string,
  format: string,
  dpi: number,
  extension: 'png' | 'pdf',
): string {
  return `${posterFileBase(artist, title)}-${format}-${dpi}dpi.${extension}`;
}

export function posterArchiveFilename(artist: string, title: string): string {
  return `${posterFileBase(artist, title)}-formats.zip`;
}

function posterFileBase(artist: string, title: string): string {
  return (
    `${artist}-${title}`
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'album-poster'
  );
}
