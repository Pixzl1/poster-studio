export const PRINT_FORMAT_IDS = [
  'a4',
  'a3',
  '30x40',
  '40x50',
  '50x70',
  'letter',
] as const;
export type PrintFormatId = (typeof PRINT_FORMAT_IDS)[number];
export const POSTER_TEMPLATE_IDS = [
  'classic',
  'gallery',
  'sand',
  'paper',
  'onyx',
  'noir',
  'mono',
  'bloom',
  'editorial-dark',
  'editorial-white',
] as const;
export type PosterTemplateId = (typeof POSTER_TEMPLATE_IDS)[number];
export type PosterDpi = 150 | 300;
export const QR_CODE_POSITIONS = ['left', 'center', 'right'] as const;
export type QrCodePosition = (typeof QR_CODE_POSITIONS)[number];

export function isPrintFormatId(value: string): value is PrintFormatId {
  return PRINT_FORMAT_IDS.some((formatId) => formatId === value);
}

export function isPosterDpi(value: number): value is PosterDpi {
  return value === 150 || value === 300;
}

export interface PrintFormat {
  id: PrintFormatId;
  name: string;
  widthMm: number;
  heightMm: number;
  aspectRatio: number;
}

export interface PosterSettings {
  template: PosterTemplateId;
  format: PrintFormatId;
  marginMm: number;
  showTracklist: boolean;
  showDurations: boolean;
  showReleaseDate: boolean;
  showTotalRuntime: boolean;
  showWaveform: boolean;
  showAlbumCode: boolean;
  albumCodeUrl: string;
  albumCodePosition: QrCodePosition;
  typography: PosterTypographySettings;
  dpi: PosterDpi;
}

export interface PosterTypographySettings {
  musicTitleScale: number;
  customTitleScale: number;
  customSubtitleScale: number;
  customCreatorScale: number;
  customDescriptionScale: number;
  customMetadataScale: number;
}

export type PosterMode = 'music' | 'custom';
export type ArtworkFitMode = 'fit' | 'fill';

export interface ArtworkSettings {
  scale: number;
  positionX: number;
  positionY: number;
  fitMode: ArtworkFitMode;
}

export interface UserArtwork {
  file: File;
  objectUrl: string;
  width: number;
  height: number;
  mimeType: string;
  fileName: string;
  sizeBytes: number;
}

export interface MusicPosterContent {
  albumId: string | null;
  title: string;
  artist: string;
  subtitle: string;
  year: number | null;
  releaseDate: string | null;
  tracks: import('./music').Track[];
  isExplicit: boolean;
}

export interface CustomMetadataRow {
  id: string;
  label: string;
  value: string;
}

export interface CustomPosterContent {
  title: string;
  subtitle: string;
  category: string;
  creator: string;
  year: string;
  description: string;
  metadata: CustomMetadataRow[];
}

interface PosterProjectBase {
  artwork: UserArtwork | null;
  artworkSettings: ArtworkSettings;
  settings: PosterSettings;
}

export interface MusicPosterProject extends PosterProjectBase {
  mode: 'music';
  metadataSource: 'musicbrainz' | 'manual';
  content: MusicPosterContent;
}

export interface CustomPosterProject extends PosterProjectBase {
  mode: 'custom';
  content: CustomPosterContent;
}

export type PosterProject = MusicPosterProject | CustomPosterProject;
