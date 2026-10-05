import { PRINT_FORMATS } from '@/lib/config/print-formats';
import { mmToPoints } from '@/lib/domain/print';
import type { PosterSettings } from '@/types/poster';
import { renderPosterPng } from './png';
export async function renderPosterPdf(
  svg: SVGSVGElement,
  settings: PosterSettings,
  artworkFile: File,
): Promise<Blob> {
  const png = await renderPosterPng(svg, settings, artworkFile);
  return renderPosterPdfFromPng(png, settings);
}

export async function renderPosterPdfFromPng(
  png: Blob,
  settings: PosterSettings,
): Promise<Blob> {
  const { PDFDocument } = await import('pdf-lib');
  const document = await PDFDocument.create();
  const format = PRINT_FORMATS[settings.format];
  const width = mmToPoints(format.widthMm);
  const height = mmToPoints(format.heightMm);
  const page = document.addPage([width, height]);
  const image = await document.embedPng(await png.arrayBuffer());
  page.drawImage(image, { x: 0, y: 0, width, height });
  const bytes = await document.save({ useObjectStreams: true });
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}
