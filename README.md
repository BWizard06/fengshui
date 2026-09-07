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

| Skript                 | Zweck                                     |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Entwicklungsserver auf Port 4321          |
| `npm run build`        | Typprüfung und statischer Build nach dist |
| `npm run preview`      | Build lokal ausliefern                    |
| `npm run check`        | Nur Typprüfung                            |
| `npm run format`       | Prettier über das gesamte Projekt         |
| `npm run format:check` | Formatierung prüfen ohne zu schreiben     |

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

## Offene Punkte

- Kontaktformular ohne Versandlogik; Felder und Zustände sind angelegt.
- Newsletter noch nicht umgesetzt.
- Animationen folgen in einem eigenen Schritt.
- Impressum und Datenschutzerklärung fehlen noch.

## Deployment

Der Build erzeugt statische Dateien in `dist/` und läuft auf jedem Static-Host.
Die Produktionsadresse ist in `astro.config.mjs` unter `site` hinterlegt und
steuert Sitemap, Canonical-Tags und Open-Graph-Angaben.
