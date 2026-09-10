import { Resend } from 'resend';
import { mail } from '../config';

export interface ContactSubmission {
  name: string;
  email: string;
  message: string;
  newsletter: boolean;
}

export interface MailMessage {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const paragraphs = (value: string) =>
  escapeHtml(value)
    .split(/\n{2,}/)
    .map((block) => `<p style="margin:0 0 14px">${block.replace(/\n/g, '<br />')}</p>`)
    .join('');

const shell = (heading: string, body: string) => `<!doctype html>
<html lang="de">
  <body style="margin:0;padding:24px;background:#FBF6F2;font-family:Helvetica,Arial,sans-serif;color:#7A675D;font-size:15px;line-height:1.7">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid rgba(220,207,195,0.55);border-radius:18px;padding:32px 30px">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#A8B2A1">Kati Schepis &middot; Feng Shui</p>
      <h1 style="margin:0 0 22px;font-family:Georgia,serif;font-size:24px;font-weight:500;color:#7A675D">${escapeHtml(heading)}</h1>
      ${body}
    </div>
    <p style="max-width:560px;margin:16px auto 0;font-size:11px;color:#B6AAA1;text-align:center">Automatisch gesendet von katischepis.ch</p>
  </body>
</html>`;

const row = (label: string, value: string) =>
  `<tr>
      <td style="padding:8px 16px 8px 0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#A8B2A1;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:#7A675D">${value}</td>
    </tr>`;

export function contactNotification(submission: ContactSubmission): MailMessage {
  const newsletterLabel = submission.newsletter ? 'Ja' : 'Nein';

  const html = shell(
    'Neue Nachricht über das Kontaktformular',
    `<table style="width:100%;border-collapse:collapse;border-bottom:1px solid rgba(220,207,195,0.55);margin-bottom:22px">
        ${row('Name', escapeHtml(submission.name))}
        ${row('E-Mail', `<a href="mailto:${escapeHtml(submission.email)}" style="color:#C7968A">${escapeHtml(submission.email)}</a>`)}
        ${row('Newsletter', `<strong style="color:${submission.newsletter ? '#6E7F5A' : '#B6AAA1'}">${newsletterLabel}</strong>`)}
      </table>
      <p style="margin:0 0 10px;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#A8B2A1">Nachricht</p>
      ${paragraphs(submission.message)}
      <p style="margin:24px 0 0;font-size:12px;color:#B6AAA1">Eine Antwort auf diese E-Mail geht direkt an ${escapeHtml(submission.email)}.</p>`
  );

  const text = [
    'Neue Nachricht über das Kontaktformular',
    '',
    `Name: ${submission.name}`,
    `E-Mail: ${submission.email}`,
    `Newsletter: ${newsletterLabel}`,
    '',
    'Nachricht:',
    submission.message,
  ].join('\n');

  return {
    to: mail.to,
    replyTo: submission.email,
    subject: `Neue Kontaktanfrage von ${submission.name}`,
    html,
    text,
  };
}

export function contactConfirmation(submission: ContactSubmission): MailMessage {
  const html = shell(
    'Ihre Nachricht ist angekommen',
    `<p style="margin:0 0 14px">Guten Tag ${escapeHtml(submission.name)}</p>
      <p style="margin:0 0 14px">Herzlichen Dank für Ihre Nachricht. Ich habe sie erhalten und melde mich in den nächsten Tagen persönlich bei Ihnen.</p>
      ${submission.newsletter ? '<p style="margin:0 0 14px">Ihre Anmeldung zum Newsletter habe ich ebenfalls notiert.</p>' : ''}
      <p style="margin:0 0 4px">Herzlich</p>
      <p style="margin:0 0 22px;font-family:Georgia,serif;font-size:19px;font-style:italic;color:#C7968A">Kati Schepis</p>
      <div style="border-top:1px solid rgba(220,207,195,0.55);padding-top:18px">
        <p style="margin:0 0 10px;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#A8B2A1">Ihre Nachricht</p>
        <div style="color:#B6AAA1;font-size:14px">${paragraphs(submission.message)}</div>
      </div>`
  );

  const text = [
    `Guten Tag ${submission.name}`,
    '',
    'Herzlichen Dank für Ihre Nachricht. Ich habe sie erhalten und melde mich in den nächsten Tagen persönlich bei Ihnen.',
    submission.newsletter ? 'Ihre Anmeldung zum Newsletter habe ich ebenfalls notiert.' : '',
    '',
    'Herzlich',
    'Kati Schepis',
    '',
    'Ihre Nachricht:',
    submission.message,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    to: submission.email,
    replyTo: mail.replyTo,
    subject: 'Ihre Nachricht an Kati Schepis',
    html,
    text,
  };
}

export function newsletterNotification(email: string, pending = false): MailMessage {
  const stand = pending ? 'Wartet auf die Bestätigung per E-Mail' : 'In Mailchimp eingetragen';
  const schluss = pending
    ? 'Sobald die Person den Bestätigungslink angeklickt hat, erscheint sie in Ihrer Mailchimp-Liste.'
    : 'Die Adresse steht bereits in Ihrer Mailchimp-Liste, Sie müssen nichts weiter tun.';

  const html = shell(
    'Neue Newsletter-Anmeldung',
    `<table style="width:100%;border-collapse:collapse;border-bottom:1px solid rgba(220,207,195,0.55);margin-bottom:22px">
        ${row('E-Mail', `<a href="mailto:${escapeHtml(email)}" style="color:#C7968A">${escapeHtml(email)}</a>`)}
        ${row('Quelle', 'Formular auf der Blogseite')}
        ${row('Stand', escapeHtml(stand))}
      </table>
      <p style="margin:0">${schluss}</p>`
  );

  const text = [
    'Neue Newsletter-Anmeldung',
    '',
    `E-Mail: ${email}`,
    'Quelle: Formular auf der Blogseite',
    `Stand: ${stand}`,
    '',
    schluss,
  ].join('\n');

  return {
    to: mail.to,
    replyTo: email,
    subject: 'Neue Newsletter-Anmeldung',
    html,
    text,
  };
}

export async function sendMail(apiKey: string, message: MailMessage): Promise<void> {
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: mail.from,
    to: [message.to],
    replyTo: message.replyTo,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });

  if (error) {
    throw new Error(`${error.name}: ${error.message}`);
  }
}
