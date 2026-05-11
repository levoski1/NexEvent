import { Schema, model, Document } from 'mongoose';
import type { QueueMetricSnapshot } from '@nexevent/shared-types';

export interface QueueMetricDoc extends Omit<QueueMetricSnapshot, 'timestamp'>, Document {}

const queueMetricSchema = new Schema<QueueMetricDoc>(
  {
    queueName: { type: String, required: true },
    waiting: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    delayed: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

queueMetricSchema.index({ queueName: 1, createdAt: -1 });

export const QueueMetricModel = model<QueueMetricDoc>('QueueMetric', queueMetricSchema);
