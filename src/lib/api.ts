import { getSecret } from 'astro:env/server';
import { env } from 'cloudflare:workers';
import type { APIContext } from 'astro';
import type { RateLimitStore } from './rate-limit';

export type ApiErrorCode =
  'validation' | 'rateLimit' | 'notConfigured' | 'server' | 'alreadySubscribed';

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export const ok = () => json({ ok: true });

export const fail = (error: ApiErrorCode, status: number, fields?: string[]) =>
  json({ ok: false, error, fields }, status);

function bindings(): Record<string, unknown> | undefined {
  try {
    return env as unknown as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

export function getRateLimitStore(): RateLimitStore | undefined {
  const binding = bindings()?.RATE_LIMIT as RateLimitStore | undefined;
  return typeof binding?.get === 'function' ? binding : undefined;
}

export function getResendApiKey(): string | undefined {
  const fromBinding = bindings()?.RESEND_API_KEY;
  if (typeof fromBinding === 'string' && fromBinding.length > 0) return fromBinding;

  const fromEnv = getSecret('RESEND_API_KEY');
  return typeof fromEnv === 'string' && fromEnv.length > 0 ? fromEnv : undefined;
}

export function getMailchimpApiKey(): string | undefined {
  const fromBinding = bindings()?.MAILCHIMP_API_KEY;
  if (typeof fromBinding === 'string' && fromBinding.length > 0) return fromBinding;

  const fromEnv = getSecret('MAILCHIMP_API_KEY');
  return typeof fromEnv === 'string' && fromEnv.length > 0 ? fromEnv : undefined;
}

export function getClientIp(context: APIContext): string {
  const header =
    context.request.headers.get('cf-connecting-ip') ??
    context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  return header || context.clientAddress || 'unbekannt';
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function isTooFast(startedAt: unknown, minSeconds: number): boolean {
  const value = Number(startedAt);
  if (!Number.isFinite(value) || value <= 0) return false;
  return Date.now() - value < minSeconds * 1000;
}
