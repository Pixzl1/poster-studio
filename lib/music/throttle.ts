const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export interface RequestScheduler {
  schedule<T>(request: () => Promise<T>): Promise<T>;
}

export class RequestThrottle implements RequestScheduler {
  private tail: Promise<void> = Promise.resolve();
  private lastStartedAt = 0;
  private hasStarted = false;

  constructor(
    private readonly intervalMs: number,
    private readonly now: () => number = Date.now,
    private readonly wait: (milliseconds: number) => Promise<void> = sleep,
  ) {}

  schedule<T>(request: () => Promise<T>): Promise<T> {
    const run = this.tail.then(async () => {
      if (this.hasStarted) {
        const remaining = this.intervalMs - (this.now() - this.lastStartedAt);
        if (remaining > 0) await this.wait(remaining);
      }
      this.hasStarted = true;
      this.lastStartedAt = this.now();
      return request();
    });

    this.tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }
}

export const musicBrainzThrottle = new RequestThrottle(1_100);
