import axios from 'axios';
import { interpolate } from '@nexevent/shared-utils';
import { config } from '@nexevent/config';
import type { TelegramConfig, SorobanEvent } from '@nexevent/shared-types';

export async function executeTelegram(cfg: TelegramConfig, event: SorobanEvent): Promise<void> {
  if (!config.TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN not configured');
  const text = interpolate(cfg.messageTemplate, event as unknown as Record<string, unknown>);
  await axios.post(
    `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`,
    { chat_id: cfg.chatId, text, parse_mode: 'Markdown' },
    { timeout: 10_000 },
  );
}
