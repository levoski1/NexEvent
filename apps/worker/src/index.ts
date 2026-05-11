import 'dotenv/config';
import mongoose from 'mongoose';
import { config } from '@nexevent/config';
import { logger } from './lib/logger';
import { pollEvents } from './poller/sorobanPoller';
import { matchesTrigger } from './engine/triggerMatcher';
import { addToBatch } from './queue/batchAggregator';
import { startQueueWorker } from './queue/queueWorker';
import { Queue } from 'bullmq';
import { redis } from './lib/redis';
import type { SorobanEvent, Trigger, QueueJobData } from '@nexevent/shared-types';

// Inline Trigger model import (worker has its own mongoose connection)
import { TriggerModel } from '../../backend/src/models/Trigger';

const actionQueue = new Queue<QueueJobData>('nexevent:actions', { connection: redis });

async function enqueueForTrigger(trigger: Trigger, events: SorobanEvent[]): Promise<void> {
  for (const event of events) {
    await actionQueue.add('execute', {
      triggerId: trigger.id,
      event,
      actionType: trigger.actionType,
      actionConfig: trigger.actionConfig,
      attempt: 1,
    });
  }
}

async function handleEvent(event: SorobanEvent): Promise<void> {
  const triggers = await TriggerModel.find({ status: 'active' }).lean();

  for (const trigger of triggers) {
    if (matchesTrigger(event, trigger as unknown as Trigger)) {
      addToBatch(trigger as unknown as Trigger, event, enqueueForTrigger);
    }
  }
}

async function main() {
  await mongoose.connect(config.MONGODB_URI);
  logger.info('Worker MongoDB connected');

  startQueueWorker();
  await pollEvents(handleEvent);
}

main().catch((err) => {
  logger.error({ err }, 'Worker fatal error');
  process.exit(1);
});
