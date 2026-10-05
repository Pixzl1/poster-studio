export function wrapText(value: string, maxCharacters: number): string[] {
  if (maxCharacters < 1) return [];
  const lines: string[] = [];
  const paragraphs = value.replaceAll('\r\n', '\n').split('\n');
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let current = '';
    for (const word of words) {
      const chunks = splitToken(word, maxCharacters);
      for (const chunk of chunks) {
        const candidate = current ? `${current} ${chunk}` : chunk;
        if (candidate.length <= maxCharacters) {
          current = candidate;
        } else {
          if (current) lines.push(current);
          current = chunk;
        }
      }
    }
    if (current) lines.push(current);
  }
  while (lines.at(-1) === '') lines.pop();
  return lines;
}

export function wrapTextByWidth(
  value: string,
  maxWidth: number,
  fontSize: number,
): string[] {
  if (maxWidth <= 0 || fontSize <= 0) return [];
  const lines: string[] = [];
  const paragraphs = value.replaceAll('\r\n', '\n').split('\n');
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let current = '';
    for (const word of words) {
      const chunks = splitTokenByWidth(word, maxWidth, fontSize);
      for (const chunk of chunks) {
        const candidate = current ? `${current} ${chunk}` : chunk;
        if (estimatedTextWidth(candidate, fontSize) <= maxWidth) {
          current = candidate;
        } else {
          if (current) lines.push(current);
          current = chunk;
        }
      }
    }
    if (current) lines.push(current);
  }
  while (lines.at(-1) === '') lines.pop();
  return lines;
}

export function wrapTextLines(
  value: string,
  maxCharacters: number,
  maxLines: number,
): string[] {
  if (maxLines < 1) return [];
  const lines = wrapText(value, maxCharacters);
  if (lines.length <= maxLines) return lines;
  const visible = lines.slice(0, maxLines);
  const overflow = lines.slice(maxLines - 1).join(' ');
  visible[maxLines - 1] =
    `${overflow.slice(0, Math.max(1, maxCharacters - 1)).trimEnd()}…`;
  return visible;
}

function splitToken(value: string, maxCharacters: number): string[] {
  if (value.length <= maxCharacters) return [value];
  return Array.from(
    { length: Math.ceil(value.length / maxCharacters) },
    (_, index) =>
      value.slice(index * maxCharacters, (index + 1) * maxCharacters),
  );
}

function splitTokenByWidth(
  value: string,
  maxWidth: number,
  fontSize: number,
): string[] {
  const chunks: string[] = [];
  let current = '';
  for (const character of value) {
    const candidate = `${current}${character}`;
    if (current && estimatedTextWidth(candidate, fontSize) > maxWidth) {
      chunks.push(current);
      current = character;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function estimatedTextWidth(value: string, fontSize: number): number {
  return Array.from(value).reduce(
    (width, character) => width + glyphWidth(character) * fontSize,
    0,
  );
}

function glyphWidth(character: string): number {
  if (/\s/.test(character)) return 0.28;
  if (/[fijltI1.,'`!|:;]/.test(character)) return 0.3;
  if (/[mwMW@%&QO]/.test(character)) return 0.82;
  if (/[A-Z]/.test(character)) return 0.66;
  if (/[0-9]/.test(character)) return 0.56;
  return 0.51;
}
