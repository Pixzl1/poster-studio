import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/components/i18n/LanguageProvider';
import { ExportActions } from '@/components/settings/ExportActions';
import {
  batchPosterFilename,
  posterArchiveFilename,
} from '@/lib/export/filename';
import { createZip } from '@/lib/export/zip';

describe('batch poster export', () => {
  it('creates format-specific file and archive names', () => {
    expect(
      batchPosterFilename('Studio North', 'Night Study', '50x70', 300, 'png'),
    ).toBe('studio-north-night-study-50x70-300dpi.png');
    expect(posterArchiveFilename('Studio North', 'Night Study')).toBe(
      'studio-north-night-study-formats.zip',
    );
  });

  it('creates a valid stored ZIP structure with UTF-8 filenames', async () => {
    const zip = await createZip([
      { name: 'poster-a4.txt', data: new Blob(['hello']) },
      { name: 'größen.txt', data: new Blob(['world']) },
    ]);
    const bytes = new Uint8Array(await zip.arrayBuffer());
    const view = new DataView(bytes.buffer);
    const endOffset = bytes.length - 22;

    expect(zip.type).toBe('application/zip');
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(view.getUint32(14, true)).toBe(0x3610a686);
    expect(view.getUint32(endOffset, true)).toBe(0x06054b50);
    expect(view.getUint16(endOffset + 8, true)).toBe(2);
    expect(view.getUint16(endOffset + 10, true)).toBe(2);
  });

  it('offers batch export only when enabled for Custom posters', () => {
    const render = (batchEnabled: boolean) =>
      renderToStaticMarkup(
        <LanguageProvider>
          <ExportActions
            exporting={null}
            batchProgress={null}
            batchEnabled={batchEnabled}
            artwork={null}
            dpi={150}
            disabled={false}
            onExportPng={() => {}}
            onExportPdf={() => {}}
            onExportBatch={() => {}}
          />
        </LanguageProvider>,
      );

    expect(render(true)).toContain('Mehrere Formate exportieren');
    expect(render(false)).not.toContain('Mehrere Formate exportieren');
  });
});
