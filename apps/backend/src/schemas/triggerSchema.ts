import { z } from 'zod';

const webhookConfigSchema = z.object({
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH']).default('POST'),
  headers: z.record(z.string()).optional(),
  bodyTemplate: z.string().optional(),
});

const discordConfigSchema = z.object({
  webhookUrl: z.string().url(),
  messageTemplate: z.string().min(1),
});

const telegramConfigSchema = z.object({
  chatId: z.string().min(1),
  messageTemplate: z.string().min(1),
});

const emailConfigSchema = z.object({
  to: z.array(z.string().email()).min(1),
  subject: z.string().min(1),
  bodyTemplate: z.string().min(1),
});

const batchingSchema = z.object({
  enabled: z.boolean().default(false),
  windowMs: z.number().int().positive().default(5000),
  maxBatchSize: z.number().int().positive().default(10),
  continueOnError: z.boolean().default(true),
});

export const createTriggerSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  filter: z.object({
    contractId: z.string().optional(),
    eventType: z.string().optional(),
    topicContains: z.array(z.string()).optional(),
  }),
  actionType: z.enum(['webhook', 'discord', 'telegram', 'email']),
  actionConfig: z.union([webhookConfigSchema, discordConfigSchema, telegramConfigSchema, emailConfigSchema]),
  batching: batchingSchema.optional(),
  maxRetries: z.number().int().min(0).max(10).default(3),
});

export const updateTriggerSchema = createTriggerSchema.partial();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
