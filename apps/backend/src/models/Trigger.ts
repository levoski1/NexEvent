import { Schema, model, Document } from 'mongoose';
import type { Trigger, ActionType, TriggerStatus } from '@nexevent/shared-types';

export interface TriggerDoc extends Omit<Trigger, 'id'>, Document {}

const batchingSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    windowMs: { type: Number, default: 5000 },
    maxBatchSize: { type: Number, default: 10 },
    continueOnError: { type: Boolean, default: true },
  },
  { _id: false },
);

const triggerSchema = new Schema<TriggerDoc>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['active', 'paused', 'error'] as TriggerStatus[],
      default: 'active',
    },
    filter: {
      contractId: { type: String },
      eventType: { type: String },
      topicContains: [{ type: String }],
    },
    actionType: {
      type: String,
      enum: ['webhook', 'discord', 'telegram', 'email'] as ActionType[],
      required: true,
    },
    actionConfig: { type: Schema.Types.Mixed, required: true },
    batching: { type: batchingSchema, default: () => ({}) },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
  },
  { timestamps: true },
);

triggerSchema.index({ status: 1 });
triggerSchema.index({ 'filter.contractId': 1 });
triggerSchema.index({ 'filter.eventType': 1 });

export const TriggerModel = model<TriggerDoc>('Trigger', triggerSchema);
