# Kati Schepis · Feng Shui

Website für die Feng-Shui-Beratung von Kati Schepis-Buck, Neftenbach.

## Stack

| Bereich        | Technologie                       |
| -------------- | --------------------------------- |
| Framework      | Astro 7 (statischer Export)       |
| Interaktivität | React 19 als Astro Islands        |
| Styling        | Tailwind CSS 4 mit Design-Tokens  |
| Schriften      | Fontsource, selbst gehostet       |
| Bilder         | Astro Assets mit Sharp, AVIF/WebP |
| Sprache        | TypeScript 6                      |

## Entwicklung

```bash
npm install
npm run dev
```

| Skript                    | Zweck                                     |
| ------------------------- | ----------------------------------------- |
| `npm run dev`             | Entwicklungsserver auf Port 4321          |
| `npm run build`           | Typprüfung und statischer Build nach dist |
| `npm run preview`         | Build im echten Worker samt KV ausliefern |
| `npm run check`           | Nur Typprüfung                            |
| `npm run rate-limit`      | Zählerstand des Rate Limitings anzeigen   |
| `npm run rate-limit:test` | Rate Limiting und Spamschutz durchspielen |
| `npm run format`          | Prettier über das gesamte Projekt         |
| `npm run format:check`    | Formatierung prüfen ohne zu schreiben     |

## Struktur

```
src/
├── assets/images/     Bildmaterial, wird beim Build optimiert
├── components/        Astro-Komponenten und React Islands
├── content/blog/      Markdown-Artikel (Content Collection)
├── i18n/              Sprachdateien, Locale-Konfiguration, Routen
├── layouts/           Grundgerüst mit Head, Header und Footer
├── lib/               Fachliche Hilfsdaten
├── pages/             Eine Datei pro Route
└── styles/global.css  Design-Tokens und Basis-Styles
```

## Seiten

| Route        | Inhalt            |
| ------------ | ----------------- |
| `/`          | Startseite        |
| `/about`     | Über mich         |
| `/feng-shui` | Was ist Feng Shui |
| `/offer`     | Angebot           |
| `/blog`      | Blog              |
| `/contact`   | Kontakt           |
| `/partners`  | Partner           |

## Mehrsprachigkeit

Aktiv ist ausschliesslich Deutsch, ohne Präfix in der URL. Die Struktur ist auf weitere
Sprachen vorbereitet:

1. `src/i18n/en.ts` als Kopie von `de.ts` anlegen und übersetzen.
2. In `src/i18n/config.ts` das Kürzel zu `locales`, `htmlLang` und `localeLabel` ergänzen.
3. In `src/i18n/index.ts` das Wörterbuch in `dictionaries` registrieren.
4. Unter `src/pages/en/` je Route eine Datei anlegen, die dieselben Sektionen einbindet.

Deutsche URLs bleiben unverändert, weitere Sprachen erscheinen unter `/en/about` und so fort.
`localizePath` erzeugt alle Links automatisch passend zur aktiven Sprache.

## Bewegung

Alle Inhalte blenden beim Scrollen sanft von unten ein. Ein Element wird zum Ziel, sobald es
`data-reveal` trägt; steht `data-reveal-group` an einem Container, animieren dessen direkte
Kinder nacheinander mit leichtem Versatz. `data-reveal-skip` nimmt ein Element aus – im Einsatz
beim Hero-Bild, damit der grösste sichtbare Inhalt sofort steht.

Fotos zoomen bei Hover um wenige Prozent heran. Dazu wird das Bild in ein Element mit
`zoom-frame` gelegt, das Radius, Schatten und Beschnitt übernimmt. Liegt der Auslöser weiter
aussen, etwa bei einer ganz verlinkten Karte, bekommt der Auslöser zusätzlich `zoom-host`.

Tempo, Weg und Zoomstärke stehen als Variablen am Anfang von `src/styles/global.css`
(`--reveal-shift`, `--reveal-duration`, `--reveal-stagger`, `--zoom-scale`, `--zoom-duration`).
Wer im Betriebssystem reduzierte Bewegung eingestellt hat, sieht alles sofort und ohne Zoom.
Ohne JavaScript bleibt ebenfalls alles sichtbar.

## Inhaltsverzeichnis

Die Feng-Shui-Seite hat ein Inhaltsverzeichnis: eine feste Leiste links neben dem Text, sonst
ein Button unten rechts, der ein Sheet öffnet. Der gerade gelesene Abschnitt wird hervorgehoben.

Die Leiste misst zur Laufzeit den linken Rand des breitesten Inhaltscontainers und setzt sich
mit festem Abstand davor. Bleibt dafür zu wenig Platz, blendet sie sich aus und der Button
übernimmt. Dadurch kann sie sich nie mit dem Inhalt überschneiden, auch wenn sich Container-
breiten später ändern. Bei den aktuellen Breiten – der breiteste Container misst 1172px –
erscheint die Leiste ab rund 1530px Fensterbreite. Die Werte dafür stehen als Konstanten oben
in `src/components/TableOfContents.tsx` (`RAIL_WIDTH`, `RAIL_GAP`, `RAIL_MIN_EDGE`).

Ein- und ausschalten über `src/config.ts`:

```ts
export const features = {
  fengShuiTableOfContents: true,
};
```

Auf `false` verschwinden Leiste und Button vollständig; die Sprungmarken im Text bleiben
erhalten, sodass Links wie `/feng-shui#ba-gua` weiter funktionieren. Kapitel und Beschriftungen
stehen unter `fengShui.toc` in `src/i18n/de.ts`, die `id` dort muss zur `id` im Markup passen.

## Design-System

Farben, Schriftgrössen, Schatten und der Breakpoint `desk` (900px) sind als Tokens im
`@theme`-Block von `src/styles/global.css` definiert. Schriftgrössen skalieren über `clamp()`
fliessend zwischen Mobil- und Desktop-Grösse; dadurch entsteht der Tablet-Bereich ohne eigenes
Layout. Unterhalb von 900px greift das Mobil-Layout, darüber das Desktop-Layout.

## Blog

Die Übersicht zeigt einen Hinweis, solange keine Artikel vorhanden sind. Ein neuer Artikel
entsteht durch eine Markdown-Datei in `src/content/blog/`:

```markdown
---
title: Titel des Artikels
description: Kurzbeschreibung für Übersicht und Suchmaschinen
publishDate: 2026-09-01
cover: ../../assets/images/peonies.jpg
coverAlt: Beschreibung des Bildes
draft: false
---

Inhalt des Artikels.
```

Übersicht und Detailseite werden daraus automatisch erzeugt.

## Kontaktformular und Newsletter

Beide Formulare senden über [Resend](https://resend.com) an `info@katischepis.ch`. Absender ist
`website@katischepis.ch`, als Antwortadresse wird die Adresse der schreibenden Person gesetzt.
Die Domain ist in Resend verifiziert, Region eu-west-1.

| Route             | Auslöser                          | Mails                                          |
| ----------------- | --------------------------------- | ---------------------------------------------- |
| `/api/contact`    | Kontaktformular auf `/contact`    | Benachrichtigung an Kati, optional Bestätigung |
| `/api/newsletter` | Newsletter-Feld unten auf `/blog` | Benachrichtigung an Kati                       |

Die Checkbox im Kontaktformular ist standardmässig leer. Ist sie gesetzt, steht `Newsletter: Ja`
in der Mail an Kati. Die Weitergabe an Mailchimp ist noch nicht angebunden.

### Schalter und Grenzwerte

Beides in `src/config.ts`:

```ts
export const features = {
  contactConfirmationEmail: true,
};

export const mailLimits = {
  perIpPerHour: 3,
  perIpPerDay: 8,
  globalPerDay: 80,
  minSecondsBeforeSubmit: 3,
};
```

`contactConfirmationEmail` auf `false` und die schreibende Person erhält keine Eingangsbestätigung
mehr; die Mail an Kati bleibt unberührt. Die Absender- und Empfängeradressen stehen im selben
File unter `mail`.

### Schutz vor Missbrauch

Drei Ebenen, alle ohne Drittanbieter und damit ohne Datenschutzthema:

1. Ein für Menschen unsichtbares Zusatzfeld. Wird es ausgefüllt, meldet der Server Erfolg,
   sendet aber nichts – ein Bot merkt so nicht, dass er erkannt wurde.
2. Eine Mindestzeit zwischen Laden und Absenden, gleiche Behandlung.
3. Zählwerke in Cloudflare KV: pro IP-Adresse und ein globales Tageslimit für versendete Mails.
   Das globale Limit schützt das Resend-Kontingent von 100 Mails pro Tag – auch dann, wenn jemand
   die IP wechselt. Wird es erreicht, verweist die Meldung auf die direkte Adresse.

Ohne KV-Bindung greifen die Zählwerke nicht, das Formular funktioniert aber weiter. Die Bindung
ist deshalb vor dem Launch einzurichten.

### Rate Limiting prüfen

Die Zählwerke liegen in KV und lassen sich jederzeit auslesen. Lokal setzt das einen Build und
einen laufenden Worker voraus, weil die Bindung erst dort existiert:

```bash
npm run build
npx wrangler dev --config dist/server/wrangler.json --port 4333
```

Aktueller Stand pro IP-Adresse, in einem zweiten Terminal:

```bash
npm run rate-limit
```

Die Ausgabe zeigt je IP den Stundenzähler, den Tageszähler und darunter die insgesamt heute
versendeten Mails gegen das Tageslimit. `[blockiert]` markiert eine IP, die gerade abgewiesen wird.

Den ganzen Ablauf durchspielen – drei Anfragen kommen durch, die vierte wird abgewiesen, eine
zweite IP bleibt unberührt, Honeypot, Zeitsperre und Feldprüfung greifen:

```bash
npm run rate-limit:test
```

Der Test verschickt echte Mails und bricht deshalb ab, solange `mail.to` in `src/config.ts` auf
die Adresse von Kati zeigt. Für einen Lauf dort vorübergehend `delivered@resend.dev` eintragen –
die Sandbox von Resend, die alles annimmt und nichts zustellt – und neu bauen. Danach zurückstellen.

Lokale Zählwerke zurücksetzen:

```bash
rm -rf dist/server/.wrangler/state
```

Auf der Produktion greifen dieselben Befehle mit `--remote`, sobald der KV-Namespace angelegt und
in `wrangler.jsonc` eingetragen ist:

```bash
node scripts/rate-limit.mjs status --remote
```

Die Stundenzähler laufen nach einer Stunde ab, die Tageszähler nach 24 Stunden – beides über die
Ablaufzeit in KV, es braucht also kein Aufräumen.

## Deployment auf Cloudflare

Die Seite bleibt statisch, nur die beiden API-Routen laufen als Worker.

1. KV-Namespace anlegen und die zurückgegebene ID in `wrangler.jsonc` unter `kv_namespaces`
   eintragen:

   ```bash
   npx wrangler kv namespace create RATE_LIMIT
   ```

2. Den Resend-Schlüssel als Secret hinterlegen:

   ```bash
   npx wrangler secret put RESEND_API_KEY
   ```

3. Bauen und veröffentlichen:

   ```bash
   npm run build
   npx wrangler deploy --config dist/server/wrangler.json
   ```

Lokal liegt der Schlüssel in `.env` für `npm run dev` und zusätzlich in `.dev.vars` für
`npm run preview`, das den echten Worker samt KV startet. Beide Dateien sind aus Git
ausgeschlossen. `worker-configuration.d.ts` wird von `wrangler types` erzeugt und ebenfalls nicht
eingecheckt; `npm run build` und `npm run check` erzeugen es automatisch.

## Offene Punkte

- Mailchimp ist noch nicht angebunden; die Newsletter-Zustimmung wird bisher nur per Mail an
  Kati gemeldet.
- Impressum und Datenschutzerklärung fehlen noch. Für ein Formular, das personenbezogene Daten
  entgegennimmt, gehört ein Hinweis dorthin und idealerweise ein Link direkt beim Formular.

## Deployment

Die Produktionsadresse ist in `astro.config.mjs` unter `site` hinterlegt und steuert Sitemap,
Canonical-Tags und Open-Graph-Angaben. Die Schritte für Cloudflare stehen weiter oben.
