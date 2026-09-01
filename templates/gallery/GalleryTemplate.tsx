import { PRINT_FORMATS } from '@/lib/config/print-formats';
import { normalizePosterLink } from '@/lib/domain/poster-link';
import { wrapTextLines } from '@/lib/domain/text-layout';
import { AlbumCodeMark, WaveformMark } from '@/templates/classic/PosterFooter';
import { getPosterScale, truncateLabel } from '@/templates/classic/layout';
import { PosterArtwork, SANS } from '@/templates/shared/elements';
import type { PosterTemplateProps } from '@/templates/types';

export function GalleryTemplate({
  album,
  artwork,
  artworkSettings,
  settings,
  ...props
}: PosterTemplateProps) {
  const format = PRINT_FORMATS[settings.format];
  const width = format.widthMm * 10;
  const height = format.heightMm * 10;
  const margin = settings.marginMm * 10;
  const scale = getPosterScale(width);
  const contentWidth = width - margin * 2;
  const artworkHeight = Math.min(contentWidth * 1.08, height * 0.72);
  const artworkY = margin;
  const titleFontSize = 74 * scale * settings.typography.musicTitleScale;
  const titleLetterSpacing = 4.5 * scale * settings.typography.musicTitleScale;
  const titleCharacters = Math.max(
    8,
    Math.floor(contentWidth / (titleFontSize * 0.62 + titleLetterSpacing)),
  );
  const titleLines = wrapTextLines(
    album.title.toUpperCase(),
    titleCharacters,
    2,
  );
  const titleLineHeight = titleFontSize * 1.08;
  const titleY = artworkY + artworkHeight + 150 * scale;
  const artistY =
    titleY + (titleLines.length - 1) * titleLineHeight + 86 * scale;
  const hasSubtitle = Boolean(album.disambiguation.trim());
  const subtitleY = artistY + 62 * scale;
  const waveformY = (hasSubtitle ? subtitleY : artistY) + 108 * scale;
  const waveformWidth = width * 0.24;
  const waveformX = (width - waveformWidth) / 2;
  const codeValue = normalizePosterLink(settings.albumCodeUrl);
  const showCode = settings.showAlbumCode && codeValue !== null;
  const codeSize = 220 * scale;
  const codeX = getGalleryCodeX(
    settings.albumCodePosition,
    width,
    margin,
    codeSize,
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${album.title} von ${album.artist} Gallery Poster`}
      {...props}
    >
      <rect width={width} height={height} fill="#fbfbfa" />
      <rect
        x={margin * 0.38}
        y={margin * 0.38}
        width={width - margin * 0.76}
        height={height - margin * 0.76}
        fill="none"
        stroke="#d6d6d1"
        strokeWidth={2 * scale}
      />
      <PosterArtwork
        artwork={artwork}
        settings={artworkSettings}
        x={margin}
        y={artworkY}
        width={contentWidth}
        height={artworkHeight}
        filterId="gallery-artwork"
      />
      <text
        data-poster-title="gallery"
        data-title-lines={titleLines.length}
        x={width / 2}
        y={titleY}
        fill="#161615"
        fontFamily={SANS}
        fontSize={titleFontSize}
        fontWeight="700"
        letterSpacing={titleLetterSpacing}
        textAnchor="middle"
      >
        {titleLines.map((line, index) => (
          <tspan
            key={`${line}-${index}`}
            x={width / 2}
            dy={index === 0 ? 0 : titleLineHeight}
          >
            {line}
          </tspan>
        ))}
      </text>
      <text
        x={width / 2}
        y={artistY}
        fill="#3f3f3c"
        fontFamily={SANS}
        fontSize={34 * scale}
        letterSpacing={10 * scale}
        textAnchor="middle"
      >
        {truncateLabel(album.artist.toUpperCase(), 30)}
      </text>
      {album.year !== null && (
        <text
          x={width - margin}
          y={artistY}
          fill="#42423f"
          fontFamily={SANS}
          fontSize={31 * scale}
          textAnchor="end"
        >
          {album.year}
        </text>
      )}
      {hasSubtitle && (
        <text
          x={width / 2}
          y={subtitleY}
          fill="#6b6b66"
          fontFamily={SANS}
          fontSize={27 * scale}
          letterSpacing={4 * scale}
          textAnchor="middle"
        >
          {truncateLabel(album.disambiguation.toUpperCase(), 42)}
        </text>
      )}
      {settings.showWaveform && (
        <WaveformMark
          x={waveformX}
          y={waveformY}
          width={waveformWidth}
          height={48 * scale}
          tracks={album.tracks}
          color="#171716"
          background="#fbfbfa"
        />
      )}
      {showCode && (
        <AlbumCodeMark
          x={codeX}
          y={height - margin - codeSize}
          size={codeSize}
          value={codeValue}
          color="#161615"
        />
      )}
    </svg>
  );
}

export function getGalleryCodeX(
  position: 'left' | 'center' | 'right',
  width: number,
  margin: number,
  codeSize: number,
): number {
  if (position === 'left') return margin;
  if (position === 'center') return (width - codeSize) / 2;
  return width - margin - codeSize;
}
