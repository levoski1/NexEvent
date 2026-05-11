import { Schema, model, Document } from 'mongoose';
import type { AuditLog, AuditAction } from '@nexevent/shared-types';

export interface AuditLogDoc extends Omit<AuditLog, 'id'>, Document {}

const auditLogSchema = new Schema<AuditLogDoc>(
  {
    action: {
      type: String,
      enum: [
        'trigger.created',
        'trigger.updated',
        'trigger.deleted',
        'trigger.paused',
        'trigger.resumed',
        'action.executed',
        'action.failed',
        'batch.processed',
      ] as AuditAction[],
      required: true,
    },
    actorId: { type: String },
    resourceId: { type: String, required: true },
    resourceType: { type: String, required: true },
    diff: { type: Schema.Types.Mixed },
    integrityHash: { type: String, required: true },
    requestFingerprint: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, strict: true },
);

auditLogSchema.index({ resourceId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLogModel = model<AuditLogDoc>('AuditLog', auditLogSchema);
