import { objectDiff } from '@nexevent/shared-utils';
import { TriggerModel } from '../models/Trigger';
import { createAuditLog } from './auditService';
import { AppError } from '../middleware/errorHandler';
import type { Trigger } from '@nexevent/shared-types';

export async function listTriggers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    TriggerModel.find().skip(skip).limit(limit).lean(),
    TriggerModel.countDocuments(),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getTrigger(id: string) {
  const trigger = await TriggerModel.findById(id).lean();
  if (!trigger) throw new AppError(404, 'Trigger not found');
  return trigger;
}

export async function createTrigger(data: Omit<Trigger, 'id' | 'createdAt' | 'updatedAt' | 'retryCount'>, actorId?: string) {
  const trigger = await TriggerModel.create(data);
  await createAuditLog({
    action: 'trigger.created',
    actorId,
    resourceId: trigger.id,
    resourceType: 'Trigger',
  });
  return trigger;
}

export async function updateTrigger(id: string, data: Partial<Trigger>, actorId?: string) {
  const before = await getTrigger(id);
  const trigger = await TriggerModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!trigger) throw new AppError(404, 'Trigger not found');
  const diff = objectDiff(before as Record<string, unknown>, trigger as Record<string, unknown>);
  await createAuditLog({ action: 'trigger.updated', actorId, resourceId: id, resourceType: 'Trigger', diff });
  return trigger;
}

export async function deleteTrigger(id: string, actorId?: string) {
  const trigger = await TriggerModel.findByIdAndDelete(id);
  if (!trigger) throw new AppError(404, 'Trigger not found');
  await createAuditLog({ action: 'trigger.deleted', actorId, resourceId: id, resourceType: 'Trigger' });
}

export async function setTriggerStatus(id: string, status: 'active' | 'paused', actorId?: string) {
  const action = status === 'paused' ? 'trigger.paused' : 'trigger.resumed';
  const trigger = await TriggerModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!trigger) throw new AppError(404, 'Trigger not found');
  await createAuditLog({ action, actorId, resourceId: id, resourceType: 'Trigger' });
  return trigger;
}
