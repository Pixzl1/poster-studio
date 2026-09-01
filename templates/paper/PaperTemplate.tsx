import { PRINT_FORMATS } from '@/lib/config/print-formats';
import { formatRuntime, totalRuntime } from '@/lib/domain/duration';
import { normalizePosterLink } from '@/lib/domain/poster-link';
import { AlbumCodeMark, WaveformMark } from '@/templates/classic/PosterFooter';
import { getPosterScale, truncateLabel } from '@/templates/classic/layout';
import { PosterArtwork, SANS, TrackList } from '@/templates/shared/elements';
import type { PosterTemplateProps } from '@/templates/types';

export function PaperTemplate({
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
  const artWidth = contentWidth * 0.72;
  const artX = (width - artWidth) / 2;
  const artY = margin + 570 * scale;
  const ruleY = artY + artWidth + 100 * scale;
  const footerY = height - margin - 110 * scale;
  const titleWords = album.title.split(' ');
  const titleBreak = Math.max(1, Math.ceil(titleWords.length / 2));
  const waveformWidth = 240 * scale;
  const waveformX = width - margin - 300 * scale;
  const codeValue = normalizePosterLink(settings.albumCodeUrl);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${album.title} Paper Poster`}
      {...props}
    >
      <defs>
        <filter id="paper-grain">
          <feTurbulence baseFrequency="0.9" numOctaves="3" seed="8" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .05 0" />
        </filter>
      </defs>
      <rect width={width} height={height} fill="#f5f3ed" />
      <rect
        width={width}
        height={height}
        fill="#a8a399"
        opacity="0.22"
        filter="url(#paper-grain)"
      />
      <text
        x={margin}
        y={margin + 130 * scale}
        fill="#161616"
        fontFamily={SANS}
        fontSize={94 * scale}
        fontWeight="700"
      >
        <tspan x={margin}>
          {truncateLabel(titleWords.slice(0, titleBreak).join(' '), 20)}
        </tspan>
        {titleWords.length > 1 && (
          <tspan x={margin} dy={100 * scale}>
            {truncateLabel(titleWords.slice(titleBreak).join(' '), 20)}
          </tspan>
        )}
      </text>
      <text
        x={margin}
        y={margin + 335 * scale}
        fill="#292927"
        fontFamily={SANS}
        fontSize={35 * scale}
      >
        {truncateLabel(album.artist, 36)}
      </text>
      {album.year !== null && (
        <text
          x={margin}
          y={margin + 400 * scale}
          fill="#292927"
          fontFamily={SANS}
          fontSize={28 * scale}
        >
          {album.year}
        </text>
      )}
      {settings.showWaveform && (
        <WaveformMark
          x={waveformX}
          y={margin + 80 * scale}
          width={waveformWidth}
          height={45 * scale}
          tracks={album.tracks}
          color="#161616"
          background="#f5f3ed"
        />
      )}
      {settings.showAlbumCode && codeValue && (
        <AlbumCodeMark
          x={width - margin - 180 * scale}
          y={margin + 180 * scale}
          size={170 * scale}
          value={codeValue}
          color="#161616"
        />
      )}
      <PosterArtwork
        artwork={artwork}
        settings={artworkSettings}
        x={artX}
        y={artY}
        width={artWidth}
        height={artWidth}
        filterId="paper-artwork"
      />
      <line
        x1={margin}
        x2={width - margin}
        y1={ruleY}
        y2={ruleY}
        stroke="#918f88"
        strokeWidth={2 * scale}
      />
      <TrackList
        album={album}
        settings={settings}
        x={margin}
        y={ruleY + 80 * scale}
        width={contentWidth}
        height={footerY - ruleY - 120 * scale}
        scale={scale}
        ink="#242422"
        muted="#55534e"
        columns={album.tracks.length > 7 ? 2 : 1}
      />
      <line
        x1={margin}
        x2={width - margin}
        y1={footerY}
        y2={footerY}
        stroke="#918f88"
        strokeWidth={2 * scale}
      />
      <g fill="#343431" fontFamily={SANS} fontSize={24 * scale}>
        {settings.showReleaseDate && (
          <text x={margin} y={footerY + 68 * scale}>
            Release Date: {album.releaseDate ?? 'Unbekannt'}
          </text>
        )}
        {settings.showTotalRuntime && (
          <text x={width * 0.55} y={footerY + 68 * scale}>
            Total Runtime: {formatRuntime(totalRuntime(album.tracks))}
          </text>
        )}
      </g>
    </svg>
  );
}
