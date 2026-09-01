const MBID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidMbid(value: string): boolean {
  return MBID_PATTERN.test(value);
}

export function escapeLucenePhrase(value: string): string {
  return value.replace(/[\\"]/g, '\\$&');
}
