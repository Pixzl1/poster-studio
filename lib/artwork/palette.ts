export const DEFAULT_ARTWORK_PALETTE = [
  '#141820',
  '#2f4b78',
  '#6c4f8f',
  '#bf5f64',
  '#df8a52',
] as const;

interface ColorBucket {
  red: number;
  green: number;
  blue: number;
  count: number;
}

interface PaletteColor {
  red: number;
  green: number;
  blue: number;
  score: number;
  saturation: number;
  lightness: number;
}

export function extractDominantPalette(
  pixels: Uint8ClampedArray,
  colorCount = 5,
): string[] {
  const targetCount = Math.min(8, Math.max(1, Math.round(colorCount)));
  const buckets = new Map<number, ColorBucket>();

  for (let index = 0; index + 3 < pixels.length; index += 4) {
    const alpha = pixels[index + 3];
    if (alpha < 128) continue;

    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const key = (red >> 4) * 256 + (green >> 4) * 16 + (blue >> 4);
    const bucket = buckets.get(key) ?? { red: 0, green: 0, blue: 0, count: 0 };
    bucket.red += red;
    bucket.green += green;
    bucket.blue += blue;
    bucket.count += 1;
    buckets.set(key, bucket);
  }

  const candidates = Array.from(buckets.values())
    .map(toPaletteColor)
    .sort((left, right) => right.score - left.score);
  const chromaticCandidates = candidates.filter(
    (color) =>
      color.saturation >= 0.16 &&
      color.lightness >= 0.06 &&
      color.lightness <= 0.94,
  );
  const candidatePool = [
    ...chromaticCandidates,
    ...candidates.filter(
      (candidate) => !chromaticCandidates.includes(candidate),
    ),
  ];
  const selected: PaletteColor[] = [];

  for (const minimumDistance of [72, 52, 34]) {
    for (const candidate of candidatePool) {
      if (selected.includes(candidate)) continue;
      if (
        selected.every(
          (color) => colorDistance(color, candidate) >= minimumDistance,
        )
      ) {
        selected.push(candidate);
      }
      if (selected.length === targetCount) break;
    }
    if (selected.length === targetCount) break;
  }

  const palette = selected
    .sort((left, right) => luminance(left) - luminance(right))
    .map(toHex);
  return fillPalette(palette, targetCount);
}

export function extractPaletteFromImage(
  image: HTMLImageElement,
  colorCount = 5,
): string[] {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 56;
    canvas.height = 56;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return fillPalette([], colorCount);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return extractDominantPalette(
      context.getImageData(0, 0, canvas.width, canvas.height).data,
      colorCount,
    );
  } catch {
    return fillPalette([], colorCount);
  }
}

function toPaletteColor(bucket: ColorBucket): PaletteColor {
  const red = Math.round(bucket.red / bucket.count);
  const green = Math.round(bucket.green / bucket.count);
  const blue = Math.round(bucket.blue / bucket.count);
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const saturation = maximum === 0 ? 0 : (maximum - minimum) / maximum;
  const lightness = (maximum + minimum) / 510;
  const printableWeight = 0.72 + (1 - Math.abs(lightness - 0.5)) * 0.28;
  return {
    red,
    green,
    blue,
    saturation,
    lightness,
    score: bucket.count * (0.3 + saturation * 1.8) * printableWeight,
  };
}

function colorDistance(left: PaletteColor, right: PaletteColor): number {
  return Math.sqrt(
    (left.red - right.red) ** 2 +
      (left.green - right.green) ** 2 +
      (left.blue - right.blue) ** 2,
  );
}

function luminance(color: PaletteColor): number {
  return color.red * 0.2126 + color.green * 0.7152 + color.blue * 0.0722;
}

function toHex(color: PaletteColor): string {
  return `#${[color.red, color.green, color.blue]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

function fillPalette(palette: string[], colorCount: number): string[] {
  const targetCount = Math.min(8, Math.max(1, Math.round(colorCount)));
  const result = [...palette];
  for (const fallback of DEFAULT_ARTWORK_PALETTE) {
    if (result.length === targetCount) break;
    if (!result.includes(fallback)) result.push(fallback);
  }
  return result.slice(0, targetCount);
}
