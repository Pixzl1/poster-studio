export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(
    message: string,
    error?: unknown,
    context?: Record<string, unknown>,
  ): void;
}

class ConsoleLogger implements Logger {
  info(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development')
      console.info(message, context ?? {});
  }
  warn(message: string, context?: Record<string, unknown>) {
    console.warn(message, context ?? {});
  }
  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    console.error(message, { error, ...context });
  }
}
export const logger: Logger = new ConsoleLogger();
