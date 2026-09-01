import { formatRuntime, totalRuntime } from '@/lib/domain/duration';
import { normalizePosterLink } from '@/lib/domain/poster-link';
import type { AlbumData } from '@/types/music';
import type { PosterSettings } from '@/types/poster';
import {
  createAlbumCodeMatrix,
  createStylizedQrGeometry,
  createWaveformHeights,
} from './marks';

interface Props {
  album: AlbumData;
  settings: PosterSettings;
  x: number;
  y: number;
  width: number;
  scale: number;
  colors: { ink: string; muted: string; rule: string; paper?: string };
  fontFamily: string;
}

export function PosterFooter({
  album,
  settings,
  x,
  y,
  width,
  scale,
  colors,
  fontFamily,
}: Props) {
  const items = [
    settings.showReleaseDate
      ? { label: 'RELEASE DATE', value: album.releaseDate ?? 'Unbekannt' }
      : null,
    settings.showTotalRuntime
      ? {
          label: 'TOTAL RUNTIME',
          value: formatRuntime(totalRuntime(album.tracks)),
        }
      : null,
  ].filter((item): item is { label: string; value: string } => item !== null);
  const codeSize = 200 * scale;
  const codeX = x + width - codeSize;
  const codeValue = normalizePosterLink(settings.albumCodeUrl);
  const showCode = settings.showAlbumCode && codeValue !== null;
  const { waveformWidth, waveformX } = getFooterMarkLayout(x, width, showCode);

  return (
    <g fontFamily={fontFamily}>
      <line
        x1={x}
        x2={x + width}
        y1={y}
        y2={y}
        stroke={colors.rule}
        strokeWidth={2 * scale}
      />
      {items.map((item, index) => (
        <MetadataItem
          key={item.label}
          x={x + index * Math.min(width * 0.28, 480 * scale)}
          y={y}
          scale={scale}
          label={item.label}
          value={item.value}
          colors={colors}
        />
      ))}
      {settings.showWaveform && (
        <WaveformMark
          x={waveformX}
          y={y + 70 * scale}
          width={waveformWidth}
          height={64 * scale}
          tracks={album.tracks}
          color={colors.ink}
          background={colors.paper ?? '#faf9f5'}
        />
      )}
      {showCode && (
        <AlbumCodeMark
          x={codeX}
          y={y + 22 * scale}
          size={codeSize}
          value={codeValue}
          color={colors.ink}
        />
      )}
    </g>
  );
}

export function getFooterMarkLayout(
  x: number,
  width: number,
  showCode: boolean,
): { waveformX: number; waveformWidth: number } {
  const waveformWidth = showCode ? width * 0.22 : width * 0.3;
  return {
    waveformWidth,
    waveformX: showCode ? x + width * 0.57 : x + width - waveformWidth,
  };
}

function MetadataItem({
  x,
  y,
  scale,
  label,
  value,
  colors,
}: {
  x: number;
  y: number;
  scale: number;
  label: string;
  value: string;
  colors: Props['colors'];
}) {
  return (
    <g>
      <text
        x={x}
        y={y + 38 * scale}
        fill={colors.muted}
        fontSize={17 * scale}
        fontWeight="600"
        letterSpacing={2.3 * scale}
      >
        {label}
      </text>
      <text x={x} y={y + 82 * scale} fill={colors.ink} fontSize={28 * scale}>
        {value}
      </text>
    </g>
  );
}

export function WaveformMark({
  x,
  y,
  width,
  height,
  tracks,
  color,
  background,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  tracks: AlbumData['tracks'];
  color: string;
  background: string;
}) {
  const bars = createWaveformHeights(tracks);
  const iconSize = height * 0.76;
  const barsX = x + iconSize + height * 0.28;
  const barAreaWidth = width - iconSize - height * 0.28;
  const step = barAreaWidth / bars.length;
  return (
    <g data-poster-waveform="true" fill={color}>
      <circle cx={x + iconSize / 2} cy={y} r={iconSize / 2} />
      <circle
        cx={x + iconSize / 2}
        cy={y}
        r={iconSize * 0.16}
        fill={background}
      />
      {bars.map((bar, index) => (
        <rect
          key={index}
          x={barsX + index * step}
          y={y - (height * bar) / 2}
          width={Math.max(2, step * 0.48)}
          height={height * bar}
          rx={step * 0.2}
        />
      ))}
    </g>
  );
}

export function AlbumCodeMark({
  x,
  y,
  size,
  value,
  color,
}: {
  x: number;
  y: number;
  size: number;
  value: string;
  color: string;
}) {
  const matrix = createAlbumCodeMatrix(value);
  const shapes = createStylizedQrGeometry(matrix);
  const quietZone = 4;
  const cell = size / (matrix.length + quietZone * 2);
  return (
    <g
      data-album-code="qr"
      data-background="transparent"
      fill={color}
      role="img"
      aria-label="QR code"
    >
      {shapes.map((shape, index) => (
        <rect
          key={index}
          x={x + (shape.x + quietZone) * cell}
          y={y + (shape.y + quietZone) * cell}
          width={shape.width * cell}
          height={shape.height * cell}
          rx={shape.radius * cell}
        />
      ))}
    </g>
  );
}
