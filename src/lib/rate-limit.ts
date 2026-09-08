import { mailLimits } from '../config';

export interface RateLimitStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export type RateLimitDecision = { allowed: true } | { allowed: false; reason: 'ip' | 'global' };

const HOUR_IN_SECONDS = 60 * 60;
const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;

const dayStamp = () => new Date().toISOString().slice(0, 10);
const hourStamp = () => Math.floor(Date.now() / (HOUR_IN_SECONDS * 1000));

const hourKey = (ip: string) => `ip:${ip}:hour:${hourStamp()}`;
const dayKey = (ip: string) => `ip:${ip}:day:${dayStamp()}`;
const globalKey = () => `mails:day:${dayStamp()}`;

async function readCount(store: RateLimitStore, key: string): Promise<number> {
  const raw = await store.get(key);
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

async function bump(
  store: RateLimitStore,
  key: string,
  amount: number,
  ttl: number
): Promise<void> {
  const next = (await readCount(store, key)) + amount;
  await store.put(key, String(next), { expirationTtl: ttl });
}

export async function checkRateLimit(
  store: RateLimitStore | undefined,
  ip: string,
  emailCost: number
): Promise<RateLimitDecision> {
  if (!store) return { allowed: true };

  const [perHour, perDay, globalToday] = await Promise.all([
    readCount(store, hourKey(ip)),
    readCount(store, dayKey(ip)),
    readCount(store, globalKey()),
  ]);

  if (perHour >= mailLimits.perIpPerHour || perDay >= mailLimits.perIpPerDay) {
    return { allowed: false, reason: 'ip' };
  }

  if (globalToday + emailCost > mailLimits.globalPerDay) {
    return { allowed: false, reason: 'global' };
  }

  return { allowed: true };
}

export async function recordSubmission(
  store: RateLimitStore | undefined,
  ip: string,
  emailCost: number
): Promise<void> {
  if (!store) return;

  await Promise.all([
    bump(store, hourKey(ip), 1, HOUR_IN_SECONDS),
    bump(store, dayKey(ip), 1, DAY_IN_SECONDS),
    bump(store, globalKey(), emailCost, DAY_IN_SECONDS),
  ]);
}
