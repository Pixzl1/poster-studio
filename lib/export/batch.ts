import type { PrintFormatId } from '@/types/poster';

export type BatchExportFileType = 'png' | 'pdf';

export interface BatchExportRequest {
  formats: PrintFormatId[];
  fileTypes: BatchExportFileType[];
}

export interface BatchExportProgress {
  current: number;
  total: number;
}
