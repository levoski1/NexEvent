import type { SorobanEvent, Trigger } from '@nexevent/shared-types';

/**
 * Returns true if the event matches the trigger's filter criteria.
 * All specified filter fields must match (AND logic).
 */
export function matchesTrigger(event: SorobanEvent, trigger: Trigger): boolean {
  const { filter } = trigger;

  if (filter.contractId && filter.contractId !== event.contractId) return false;
  if (filter.eventType && filter.eventType !== event.type) return false;
  if (filter.topicContains?.length) {
    const hasAll = filter.topicContains.every((t) => event.topic.includes(t));
    if (!hasAll) return false;
  }

  return true;
}
