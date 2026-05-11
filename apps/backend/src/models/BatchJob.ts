import { Schema, model, Document } from 'mongoose';

export interface BatchJobDoc extends Document {
  triggerId: string;
  events: unknown[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  windowStart: Date;
  windowEnd: Date;
  processedCount: number;
  errorCount: number;
  integrityHash: string;
}

const batchJobSchema = new Schema<BatchJobDoc>(
  {
    triggerId: { type: String, required: true, index: true },
    events: [{ type: Schema.Types.Mixed }],
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    windowStart: { type: Date, required: true },
    windowEnd: { type: Date, required: true },
    processedCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    integrityHash: { type: String, required: true },
  },
  { timestamps: true },
);

export const BatchJobModel = model<BatchJobDoc>('BatchJob', batchJobSchema);
