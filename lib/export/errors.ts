export class ExportError extends Error {
  constructor(message = 'Das Poster konnte nicht exportiert werden.') {
    super(message);
    this.name = 'ExportError';
  }
}
