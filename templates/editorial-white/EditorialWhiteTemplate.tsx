import { EditorialComposition } from '@/templates/editorial-dark/EditorialDarkTemplate';
import type { CustomPosterTemplateProps } from '@/templates/types';

const COLORS = {
  background: '#ffffff',
  foreground: '#20201e',
  muted: '#6f6f68',
  accent: '#6f6f68',
  rule: '#d8d8d2',
};

export function EditorialWhiteTemplate(props: CustomPosterTemplateProps) {
  return (
    <EditorialComposition
      {...props}
      colors={COLORS}
      templateName="Editorial White"
    />
  );
}
