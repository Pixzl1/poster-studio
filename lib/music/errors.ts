export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 500,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = new.target.name;
  }
}
export class MusicProviderError extends AppError {
  constructor(
    message = 'The music service is temporarily unavailable.',
    options?: ErrorOptions,
  ) {
    super('MUSIC_PROVIDER_ERROR', message, 502, options);
  }
}
export class MusicBrainzRateLimitError extends AppError {
  constructor() {
    super(
      'MUSICBRAINZ_RATE_LIMIT',
      'MusicBrainz is busy. Please try again shortly.',
      503,
    );
  }
}
export class MusicBrainzDisabledError extends AppError {
  constructor() {
    super(
      'MUSICBRAINZ_DISABLED',
      'MusicBrainz is unavailable for this installation.',
      503,
    );
  }
}
export class AlbumNotFoundError extends AppError {
  constructor() {
    super('ALBUM_NOT_FOUND', 'That album release could not be found.', 404);
  }
}
