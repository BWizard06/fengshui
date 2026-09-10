import type { APIRoute } from 'astro';
import { features, mailchimp, mailLimits } from '../../config';
import { defaultLocale } from '../../i18n/config';
import {
  EMAIL_PATTERN,
  fail,
  getClientIp,
  getMailchimpApiKey,
  getRateLimitStore,
  getResendApiKey,
  isTooFast,
  ok,
} from '../../lib/api';
import { contactConfirmation, contactNotification, sendMail } from '../../lib/mail';
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

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  const newsletter = payload.newsletter === true;

  const invalid: string[] = [];
  if (name.length < 2 || name.length > 100) invalid.push('name');
  if (!EMAIL_PATTERN.test(email) || email.length > 254) invalid.push('email');
  if (message.length < 10 || message.length > 5000) invalid.push('message');
  if (invalid.length > 0) return fail('validation', 400, invalid);

  const apiKey = getResendApiKey();
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY fehlt');
    return fail('notConfigured', 500);
  }

  const store = getRateLimitStore();
  const ip = getClientIp(context);
  const emailCost = features.contactConfirmationEmail ? 2 : 1;

  const decision = await checkRateLimit(store, ip, emailCost);
  if (!decision.allowed) return fail('rateLimit', 429);

  const submission = { name, email, message, newsletter };

  try {
    await sendMail(apiKey, contactNotification(submission));
  } catch (error) {
    console.error('[contact] Versand an Kati fehlgeschlagen', error);
    return fail('server', 502);
  }

  await recordSubmission(store, ip, emailCost);

  if (newsletter) {
    const audience = getMailchimpConfig(getMailchimpApiKey());

    if (!audience) {
      console.error('[contact] Newsletter gewuenscht, aber MAILCHIMP_API_KEY fehlt');
    } else {
      const outcome = await subscribe(audience, {
        email,
        firstName: name.split(/\s+/)[0],
        language: defaultLocale,
        tag: mailchimp.tags.contact,
      });

      if (outcome.state === 'failed') {
        console.error(
          outcome.reason === 'auth'
            ? '[contact] Mailchimp lehnt den Schluessel ab – vermutlich abgelaufen'
            : `[contact] Newsletter-Eintrag fehlgeschlagen (${outcome.reason})`
        );
      }
    }
  }

  if (features.contactConfirmationEmail) {
    try {
      await sendMail(apiKey, contactConfirmation(submission));
    } catch (error) {
      console.error('[contact] Bestätigung an Absender fehlgeschlagen', error);
    }
  }

  return ok();
};
