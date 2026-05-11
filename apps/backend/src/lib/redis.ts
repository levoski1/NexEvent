import IORedis from 'ioredis';
import { config } from '@nexevent/config';
import { logger } from './logger';

export const redis = new IORedis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // required by BullMQ
  enableReadyCheck: false,
});

redis.on('error', (err) => logger.error({ err }, 'Redis error'));
redis.on('connect', () => logger.info('Redis connected'));
