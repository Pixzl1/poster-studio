import { describe, expect, it } from 'vitest';
import { POSTER_TEMPLATES } from '@/templates/registry';
import { POSTER_TEMPLATE_IDS } from '@/types/poster';

describe('poster template registry', () => {
  it('registers every supported template exactly once', () => {
    expect(Object.keys(POSTER_TEMPLATES)).toEqual([...POSTER_TEMPLATE_IDS]);
  });

  it('keeps registry identifiers aligned with their keys', () => {
    for (const id of POSTER_TEMPLATE_IDS) {
      expect(POSTER_TEMPLATES[id].id).toBe(id);
      expect(POSTER_TEMPLATES[id].component).toBeTypeOf('function');
    }
  });
});
