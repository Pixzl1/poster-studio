import { createCustomProject, createMusicProject } from '@/lib/domain/project';
import type {
  CustomPosterProject,
  MusicPosterProject,
  PosterMode,
  PosterProject,
} from '@/types/poster';

export interface PosterDrafts {
  music: MusicPosterProject;
  custom: CustomPosterProject;
}

export function createPosterDrafts(): PosterDrafts {
  return {
    music: createMusicProject(),
    custom: createCustomProject(),
  };
}

export function getPosterDraft(
  drafts: PosterDrafts,
  mode: PosterMode,
): PosterProject {
  return drafts[mode];
}

export function replacePosterDraft(
  drafts: PosterDrafts,
  project: PosterProject,
): PosterDrafts {
  return project.mode === 'music'
    ? { ...drafts, music: project }
    : { ...drafts, custom: project };
}
