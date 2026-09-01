import { PRINT_FORMATS } from '@/lib/config/print-formats';
import { pixelDimensions } from '@/lib/domain/print';
import { ExportError } from '@/lib/export/errors';
import type { PosterSettings } from '@/types/poster';

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function serializeSvg(
  source: SVGSVGElement,
  width: number,
  height: number,
  artworkFile: File,
): Promise<string> {
  const clone = source.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  const images = Array.from(clone.querySelectorAll('image'));
  const artworkDataUrl = await blobToDataUrl(artworkFile).catch(() => {
    throw new ExportError(
      'Das hochgeladene Bild konnte nicht für den Export vorbereitet werden.',
    );
  });
  await Promise.all(
    images.map(async (image) => {
      const href =
        image.getAttribute('data-export-href') ?? image.getAttribute('href');
      if (!href || href.startsWith('data:')) return;
      image.setAttribute('href', artworkDataUrl);
      image.removeAttribute('data-export-href');
    }),
  );
  return new XMLSerializer().serializeToString(clone);
}

export async function renderPosterPng(
  svg: SVGSVGElement,
  settings: PosterSettings,
  artworkFile: File,
): Promise<Blob> {
  await document.fonts.ready;
  const format = PRINT_FORMATS[settings.format];
  const dimensions = pixelDimensions(
    format.widthMm,
    format.heightMm,
    settings.dpi,
  );
  if (dimensions.width * dimensions.height > 55_000_000)
    throw new ExportError(
      'Die gewählte Kombination aus Format und DPI ist für diesen Browser zu groß. Bitte wähle 150 DPI oder ein kleineres Format.',
    );
  const markup = await serializeSvg(
    svg,
    dimensions.width,
    dimensions.height,
    artworkFile,
  );
  const url = URL.createObjectURL(
    new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }),
  );
  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext('2d');
    if (!context)
      throw new ExportError(
        'Dein Browser unterstützt den benötigten Bildexport nicht.',
      );
    context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(
                new ExportError(
                  'Der Browser konnte die PNG-Datei nicht erzeugen.',
                ),
              ),
        'image/png',
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new ExportError(
          'Das Poster konnte nicht für den Export gerendert werden.',
        ),
      );
    image.src = url;
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
