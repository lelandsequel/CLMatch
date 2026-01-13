export interface FetchOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
  method?: "GET" | "HEAD";
}

export async function fetchWithTimeout(url: string, options: FetchOptions = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);

  try {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        "User-Agent": options.headers?.["User-Agent"] ?? "cl-job-match-bot/1.0",
        ...options.headers
      },
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export class RateLimiter {
  private lastRun = 0;

  constructor(private intervalMs: number) {}

  async wait() {
    const now = Date.now();
    const diff = now - this.lastRun;
    if (diff < this.intervalMs) {
      await new Promise((resolve) => setTimeout(resolve, this.intervalMs - diff));
    }
    this.lastRun = Date.now();
  }
}

export async function mapWithConcurrency<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>) {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await mapper(items[current]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
