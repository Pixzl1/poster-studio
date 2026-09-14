import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { StyleSelector } from '@/components/settings/StyleSelector';

describe('style selector', () => {
  it('keeps work-in-progress music styles out of the visible selector', () => {
    const markup = renderToStaticMarkup(
      <StyleSelector value="classic" mode="music" onChange={() => {}} />,
    );
    expect(markup).toContain('Classic');
    expect(markup).toContain('Mono');
    expect(markup).toContain('Bloom');
    expect(markup).not.toContain('Sand');
    expect(markup).not.toContain('Paper');
    expect(markup).not.toContain('Onyx');
  });

  it('offers editorial and lyrics record custom styles', () => {
    const markup = renderToStaticMarkup(
      <StyleSelector
        value="editorial-white"
        mode="custom"
        onChange={() => {}}
      />,
    );
    expect(markup).toContain('Editorial Dark');
    expect(markup).toContain('Editorial White');
    expect(markup).toContain('Lyrics Record Light');
    expect(markup).toContain('Lyrics Record Dark');
    expect(markup.indexOf('Editorial White')).toBeLessThan(
      markup.indexOf('Editorial Dark'),
    );
  });
});
