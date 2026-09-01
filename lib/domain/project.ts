import { DEFAULT_POSTER_SETTINGS } from '@/lib/config/print-formats';
import type {
  ArtworkSettings,
  CustomPosterProject,
  MusicPosterProject,
  PosterMode,
  PosterProject,
  UserArtwork,
} from '@/types/poster';

export const DEFAULT_ARTWORK_SETTINGS: ArtworkSettings = {
  scale: 1,
  positionX: 0,
  positionY: 0,
  fitMode: 'fit',
};

export function createMusicProject(): MusicPosterProject {
  return {
    mode: 'music',
    artwork: null,
    artworkSettings: { ...DEFAULT_ARTWORK_SETTINGS },
    settings: { ...DEFAULT_POSTER_SETTINGS, template: 'classic' },
    metadataSource: 'manual',
    content: {
      albumId: null,
      title: '',
      artist: '',
      subtitle: '',
      year: null,
      releaseDate: null,
      tracks: [],
      isExplicit: false,
    },
  };
}

export function createCustomProject(): CustomPosterProject {
  return {
    mode: 'custom',
    artwork: null,
    artworkSettings: { ...DEFAULT_ARTWORK_SETTINGS },
    settings: {
      ...DEFAULT_POSTER_SETTINGS,
      template: 'editorial-dark',
      showTracklist: false,
      showDurations: false,
      showReleaseDate: false,
      showTotalRuntime: false,
      showAlbumCode: false,
    },
    content: {
      title: '',
      subtitle: '',
      category: '',
      creator: '',
      year: '',
      description: '',
      metadata: [],
    },
  };
}

export function createPosterProject(mode: PosterMode): PosterProject {
  return mode === 'music' ? createMusicProject() : createCustomProject();
}

export function withUserArtwork<TProject extends PosterProject>(
  project: TProject,
  artwork: UserArtwork | null,
): TProject {
  return {
    ...project,
    artwork,
    artworkSettings: { ...DEFAULT_ARTWORK_SETTINGS },
  };
}

export function projectTitle(project: PosterProject): string {
  return project.content.title.trim() || 'Unbenanntes Poster';
}

export function projectCreator(project: PosterProject): string {
  return project.mode === 'music'
    ? project.content.artist.trim() || 'Music Poster'
    : project.content.creator.trim() ||
        project.content.category.trim() ||
        'Custom Poster';
}

export function isProjectExportable(project: PosterProject): boolean {
  return Boolean(project.artwork && project.content.title.trim());
}
