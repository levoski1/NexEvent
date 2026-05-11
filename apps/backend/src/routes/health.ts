import { Router } from 'express';
import mongoose from 'mongoose';
import { redis } from '../lib/redis';

const router = Router();

router.get('/', async (_req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'ok' : 'error';
  let redisState = 'ok';
  try {
    await redis.ping();
  } catch {
    redisState = 'error';
  }
  const healthy = dbState === 'ok' && redisState === 'ok';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    db: dbState,
    redis: redisState,
    uptime: process.uptime(),
  });
});

export default router;
