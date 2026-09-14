import { describe, expect, it } from 'vitest';
import { configuredProviderId } from '@/lib/config/provider-id';

describe('provider configuration', () => {
  it.each([undefined, '', '   ', '\t\n'])(
    'uses the documented fallback for an empty value (%j)',
    (value) => {
      expect(configuredProviderId(value, 'memory')).toBe('memory');
    },
  );

  it('trims a configured provider identifier', () => {
    expect(configuredProviderId('  memory  ', 'fallback')).toBe('memory');
  });

  it('keeps unknown non-empty values available for strict validation', () => {
    expect(configuredProviderId('unsupported', 'memory')).toBe('unsupported');
  });
});
