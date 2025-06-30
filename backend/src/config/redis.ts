import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('🔗 Redis connected successfully');
});

export async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (error: any) {
    console.warn('⚠️ Redis connection failed - continuing without cache:', error?.message || error);
    // Don't throw error, continue without Redis
  }
}

export async function disconnectRedis() {
  await redisClient.disconnect();
}

export { redisClient };