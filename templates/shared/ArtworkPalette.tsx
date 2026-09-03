import { normalizeArtworkPalette } from '@/lib/artwork/palette';

interface ArtworkPaletteProps {
  palette?: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  gap: number;
}

/** Native SVG swatches stay identical in the preview and print exports. */
export function ArtworkPalette({
  palette,
  x,
  y,
  width,
  height,
  gap,
}: ArtworkPaletteProps) {
  const colors = normalizeArtworkPalette(palette);
  const swatchWidth = (width - gap * (colors.length - 1)) / colors.length;

  return (
    <g data-artwork-palette={colors.join(',')}>
      {colors.map((color, index) => (
        <rect
          key={`${color}-${index}`}
          x={x + index * (swatchWidth + gap)}
          y={y}
          width={swatchWidth}
          height={height}
          fill={color}
        />
      ))}
    </g>
  );
}
