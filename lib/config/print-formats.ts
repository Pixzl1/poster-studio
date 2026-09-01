import type {
  PrintFormat,
  PrintFormatId,
  PosterSettings,
} from '@/types/poster';

const makeFormat = (
  id: PrintFormatId,
  name: string,
  widthMm: number,
  heightMm: number,
): PrintFormat => ({
  id,
  name,
  widthMm,
  heightMm,
  aspectRatio: widthMm / heightMm,
});

export const PRINT_FORMATS: Record<PrintFormatId, PrintFormat> = {
  a4: makeFormat('a4', 'A4', 210, 297),
  a3: makeFormat('a3', 'A3', 297, 420),
  '30x40': makeFormat('30x40', '30 × 40 cm', 300, 400),
  '40x50': makeFormat('40x50', '40 × 50 cm', 400, 500),
  '50x70': makeFormat('50x70', '50 × 70 cm', 500, 700),
  letter: makeFormat('letter', 'US Letter', 215.9, 279.4),
};

export const DEFAULT_POSTER_SETTINGS: PosterSettings = {
  template: 'classic',
  format: 'a4',
  marginMm: 16,
  showTracklist: true,
  showDurations: true,
  showReleaseDate: true,
  showTotalRuntime: true,
  showWaveform: true,
  showAlbumCode: true,
  albumCodeUrl: '',
  albumCodePosition: 'right',
  typography: {
    musicTitleScale: 1,
    customTitleScale: 1,
    customSubtitleScale: 1,
    customCreatorScale: 1,
    customDescriptionScale: 1,
    customMetadataScale: 1,
  },
  dpi: 150,
};
