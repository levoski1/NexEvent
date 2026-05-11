import axios from 'axios';
import { interpolate } from '@nexevent/shared-utils';
import type { DiscordConfig, SorobanEvent } from '@nexevent/shared-types';

export async function executeDiscord(cfg: DiscordConfig, event: SorobanEvent): Promise<void> {
  const content = interpolate(cfg.messageTemplate, event as unknown as Record<string, unknown>);
  await axios.post(cfg.webhookUrl, { content }, { timeout: 10_000 });
}
