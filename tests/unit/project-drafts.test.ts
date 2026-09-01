import { describe, expect, it } from 'vitest';
import {
  createPosterDrafts,
  getPosterDraft,
  replacePosterDraft,
} from '@/lib/domain/project-drafts';

describe('poster mode drafts', () => {
  it('keeps Music and Custom content independently when switching modes', () => {
    let drafts = createPosterDrafts();
    drafts = replacePosterDraft(drafts, {
      ...drafts.custom,
      content: {
        ...drafts.custom.content,
        title: 'Custom title that must survive',
        description: 'Custom description',
      },
    });
    drafts = replacePosterDraft(drafts, {
      ...drafts.music,
      content: {
        ...drafts.music.content,
        title: 'Music title that must survive',
        artist: 'Artist',
      },
    });

    expect(getPosterDraft(drafts, 'custom').content.title).toBe(
      'Custom title that must survive',
    );
    expect(getPosterDraft(drafts, 'music').content.title).toBe(
      'Music title that must survive',
    );
  });
});
