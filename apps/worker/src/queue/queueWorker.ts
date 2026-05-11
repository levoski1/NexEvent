import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import { logger } from '../lib/logger';
import { config } from '@nexevent/config';
import { dispatch } from '../executors/dispatcher';
import type { QueueJobData } from '@nexevent/shared-types';

const QUEUE_NAME = 'nexevent:actions';

export function startQueueWorker(): Worker<QueueJobData> {
  const worker = new Worker<QueueJobData>(
    QUEUE_NAME,
    async (job: Job<QueueJobData>) => {
      logger.info({ jobId: job.id, triggerId: job.data.triggerId }, 'Processing job');
      await dispatch(job.data);
      logger.info({ jobId: job.id }, 'Job completed');
    },
    {
      connection: redis,
      concurrency: config.QUEUE_CONCURRENCY,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Job failed');
  });

  worker.on('error', (err) => {
    logger.error({ err }, 'Worker error');
  });

  logger.info({ concurrency: config.QUEUE_CONCURRENCY }, 'Queue worker started');
  return worker;
}
