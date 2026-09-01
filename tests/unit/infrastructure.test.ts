import { describe, expect, it } from 'vitest';
import { MemoryCacheProvider } from '@/lib/cache/memory';
import { MemoryRateLimitProvider } from '@/lib/rate-limit/memory';

describe('bounded in-memory infrastructure', () => {
  it('evicts the oldest cache entry at capacity', async () => {
    const cache = new MemoryCacheProvider(2);
    await cache.set('first', 1, 60);
    await cache.set('second', 2, 60);
    await cache.set('third', 3, 60);
    await expect(cache.get('first')).resolves.toBeNull();
    await expect(cache.get('third')).resolves.toBe(3);
  });

  it('bounds rate-limit buckets without blocking new clients', async () => {
    const limiter = new MemoryRateLimitProvider(2);
    await limiter.consume('first', 1, 60);
    await limiter.consume('second', 1, 60);
    await limiter.consume('third', 1, 60);
    const recycled = await limiter.consume('first', 1, 60);
    expect(recycled.allowed).toBe(true);
  });
});
