import { describe, expect, it } from 'vitest';
import jsQR from 'jsqr';
import { normalizePosterLink } from '@/lib/domain/poster-link';
import {
  createAlbumCodeMatrix,
  createStylizedQrGeometry,
  type QrModuleShape,
} from '@/templates/classic/marks';
import { getFooterMarkLayout } from '@/templates/classic/PosterFooter';

describe('poster links and QR codes', () => {
  it('accepts only complete web links', () => {
    expect(normalizePosterLink('https://example.com/album')).toBe(
      'https://example.com/album',
    );
    expect(normalizePosterLink('javascript:alert(1)')).toBeNull();
    expect(normalizePosterLink('example.com/album')).toBeNull();
    const exact =
      'https://music.example/listen?album=Midnight%20Echoes&service=custom#track-10';
    expect(normalizePosterLink(`  ${exact}  `)).toBe(exact);
  });

  it('round-trips a long URL without truncating query or fragment data', () => {
    const url =
      'https://music.example/album/midnight-echoes/listen?service=custom&campaign=poster-studio&release=deluxe-edition&track=10#player';
    const matrix = createAlbumCodeMatrix(url);
    const quietZone = 4;
    const scale = 8;
    const size = (matrix.length + quietZone * 2) * scale;
    const pixels = new Uint8ClampedArray(size * size * 4).fill(255);

    matrix.forEach((row, rowIndex) =>
      row.forEach((filled, columnIndex) => {
        if (!filled) return;
        for (let y = 0; y < scale; y += 1) {
          for (let x = 0; x < scale; x += 1) {
            const pixelX = (columnIndex + quietZone) * scale + x;
            const pixelY = (rowIndex + quietZone) * scale + y;
            const offset = (pixelY * size + pixelX) * 4;
            pixels[offset] = 0;
            pixels[offset + 1] = 0;
            pixels[offset + 2] = 0;
          }
        }
      }),
    );

    expect(jsQR(pixels, size, size)?.data).toBe(url);
  });

  it('creates a standards-based square QR matrix', () => {
    const matrix = createAlbumCodeMatrix('https://example.com/album');
    expect(matrix.length).toBeGreaterThanOrEqual(21);
    expect(matrix.every((row) => row.length === matrix.length)).toBe(true);
    expect(matrix[0]?.[0]).toBe(true);
  });

  it('keeps the organic pill-module QR style machine-readable', () => {
    const url =
      'https://music.example/album/midnight-echoes?service=preferred&campaign=poster#player';
    const matrix = createAlbumCodeMatrix(url);
    const quietZone = 4;
    const scale = 14;
    const size = (matrix.length + quietZone * 2) * scale;
    const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
    const shapes = createStylizedQrGeometry(matrix);

    shapes.forEach((shape) => drawShape(pixels, size, scale, quietZone, shape));

    expect(jsQR(pixels, size, size)?.data).toBe(url);
  });

  it('right-aligns and widens the waveform when the QR code is hidden', () => {
    const layout = getFooterMarkLayout(100, 1000, false);
    expect(layout.waveformWidth).toBe(300);
    expect(layout.waveformX + layout.waveformWidth).toBe(1100);
    expect(getFooterMarkLayout(100, 1000, true).waveformWidth).toBe(220);
  });
});

function drawShape(
  pixels: Uint8ClampedArray,
  imageSize: number,
  scale: number,
  quietZone: number,
  shape: QrModuleShape,
) {
  const left = (quietZone + shape.x) * scale;
  const top = (quietZone + shape.y) * scale;
  const width = shape.width * scale;
  const height = shape.height * scale;
  const radius = Math.min(shape.radius * scale, width / 2, height / 2);
  const right = left + width;
  const bottom = top + height;

  for (let pixelY = Math.floor(top); pixelY < Math.ceil(bottom); pixelY += 1) {
    for (
      let pixelX = Math.floor(left);
      pixelX < Math.ceil(right);
      pixelX += 1
    ) {
      const centerX = pixelX + 0.5;
      const centerY = pixelY + 0.5;
      const nearestX = Math.max(
        left + radius,
        Math.min(centerX, right - radius),
      );
      const nearestY = Math.max(
        top + radius,
        Math.min(centerY, bottom - radius),
      );
      const inside =
        radius === 0 ||
        Math.hypot(centerX - nearestX, centerY - nearestY) <= radius;
      if (!inside) continue;
      const offset = (pixelY * imageSize + pixelX) * 4;
      pixels[offset] = 0;
      pixels[offset + 1] = 0;
      pixels[offset + 2] = 0;
    }
  }
}
