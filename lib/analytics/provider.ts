export type AnalyticsEvent =
  | 'album_search'
  | 'album_selected'
  | 'poster_generated'
  | 'png_export'
  | 'pdf_export'
  | 'template_changed';
export interface AnalyticsProvider {
  track(
    event: AnalyticsEvent,
    properties?: Record<string, string | number | boolean>,
  ): void;
}
export class NoOpAnalyticsProvider implements AnalyticsProvider {
  track(): void {}
}
export const analytics: AnalyticsProvider = new NoOpAnalyticsProvider();
