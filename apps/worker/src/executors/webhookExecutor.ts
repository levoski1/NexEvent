import axios from 'axios';
import { interpolate } from '@nexevent/shared-utils';
import { config } from '@nexevent/config';
import type { WebhookConfig, SorobanEvent } from '@nexevent/shared-types';

export async function executeWebhook(cfg: WebhookConfig, event: SorobanEvent): Promise<void> {
  const body = cfg.bodyTemplate
    ? interpolate(cfg.bodyTemplate, event as unknown as Record<string, unknown>)
    : JSON.stringify(event);

  await axios({
    method: cfg.method,
    url: cfg.url,
    headers: { 'Content-Type': 'application/json', ...cfg.headers },
    data: body,
    timeout: config.WEBHOOK_TIMEOUT_MS,
  });
}
