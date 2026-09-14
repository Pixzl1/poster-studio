import {
  LyricsRecordTemplate,
  type LyricsRecordColors,
} from './LyricsRecordTemplate';
import type { CustomPosterTemplateProps } from '@/templates/types';

const COLORS: LyricsRecordColors = {
  background: '#ffffff',
  foreground: '#171715',
  muted: '#67645e',
  rule: '#393833',
  record: '#ffffff',
};

export function LyricsRecordLightTemplate(props: CustomPosterTemplateProps) {
  return (
    <LyricsRecordTemplate
      {...props}
      colors={COLORS}
      templateName="Lyrics Record Light"
    />
  );
}
