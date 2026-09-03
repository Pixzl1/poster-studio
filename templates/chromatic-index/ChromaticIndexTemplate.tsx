import { normalizeArtworkPalette } from '@/lib/artwork/palette';
import { PRINT_FORMATS } from '@/lib/config/print-formats';
import { formatRuntime, totalRuntime } from '@/lib/domain/duration';
import { normalizePosterLink } from '@/lib/domain/poster-link';
import { wrapTextLines } from '@/lib/domain/text-layout';
import { AlbumCodeMark, WaveformMark } from '@/templates/classic/PosterFooter';
import { getPosterScale, truncateLabel } from '@/templates/classic/layout';
import { createAlbumCodeMatrix } from '@/templates/classic/marks';
import { ArtworkPalette } from '@/templates/shared/ArtworkPalette';
import { PosterArtwork, SANS, TrackList } from '@/templates/shared/elements';
import type { PosterTemplateProps } from '@/templates/types';

const INK = '#171717';
const MUTED = '#65655f';
const RULE = '#aaa9a3';

export function ChromaticIndexTemplate({
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
  const artworkY = margin * 0.82;
  const artworkHeight = Math.min(contentWidth * 0.91, height * 0.52);
  const titleSize = 92 * scale * settings.typography.musicTitleScale;
  const titleCharacters = Math.max(
    11,
    Math.floor(contentWidth / (titleSize * 0.56)),
  );
  const titleLines = wrapTextLines(
    album.title.toUpperCase(),
    titleCharacters,
    2,
  );
  const titleLineHeight = titleSize * 0.96;
  const titleY = artworkY + artworkHeight + 112 * scale;
  const artistY =
    titleY + (titleLines.length - 1) * titleLineHeight + 78 * scale;
  const mediaY = artistY + 92 * scale;
  const dividerY = mediaY + 86 * scale;
  const footerLineY = height - margin - 145 * scale;
  const trackTop = dividerY + 82 * scale;
  const trackHeight = Math.max(
    160 * scale,
    footerLineY - trackTop - 28 * scale,
  );
  const codeValue = normalizePosterLink(settings.albumCodeUrl);
  const showCode = settings.showAlbumCode && codeValue !== null;
  const codeSize = 150 * scale;
  const codeX = width - margin - codeSize;
  const yearRightEdge =
    showCode && codeValue
      ? getCodeVisibleRightEdge(codeX, codeSize, codeValue)
      : width - margin;
  const waveformWidth = showCode ? contentWidth * 0.19 : contentWidth * 0.25;
  const waveformX = showCode
    ? codeX - waveformWidth - 34 * scale
    : width - margin - waveformWidth;
  const palette = normalizeArtworkPalette(artwork?.palette);
  const swatchGap = 12 * scale;
  const paletteWidth = Math.min(contentWidth * 0.42, 710 * scale);
  const metadataItems = [
    settings.showReleaseDate
      ? {
          label: 'RELEASE DATE',
          value: album.releaseDate ?? album.year?.toString() ?? 'UNKNOWN',
        }
      : null,
    settings.showTotalRuntime
      ? {
          label: 'TOTAL RUNTIME',
          value: formatRuntime(totalRuntime(album.tracks)),
        }
      : null,
  ].filter((item): item is { label: string; value: string } => item !== null);
  const metadataWidth = metadataItems.length > 0 ? contentWidth * 0.25 : 0;
  const trackWidth =
    metadataWidth > 0
      ? contentWidth - metadataWidth - 70 * scale
      : contentWidth;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${album.title} Chromatic Index Poster`}
      {...props}
    >
      <rect width={width} height={height} fill="#ffffff" />
      <rect
        x={24 * scale}
        y={24 * scale}
        width={width - 48 * scale}
        height={height - 48 * scale}
        fill="none"
        stroke={INK}
        strokeWidth={5 * scale}
      />
      <PosterArtwork
        artwork={artwork}
        settings={artworkSettings}
        x={margin}
        y={artworkY}
        width={contentWidth}
        height={artworkHeight}
        filterId="chromatic-index-artwork"
        placeholder="#e7e6e1"
      />

      <text
        data-poster-title="chromatic-index"
        data-title-lines={titleLines.length}
        x={margin}
        y={titleY}
        fill={INK}
        fontFamily={SANS}
        fontSize={titleSize}
        fontWeight="800"
        letterSpacing={-titleSize * 0.035}
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
        fill={INK}
        fontFamily={SANS}
        fontSize={35 * scale}
        fontWeight="500"
        letterSpacing={12 * scale}
      >
        {truncateLabel(album.artist.toUpperCase(), 34)}
      </text>
      {album.year !== null && (
        <text
          data-year-alignment={showCode ? 'qr-visible-edge' : 'content-edge'}
          x={yearRightEdge}
          y={artistY}
          fill={MUTED}
          fontFamily={SANS}
          fontSize={29 * scale}
          fontWeight="600"
          textAnchor="end"
        >
          {album.year}
        </text>
      )}

      {settings.showArtworkPalette !== false && (
        <ArtworkPalette
          palette={palette}
          x={margin}
          y={mediaY - 24 * scale}
          width={paletteWidth}
          height={34 * scale}
          gap={swatchGap}
        />
      )}
      {settings.showWaveform && (
        <WaveformMark
          x={waveformX}
          y={mediaY - 7 * scale}
          width={waveformWidth}
          height={48 * scale}
          tracks={album.tracks}
          color={INK}
          background="#ffffff"
        />
      )}
      {showCode && (
        <AlbumCodeMark
          x={codeX}
          y={mediaY - 62 * scale}
          size={codeSize}
          value={codeValue}
          color={INK}
        />
      )}

      <line
        x1={margin}
        x2={width - margin}
        y1={dividerY}
        y2={dividerY}
        stroke={RULE}
        strokeWidth={2 * scale}
      />
      {settings.showTracklist && (
        <text
          x={margin}
          y={trackTop - 35 * scale}
          fill={INK}
          fontFamily={SANS}
          fontSize={20 * scale}
          fontWeight="700"
          letterSpacing={2.5 * scale}
        >
          TRACKLIST
        </text>
      )}
      <TrackList
        album={album}
        settings={settings}
        x={margin}
        y={trackTop}
        width={trackWidth}
        height={trackHeight}
        scale={scale}
        ink={INK}
        muted={MUTED}
        numberColor={palette[3]}
        columns={album.tracks.length > 6 ? 2 : 1}
      />

      {metadataItems.length > 0 && (
        <g
          fontFamily={SANS}
          transform={`translate(${width - margin - metadataWidth} ${trackTop - 10 * scale})`}
        >
          <line
            x1={-28 * scale}
            x2={-28 * scale}
            y1={0}
            y2={Math.min(trackHeight, 310 * scale)}
            stroke={RULE}
            strokeWidth={2 * scale}
          />
          {metadataItems.map((item, index) => {
            const y = index * 138 * scale;
            return (
              <g key={item.label} transform={`translate(0 ${y})`}>
                <text
                  y={25 * scale}
                  fill={MUTED}
                  fontSize={17 * scale}
                  fontWeight="700"
                  letterSpacing={1.8 * scale}
                >
                  {item.label}
                </text>
                <text
                  y={68 * scale}
                  fill={INK}
                  fontSize={26 * scale}
                  fontWeight="600"
                >
                  {truncateLabel(item.value.toUpperCase(), 24)}
                </text>
                {index < metadataItems.length - 1 && (
                  <line
                    x1={0}
                    x2={metadataWidth}
                    y1={96 * scale}
                    y2={96 * scale}
                    stroke={RULE}
                    strokeWidth={1.5 * scale}
                  />
                )}
              </g>
            );
          })}
        </g>
      )}

      <line
        x1={margin}
        x2={width - margin}
        y1={footerLineY}
        y2={footerLineY}
        stroke={RULE}
        strokeWidth={2 * scale}
      />
    </svg>
  );
}

export function getCodeVisibleRightEdge(
  x: number,
  size: number,
  value: string,
): number {
  const matrixSize = createAlbumCodeMatrix(value).length;
  const quietZone = 4;
  const cellSize = size / (matrixSize + quietZone * 2);
  return x + (quietZone + matrixSize) * cellSize;
}
