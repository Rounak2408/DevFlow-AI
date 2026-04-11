import Redis from 'ioredis';

let client;

const CACHE_CMD_MS = Number(process.env.REDIS_CACHE_CMD_MS || 3500);

function redisOptions() {
  return {
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    /** Fail fast instead of queuing commands while disconnected (avoids hung HTTP handlers). */
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 15) return null;
      return Math.min(times * 150, 2000);
    },
  };
}

export function getRedis() {
  if (!client) {
    const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    client = new Redis(url, redisOptions());
  }
  return client;
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timeout`)), ms);
    }),
  ]);
}

export async function cacheGet(key) {
  try {
    const r = getRedis();
    const v = await withTimeout(r.get(key), CACHE_CMD_MS, 'redis get');
    return v ? JSON.parse(v) : null;
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[redis] cacheGet skipped:', e.message);
    }
    return null;
  }
}

export async function cacheSet(key, value, ttlSeconds = 60) {
  try {
    const r = getRedis();
    await withTimeout(r.set(key, JSON.stringify(value), 'EX', ttlSeconds), CACHE_CMD_MS, 'redis set');
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[redis] cacheSet skipped:', e.message);
    }
  }
}

export async function cacheDel(pattern) {
  try {
    const r = getRedis();
    const keys = await withTimeout(r.keys(pattern), CACHE_CMD_MS, 'redis keys');
    if (keys.length) await withTimeout(r.del(...keys), CACHE_CMD_MS, 'redis del');
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[redis] cacheDel skipped:', e.message);
    }
  }
}
