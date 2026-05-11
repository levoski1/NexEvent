// ─── Soroban Event ────────────────────────────────────────────────────────────

export interface SorobanEvent {
  id: string;
  ledger: number;
  ledgerClosedAt: string;
  contractId: string;
  type: string;
  topic: string[];
  value: unknown;
  txHash: string;
}

// ─── Trigger ──────────────────────────────────────────────────────────────────

export type ActionType = 'webhook' | 'discord' | 'telegram' | 'email';
export type TriggerStatus = 'active' | 'paused' | 'error';

export interface WebhookConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  bodyTemplate?: string;
}

export interface DiscordConfig {
  webhookUrl: string;
  messageTemplate: string;
}

export interface TelegramConfig {
  chatId: string;
  messageTemplate: string;
}

export interface EmailConfig {
  to: string[];
  subject: string;
  bodyTemplate: string;
}

export type ActionConfig = WebhookConfig | DiscordConfig | TelegramConfig | EmailConfig;

export interface BatchingConfig {
  enabled: boolean;
  windowMs: number;
  maxBatchSize: number;
  continueOnError: boolean;
}

export interface TriggerFilter {
  contractId?: string;
  eventType?: string;
  topicContains?: string[];
}

export interface Trigger {
  id: string;
  name: string;
  description?: string;
  status: TriggerStatus;
  filter: TriggerFilter;
  actionType: ActionType;
  actionConfig: ActionConfig;
  batching: BatchingConfig;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Queue ────────────────────────────────────────────────────────────────────

export type QueueJobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';

export interface QueueJobData {
  triggerId: string;
  event: SorobanEvent;
  actionType: ActionType;
  actionConfig: ActionConfig;
  attempt: number;
}

export interface QueueMetricSnapshot {
  queueName: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  timestamp: string;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'trigger.created'
  | 'trigger.updated'
  | 'trigger.deleted'
  | 'trigger.paused'
  | 'trigger.resumed'
  | 'action.executed'
  | 'action.failed'
  | 'batch.processed';

export interface AuditLog {
  id: string;
  action: AuditAction;
  actorId?: string;
  resourceId: string;
  resourceType: string;
  diff?: Record<string, unknown>;
  integrityHash: string;
  requestFingerprint?: string;
  createdAt: string;
}

// ─── Webhook Delivery ─────────────────────────────────────────────────────────

export type DeliveryStatus = 'pending' | 'success' | 'failed' | 'retrying';

export interface WebhookDelivery {
  id: string;
  triggerId: string;
  eventId: string;
  url: string;
  statusCode?: number;
  responseBody?: string;
  status: DeliveryStatus;
  attempt: number;
  nextRetryAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
