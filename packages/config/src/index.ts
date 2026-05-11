import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  BACKEND_PORT: z.coerce.number().default(4000),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_API_KEY: z.string().min(16),

  MONGODB_URI: z.string().url(),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  SOROBAN_RPC_URL: z.string().url(),
  STELLAR_NETWORK_PASSPHRASE: z.string(),
  POLL_INTERVAL_MS: z.coerce.number().default(5000),
  START_LEDGER: z.coerce.number().default(0),

  WEBHOOK_TIMEOUT_MS: z.coerce.number().default(10000),
  WEBHOOK_MAX_RETRIES: z.coerce.number().default(3),

  DISCORD_BOT_TOKEN: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('noreply@nexevent.io'),

  QUEUE_CONCURRENCY: z.coerce.number().default(5),
  QUEUE_MAX_RETRIES: z.coerce.number().default(3),
  QUEUE_BACKOFF_MS: z.coerce.number().default(5000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
