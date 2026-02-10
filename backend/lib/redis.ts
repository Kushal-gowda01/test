import Redis from 'ioredis';

declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | null | undefined;
}

function createRedisClient(): Redis | null {
  // Skip Redis if env vars not configured
  if (!process.env.REDIS_HOST) {
    console.log('⚠️  Redis not configured, caching disabled');
    return null;
  }

  const client = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

  client.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  client.on('connect', () => {
    console.log('✅ Redis connected');
  });

  return client;
}

export const redis = global.redis !== undefined ? global.redis : createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  global.redis = redis;
}

// Cache helper functions
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    console.warn('Redis GET failed for key:', key);
    return null;
  }
}

export async function setCache(key: string, data: unknown, ttlSeconds: number = 300): Promise<void> {
  if (!redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch {
    console.warn('Redis SET failed for key:', key);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    console.warn('Redis invalidate failed for pattern:', pattern);
  }
}

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  AQI_CURRENT: 120,       // 2 minutes for current readings
  AQI_HISTORICAL: 3600,   // 1 hour for historical data
  CITY_LIST: 86400,        // 24 hours for city list
  DASHBOARD_SUMMARY: 180,  // 3 minutes for dashboard
  TEMPERATURE: 300,        // 5 minutes for temperature
} as const;

export default redis;
