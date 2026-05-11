import pino from 'pino';
import { config } from '@nexevent/config';

export const logger = pino({
  level: config.LOG_LEVEL,
  transport:
    config.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});
