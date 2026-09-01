export interface TrackLayout {
  columns: number;
  fontSize: number;
  lineHeight: number;
  rows: number;
}

export const CLASSIC_BASE_WIDTH = 2100;

export function getPosterScale(width: number): number {
  return width / CLASSIC_BASE_WIDTH;
}

export function getTrackLayout(
  count: number,
  availableHeight: number,
  scale = 1,
): TrackLayout {
  const minimumColumns = count > 30 ? 3 : count > 8 ? 2 : 1;
  const maximumRowsAtReadableSize = Math.max(
    1,
    Math.floor(availableHeight / (40 * scale)),
  );
  const columns = Math.min(
    4,
    Math.max(minimumColumns, Math.ceil(count / maximumRowsAtReadableSize)),
  );
  const rows = Math.max(1, Math.ceil(count / columns));
  const lineHeight = Math.min(52 * scale, availableHeight / rows);
  return {
    columns,
    rows,
    lineHeight,
    fontSize: Math.min(
      lineHeight,
      Math.max(8 * scale, Math.min(32 * scale, lineHeight * 0.64)),
    ),
  };
}
export function truncateLabel(label: string, maxChars: number): string {
  return label.length > maxChars
    ? `${label.slice(0, Math.max(1, maxChars - 1)).trim()}…`
    : label;
}
