import { z } from 'zod';
import {
  POSTER_TEMPLATE_IDS,
  PRINT_FORMAT_IDS,
  QR_CODE_POSITIONS,
  type PosterSettings,
} from '@/types/poster';
export const posterSettingsSchema = z.object({
  template: z.enum(POSTER_TEMPLATE_IDS),
  format: z.enum(PRINT_FORMAT_IDS),
  marginMm: z.number().min(6).max(30),
  showTracklist: z.boolean(),
  showDurations: z.boolean(),
  showReleaseDate: z.boolean(),
  showTotalRuntime: z.boolean(),
  showWaveform: z.boolean(),
  showArtworkPalette: z.boolean().default(true),
  showAlbumCode: z.boolean(),
  albumCodeUrl: z.string().max(2048),
  albumCodePosition: z.enum(QR_CODE_POSITIONS),
  typography: z.object({
    musicTitleScale: z.number().min(0.6).max(1.5),
    customTitleScale: z.number().min(0.6).max(1.5),
    customSubtitleScale: z.number().min(0.6).max(1.5),
    customCreatorScale: z.number().min(0.6).max(1.5),
    customDescriptionScale: z.number().min(0.6).max(1.5),
    customMetadataScale: z.number().min(0.6).max(1.5),
  }),
  dpi: z.union([z.literal(150), z.literal(300)]),
});
export function validatePosterSettings(value: unknown): PosterSettings {
  return posterSettingsSchema.parse(value);
}
