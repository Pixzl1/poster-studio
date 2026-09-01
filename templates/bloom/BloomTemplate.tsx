import { ClassicComposition } from '@/templates/classic/ClassicTemplate';
import type { PosterTemplateProps } from '@/templates/types';

export function BloomTemplate(props: PosterTemplateProps) {
  return <ClassicComposition {...props} blurredBackground />;
}
