import { describe, expect, it } from 'vitest';
import { RequestThrottle } from '@/lib/music/throttle';

describe('request throttle', () => {
  it('spaces every request, including queued retries', async () => {
    let now = 0;
    const starts: number[] = [];
    const throttle = new RequestThrottle(
      1_100,
      () => now,
      async (milliseconds) => {
        now += milliseconds;
      },
    );

    await Promise.all([
      throttle.schedule(async () => starts.push(now)),
      throttle.schedule(async () => starts.push(now)),
      throttle.schedule(async () => starts.push(now)),
    ]);

    expect(starts).toEqual([0, 1_100, 2_200]);
  });

  it('continues the queue after a failed request', async () => {
    let now = 0;
    const throttle = new RequestThrottle(
      1_000,
      () => now,
      async (milliseconds) => {
        now += milliseconds;
      },
    );
    await expect(
      throttle.schedule(async () => {
        throw new Error('upstream failure');
      }),
    ).rejects.toThrow('upstream failure');
    await expect(throttle.schedule(async () => now)).resolves.toBe(1_000);
  });
});
