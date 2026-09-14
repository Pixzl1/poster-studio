import { useMemo } from 'react';
import { normalizeArtworkPalette } from '@/lib/artwork/palette';
import { PRINT_FORMATS } from '@/lib/config/print-formats';
import { fitCircularText } from '@/lib/domain/circular-text';
import { normalizePosterLink } from '@/lib/domain/poster-link';
import { wrapTextLines } from '@/lib/domain/text-layout';
import { AlbumCodeMark } from '@/templates/classic/PosterFooter';
import { getPosterScale, truncateLabel } from '@/templates/classic/layout';
import { getArtworkPlacement, SANS } from '@/templates/shared/elements';
import type { CustomPosterTemplateProps } from '@/templates/types';

export interface LyricsRecordColors {
  background: string;
  foreground: string;
  muted: string;
  rule: string;
  record: string;
}

export function LyricsRecordTemplate({
  content,
  artwork,
  artworkSettings,
  settings,
  colors,
  templateName,
  ...props
}: CustomPosterTemplateProps & {
  colors: LyricsRecordColors;
  templateName: string;
}) {
  const format = PRINT_FORMATS[settings.format];
  const width = format.widthMm * 10;
  const height = format.heightMm * 10;
  const margin = settings.marginMm * 10;
  const scale = getPosterScale(width);
  const contentWidth = width - margin * 2;
  const slug = templateName.toLowerCase().replaceAll(' ', '-');
  const titleSize = 132 * scale * settings.typography.customTitleScale;
  const titleLines = wrapTextLines(
    (content.title || 'UNTITLED SONG').toUpperCase(),
    Math.max(10, Math.floor((contentWidth * 0.57) / (titleSize * 0.55))),
    2,
  );
  const titleLineHeight = titleSize * 0.88;
  const titleY = margin + titleSize;
  const headerBottom = titleY + (titleLines.length - 1) * titleLineHeight;
  const separatorY = Math.max(headerBottom + 58 * scale, margin + 225 * scale);
  const infoX = margin + contentWidth * 0.66;
  const infoSize = 31 * scale * settings.typography.customCreatorScale;
  const recordRadius = Math.min(contentWidth * 0.43, height * 0.265);
  const recordCenterX = width / 2;
  const recordCenterY = Math.max(
    height * 0.545,
    separatorY + 72 * scale + recordRadius,
  );
  const labelRadius = recordRadius * 0.27;
  const requestedLyricFontSize =
    17.5 * scale * settings.typography.customDescriptionScale;
  const radialTextSpace = recordRadius - labelRadius * 1.25;
  const lyricsValue = content.description || 'ADD YOUR LYRICS';
  const normalizedLyricsLength = lyricsValue
    .replaceAll(/\s+/g, ' ')
    .trim().length;
  const preferredCharactersPerRing = Math.max(
    18,
    Math.round(70 / settings.typography.customDescriptionScale),
  );
  const preferredRingCount = Math.max(
    1,
    Math.ceil(normalizedLyricsLength / preferredCharactersPerRing),
  );
  const fittedLyrics = useMemo(
    () =>
      fitCircularText(lyricsValue, {
        outerRadius: recordRadius,
        innerRadius: labelRadius * 1.25,
        requestedFontSize: requestedLyricFontSize,
        minimumFontSize: 7 * scale,
        preferredRingCount,
      }),
    [
      lyricsValue,
      recordRadius,
      labelRadius,
      requestedLyricFontSize,
      scale,
      preferredRingCount,
    ],
  );
  const lyricFontSize = fittedLyrics.fontSize;
  const lyrics = fittedLyrics.rings;
  const grooveCount = Math.max(15, lyrics.length);
  const grooveRadii = Array.from(
    { length: grooveCount },
    (_, index) => recordRadius - (index * radialTextSpace) / (grooveCount - 1),
  );
  const palette = normalizeArtworkPalette(artwork?.palette);
  const dedicationY = height - margin - 142 * scale;
  const dedicationSize = 26 * scale * settings.typography.customSubtitleScale;
  const dedicationLineOffset = dedicationSize * 0.72 + 18 * scale;
  const accentStartX = width - margin - 126 * scale;
  const codeValue = normalizePosterLink(settings.albumCodeUrl);
  const showCode = settings.showAlbumCode && codeValue !== null;
  const codeSize = 135 * scale;
  const dedicationWidth = showCode
    ? contentWidth - codeSize - 55 * scale
    : contentWidth;
  const artworkPlacement = artwork
    ? getArtworkPlacement(
        artwork,
        artworkSettings,
        recordCenterX - labelRadius,
        recordCenterY - labelRadius,
        labelRadius * 2,
        labelRadius * 2,
      )
    : null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${content.title || 'Custom'} ${templateName} Poster`}
      {...props}
    >
      <defs>
        <clipPath id={`${slug}-label-clip`}>
          <circle cx={recordCenterX} cy={recordCenterY} r={labelRadius} />
        </clipPath>
        {lyrics.map((ring, index) => (
          <path
            key={index}
            id={`${slug}-lyric-ring-${index}`}
            d={`M ${recordCenterX} ${recordCenterY - ring.radius} a ${ring.radius} ${ring.radius} 0 0 1 0 ${ring.radius * 2} a ${ring.radius} ${ring.radius} 0 0 1 0 ${-ring.radius * 2}`}
          />
        ))}
      </defs>
      <rect width={width} height={height} fill={colors.background} />

      <text
        data-custom-typography="title"
        x={margin}
        y={titleY}
        fill={colors.foreground}
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

      <line
        x1={infoX - 38 * scale}
        x2={infoX - 38 * scale}
        y1={margin + 20 * scale}
        y2={separatorY}
        stroke={colors.rule}
        strokeWidth={3 * scale}
      />
      <g
        data-custom-typography="creator"
        fill={colors.foreground}
        fontFamily={SANS}
        fontSize={infoSize}
      >
        <text x={infoX} y={margin + 65 * scale} fontWeight="700">
          {truncateLabel(
            (content.creator || 'UNKNOWN ARTIST').toUpperCase(),
            28,
          )}
        </text>
        {content.category.trim() && (
          <text x={infoX} y={margin + 123 * scale} fill={colors.muted}>
            {truncateLabel(content.category.toUpperCase(), 28)}
          </text>
        )}
        {content.year.trim() && (
          <text
            data-custom-typography="year"
            x={infoX}
            y={margin + 181 * scale}
            fill={colors.muted}
          >
            {truncateLabel(content.year, 28)}
          </text>
        )}
      </g>

      <line
        data-header-separator="true"
        x1={margin}
        x2={accentStartX - 34 * scale}
        y1={separatorY}
        y2={separatorY}
        stroke={colors.rule}
        strokeWidth={3 * scale}
      />
      <g data-record-accent="true" data-accent-alignment="separator">
        {palette.slice(1, 4).map((color, index) => (
          <circle
            key={color}
            cx={accentStartX + index * 48 * scale}
            cy={separatorY}
            r={14 * scale}
            fill={color}
          />
        ))}
      </g>

      <circle
        cx={recordCenterX}
        cy={recordCenterY}
        r={recordRadius + 25 * scale}
        fill={colors.record}
        stroke={colors.rule}
        strokeWidth={2 * scale}
      />
      <g
        data-record-grooves="true"
        fill="none"
        stroke={colors.foreground}
        strokeOpacity="0.14"
        strokeWidth={1.5 * scale}
      >
        {grooveRadii.map((radius) => (
          <circle
            key={`groove-${radius}`}
            cx={recordCenterX}
            cy={recordCenterY}
            r={radius}
          />
        ))}
      </g>
      <g
        data-circular-lyrics="true"
        data-lyrics-auto-fitted={fittedLyrics.wasReduced || undefined}
        data-requested-font-size={requestedLyricFontSize}
        data-effective-font-size={lyricFontSize}
        data-custom-typography="description"
        fill={colors.foreground}
        fontFamily={SANS}
        fontSize={lyricFontSize}
        fontWeight="600"
        letterSpacing={1.25 * scale}
      >
        {lyrics.map((ring, index) => {
          const fillsRing =
            ring.text.length /
              ((2 * Math.PI * ring.radius) / (lyricFontSize * 0.7)) >
            0.55;
          return (
            <text
              key={`${ring.radius}-${index}`}
              data-lyrics-truncated={ring.truncated || undefined}
              transform={`rotate(${(index * 137.5) % 360} ${recordCenterX} ${recordCenterY})`}
              textLength={
                fillsRing ? 2 * Math.PI * ring.radius * 0.985 : undefined
              }
              lengthAdjust="spacing"
            >
              <textPath href={`#${slug}-lyric-ring-${index}`} startOffset="0%">
                <tspan data-lyrics-chunk="true">
                  {ring.text.toUpperCase()}
                </tspan>
                {fillsRing && <tspan data-lyrics-separator="true"> · </tspan>}
              </textPath>
            </text>
          );
        })}
      </g>

      <circle
        cx={recordCenterX}
        cy={recordCenterY}
        r={labelRadius + 12 * scale}
        fill={colors.background}
        stroke={colors.foreground}
        strokeWidth={2 * scale}
      />
      {artwork && artworkPlacement ? (
        <image
          href={artwork.objectUrl}
          data-export-href={artwork.objectUrl}
          x={artworkPlacement.x}
          y={artworkPlacement.y}
          width={artworkPlacement.width}
          height={artworkPlacement.height}
          preserveAspectRatio="none"
          clipPath={`url(#${slug}-label-clip)`}
        />
      ) : (
        <circle
          cx={recordCenterX}
          cy={recordCenterY}
          r={labelRadius}
          fill={palette[1]}
        />
      )}
      {settings.showRecordHole !== false && (
        <circle
          data-record-hole="true"
          cx={recordCenterX}
          cy={recordCenterY}
          r={14 * scale}
          fill={colors.background}
          stroke={colors.foreground}
          strokeWidth={2 * scale}
        />
      )}

      {content.subtitle.trim() && (
        <g data-dedication="true">
          <line
            data-dedication-line="top"
            data-line-position={dedicationY - dedicationLineOffset}
            x1={margin}
            x2={margin + dedicationWidth}
            y1={dedicationY - dedicationLineOffset}
            y2={dedicationY - dedicationLineOffset}
            stroke={colors.rule}
            strokeWidth={2 * scale}
          />
          <text
            data-custom-typography="subtitle"
            data-dedication-center={dedicationY}
            x={margin + dedicationWidth / 2}
            y={dedicationY}
            fill={colors.foreground}
            fontFamily={SANS}
            fontSize={dedicationSize}
            fontWeight="500"
            letterSpacing={4 * scale}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {truncateLabel(content.subtitle.toUpperCase(), 72)}
          </text>
          <line
            data-dedication-line="bottom"
            data-line-position={dedicationY + dedicationLineOffset}
            x1={margin}
            x2={margin + dedicationWidth}
            y1={dedicationY + dedicationLineOffset}
            y2={dedicationY + dedicationLineOffset}
            stroke={colors.rule}
            strokeWidth={2 * scale}
          />
        </g>
      )}
      <g
        data-custom-typography="metadata-value"
        fill={colors.muted}
        fontFamily={SANS}
        fontSize={19 * scale * settings.typography.customMetadataScale}
        fontWeight="600"
        letterSpacing={2.5 * scale}
      >
        {content.metadata.slice(0, 2).map((item, index) => (
          <text
            key={item.id}
            data-custom-metadata="optional"
            x={margin + index * dedicationWidth * 0.46}
            y={dedicationY + dedicationLineOffset + 44 * scale}
          >
            {truncateLabel(`${item.label}: ${item.value}`.toUpperCase(), 34)}
          </text>
        ))}
      </g>
      {showCode && (
        <AlbumCodeMark
          x={width - margin - codeSize}
          y={height - margin - codeSize}
          size={codeSize}
          value={codeValue}
          color={colors.foreground}
        />
      )}
    </svg>
  );
}
