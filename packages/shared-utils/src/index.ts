import { createHash } from 'crypto';

/**
 * SHA-256 hash of a JSON-serializable object.
 * Used for audit log integrity verification.
 */
export function hashObject(obj: unknown): string {
  const canonical = JSON.stringify(obj, Object.keys(obj as object).sort());
  return createHash('sha256').update(canonical).digest('hex');
}

/**
 * Compute a request fingerprint from IP + user-agent + timestamp bucket (1-minute).
 */
export function requestFingerprint(ip: string, userAgent: string): string {
  const bucket = Math.floor(Date.now() / 60_000);
  return createHash('sha256').update(`${ip}:${userAgent}:${bucket}`).digest('hex').slice(0, 16);
}

/**
 * Interpolate a template string with values.
 * Template syntax: {{key}}
 */
export function interpolate(template: string, values: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? ''));
}

/**
 * Sleep for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Exponential backoff delay: base * 2^attempt, capped at maxMs.
 */
export function backoffMs(attempt: number, baseMs = 1000, maxMs = 60_000): number {
  return Math.min(baseMs * Math.pow(2, attempt), maxMs);
}

/**
 * Safely parse JSON, returning null on failure.
 */
export function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Compute a diff between two objects, returning only changed keys.
 */
export function objectDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Record<string, { before: unknown; after: unknown }> {
  const diff: Record<string, { before: unknown; after: unknown }> = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diff[key] = { before: before[key], after: after[key] };
    }
  }
  return diff;
}

/**
 * Chunk an array into batches of size n.
 */
export function chunk<T>(arr: T[], n: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += n) result.push(arr.slice(i, i + n));
  return result;
}
