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

  it('offers both editorial custom styles', () => {
    const markup = renderToStaticMarkup(
      <StyleSelector
        value="editorial-white"
        mode="custom"
        onChange={() => {}}
      />,
    );
    expect(markup).toContain('Editorial Dark');
    expect(markup).toContain('Editorial White');
  });
});
