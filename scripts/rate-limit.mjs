import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { mail, mailLimits, features } from '../src/config.ts';

const args = process.argv.slice(2);
const command = args.find((value) => !value.startsWith('--')) ?? 'status';
const remote = args.includes('--remote');
const preview = args.includes('--preview');
const force = args.includes('--force');
const defaultUrl = preview ? 'http://localhost:4333' : 'http://localhost:4321';
const baseUrl = (args.find((value) => value.startsWith('--url=')) ?? `--url=${defaultUrl}`).slice(
  6
);

const configPath = preview ? 'dist/server/wrangler.json' : 'wrangler.jsonc';
const scopeFlag = remote ? '--remote' : '--local';

const wrangler = (params) =>
  spawnSync(
    'npx',
    ['wrangler', ...params, '--binding', 'RATE_LIMIT', '--config', configPath, scopeFlag],
    {
      encoding: 'utf8',
    }
  );

const dayStamp = () => new Date().toISOString().slice(0, 10);
const hourStamp = () => String(Math.floor(Date.now() / 3_600_000));

function listKeys() {
  const result = wrangler(['kv', 'key', 'list']);
  const output = result.stdout ?? '';
  const start = output.indexOf('[');

  if (result.status !== 0 || start === -1) {
    console.error(
      result.stderr?.trim() || output.trim() || 'wrangler kv key list ist fehlgeschlagen.'
    );
    console.error(
      remote
        ? '\nHinweis: braucht eine echte KV-Namespace-ID in wrangler.jsonc und einen Login (npx wrangler login).'
        : preview
          ? '\nHinweis: fuer --preview zuerst "npm run build" ausfuehren.'
          : '\nHinweis: Zaehler entstehen erst, wenn ueber "npm run dev" ein Formular abgeschickt wurde.'
    );
    process.exit(1);
  }

  return JSON.parse(output.slice(start)).map((entry) => entry.name);
}

function readKey(key) {
  const result = wrangler(['kv', 'key', 'get', key]);
  if (result.status !== 0) return 0;
  const lines = (result.stdout ?? '').trim().split('\n');
  return Number(lines[lines.length - 1]?.trim()) || 0;
}

function status() {
  const keys = listKeys();
  const today = dayStamp();
  const hour = hourStamp();
  const perIp = new Map();
  let globalToday = 0;

  for (const key of keys) {
    if (key === `mails:day:${today}`) {
      globalToday = readKey(key);
      continue;
    }

    const match = key.match(/^ip:(.+):(hour|day):([^:]+)$/);
    if (!match) continue;

    const [, ip, kind, stamp] = match;
    if (kind === 'hour' && stamp !== hour) continue;
    if (kind === 'day' && stamp !== today) continue;

    const entry = perIp.get(ip) ?? { hour: 0, day: 0 };
    entry[kind] = readKey(key);
    perIp.set(ip, entry);
  }

  const label = remote ? 'Produktion' : preview ? 'Preview-Worker' : 'Entwicklungsserver';
  console.log(`\nRate Limit — ${label}  (${today}, Stunde ${hour})\n`);

  if (perIp.size === 0) {
    console.log('  Keine Anfragen in der laufenden Stunde bzw. am heutigen Tag.\n');
  } else {
    const width = Math.max(...[...perIp.keys()].map((ip) => ip.length), 12);
    console.log(`  ${'IP'.padEnd(width)}  ${'Stunde'.padEnd(12)}  Tag`);
    console.log(`  ${'-'.repeat(width)}  ${'-'.repeat(12)}  ${'-'.repeat(12)}`);

    for (const [ip, entry] of [...perIp].sort((a, b) => b[1].day - a[1].day)) {
      const blockedHour = entry.hour >= mailLimits.perIpPerHour ? ' [blockiert]' : '';
      const blockedDay = entry.day >= mailLimits.perIpPerDay ? ' [blockiert]' : '';
      console.log(
        `  ${ip.padEnd(width)}  ${`${entry.hour}/${mailLimits.perIpPerHour}`.padEnd(12)}  ${entry.day}/${mailLimits.perIpPerDay}${blockedHour || blockedDay}`
      );
    }
    console.log('');
  }

  const remaining = mailLimits.globalPerDay - globalToday;
  console.log(
    `  Mails heute gesamt: ${globalToday}/${mailLimits.globalPerDay}  (noch ${remaining} frei)`
  );
  console.log(
    `  Kosten pro Kontaktanfrage: ${features.contactConfirmationEmail ? 2 : 1} Mail(s)\n`
  );
}

async function post(path, body, ip) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip },
    body: JSON.stringify(body),
  });

  return { status: response.status, body: await response.json().catch(() => ({})) };
}

const aged = () => Date.now() - (mailLimits.minSecondsBeforeSubmit + 5) * 1000;

const contactBody = (index, extra = {}) => ({
  name: `Rate Limit Test ${index}`,
  email: `test${index}@example.com`,
  message: `Automatischer Test der Rate-Limit-Logik, Nachricht ${index}.`,
  newsletter: false,
  website: '',
  startedAt: aged(),
  ...extra,
});

async function test() {
  if (mail.to !== 'delivered@resend.dev' && !force) {
    console.error(`\nAbbruch: mail.to steht auf "${mail.to}".`);
    console.error(
      'Der Test wuerde echte Mails an diese Adresse schicken und das Resend-Kontingent belasten.'
    );
    console.error(
      "\nSetze in src/config.ts voruebergehend  to: 'delivered@resend.dev'  (Resend Sandbox)"
    );
    console.error('und baue neu, oder erzwinge den Lauf mit --force.\n');
    process.exit(1);
  }

  const stamp = Date.now();
  const ipA = `198.51.100.${stamp % 200}`;
  const ipB = `203.0.113.${(stamp + 7) % 200}`;
  const results = [];
  const check = (name, passed, detail) => {
    results.push({ name, passed, detail });
    console.log(`  ${passed ? 'OK  ' : 'FEHL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  };

  console.log(`\nRate-Limit-Test gegen ${baseUrl}`);
  console.log(
    `Limits: ${mailLimits.perIpPerHour}/Stunde, ${mailLimits.perIpPerDay}/Tag pro IP, ${mailLimits.globalPerDay} Mails/Tag gesamt`
  );
  console.log(`Test-IPs: ${ipA}, ${ipB}\n`);

  for (let index = 1; index <= mailLimits.perIpPerHour; index += 1) {
    const response = await post('/api/contact', contactBody(index), ipA);
    check(
      `Anfrage ${index} von ${ipA} geht durch`,
      response.status === 200 && response.body.ok === true,
      `HTTP ${response.status}`
    );
  }

  const blocked = await post('/api/contact', contactBody(99), ipA);
  check(
    `Anfrage ${mailLimits.perIpPerHour + 1} von ${ipA} wird blockiert`,
    blocked.status === 429 && blocked.body.error === 'rateLimit',
    `HTTP ${blocked.status} ${JSON.stringify(blocked.body)}`
  );

  const newsletterBlocked = await post(
    '/api/newsletter',
    { email: 'test@example.com', website: '', startedAt: aged() },
    ipA
  );
  check(
    'Newsletter teilt dasselbe Budget derselben IP',
    newsletterBlocked.status === 429,
    `HTTP ${newsletterBlocked.status}`
  );

  const otherIp = await post(
    '/api/newsletter',
    { email: 'anders@example.com', website: '', startedAt: aged() },
    ipB
  );
  check(
    `Andere IP (${ipB}) ist nicht betroffen`,
    otherIp.status === 200 && otherIp.body.ok === true,
    `HTTP ${otherIp.status}`
  );

  const honeypot = await post(
    '/api/contact',
    contactBody(100, { website: 'https://spam.example' }),
    ipB
  );
  check(
    'Honeypot wird still verworfen',
    honeypot.status === 200 && honeypot.body.ok === true,
    `HTTP ${honeypot.status}`
  );

  const tooFast = await post('/api/contact', contactBody(101, { startedAt: Date.now() }), ipB);
  check(
    'Zu schnelles Absenden wird still verworfen',
    tooFast.status === 200 && tooFast.body.ok === true,
    `HTTP ${tooFast.status}`
  );

  const invalid = await post('/api/contact', contactBody(102, { email: 'keine-mail' }), ipB);
  check(
    'Ungueltige Adresse wird als Feldfehler gemeldet',
    invalid.status === 400 &&
      invalid.body.error === 'validation' &&
      invalid.body.fields?.includes('email'),
    `HTTP ${invalid.status} ${JSON.stringify(invalid.body)}`
  );

  const failed = results.filter((entry) => !entry.passed);
  console.log(`\n${results.length - failed.length}/${results.length} Pruefungen bestanden.\n`);

  if (!remote) status();

  process.exit(failed.length === 0 ? 0 : 1);
}

if (command === 'status') status();
else if (command === 'test') await test();
else {
  console.error(`Unbekannter Befehl "${command}". Erlaubt: status, test.`);
  process.exit(1);
}
