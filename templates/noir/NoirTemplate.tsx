import { PRINT_FORMATS } from '@/lib/config/print-formats';
import { formatRuntime, totalRuntime } from '@/lib/domain/duration';
import { normalizePosterLink } from '@/lib/domain/poster-link';
import { wrapTextLines } from '@/lib/domain/text-layout';
import { AlbumCodeMark, WaveformMark } from '@/templates/classic/PosterFooter';
import { getPosterScale, truncateLabel } from '@/templates/classic/layout';
import { PosterArtwork, SANS, TrackList } from '@/templates/shared/elements';
import type { PosterTemplateProps } from '@/templates/types';

export function NoirTemplate({
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
  const artHeight = Math.min(contentWidth * 0.93, height * 0.55);
  const titleFontSize = 76 * scale * settings.typography.musicTitleScale;
  const titleLetterSpacing = 2 * scale * settings.typography.musicTitleScale;
  const titleCharacters = Math.max(
    9,
    Math.floor(contentWidth / (titleFontSize * 0.62 + titleLetterSpacing)),
  );
  const titleLines = wrapTextLines(
    album.title.toUpperCase(),
    titleCharacters,
    2,
  );
  const titleLineHeight = titleFontSize * 1.08;
  const titleY = margin + artHeight + 125 * scale;
  const artistY =
    titleY + (titleLines.length - 1) * titleLineHeight + 68 * scale;
  const ruleY = artistY + 78 * scale;
  const footerY = height - margin - 105 * scale;
  const codeValue = normalizePosterLink(settings.albumCodeUrl);
  const showCode = settings.showAlbumCode && codeValue !== null;
  const codeSize = 190 * scale;
  const codeX = width - margin - codeSize;
  const waveformWidth = showCode ? width * 0.14 : width * 0.2;
  const waveformX = showCode
    ? codeX - waveformWidth - 36 * scale
    : width - margin - waveformWidth;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${album.title} Noir Poster`}
      {...props}
    >
      <rect width={width} height={height} fill="#0d0e0e" />
      <PosterArtwork
        artwork={artwork}
        settings={artworkSettings}
        x={0}
        y={0}
        width={width}
        height={artHeight + margin}
        filterId="noir-artwork"
        grayscale
        placeholder="#222"
      />
      <text
        data-poster-title="noir"
        data-title-lines={titleLines.length}
        x={margin}
        y={titleY}
        fill="#f5f4f0"
        fontFamily={SANS}
        fontSize={titleFontSize}
        fontWeight="700"
        letterSpacing={titleLetterSpacing}
      >
        {titleLines.map((line, index) => (
          <tspan
            key={`${line}-${index}`}
            x={margin}
            dy={index === 0 ? 0 : titleLineHeight}
          >
            {line}
          </tspan>
        ))}
      </text>
      <text
        x={margin}
        y={artistY}
        fill="#d7d5ce"
        fontFamily={SANS}
        fontSize={38 * scale}
        fontWeight="600"
        letterSpacing={3 * scale}
      >
        {truncateLabel(album.artist.toUpperCase(), 35)}
      </text>
      {album.year !== null && (
        <text
          x={width - margin}
          y={artistY}
          fill="#e7e5df"
          fontFamily={SANS}
          fontSize={34 * scale}
          textAnchor="end"
        >
          {album.year}
        </text>
      )}
      <line
        x1={margin}
        x2={width - margin}
        y1={ruleY}
        y2={ruleY}
        stroke="#777773"
        strokeWidth={2 * scale}
      />
      <TrackList
        album={album}
        settings={settings}
        x={margin}
        y={ruleY + 85 * scale}
        width={contentWidth}
        height={footerY - ruleY - 130 * scale}
        scale={scale}
        ink="#efeee9"
        muted="#b8b7b1"
        columns={album.tracks.length > 7 ? 2 : 1}
      />
      <line
        x1={margin}
        x2={width - margin}
        y1={footerY}
        y2={footerY}
        stroke="#777773"
        strokeWidth={2 * scale}
      />
      <g fill="#dddcd6" fontFamily={SANS} fontSize={24 * scale}>
        {settings.showReleaseDate && (
          <text x={margin} y={footerY + 65 * scale}>
            Release Date: {album.releaseDate ?? 'Unbekannt'}
          </text>
        )}
        {settings.showTotalRuntime && (
          <text x={width * 0.43} y={footerY + 65 * scale}>
            Total Runtime: {formatRuntime(totalRuntime(album.tracks))}
          </text>
        )}
      </g>
      {settings.showWaveform && (
        <WaveformMark
          x={waveformX}
          y={footerY + 55 * scale}
          width={waveformWidth}
          height={42 * scale}
          tracks={album.tracks}
          color="#f2f1ec"
          background="#0d0e0e"
        />
      )}
      {showCode && (
        <AlbumCodeMark
          x={codeX}
          y={footerY + 15 * scale}
          size={codeSize}
          value={codeValue}
          color="#f2f1ec"
        />
      )}
    </svg>
  );
}
