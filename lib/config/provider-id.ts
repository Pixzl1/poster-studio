export function configuredProviderId<T extends string>(
  value: string | undefined,
  fallback: T,
): string | T {
  const configured = value?.trim();
  return configured || fallback;
}
