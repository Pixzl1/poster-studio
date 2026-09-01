import type { CacheProvider } from './provider';
interface Entry {
  value: unknown;
  expiresAt: number;
}
export class MemoryCacheProvider implements CacheProvider {
  private readonly entries = new Map<string, Entry>();

  constructor(private readonly maxEntries = 500) {}

  async get<T>(key: string): Promise<T | null> {
    const entry = this.entries.get(key);
    if (!entry || entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }
    return entry.value as T;
  }
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.prune();
    if (!this.entries.has(key) && this.entries.size >= this.maxEntries) {
      const oldestKey = this.entries.keys().next().value as string | undefined;
      if (oldestKey) this.entries.delete(oldestKey);
    }
    this.entries.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  private prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt <= now) this.entries.delete(key);
    }
  }
}
