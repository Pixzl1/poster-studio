import type { Track } from '@/types/music';
import { create as createQrCode } from 'qrcode';

export function createWaveformHeights(
  tracks: Track[],
  barCount = 31,
): number[] {
  const source = tracks.length > 0 ? tracks : [{ id: 'album', durationMs: 0 }];
  return Array.from({ length: barCount }, (_, index) => {
    const track = source[index % source.length];
    const duration = track.durationMs ?? 0;
    const idSeed = [...track.id].reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    );
    return 0.25 + ((duration / 1000 + idSeed + index * 17) % 75) / 100;
  });
}

export function createAlbumCodeMatrix(value: string): boolean[][] {
  const modules = createQrCode(value, { errorCorrectionLevel: 'M' }).modules;
  return Array.from({ length: modules.size }, (_, row) =>
    Array.from(
      { length: modules.size },
      (_, column) => modules.data[row * modules.size + column] === 1,
    ),
  );
}

export interface QrModuleShape {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

export function createStylizedQrGeometry(matrix: boolean[][]): QrModuleShape[] {
  const size = matrix.length;
  const shapes: QrModuleShape[] = [];
  const finderOrigins = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ] as const;

  for (const [finderX, finderY] of finderOrigins) {
    shapes.push(
      { x: finderX, y: finderY, width: 7, height: 1, radius: 0 },
      { x: finderX, y: finderY + 6, width: 7, height: 1, radius: 0 },
      { x: finderX, y: finderY + 1, width: 1, height: 5, radius: 0 },
      {
        x: finderX + 6,
        y: finderY + 1,
        width: 1,
        height: 5,
        radius: 0,
      },
      { x: finderX + 2, y: finderY + 2, width: 3, height: 3, radius: 0 },
    );
  }

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (!matrix[row]?.[column] || isFinderCell(row, column, size)) continue;
      shapes.push({
        x: column + 0.03,
        y: row + 0.03,
        width: 0.94,
        height: 0.94,
        radius: 0.47,
      });
      const joinsNextModule =
        matrix[row + 1]?.[column] === true &&
        !isFinderCell(row + 1, column, size) &&
        (row + column) % 3 === 0;
      if (joinsNextModule) {
        shapes.push({
          x: column + 0.03,
          y: row + 0.5,
          width: 0.94,
          height: 1,
          radius: 0.47,
        });
      }
    }
  }

  return shapes;
}

function isFinderCell(row: number, column: number, size: number): boolean {
  return (
    (row < 7 && column < 7) ||
    (row < 7 && column >= size - 7) ||
    (row >= size - 7 && column < 7)
  );
}
