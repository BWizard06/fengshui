import type { APIRoute } from 'astro';
import { mailLimits } from '../../config';
import {
  EMAIL_PATTERN,
  fail,
  getClientIp,
  getRateLimitStore,
  getResendApiKey,
  isTooFast,
  ok,
} from '../../lib/api';
import { newsletterNotification, sendMail } from '../../lib/mail';
import { checkRateLimit, recordSubmission } from '../../lib/rate-limit';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  let payload: Record<string, unknown>;

  try {
    payload = await context.request.json();
  } catch {
    return fail('validation', 400);
  }

  const honeypot = typeof payload.website === 'string' ? payload.website.trim() : '';
  if (honeypot.length > 0 || isTooFast(payload.startedAt, mailLimits.minSecondsBeforeSubmit)) {
    return ok();
  }

  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return fail('validation', 400, ['email']);
  }

  const apiKey = getResendApiKey();
  if (!apiKey) {
    console.error('[newsletter] RESEND_API_KEY fehlt');
    return fail('notConfigured', 500);
  }

  const store = getRateLimitStore();
  const ip = getClientIp(context);

  const decision = await checkRateLimit(store, ip, 1);
  if (!decision.allowed) return fail('rateLimit', 429);

  try {
    await sendMail(apiKey, newsletterNotification(email));
  } catch (error) {
    console.error('[newsletter] Versand fehlgeschlagen', error);
    return fail('server', 502);
  }

  await recordSubmission(store, ip, 1);

  return ok();
};
