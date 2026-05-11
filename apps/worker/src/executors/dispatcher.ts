import type { QueueJobData } from '@nexevent/shared-types';
import { executeWebhook } from './webhookExecutor';
import { executeDiscord } from './discordExecutor';
import { executeTelegram } from './telegramExecutor';
import { executeEmail } from './emailExecutor';

export async function dispatch(job: QueueJobData): Promise<void> {
  const { actionType, actionConfig, event } = job;

  switch (actionType) {
    case 'webhook':
      return executeWebhook(actionConfig as Parameters<typeof executeWebhook>[0], event);
    case 'discord':
      return executeDiscord(actionConfig as Parameters<typeof executeDiscord>[0], event);
    case 'telegram':
      return executeTelegram(actionConfig as Parameters<typeof executeTelegram>[0], event);
    case 'email':
      return executeEmail(actionConfig as Parameters<typeof executeEmail>[0], event);
    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
}
