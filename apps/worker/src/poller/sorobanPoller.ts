import { SorobanRpc, Networks } from '@stellar/stellar-sdk';
import { config } from '@nexevent/config';
import { redis } from '../lib/redis';
import { logger } from '../lib/logger';
import { sleep } from '@nexevent/shared-utils';
import type { SorobanEvent } from '@nexevent/shared-types';

const CURSOR_KEY = 'nexevent:poller:last_ledger';
const server = new SorobanRpc.Server(config.SOROBAN_RPC_URL, { allowHttp: true });

async function getLastLedger(): Promise<number> {
  const stored = await redis.get(CURSOR_KEY);
  if (stored) return parseInt(stored, 10);
  if (config.START_LEDGER > 0) return config.START_LEDGER;
  const latest = await server.getLatestLedger();
  return latest.sequence;
}

async function saveLastLedger(ledger: number): Promise<void> {
  await redis.set(CURSOR_KEY, ledger.toString());
}

function normalizeEvent(raw: SorobanRpc.Api.EventResponse): SorobanEvent {
  return {
    id: raw.id,
    ledger: raw.ledger,
    ledgerClosedAt: raw.ledgerClosedAt,
    contractId: raw.contractId ?? '',
    type: raw.type,
    topic: raw.topic.map((t) => t.toXDR('base64')),
    value: raw.value,
    txHash: raw.txHash,
  };
}

export async function pollEvents(
  onEvent: (event: SorobanEvent) => Promise<void>,
): Promise<void> {
  logger.info('Soroban poller started');

  while (true) {
    try {
      const fromLedger = await getLastLedger();

      const response = await server.getEvents({
        startLedger: fromLedger,
        filters: [{ type: 'contract' }],
        limit: 100,
      });

      if (response.events.length > 0) {
        logger.info({ count: response.events.length, fromLedger }, 'Events fetched');

        let maxLedger = fromLedger;
        for (const raw of response.events) {
          const event = normalizeEvent(raw);
          maxLedger = Math.max(maxLedger, event.ledger);
          try {
            await onEvent(event);
          } catch (err) {
            logger.error({ err, eventId: event.id }, 'Error processing event');
          }
        }
        await saveLastLedger(maxLedger + 1);
      }
    } catch (err) {
      logger.error({ err }, 'Poller error — will retry');
    }

    await sleep(config.POLL_INTERVAL_MS);
  }
}
