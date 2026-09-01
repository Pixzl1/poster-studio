import { formatDuration } from '@/lib/domain/duration';
import { getTrackLayout, truncateLabel } from '@/templates/classic/layout';
import type { AlbumData } from '@/types/music';
import type {
  ArtworkSettings,
  PosterSettings,
  UserArtwork,
} from '@/types/poster';

export const SANS = 'Arial, Helvetica, sans-serif';

export function PosterBackdrop({
  artwork,
  x,
  y,
  width,
  height,
  filterId,
  overlay = '#ffffff',
  overlayOpacity = 0.76,
  grayscale = false,
}: {
  artwork: UserArtwork | null;
  x: number;
  y: number;
  width: number;
  height: number;
  filterId: string;
  overlay?: string;
  overlayOpacity?: number;
  grayscale?: boolean;
}) {
  if (!artwork) return null;
  const placement = getArtworkPlacement(
    artwork,
    { scale: 1.12, positionX: 0, positionY: 0, fitMode: 'fill' },
    x,
    y,
    width,
    height,
  );
  return (
    <>
      <defs>
        <clipPath id={`${filterId}-clip`}>
          <rect x={x} y={y} width={width} height={height} />
        </clipPath>
        <filter
          id={`${filterId}-blur`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          {grayscale && <feColorMatrix type="saturate" values="0" />}
          <feGaussianBlur stdDeviation={Math.min(width, height) * 0.035} />
        </filter>
      </defs>
      <g clipPath={`url(#${filterId}-clip)`}>
        <image
          href={artwork.objectUrl}
          data-export-href={artwork.objectUrl}
          x={placement.x}
          y={placement.y}
          width={placement.width}
          height={placement.height}
          preserveAspectRatio="none"
          filter={`url(#${filterId}-blur)`}
        />
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={overlay}
          opacity={overlayOpacity}
        />
      </g>
    </>
  );
}

export function PosterArtwork({
  artwork,
  settings,
  x,
  y,
  width,
  height,
  filterId,
  grayscale = false,
  placeholder = '#deddd7',
}: {
  artwork: UserArtwork | null;
  settings: ArtworkSettings;
  x: number;
  y: number;
  width: number;
  height: number;
  filterId: string;
  grayscale?: boolean;
  placeholder?: string;
}) {
  const placement = artwork
    ? getArtworkPlacement(artwork, settings, x, y, width, height)
    : null;
  return (
    <>
      <defs>
        <clipPath id={`${filterId}-clip`}>
          <rect x={x} y={y} width={width} height={height} />
        </clipPath>
        <filter
          id={`${filterId}-backdrop`}
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          {grayscale && <feColorMatrix type="saturate" values="0" />}
          <feGaussianBlur stdDeviation={Math.min(width, height) * 0.025} />
        </filter>
        {grayscale && (
          <filter
            id={`${filterId}-foreground`}
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix type="saturate" values="0" />
          </filter>
        )}
      </defs>
      {artwork && placement ? (
        <g clipPath={`url(#${filterId}-clip)`}>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={placeholder}
            opacity="0.16"
          />
          <image
            href={artwork.objectUrl}
            data-export-href={artwork.objectUrl}
            x={placement.x}
            y={placement.y}
            width={placement.width}
            height={placement.height}
            preserveAspectRatio="none"
            filter={grayscale ? `url(#${filterId}-foreground)` : undefined}
          />
        </g>
      ) : (
        <g>
          <rect x={x} y={y} width={width} height={height} fill={placeholder} />
          <circle
            cx={x + width / 2}
            cy={y + height / 2}
            r={Math.min(width, height) * 0.2}
            fill="none"
            stroke="#888780"
            strokeWidth={Math.min(width, height) * 0.012}
          />
          <circle
            cx={x + width / 2}
            cy={y + height / 2}
            r={Math.min(width, height) * 0.04}
            fill="#888780"
          />
        </g>
      )}
    </>
  );
}

export function getArtworkPlacement(
  artwork: Pick<UserArtwork, 'width' | 'height'>,
  settings: ArtworkSettings,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const fitScale = Math.min(width / artwork.width, height / artwork.height);
  const fillScale = Math.max(width / artwork.width, height / artwork.height);
  const baseScale = settings.fitMode === 'fill' ? fillScale : fitScale;
  const renderedWidth = artwork.width * baseScale * settings.scale;
  const renderedHeight = artwork.height * baseScale * settings.scale;
  const travelX = Math.max(0, renderedWidth - width) / 2;
  const travelY = Math.max(0, renderedHeight - height) / 2;
  return {
    x: x + (width - renderedWidth) / 2 + (settings.positionX / 100) * travelX,
    y: y + (height - renderedHeight) / 2 + (settings.positionY / 100) * travelY,
    width: renderedWidth,
    height: renderedHeight,
  };
}

export function TrackList({
  album,
  settings,
  x,
  y,
  width,
  height,
  scale,
  ink,
  muted,
  numberColor = muted,
  columns,
  fontFamily = SANS,
}: {
  album: AlbumData;
  settings: PosterSettings;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  ink: string;
  muted: string;
  numberColor?: string;
  columns?: number;
  fontFamily?: string;
}) {
  if (!settings.showTracklist) return null;
  const automatic = getTrackLayout(album.tracks.length, height, scale);
  const columnCount = columns ?? automatic.columns;
  const rows = Math.max(1, Math.ceil(album.tracks.length / columnCount));
  const lineHeight = Math.min(48 * scale, height / rows);
  const fontSize = Math.max(
    14 * scale,
    Math.min(29 * scale, lineHeight * 0.62),
  );
  const gap = 50 * scale;
  const columnWidth = (width - gap * (columnCount - 1)) / columnCount;

  return album.tracks.map((track, index) => {
    const column = Math.floor(index / rows);
    const row = index % rows;
    const trackX = x + column * (columnWidth + gap);
    const trackY = y + row * lineHeight;
    const titleLength = Math.max(
      6,
      Math.floor(
        (columnWidth - (settings.showDurations ? 122 : 32) * scale) /
          (fontSize * 0.54),
      ),
    );
    return (
      <g key={track.id} fontFamily={fontFamily} fontSize={fontSize}>
        <text
          x={trackX}
          y={trackY}
          fill={numberColor}
          fontWeight="600"
          fontVariant="tabular-nums"
        >
          {String(track.position).padStart(2, '0')}
        </text>
        <text x={trackX + 48 * scale} y={trackY} fill={ink}>
          {truncateLabel(track.title, titleLength)}
        </text>
        {settings.showDurations && (
          <text
            x={trackX + columnWidth}
            y={trackY}
            fill={muted}
            textAnchor="end"
            fontVariant="tabular-nums"
          >
            {formatDuration(track.durationMs)}
          </text>
        )}
      </g>
    );
  });
}
