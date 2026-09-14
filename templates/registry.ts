import { BloomTemplate } from './bloom/BloomTemplate';
import { ClassicTemplate } from './classic/ClassicTemplate';
import { ChromaticIndexTemplate } from './chromatic-index/ChromaticIndexTemplate';
import { GalleryTemplate } from './gallery/GalleryTemplate';
import { MonoTemplate } from './mono/MonoTemplate';
import { NoirTemplate } from './noir/NoirTemplate';
import { OnyxTemplate } from './onyx/OnyxTemplate';
import { PaperTemplate } from './paper/PaperTemplate';
import { SandTemplate } from './sand/SandTemplate';
import { EditorialDarkTemplate } from './editorial-dark/EditorialDarkTemplate';
import { EditorialWhiteTemplate } from './editorial-white/EditorialWhiteTemplate';
import { LyricsRecordDarkTemplate } from './lyrics-record/LyricsRecordDarkTemplate';
import { LyricsRecordLightTemplate } from './lyrics-record/LyricsRecordLightTemplate';
import type {
  CustomPosterTemplateDefinition,
  PosterTemplateDefinition,
} from './types';
export const MUSIC_POSTER_TEMPLATES = {
  classic: { id: 'classic', name: 'Classic', component: ClassicTemplate },
  'chromatic-index': {
    id: 'chromatic-index',
    name: 'Chromatic Index',
    component: ChromaticIndexTemplate,
  },
  gallery: { id: 'gallery', name: 'Gallery', component: GalleryTemplate },
  sand: { id: 'sand', name: 'Sand', component: SandTemplate },
  paper: { id: 'paper', name: 'Paper', component: PaperTemplate },
  onyx: { id: 'onyx', name: 'Onyx', component: OnyxTemplate },
  noir: { id: 'noir', name: 'Noir', component: NoirTemplate },
  mono: { id: 'mono', name: 'Mono', component: MonoTemplate },
  bloom: { id: 'bloom', name: 'Bloom', component: BloomTemplate },
} satisfies Record<string, PosterTemplateDefinition>;

export const CUSTOM_POSTER_TEMPLATES = {
  'editorial-dark': {
    id: 'editorial-dark',
    name: 'Editorial Dark',
    component: EditorialDarkTemplate,
  },
  'editorial-white': {
    id: 'editorial-white',
    name: 'Editorial White',
    component: EditorialWhiteTemplate,
  },
  'lyrics-record-light': {
    id: 'lyrics-record-light',
    name: 'Lyrics Record Light',
    component: LyricsRecordLightTemplate,
  },
  'lyrics-record-dark': {
    id: 'lyrics-record-dark',
    name: 'Lyrics Record Dark',
    component: LyricsRecordDarkTemplate,
  },
} satisfies Record<string, CustomPosterTemplateDefinition>;

export const POSTER_TEMPLATES = {
  ...MUSIC_POSTER_TEMPLATES,
  ...CUSTOM_POSTER_TEMPLATES,
};

export function isCustomPosterTemplateId(
  value: string,
): value is keyof typeof CUSTOM_POSTER_TEMPLATES {
  return Object.hasOwn(CUSTOM_POSTER_TEMPLATES, value);
}
