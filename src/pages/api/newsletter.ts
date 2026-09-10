import type { APIRoute } from 'astro';
import { mailchimp, mailLimits } from '../../config';
import { defaultLocale } from '../../i18n/config';
import {
  EMAIL_PATTERN,
  fail,
  getClientIp,
  getMailchimpApiKey,
  getRateLimitStore,
  getResendApiKey,
  isTooFast,
  json,
  ok,
} from '../../lib/api';
import { newsletterNotification, sendMail } from '../../lib/mail';
import { getMailchimpConfig, subscribe } from '../../lib/mailchimp';
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

  const audience = getMailchimpConfig(getMailchimpApiKey());
  if (!audience) {
    console.error('[newsletter] MAILCHIMP_API_KEY fehlt oder ist unbrauchbar');
    return fail('notConfigured', 500);
  }

  const store = getRateLimitStore();
  const ip = getClientIp(context);

  const decision = await checkRateLimit(store, ip, 1);
  if (!decision.allowed) return fail('rateLimit', 429);

  const outcome = await subscribe(audience, {
    email,
    language: defaultLocale,
    tag: mailchimp.tags.blog,
  });

  if (outcome.state === 'already') {
    await recordSubmission(store, ip, 0);
    return fail('alreadySubscribed', 409);
  }

  if (outcome.state === 'failed') {
    await recordSubmission(store, ip, 0);

    if (outcome.reason === 'invalid') {
      return fail('validation', 400, ['email']);
    }

    if (outcome.reason === 'auth') {
      console.error('[newsletter] Mailchimp lehnt den Schluessel ab – vermutlich abgelaufen');
      return fail('notConfigured', 500);
    }

    return fail('server', 502);
  }

  try {
    await sendMail(apiKey, newsletterNotification(email, outcome.state === 'pending'));
  } catch (error) {
    console.error('[newsletter] Meldung an Kati fehlgeschlagen', error);
  }

  await recordSubmission(store, ip, 1);

  return json({ ok: true, pending: outcome.state === 'pending' });
};
