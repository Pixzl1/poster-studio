import { MemoryRateLimitProvider } from './memory';
import type { RateLimitProvider } from './provider';

type RateLimitProviderId = 'memory';

const factories: Record<RateLimitProviderId, () => RateLimitProvider> = {
  memory: () => new MemoryRateLimitProvider(),
};

const configured = process.env.RATE_LIMIT_PROVIDER ?? 'memory';
if (!isRateLimitProviderId(configured)) {
  throw new Error(`Unsupported rate-limit provider: ${configured}`);
}

function isRateLimitProviderId(value: string): value is RateLimitProviderId {
  return Object.hasOwn(factories, value);
}

export const rateLimiter: RateLimitProvider = factories[configured]();
