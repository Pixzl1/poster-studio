export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}
export interface RateLimitProvider {
  consume(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult>;
}
