import {
  LyricsRecordTemplate,
  type LyricsRecordColors,
} from './LyricsRecordTemplate';
import type { CustomPosterTemplateProps } from '@/templates/types';

const COLORS: LyricsRecordColors = {
  background: '#171817',
  foreground: '#f5f2eb',
  muted: '#b1aea7',
  rule: '#d7d2c8',
  record: '#111211',
};

export function LyricsRecordDarkTemplate(props: CustomPosterTemplateProps) {
  return (
    <LyricsRecordTemplate
      {...props}
      colors={COLORS}
      templateName="Lyrics Record Dark"
    />
  );
}
