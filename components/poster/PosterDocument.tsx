import {
  CUSTOM_POSTER_TEMPLATES,
  MUSIC_POSTER_TEMPLATES,
} from '@/templates/registry';
import type { AlbumData } from '@/types/music';
import type { PosterProject } from '@/types/poster';

export function PosterDocument({
  project,
  className,
}: {
  project: PosterProject;
  className?: string;
}) {
  if (project.mode === 'custom') {
    const templateId =
      project.settings.template === 'editorial-white'
        ? 'editorial-white'
        : 'editorial-dark';
    const Template = CUSTOM_POSTER_TEMPLATES[templateId].component;
    return (
      <Template
        content={project.content}
        artwork={project.artwork}
        artworkSettings={project.artworkSettings}
        settings={project.settings}
        className={className}
      />
    );
  }
  const templateId = project.settings.template;
  const definition =
    templateId === 'editorial-dark' || templateId === 'editorial-white'
      ? MUSIC_POSTER_TEMPLATES.classic
      : MUSIC_POSTER_TEMPLATES[templateId];
  const Template = definition.component;
  return (
    <Template
      album={toAlbumData(project)}
      artwork={project.artwork}
      artworkSettings={project.artworkSettings}
      settings={project.settings}
      className={className}
    />
  );
}

function toAlbumData(
  project: Extract<PosterProject, { mode: 'music' }>,
): AlbumData {
  return {
    id: project.content.albumId ?? 'manual',
    title: project.content.title || 'Untitled Album',
    artist: project.content.artist || 'Unknown Artist',
    year: project.content.year,
    country: null,
    status: null,
    primaryType: 'Album',
    secondaryTypes: [],
    disambiguation: project.content.subtitle,
    trackCount: project.content.tracks.length,
    releaseDate: project.content.releaseDate,
    barcode: null,
    tracks: project.content.tracks,
    isExplicit: project.content.isExplicit,
  };
}
