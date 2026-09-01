import { z } from 'zod';
import { posterSettingsSchema } from '@/lib/domain/poster-settings';

const trackSchema = z.object({
  id: z.string().min(1),
  position: z.number().int().positive(),
  title: z.string().trim().min(1).max(240),
  durationMs: z.number().nonnegative().nullable(),
});

const artworkSettingsSchema = z.object({
  scale: z.number().min(1).max(4),
  positionX: z.number().min(-100).max(100),
  positionY: z.number().min(-100).max(100),
  fitMode: z.enum(['fit', 'fill']),
});

export const musicPosterContentSchema = z.object({
  albumId: z.string().nullable(),
  title: z.string().max(240),
  artist: z.string().max(240),
  subtitle: z.string().max(240),
  year: z.number().int().min(1000).max(9999).nullable(),
  releaseDate: z.string().nullable(),
  tracks: z.array(trackSchema).max(250),
  isExplicit: z.boolean(),
});

export const customPosterContentSchema = z.object({
  title: z.string().max(240),
  subtitle: z.string().max(240),
  category: z.string().max(120),
  creator: z.string().max(240),
  year: z.string().max(40),
  description: z.string().max(2000),
  metadata: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().max(80),
        value: z.string().max(240),
      }),
    )
    .max(12),
});

const shared = {
  artwork: z.unknown().nullable(),
  artworkSettings: artworkSettingsSchema,
  settings: posterSettingsSchema,
};

export const posterProjectSchema = z
  .discriminatedUnion('mode', [
    z.object({
      ...shared,
      mode: z.literal('music'),
      metadataSource: z.enum(['musicbrainz', 'manual']),
      content: musicPosterContentSchema,
    }),
    z.object({
      ...shared,
      mode: z.literal('custom'),
      content: customPosterContentSchema,
    }),
  ])
  .refine(
    (project) =>
      project.mode === 'custom'
        ? ['editorial-dark', 'editorial-white'].includes(
            project.settings.template,
          )
        : !['editorial-dark', 'editorial-white'].includes(
            project.settings.template,
          ),
    { message: 'The selected template does not support this poster mode.' },
  );
