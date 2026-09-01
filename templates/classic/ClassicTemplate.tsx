import { PRINT_FORMATS } from '@/lib/config/print-formats';
import { formatDuration } from '@/lib/domain/duration';
import { PosterArtwork, PosterBackdrop } from '@/templates/shared/elements';
import type { PosterTemplateProps } from '../types';
import { getPosterScale, getTrackLayout, truncateLabel } from './layout';
import { PosterFooter } from './PosterFooter';

const COLORS = {
  paper: '#ffffff',
  ink: '#20201e',
  muted: '#74746e',
  rule: '#b8b8b0',
  placeholder: '#e5e3dc',
} as const;
const FONT = 'Arial, Helvetica, sans-serif';

export function ClassicTemplate(props: PosterTemplateProps) {
  return <ClassicComposition {...props} />;
}

export function ClassicComposition({
  album,
  artwork,
  artworkSettings,
  settings,
  grayscaleArtwork = false,
  blurredBackground = false,
  ...props
}: PosterTemplateProps & {
  grayscaleArtwork?: boolean;
  blurredBackground?: boolean;
}) {
  const format = PRINT_FORMATS[settings.format];
  const width = format.widthMm * 10;
  const height = format.heightMm * 10;
  const margin = settings.marginMm * 10;
  const contentWidth = width - margin * 2;
  const artworkWidth = contentWidth;
  const artworkHeight = artworkWidth * 0.85;
  const artworkY = margin * 0.85;
  // Keep every typographic and spacing measurement proportional to the
  // physical format. This makes A3 and large-format exports visually match A4.
  const scale = getPosterScale(width);
  const titleSize = Math.max(
    60 * scale,
    Math.min(116 * scale, (120 - album.title.length * 1.2) * scale),
  );
  const titleY = artworkY + artworkHeight + titleSize * 0.82 + 92 * scale;
  const artistY = titleY + 54 * scale;
  const dividerY = artistY + 78 * scale;
  const footerLineY = height - margin - 230 * scale;
  const trackTop = dividerY + 96 * scale;
  const trackHeight = Math.max(100, footerLineY - trackTop - 34 * scale);
  const layout = getTrackLayout(album.tracks.length, trackHeight, scale);
  const columnGap = 48 * scale;
  const columnWidth =
    (contentWidth - columnGap * (layout.columns - 1)) / layout.columns;
  const titleCharacters = Math.max(
    18,
    Math.floor(contentWidth / (titleSize * 0.49)),
  );
  const artistCharacters = Math.max(
    18,
    Math.floor(contentWidth / (38 * scale * 0.56)),
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${album.title} von ${album.artist} Poster`}
      {...props}
    >
      <rect width={width} height={height} fill={COLORS.paper} />
      {blurredBackground && (
        <PosterBackdrop
          artwork={artwork}
          x={0}
          y={0}
          width={width}
          height={height}
          filterId="bloom-background"
          overlayOpacity={0.8}
        />
      )}
      <PosterArtwork
        artwork={artwork}
        settings={artworkSettings}
        x={margin}
        y={artworkY}
        width={artworkWidth}
        height={artworkHeight}
        filterId="classic-artwork"
        grayscale={grayscaleArtwork}
        placeholder={COLORS.placeholder}
      />

      <text
        x={margin}
        y={titleY}
        fill={COLORS.ink}
        fontFamily={FONT}
        fontSize={titleSize}
        fontWeight="700"
        letterSpacing={-titleSize * 0.035}
      >
        {truncateLabel(album.title, titleCharacters)}
      </text>
      <text
        x={margin}
        y={artistY}
        fill={COLORS.muted}
        fontFamily={FONT}
        fontSize={38 * scale}
        fontWeight="400"
      >
        {truncateLabel(album.artist, artistCharacters)}
      </text>
      {album.year !== null && (
        <text
          x={width - margin}
          y={artistY}
          fill={COLORS.muted}
          fontFamily={FONT}
          fontSize={38 * scale}
          fontWeight="500"
          textAnchor="end"
        >
          {album.year}
        </text>
      )}
      <line
        x1={margin}
        x2={width - margin}
        y1={dividerY}
        y2={dividerY}
        stroke={COLORS.rule}
        strokeWidth={2 * scale}
      />

      {settings.showTracklist &&
        album.tracks.map((track, index) => {
          const column = Math.floor(index / layout.rows);
          const row = index % layout.rows;
          const x = margin + column * (columnWidth + columnGap);
          const y = trackTop + row * layout.lineHeight;
          const durationSpace = settings.showDurations
            ? 102 * scale
            : 18 * scale;
          const titleOffset = 44 * scale;
          const titleLength = Math.max(
            7,
            Math.floor(
              (columnWidth - durationSpace - titleOffset) /
                (layout.fontSize * 0.54),
            ),
          );
          return (
            <g key={track.id} fontFamily={FONT} fontSize={layout.fontSize}>
              <text x={x} y={y} fill={COLORS.muted} fontVariant="tabular-nums">
                {String(track.position).padStart(2, '0')}
              </text>
              <text x={x + titleOffset} y={y} fill={COLORS.ink}>
                {truncateLabel(track.title, titleLength)}
              </text>
              {settings.showDurations && (
                <text
                  x={x + columnWidth}
                  y={y}
                  fill={COLORS.muted}
                  textAnchor="end"
                  fontVariant="tabular-nums"
                >
                  {formatDuration(track.durationMs)}
                </text>
              )}
            </g>
          );
        })}

      <PosterFooter
        album={album}
        settings={settings}
        x={margin}
        y={footerLineY}
        width={contentWidth}
        scale={scale}
        colors={COLORS}
        fontFamily={FONT}
      />
    </svg>
  );
}
