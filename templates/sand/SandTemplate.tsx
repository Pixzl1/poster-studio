import { PRINT_FORMATS } from '@/lib/config/print-formats';
import { PosterFooter } from '@/templates/classic/PosterFooter';
import { getPosterScale, truncateLabel } from '@/templates/classic/layout';
import { PosterArtwork, SANS, TrackList } from '@/templates/shared/elements';
import type { PosterTemplateProps } from '@/templates/types';

export function SandTemplate({
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
  const artWidth = contentWidth * 0.66;
  const artX = (width - artWidth) / 2;
  const artY = margin * 0.86;
  const titleY = artY + artWidth + 118 * scale;
  const artistY = titleY + 54 * scale;
  const ruleY = artistY + 70 * scale;
  const footerY = height - margin - 220 * scale;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${album.title} Sand Poster`}
      {...props}
    >
      <defs>
        <filter id="sand-paper">
          <feTurbulence
            baseFrequency="0.7"
            numOctaves="2"
            seed="12"
            result="noise"
          />
          <feBlend in="SourceGraphic" in2="noise" mode="soft-light" />
        </filter>
      </defs>
      <rect width={width} height={height} fill="#eee5d4" />
      <rect
        width={width}
        height={height}
        fill="#eadfca"
        opacity="0.16"
        filter="url(#sand-paper)"
      />
      <PosterArtwork
        artwork={artwork}
        settings={artworkSettings}
        x={artX}
        y={artY}
        width={artWidth}
        height={artWidth}
        filterId="sand-artwork"
      />
      <text
        x={margin}
        y={titleY}
        fill="#201e1a"
        fontFamily={SANS}
        fontSize={76 * scale}
        fontWeight="700"
        letterSpacing={-2.5 * scale}
      >
        {truncateLabel(album.title, 34)}
      </text>
      <text
        x={margin}
        y={artistY}
        fill="#4e493f"
        fontFamily={SANS}
        fontSize={35 * scale}
      >
        {truncateLabel(album.artist, 38)}
      </text>
      {album.year !== null && (
        <text
          x={width - margin}
          y={artistY}
          fill="#302d27"
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
        stroke="#9f9687"
        strokeWidth={2 * scale}
      />
      <TrackList
        album={album}
        settings={settings}
        x={margin}
        y={ruleY + 90 * scale}
        width={contentWidth}
        height={footerY - ruleY - 125 * scale}
        scale={scale}
        ink="#25231f"
        muted="#5f594f"
        columns={album.tracks.length > 7 ? 2 : 1}
      />
      <PosterFooter
        album={album}
        settings={settings}
        x={margin}
        y={footerY}
        width={contentWidth}
        scale={scale}
        colors={{
          ink: '#27241f',
          muted: '#655e52',
          rule: '#9f9687',
          paper: '#eee5d4',
        }}
        fontFamily={SANS}
      />
    </svg>
  );
}
