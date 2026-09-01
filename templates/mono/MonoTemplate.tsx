import { ClassicComposition } from '@/templates/classic/ClassicTemplate';
import type { PosterTemplateProps } from '@/templates/types';

export function MonoTemplate(props: PosterTemplateProps) {
  return <ClassicComposition {...props} grayscaleArtwork />;
}
