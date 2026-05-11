import { Schema, model, Document } from 'mongoose';
import type { WebhookDelivery, DeliveryStatus } from '@nexevent/shared-types';

export interface WebhookDeliveryDoc extends Omit<WebhookDelivery, 'id'>, Document {}

const webhookDeliverySchema = new Schema<WebhookDeliveryDoc>(
  {
    triggerId: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    statusCode: { type: Number },
    responseBody: { type: String },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'retrying'] as DeliveryStatus[],
      default: 'pending',
    },
    attempt: { type: Number, default: 1 },
    nextRetryAt: { type: Date },
  },
  { timestamps: true },
);

webhookDeliverySchema.index({ status: 1, nextRetryAt: 1 });

export const WebhookDeliveryModel = model<WebhookDeliveryDoc>(
  'WebhookDelivery',
  webhookDeliverySchema,
);
