import { Schema, model, Document } from 'mongoose';

export interface EventHistoryDoc extends Document {
  eventId: string;
  contractId: string;
  eventType: string;
  ledger: number;
  txHash: string;
  payload: unknown;
  processedAt: Date;
  triggersMatched: string[];
}

const eventHistorySchema = new Schema<EventHistoryDoc>(
  {
    eventId: { type: String, required: true, unique: true },
    contractId: { type: String, required: true },
    eventType: { type: String, required: true },
    ledger: { type: Number, required: true },
    txHash: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
    processedAt: { type: Date, default: Date.now },
    triggersMatched: [{ type: String }],
  },
  { timestamps: false },
);

eventHistorySchema.index({ contractId: 1, eventType: 1 });
eventHistorySchema.index({ ledger: -1 });

export const EventHistoryModel = model<EventHistoryDoc>('EventHistory', eventHistorySchema);
