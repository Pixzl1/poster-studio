interface ZipEntry {
  name: string;
  data: Blob;
}

interface PreparedEntry {
  name: Uint8Array;
  data: Uint8Array;
  crc: number;
  offset: number;
}

export async function createZip(entries: ZipEntry[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const prepared: PreparedEntry[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = new Uint8Array(await entry.data.arrayBuffer());
    prepared.push({ name, data, crc: crc32(data), offset });
    offset += 30 + name.length + data.length;
  }

  const localParts = prepared.flatMap((entry) => [
    localHeader(entry),
    entry.name,
    entry.data,
  ]);
  const centralParts = prepared.flatMap((entry) => [
    centralHeader(entry),
    entry.name,
  ]);
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = endOfCentralDirectory(prepared.length, centralSize, offset);

  const blobParts = [...localParts, ...centralParts, end].map(
    (part) => new Uint8Array(part).buffer as ArrayBuffer,
  );
  return new Blob(blobParts, {
    type: 'application/zip',
  });
}

function localHeader(entry: PreparedEntry): Uint8Array {
  const header = new Uint8Array(30);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(12, 0x0021, true);
  view.setUint32(14, entry.crc, true);
  view.setUint32(18, entry.data.length, true);
  view.setUint32(22, entry.data.length, true);
  view.setUint16(26, entry.name.length, true);
  return header;
}

function centralHeader(entry: PreparedEntry): Uint8Array {
  const header = new Uint8Array(46);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(14, 0x0021, true);
  view.setUint32(16, entry.crc, true);
  view.setUint32(20, entry.data.length, true);
  view.setUint32(24, entry.data.length, true);
  view.setUint16(28, entry.name.length, true);
  view.setUint32(42, entry.offset, true);
  return header;
}

function endOfCentralDirectory(
  entries: number,
  centralSize: number,
  centralOffset: number,
): Uint8Array {
  const end = new Uint8Array(22);
  const view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, entries, true);
  view.setUint16(10, entries, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  return end;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
