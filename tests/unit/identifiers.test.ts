import { describe, expect, it } from 'vitest';
import { escapeLucenePhrase, isValidMbid } from '@/lib/music/identifiers';

describe('MusicBrainz identifiers and queries', () => {
  it('accepts only UUID-shaped MusicBrainz IDs', () => {
    expect(isValidMbid('f5093c06-23e3-404f-aeaa-40f72885ee3a')).toBe(true);
    expect(isValidMbid('../../internal')).toBe(false);
  });

  it('escapes phrase-breaking characters', () => {
    expect(escapeLucenePhrase('Blue "OR" \\ artist:*')).toBe(
      'Blue \\"OR\\" \\\\ artist:*',
    );
  });
});
