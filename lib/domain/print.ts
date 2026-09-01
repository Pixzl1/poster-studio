export const MM_PER_INCH = 25.4;
export function mmToPixels(mm: number, dpi: number): number {
  return Math.round((mm / MM_PER_INCH) * dpi);
}
export function mmToPoints(mm: number): number {
  return (mm / MM_PER_INCH) * 72;
}
export function pixelDimensions(
  widthMm: number,
  heightMm: number,
  dpi: number,
) {
  return { width: mmToPixels(widthMm, dpi), height: mmToPixels(heightMm, dpi) };
}
