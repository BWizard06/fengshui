import { mailchimp } from '../config';

export type SubscribeState = 'subscribed' | 'pending' | 'already';

export type SubscribeOutcome =
  | { state: SubscribeState }
  | { state: 'failed'; reason: 'auth' | 'blocked' | 'invalid' | 'request' };

export interface MailchimpConfig {
  apiKey: string;
  audienceId: string;
  datacenter: string;
}

export interface SubscribeInput {
  email: string;
  firstName?: string;
  tag: string;
}

export function getMailchimpConfig(apiKey: string | undefined): MailchimpConfig | undefined {
  if (!apiKey) return undefined;

  const datacenter = apiKey.split('-')[1]?.trim();
  if (!datacenter) return undefined;

  return { apiKey, audienceId: mailchimp.audienceId, datacenter };
}

function request(config: MailchimpConfig, path: string, init?: RequestInit): Promise<Response> {
  return fetch(`https://${config.datacenter}.api.mailchimp.com/3.0${path}`, {
    ...init,
    headers: {
      authorization: `Basic ${btoa(`website:${config.apiKey}`)}`,
      'content-type': 'application/json',
      ...init?.headers,
    },
  });
}

const memberPath = (config: MailchimpConfig, email: string) =>
  `/lists/${config.audienceId}/members/${encodeURIComponent(email.trim().toLowerCase())}`;

export async function subscribe(
  config: MailchimpConfig,
  input: SubscribeInput
): Promise<SubscribeOutcome> {
  const targetState: SubscribeState = mailchimp.doubleOptIn ? 'pending' : 'subscribed';
  const merge = input.firstName ? { FNAME: input.firstName } : undefined;

  let existing: Response;
  try {
    existing = await request(config, memberPath(config, input.email));
  } catch (error) {
    console.error('[mailchimp] Abfrage fehlgeschlagen', error);
    return { state: 'failed', reason: 'request' };
  }

  if (existing.status === 401) return { state: 'failed', reason: 'auth' };

  if (existing.ok) {
    const member = (await existing.json().catch(() => ({}))) as { status?: string };

    if (member.status === 'subscribed' || member.status === 'pending') {
      return { state: 'already' };
    }

    if (member.status === 'cleaned') return { state: 'failed', reason: 'blocked' };

    const revived = await request(config, memberPath(config, input.email), {
      method: 'PUT',
      body: JSON.stringify({
        email_address: input.email,
        status: 'pending',
        status_if_new: 'pending',
        ...(merge ? { merge_fields: merge } : {}),
      }),
    });

    if (revived.status === 401) return { state: 'failed', reason: 'auth' };
    if (revived.ok) return { state: 'pending' };

    console.error('[mailchimp] Reaktivierung fehlgeschlagen', await safeDetail(revived));
    return { state: 'failed', reason: 'request' };
  }

  if (existing.status !== 404) {
    console.error('[mailchimp] Unerwartete Antwort', existing.status, await safeDetail(existing));
    return { state: 'failed', reason: 'request' };
  }

  const created = await request(config, `/lists/${config.audienceId}/members`, {
    method: 'POST',
    body: JSON.stringify({
      email_address: input.email,
      status: targetState,
      tags: [input.tag],
      ...(merge ? { merge_fields: merge } : {}),
    }),
  });

  if (created.status === 401) return { state: 'failed', reason: 'auth' };
  if (created.ok) return { state: targetState };

  const detail = await safeDetail(created);
  if (created.status === 400 && detail.toLowerCase().includes('already a list member')) {
    return { state: 'already' };
  }
  if (created.status === 400 && detail.toLowerCase().includes('compliance state')) {
    return { state: 'failed', reason: 'blocked' };
  }
  if (
    created.status === 400 &&
    /looks fake or invalid|invalid email|valid email address/i.test(detail)
  ) {
    return { state: 'failed', reason: 'invalid' };
  }

  console.error('[mailchimp] Eintrag fehlgeschlagen', created.status, detail);
  return { state: 'failed', reason: 'request' };
}

async function safeDetail(response: Response): Promise<string> {
  const body = (await response.json().catch(() => ({}))) as { title?: string; detail?: string };
  return [body.title, body.detail].filter(Boolean).join(' – ');
}
