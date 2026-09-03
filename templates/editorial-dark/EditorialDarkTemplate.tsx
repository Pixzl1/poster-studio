import { PRINT_FORMATS } from '@/lib/config/print-formats';
import { normalizePosterLink } from '@/lib/domain/poster-link';
import { wrapText } from '@/lib/domain/text-layout';
import { AlbumCodeMark } from '@/templates/classic/PosterFooter';
import { getPosterScale, truncateLabel } from '@/templates/classic/layout';
import { ArtworkPalette } from '@/templates/shared/ArtworkPalette';
import { PosterArtwork, SANS } from '@/templates/shared/elements';
import type { CustomPosterTemplateProps } from '@/templates/types';

const COLORS = {
  background: '#111210',
  foreground: '#f4f2ec',
  muted: '#aaa9a2',
  accent: '#c06b48',
  rule: '#353632',
};

export function EditorialDarkTemplate(props: CustomPosterTemplateProps) {
  return (
    <EditorialComposition
      {...props}
      colors={COLORS}
      templateName="Editorial Dark"
    />
  );
}

export function EditorialComposition({
  content,
  artwork,
  artworkSettings,
  settings,
  colors,
  templateName,
  ...props
}: CustomPosterTemplateProps & {
  colors: typeof COLORS;
  templateName: string;
}) {
  const format = PRINT_FORMATS[settings.format];
  const width = format.widthMm * 10;
  const height = format.heightMm * 10;
  const margin = settings.marginMm * 10;
  const scale = getPosterScale(width);
  const contentWidth = width - margin * 2;
  const artworkHeight = Math.min(contentWidth * 0.9, height * 0.53);
  const titleSize =
    Math.max(
      70 * scale,
      Math.min(138 * scale, (150 - content.title.length * 1.15) * scale),
    ) * settings.typography.customTitleScale;
  const titleCharacters = Math.max(
    8,
    Math.floor(contentWidth / (titleSize * 0.54)),
  );
  const titleY =
    margin + artworkHeight + Math.max(160 * scale, titleSize * 1.15);
  const paletteY = titleY + Math.max(54 * scale, titleSize * 0.35);
  const paletteHeight = 34 * scale;
  const showPalette = settings.showArtworkPalette !== false;
  const metadataY = height - margin - 150 * scale;
  const hasSubtitle = Boolean(content.subtitle.trim());
  const hasCreator = Boolean(content.creator.trim());
  const subtitleFontSize = 36 * scale * settings.typography.customSubtitleScale;
  const creatorFontSize = 28 * scale * settings.typography.customCreatorScale;
  const metadataLabelSize =
    17 * scale * settings.typography.customMetadataScale;
  const metadataValueSize =
    25 * scale * settings.typography.customMetadataScale;
  const yearFontSize = 30 * scale * settings.typography.customMetadataScale;
  const subtitleY = showPalette
    ? paletteY + paletteHeight + Math.max(76 * scale, subtitleFontSize * 1.4)
    : titleY + Math.max(78 * scale, titleSize * 0.72, subtitleFontSize * 1.4);
  const creatorY =
    subtitleY +
    (hasSubtitle ? Math.max(52 * scale, subtitleFontSize * 1.4) : 0);
  const yearY = hasCreator ? creatorY : subtitleY;
  const textBottomY = hasCreator
    ? creatorY + creatorFontSize * 0.3
    : hasSubtitle
      ? subtitleY + subtitleFontSize * 0.3
      : showPalette
        ? paletteY + paletteHeight
        : titleY;
  const detailsBottomY = Math.max(
    textBottomY,
    content.year.trim() ? yearY + yearFontSize * 0.3 : 0,
  );
  const descriptionY = detailsBottomY + 90 * scale;
  const descriptionFontSize =
    30 * scale * settings.typography.customDescriptionScale;
  const descriptionLineHeight =
    48 * scale * settings.typography.customDescriptionScale;
  const maxDescriptionCharacters = Math.max(
    32,
    Math.floor(contentWidth / (descriptionFontSize * 0.62)),
  );
  const maxDescriptionLines = Math.max(
    1,
    Math.floor(
      (metadataY - descriptionY - 105 * scale) / descriptionLineHeight,
    ),
  );
  const descriptionLines = wrapText(
    content.description,
    maxDescriptionCharacters,
  ).slice(0, maxDescriptionLines);
  const templateSlug = templateName.toLowerCase().replaceAll(' ', '-');
  const descriptionClipId = `${templateSlug}-description-clip`;
  const descriptionHeight = Math.max(0, metadataY - descriptionY - 82 * scale);
  const codeValue = normalizePosterLink(settings.albumCodeUrl);
  const showCode = settings.showAlbumCode && codeValue !== null;
  const codeSize = 175 * scale;
  const metadataWidth = showCode
    ? contentWidth - codeSize - 48 * scale
    : contentWidth;
  const metadataItems = [
    ...(content.category
      ? [{ id: 'category', label: 'CATEGORY', value: content.category }]
      : []),
    ...content.metadata.slice(0, 3),
  ];
  const metadataColumnWidth = metadataWidth / Math.max(1, metadataItems.length);
  const metadataLabelCharacters = Math.max(
    5,
    Math.floor(
      metadataColumnWidth /
        (metadataLabelSize * 0.66 +
          3 * scale * settings.typography.customMetadataScale),
    ),
  );
  const metadataValueCharacters = Math.max(
    6,
    Math.floor(metadataColumnWidth / (metadataValueSize * 0.58)),
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${content.title || 'Custom'} ${templateName} Poster`}
      {...props}
    >
      <defs>
        <clipPath id={descriptionClipId}>
          <rect
            x={margin}
            y={descriptionY - descriptionFontSize}
            width={contentWidth}
            height={descriptionHeight + descriptionFontSize}
          />
        </clipPath>
      </defs>
      <rect width={width} height={height} fill={colors.background} />
      <PosterArtwork
        artwork={artwork}
        settings={artworkSettings}
        x={margin}
        y={margin}
        width={contentWidth}
        height={artworkHeight}
        filterId={`${templateSlug}-artwork`}
        placeholder={colors.background === '#ffffff' ? '#ecece8' : '#242521'}
      />
      <text
        data-custom-typography="title"
        x={margin}
        y={titleY}
        fill={colors.foreground}
        fontFamily={SANS}
        fontSize={titleSize}
        fontWeight="700"
        letterSpacing={-titleSize * 0.035}
      >
        {truncateLabel(content.title || 'UNTITLED', titleCharacters)}
      </text>
      {showPalette && (
        <ArtworkPalette
          palette={artwork?.palette}
          x={margin}
          y={paletteY}
          width={contentWidth * 0.68}
          height={paletteHeight}
          gap={12 * scale}
        />
      )}
      {hasSubtitle && (
        <text
          data-custom-typography="subtitle"
          x={margin}
          y={subtitleY}
          fill={colors.muted}
          fontFamily={SANS}
          fontSize={subtitleFontSize}
        >
          {truncateLabel(content.subtitle, 64)}
        </text>
      )}
      {hasCreator && (
        <text
          data-custom-typography="creator"
          x={margin}
          y={creatorY}
          fill={colors.foreground}
          fontFamily={SANS}
          fontSize={creatorFontSize}
          fontWeight="600"
          letterSpacing={1.2 * scale}
        >
          {truncateLabel(content.creator, 72)}
        </text>
      )}
      {content.year.trim() && (
        <text
          data-custom-typography="year"
          x={width - margin}
          y={yearY}
          fill={colors.foreground}
          fontFamily={SANS}
          fontSize={yearFontSize}
          textAnchor="end"
        >
          {content.year}
        </text>
      )}
      {content.description && (
        <g clipPath={`url(#${descriptionClipId})`}>
          <text
            data-custom-description="true"
            data-custom-typography="description"
            x={margin}
            y={descriptionY}
            fill={colors.muted}
            fontFamily={SANS}
            fontSize={descriptionFontSize}
          >
            {descriptionLines.map((line, index) => (
              <tspan
                key={line + index}
                x={margin}
                dy={index === 0 ? 0 : descriptionLineHeight}
              >
                {line || '\u00a0'}
              </tspan>
            ))}
          </text>
        </g>
      )}
      <line
        x1={margin}
        x2={width - margin}
        y1={metadataY - 62 * scale}
        y2={metadataY - 62 * scale}
        stroke={colors.rule}
        strokeWidth={2 * scale}
      />
      <g fontFamily={SANS}>
        {metadataItems.map((item, index) => (
          <g
            key={item.id}
            data-custom-metadata={
              item.id === 'category' ? 'category' : 'optional'
            }
            transform={`translate(${margin + index * metadataColumnWidth} ${metadataY})`}
          >
            <text
              data-custom-typography="metadata-label"
              fill={colors.muted}
              fontSize={metadataLabelSize}
              fontWeight="600"
              letterSpacing={
                3 * scale * settings.typography.customMetadataScale
              }
            >
              {truncateLabel(item.label.toUpperCase(), metadataLabelCharacters)}
            </text>
            <text
              data-custom-typography="metadata-value"
              y={Math.max(43 * scale, metadataValueSize * 1.55)}
              fill={colors.foreground}
              fontSize={metadataValueSize}
            >
              {truncateLabel(item.value, metadataValueCharacters)}
            </text>
          </g>
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
