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

`description` ist freiwillig und erscheint nirgends auf der Seite – weder auf der Karte noch im
Artikel. Der Wert landet ausschliesslich in der Meta-Beschreibung für Suchmaschinen und
Link-Vorschauen; fehlt er, greift die allgemeine Blog-Beschreibung. Steht dort etwas, muss es
wörtlich von der Autorin stammen. Dasselbe gilt für den gesamten Fliesstext: Vorgegebene Texte
werden übernommen, nicht umformuliert und nicht ergänzt. Die Übersicht zentriert die Karten,
solange weniger als drei Artikel vorhanden sind; ab drei greift das dreispaltige Raster.

Bilder gehören nach `src/assets/images/blog/` und werden relativ eingebunden
(`![Beschreibung](../../assets/images/blog/datei.jpg)`), damit Astro sie optimiert. Das Bild aus
`cover` erscheint auf der Karte und als Auftakt des Artikels.

Drei Bausteine stehen im Fliesstext zur Verfügung:

```html
<p class="lead">Einleitender Absatz, etwas grösser gesetzt.</p>

<p class="note">Hervorgehobener Hinweis in einer gerahmten Box.</p>

<figure class="figure-narrow">![Beschreibung](../../assets/images/blog/hochformat.jpg)</figure>
```

Für Bilder stehen drei Rahmen zur Verfügung, damit ein Artikel nicht zur Abfolge aus Text und
dazwischengelegten Bildern wird:

| Rahmen          | Wirkung                                                             |
| --------------- | ------------------------------------------------------------------- |
| ohne            | Bild füllt die Textspalte                                           |
| `figure-wide`   | Bild bricht ab 900px beidseitig aus der Spalte aus, bis 960px breit |
| `figure-side`   | Bild steht ab 900px rechts im Satz, der Text umfliesst es           |
| `figure-narrow` | Hochformat zentriert auf 22rem begrenzt                             |

```html
<figure class="figure-wide">![Beschreibung](../../assets/images/blog/breit.jpg)</figure>
```

Die Leerzeilen innerhalb des `figure`-Elements sind nötig, damit Markdown den Bildverweis darin
noch verarbeitet. Unterhalb von 900px füllen alle Varianten schlicht die Spalte.

Dazu kommt etwas Rhythmus im Fliesstext: Der `lead`-Absatz erhält eine Initiale, jede `##`-Über-
schrift einen feinen Strich darüber. Das Titelbild aus `cover` läuft auf der Artikelseite als
breites Band im Verhältnis 2:1 über die Textspalte hinaus.

## Kontaktformular und Newsletter

Beide Formulare senden über [Resend](https://resend.com) an `info@katischepis.ch`. Absender ist
`website@katischepis.ch`, als Antwortadresse wird die Adresse der schreibenden Person gesetzt.
Die Domain ist in Resend verifiziert, Region eu-west-1.

| Route             | Auslöser                          | Mails                                          |
| ----------------- | --------------------------------- | ---------------------------------------------- |
| `/api/contact`    | Kontaktformular auf `/contact`    | Benachrichtigung an Kati, optional Bestätigung |
| `/api/newsletter` | Newsletter-Feld unten auf `/blog` | Benachrichtigung an Kati                       |

Die Checkbox im Kontaktformular ist standardmässig leer. Ist sie gesetzt, steht `Newsletter: Ja`
in der Mail an Kati und die Adresse wandert zusätzlich nach Mailchimp.

### Mailchimp

Beide Wege tragen in dieselbe Audience ein, unterscheiden sich aber:

| Weg                        | Mailchimp | Meldung an Kati                         | Tag               |
| -------------------------- | --------- | --------------------------------------- | ----------------- |
| Formular unten auf `/blog` | ja        | eigene Mail «Neue Newsletter-Anmeldung» | `Blogseite`       |
| Haken im Kontaktformular   | ja        | keine – steht schon in der Anfrage      | `Kontaktformular` |

Aus dem Kontaktformular wandert zusätzlich der Vorname ins Feld `FNAME`.

Wird ein Kontakt in Mailchimp **endgültig gelöscht** («Forget this contact»), lässt er sich über
die API nie wieder eintragen – Mailchimp antwortet dauerhaft mit «Forgotten Email Not Subscribed».
Die Person muss sich dann über Mailchimps eigenes Formular neu anmelden:

```
https://gmx.us15.list-manage.com/subscribe?u=ec875f0d26b7df7b7ddd1b855&id=f06552ddff
```

Das Blog-Formular meldet diesen Fall verständlich und verweist auf die direkte Adresse, statt einen
Serverfehler zu zeigen. Zum Aufräumen von Testeinträgen eignet sich deshalb «Archivieren» besser
als endgültiges Löschen.

Vor dem Eintrag wird geprüft, ob die Adresse schon in der Liste steht. Ist sie bereits angemeldet
oder wartet auf ihre Bestätigung, meldet das Blog-Formular «Diese Adresse ist bereits für den
Newsletter angemeldet» und es wird nichts geschrieben. Wer sich früher abgemeldet hatte, erhält
von Mailchimp eine neue Bestätigungsmail, statt still wieder eingetragen zu werden. Adressen, die
Mailchimp als unbrauchbar zurückweist, erscheinen als Feldfehler am Eingabefeld – nicht als
Serverfehler.

Audience und Verhalten stehen in `src/config.ts`:

```ts
export const mailchimp = {
  audienceId: 'f06552ddff',
  doubleOptIn: true,
  tags: { blog: 'Blogseite', contact: 'Kontaktformular' },
};
```

`doubleOptIn` ist eingeschaltet: Neue Anmeldungen landen in Mailchimp mit dem Status `pending`,
worauf Mailchimp die Bestätigungsmail verschickt. Erst nach dem Klick auf den Link darin zählt die
Person als Mitglied. Das Formular weist die anmeldende Person darauf hin. Auf `false` gesetzt wird
sofort eingetragen, ohne Bestätigungsschritt.

Die Meldung an Kati nennt bewusst keinen Bearbeitungsstand. Ob jemand den Bestätigungslink
angeklickt hat, erfährt die Website nicht, und eine zweite Mail folgt deshalb nie – ein Hinweis auf
eine ausstehende Bestätigung würde eine Aufgabe suggerieren, die es nicht gibt. Massgebend ist
immer die Liste in Mailchimp.

Meldet sich jemand an, der sich früher abgemeldet hatte, verschickt Mailchimp eine neue
Bestätigungsmail; die Person zählt erst nach dem Klick wieder als Mitglied. Das gilt für beide
Formulare gleichermassen, und der Herkunfts-Tag wird dabei ebenfalls gesetzt.

Der Audience-Schalter «Double opt-in» in Mailchimp betrifft nur deren eigene Formulare und muss
dafür nicht umgestellt werden – massgebend ist der Status, den die Website setzt.

Neue Kontakte werden mit `language: de` angelegt, damit Mailchimp sie als deutschsprachig führt.

Text und Gestaltung der Bestätigungsmail liegen in Mailchimp unter _Audience › Signup forms ›
Form builder_, im Auswahlfeld dann _Opt-in confirmation email_ – nicht in diesem Projekt. Erscheint
der Eintrag dort nicht, liegt es am Audience-Schalter «Double opt-in»: Steht er auf aus, blendet
Mailchimp die zugehörigen Vorlagen aus. Einschalten macht sie sichtbar und ändert nichts am
Verhalten der Website, weil diese den Status ohnehin selbst setzt.

**Der Mailchimp-Schlüssel ist nur ein Jahr gültig.** Läuft er ab, antwortet Mailchimp mit 401; im
Log steht dann `Mailchimp lehnt den Schluessel ab – vermutlich abgelaufen`, das Blog-Formular meldet
einen Konfigurationsfehler und verweist auf die direkte Adresse. Kontaktanfragen kommen weiterhin
an, nur der Newsletter-Eintrag unterbleibt. Neuen Schlüssel in Mailchimp erzeugen, dann:

```bash
npx wrangler secret put MAILCHIMP_API_KEY
```

Das Rechenzentrum wird aus dem Schlüssel gelesen (der Teil nach dem Bindestrich, aktuell `us15`),
es braucht dafür keine eigene Variable.

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

Der Entwicklungsserver läuft dank `@cloudflare/vite-plugin` bereits in einer echten
Workers-Umgebung. Die KV-Bindung aus `wrangler.jsonc` ist damit schon unter `npm run dev`
aktiv, und die Zählwerke entstehen ab dem ersten abgeschickten Formular.

**Achtung:** Der Entwicklungsserver sendet mit dem Schlüssel aus `.env` echte Mails an die
Adresse in `mail.to`. Zum Ausprobieren dort `delivered@resend.dev` eintragen – die Sandbox von
Resend nimmt alles an und stellt nichts zu.

Aktueller Stand pro IP-Adresse:

```bash
npm run rate-limit
```

Die Ausgabe zeigt je IP den Stundenzähler, den Tageszähler und darunter die insgesamt heute
versendeten Mails gegen das Tageslimit. `[blockiert]` markiert eine IP, die gerade abgewiesen wird.

Den ganzen Ablauf durchspielen – Anfragen bis zum Limit kommen durch, die nächste wird
abgewiesen, eine zweite IP bleibt unberührt, Honeypot, Zeitsperre und Feldprüfung greifen:

```bash
npm run rate-limit:test
```

Der Test bricht ab, solange `mail.to` auf die Adresse von Kati zeigt. Mit `--force` lässt er
sich erzwingen.

Gegen den gebauten Worker statt den Entwicklungsserver laufen beide Befehle mit `--preview`,
gegen die Produktion mit `--remote`:

```bash
npm run build
npx wrangler dev --config dist/server/wrangler.json --port 4333
node scripts/rate-limit.mjs status --preview
node scripts/rate-limit.mjs status --remote
```

Einzelne Zählwerke zurücksetzen, bei laufendem Entwicklungsserver:

```bash
npx wrangler kv key delete "ip:127.0.0.1:day:2026-09-08" --binding RATE_LIMIT --config wrangler.jsonc --local
```

Alles auf einmal geht über `rm -rf .wrangler/state`, dafür muss der Entwicklungsserver aber
gestoppt sein – sonst hält er die Datei offen und die Stände geraten durcheinander.

Die Stundenzähler laufen nach einer Stunde ab, die Tageszähler nach 24 Stunden – beides über die
Ablaufzeit in KV, es braucht also kein Aufräumen.

### Grenze der Zählwerke

KV kennt kein atomares Hochzählen. Jede Anfrage liest den Stand, addiert eins und schreibt
zurück. Treffen Anfragen gleichzeitig ein, lesen sie denselben Ausgangswert und überschreiben
sich gegenseitig – sechs parallele Anfragen wurden im Test alle durchgelassen und hinterliessen
den Zählerstand fünf. Gegen einen Menschen, der das Formular mehrfach abschickt, greift die
Sperre zuverlässig; gegen ein Skript, das viele Anfragen gleichzeitig abfeuert, nicht.

Für eine exakte Zählung braucht es ein Durable Object: dort laufen alle Anfragen desselben
Schlüssels seriell durch dieselbe Instanz, wodurch verlorene Aktualisierungen ausgeschlossen sind.

## Rechtliche Seiten

`/imprint` und `/privacy` sind über den Footer erreichbar und stehen bewusst nicht in der
Hauptnavigation. Beide Formulare verweisen direkt neben dem Absenden auf die Datenschutzerklärung.

Der gesamte Text steht unter `imprint` und `privacy` in `src/i18n/de.ts`, aufgeteilt in Abschnitte
mit `title` und wahlweise `paragraphs`, `lines` oder `items`. In den Absätzen ist HTML erlaubt, damit
Links gesetzt werden können; gerendert wird über `src/components/LegalSections.astro`.

Die Datenschutzerklärung beschreibt den tatsächlichen Stand: keine Cookies, keine Analyse, lokal
eingebundene Schriften, Formulardaten nur per E-Mail, IP-Zähler mit maximal 24 Stunden Lebensdauer,
Cloudflare und Resend als Auftragsbearbeiter. Ändert sich daran etwas, gehört der Text angepasst.

## Deployment auf Cloudflare

Die Seite bleibt statisch, nur die beiden API-Routen laufen als Worker.

1. KV-Namespace anlegen und die zurückgegebene ID in `wrangler.jsonc` unter `kv_namespaces`
   eintragen:

   ```bash
   npx wrangler kv namespace create RATE_LIMIT
   ```

2. Die beiden Schlüssel als Secrets hinterlegen:

   ```bash
   npx wrangler secret put RESEND_API_KEY
   npx wrangler secret put MAILCHIMP_API_KEY
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
