import type { RateLimitProvider, RateLimitResult } from './provider';
interface Bucket {
  count: number;
  resetsAt: number;
}
export class MemoryRateLimitProvider implements RateLimitProvider {
  private buckets = new Map<string, Bucket>();

  constructor(private readonly maxBuckets = 10_000) {}

  async consume(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetsAt <= now) {
      this.prune(now);
      if (!this.buckets.has(key) && this.buckets.size >= this.maxBuckets) {
        const oldestKey = this.buckets.keys().next().value as
          string | undefined;
        if (oldestKey) this.buckets.delete(oldestKey);
      }
      bucket = { count: 0, resetsAt: now + windowSeconds * 1000 };
      this.buckets.set(key, bucket);
    }
    bucket.count += 1;
    return {
      allowed: bucket.count <= limit,
      remaining: Math.max(0, limit - bucket.count),
      retryAfterSeconds: Math.ceil((bucket.resetsAt - now) / 1000),
    };
  }

  private prune(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetsAt <= now) this.buckets.delete(key);
    }
  }
}
