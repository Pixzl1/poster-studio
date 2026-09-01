import { MemoryCacheProvider } from './memory';
import type { CacheProvider } from './provider';

type CacheProviderId = 'memory';

const factories: Record<CacheProviderId, () => CacheProvider> = {
  memory: () => new MemoryCacheProvider(),
};

const configured = process.env.CACHE_PROVIDER ?? 'memory';
if (!isCacheProviderId(configured)) {
  throw new Error(`Unsupported cache provider: ${configured}`);
}

function isCacheProviderId(value: string): value is CacheProviderId {
  return Object.hasOwn(factories, value);
}

export const cache: CacheProvider = factories[configured]();
