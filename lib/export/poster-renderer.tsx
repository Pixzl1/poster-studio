'use client';

import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { PosterDocument } from '@/components/poster/PosterDocument';
import type { PosterProject } from '@/types/poster';

export function mountPosterForExport(project: PosterProject): {
  svg: SVGSVGElement;
  cleanup(): void;
} {
  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText =
    'position:fixed;left:-100000px;top:0;width:1px;height:1px;overflow:hidden;pointer-events:none;';
  document.body.append(container);
  const root = createRoot(container);

  flushSync(() => root.render(<PosterDocument project={project} />));
  const svg = container.querySelector<SVGSVGElement>('svg');
  if (!svg) {
    root.unmount();
    container.remove();
    throw new Error('Poster SVG could not be rendered for batch export.');
  }

  return {
    svg,
    cleanup() {
      root.unmount();
      container.remove();
    },
  };
}
