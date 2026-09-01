import { PRINT_FORMATS } from '@/lib/config/print-formats';
import { PosterFooter } from '@/templates/classic/PosterFooter';
import { getPosterScale, truncateLabel } from '@/templates/classic/layout';
import { PosterArtwork, SANS, TrackList } from '@/templates/shared/elements';
import type { PosterTemplateProps } from '@/templates/types';

export function OnyxTemplate({
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
  const titleY = margin + 105 * scale;
  const artistY = titleY + 145 * scale;
  const ruleY = artistY + 88 * scale;
  const footerY = height - margin - 250 * scale;
  const bodyTop = ruleY + 125 * scale;
  const artWidth = contentWidth * 0.47;
  const artX = width - margin - artWidth;
  const titleWords = album.title.split(' ');
  const titleBreak = Math.max(1, Math.ceil(titleWords.length / 2));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${album.title} Onyx Poster`}
      {...props}
    >
      <rect width={width} height={height} fill="#101111" />
      <text
        x={margin}
        y={titleY}
        fill="#f3f2ed"
        fontFamily={SANS}
        fontSize={94 * scale}
        fontWeight="700"
      >
        <tspan x={margin}>
          {truncateLabel(titleWords.slice(0, titleBreak).join(' '), 20)}
        </tspan>
        {titleWords.length > 1 && (
          <tspan x={margin} dy={98 * scale}>
            {truncateLabel(titleWords.slice(titleBreak).join(' '), 20)}
          </tspan>
        )}
      </text>
      <text
        x={margin}
        y={artistY}
        fill="#c7c5bd"
        fontFamily={SANS}
        fontSize={37 * scale}
      >
        {truncateLabel(album.artist, 38)}
      </text>
      {album.year !== null && (
        <text
          x={width - margin}
          y={artistY}
          fill="#e3e1da"
          fontFamily={SANS}
          fontSize={37 * scale}
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
        stroke="#a63f61"
        strokeWidth={10 * scale}
      />
      <TrackList
        album={album}
        settings={settings}
        x={margin}
        y={bodyTop}
        width={contentWidth * 0.43}
        height={footerY - bodyTop - 80 * scale}
        scale={scale}
        ink="#e8e7e2"
        muted="#d0cdc7"
        numberColor="#c44c76"
        columns={1}
      />
      <PosterArtwork
        artwork={artwork}
        settings={artworkSettings}
        x={artX}
        y={bodyTop - 15 * scale}
        width={artWidth}
        height={artWidth}
        filterId="onyx-artwork"
        placeholder="#262727"
      />
      <PosterFooter
        album={album}
        settings={settings}
        x={margin}
        y={footerY}
        width={contentWidth}
        scale={scale}
        colors={{
          ink: '#f1f0eb',
          muted: '#aaa9a3',
          rule: '#656561',
          paper: '#101111',
        }}
        fontFamily={SANS}
      />
    </svg>
  );
}
