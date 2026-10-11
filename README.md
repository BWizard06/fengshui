# Kati Schepis · Feng Shui

Website für die Feng-Shui-Beratung von Kati Schepis-Buck in Neftenbach.

## Inhalt

- Startseite, Über mich, Angebot und Partner
- Einführung ins klassische Feng Shui mit interaktivem Ba Gua
- Blog auf Basis von Markdown
- Kontaktformular und Newsletter-Anmeldung mit Bestätigung per E-Mail
- Impressum und Datenschutzerklärung

## Stack

| Bereich        | Technologie                                  |
| -------------- | -------------------------------------------- |
| Framework      | Astro 7                                      |
| Interaktivität | React 19 als Astro Islands                   |
| Styling        | Tailwind CSS 4                               |
| Sprache        | TypeScript 6                                 |
| Hosting        | Cloudflare Workers, KV für das Rate Limiting |
| E-Mail         | Resend                                       |
| Newsletter     | Mailchimp                                    |

## Entwicklung

```bash
npm install
npm run dev
```

Für den Versand braucht es eine `.env` mit `RESEND_API_KEY` und `MAILCHIMP_API_KEY`. Schalter
für Testbetrieb, Bestätigungsmails und Grenzwerte stehen in `src/config.ts`.

| Skript            | Zweck                           |
| ----------------- | ------------------------------- |
| `npm run dev`     | Entwicklungsserver              |
| `npm run build`   | Typprüfung und Build            |
| `npm run preview` | Build lokal im Worker ausführen |
| `npm run format`  | Formatierung mit Prettier       |

## Rechte

Texte, Fotos und Logo gehören Kati Schepis-Buck beziehungsweise den jeweiligen Urheberinnen und
Urhebern und sind nicht zur Weiterverwendung freigegeben.
