import { describe, expect, it } from 'vitest';
import { messages } from '@/lib/i18n/messages';

describe('interface translations', () => {
  it('keeps German and English dictionaries in sync', () => {
    expect(Object.keys(messages.en).sort()).toEqual(
      Object.keys(messages.de).sort(),
    );
  });

  it('provides an English QR and settings interface', () => {
    expect(messages.en['settings.heading']).toBe('Settings');
    expect(messages.en['qr.position']).toContain('Gallery');
    expect(messages.en['mode.legend']).toMatch(/create/i);
  });
});
