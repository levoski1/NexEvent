import { chunk } from '@nexevent/shared-utils';
import type { SorobanEvent, Trigger } from '@nexevent/shared-types';
import { logger } from '../lib/logger';

interface BatchWindow {
  events: SorobanEvent[];
  timer: ReturnType<typeof setTimeout>;
}

const windows = new Map<string, BatchWindow>();

export function addToBatch(
  trigger: Trigger,
  event: SorobanEvent,
  flush: (trigger: Trigger, events: SorobanEvent[]) => Promise<void>,
): void {
  const { id, batching } = trigger;
  if (!batching.enabled) {
    flush(trigger, [event]).catch((err) => logger.error({ err }, 'Batch flush error'));
    return;
  }

  let window = windows.get(id);

  if (!window) {
    window = {
      events: [],
      timer: setTimeout(() => flushWindow(id, trigger, flush), batching.windowMs),
    };
    windows.set(id, window);
  }

  window.events.push(event);

  if (window.events.length >= batching.maxBatchSize) {
    clearTimeout(window.timer);
    flushWindow(id, trigger, flush);
  }
}

function flushWindow(
  triggerId: string,
  trigger: Trigger,
  flush: (trigger: Trigger, events: SorobanEvent[]) => Promise<void>,
): void {
  const window = windows.get(triggerId);
  if (!window) return;
  windows.delete(triggerId);

  const batches = chunk(window.events, trigger.batching.maxBatchSize);
  for (const batch of batches) {
    flush(trigger, batch).catch((err) => logger.error({ err, triggerId }, 'Batch flush error'));
  }
}
