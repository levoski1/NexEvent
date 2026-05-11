import { Queue, QueueEvents } from 'bullmq';
import { redis } from '../lib/redis';
import { config } from '@nexevent/config';
import { QueueMetricModel } from '../models/QueueMetric';
import type { QueueJobData } from '@nexevent/shared-types';

export const ACTION_QUEUE_NAME = 'nexevent:actions';

export const actionQueue = new Queue<QueueJobData>(ACTION_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: config.QUEUE_MAX_RETRIES,
    backoff: { type: 'exponential', delay: config.QUEUE_BACKOFF_MS },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
});

export const queueEvents = new QueueEvents(ACTION_QUEUE_NAME, { connection: redis });

export async function enqueueAction(data: QueueJobData): Promise<string> {
  const job = await actionQueue.add('execute', data, {
    jobId: `${data.triggerId}:${data.event.id}:${data.attempt}`,
  });
  return job.id!;
}

export async function getQueueMetrics() {
  const counts = await actionQueue.getJobCounts(
    'waiting',
    'active',
    'completed',
    'failed',
    'delayed',
  );
  return counts;
}

export async function snapshotQueueMetrics(): Promise<void> {
  const counts = await getQueueMetrics();
  await QueueMetricModel.create({
    queueName: ACTION_QUEUE_NAME,
    ...counts,
  });
}
