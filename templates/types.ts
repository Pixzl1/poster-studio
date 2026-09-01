import type { ComponentType, SVGProps } from 'react';
import type { AlbumData } from '@/types/music';
import type {
  ArtworkSettings,
  CustomPosterContent,
  PosterSettings,
  PosterTemplateId,
  UserArtwork,
} from '@/types/poster';
export interface PosterTemplateProps extends SVGProps<SVGSVGElement> {
  album: AlbumData;
  artwork: UserArtwork | null;
  artworkSettings: ArtworkSettings;
  settings: PosterSettings;
}

export interface CustomPosterTemplateProps extends SVGProps<SVGSVGElement> {
  content: CustomPosterContent;
  artwork: UserArtwork | null;
  artworkSettings: ArtworkSettings;
  settings: PosterSettings;
}
export interface PosterTemplateDefinition {
  id: PosterTemplateId;
  name: string;
  component: ComponentType<PosterTemplateProps>;
}

export interface CustomPosterTemplateDefinition {
  id: PosterTemplateId;
  name: string;
  component: ComponentType<CustomPosterTemplateProps>;
}
