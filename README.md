# connected Wetterstationen™ PWA

Eine produktionsreife Progressive Web App für das Projekt **connected Wetterstationen™ (CWS)**. Die Anwendung liefert robuste Wetterdaten für Menschen 50+ auf leistungsschwachen Geräten, funktioniert offline und integriert sich in ThingsBoard-basierte Backends.

## Highlights

- 🌤️ Dashboard mit großen, barrierearmen Kacheln und Stale-Erkennung
- 🗺️ Kartenansicht mit Normal/Hybrid-Layern, Clustering und Stations-Bottom-Sheet
- 🗓️ Kalenderansicht (Tag/Monat) inkl. Prefetch und lokaler Zeitzone *Europe/Vienna*
- 🌧️ Niederschlagsübersicht mit CSV-Export und Spike-Filter
- ⭐ Highlights-Seite mit Top-Werten + optionalem Performance-Opt-In
- ⚙️ Offline-Betrieb via Service Worker, IndexedDB (idb-keyval) und Runtime-Caching
- 📱 PWA-Metadaten, Safe-Area-Handling für iOS/Android, Lighthouse-ready (>90)

## Projektstruktur

```
public/
  manifest.json      # PWA-Manifest (Iconliste bitte bei Bedarf ergänzen)
  config.json        # ThingsBoard Konfiguration (Base URL, Token, Keys)
  sw.js              # Service Worker (Precache + Runtime Caching)
src/
  core/              # Router, Stores, Storage, i18n, HTTP Utilities
  data/              # Modelle, ThingsBoard-Client, Mockdaten
  pages/             # Dashboard, Map, Calendar, Rain, Info Tabs
  ui/                # Design-Tokens, Utilities, Layout-Styling, Icons
  main.ts            # App-Bootstrap & Layout-Aufbau
  index.html         # HTML-Shell mit PWA-Metadaten
tests/               # Vitest-Spezifikationen
```

## Eigene App-Icons

- App-Icons werden nicht mitgeliefert. Bitte fügen Sie Ihre finalen PNG/SVG Assets in `public/icons/` ein und ergänzen Sie die `icons`-Sektion in `public/manifest.json` sowie optionale `<link rel="icon">`-Tags in `index.html`.
- Für iOS empfehlen sich Apple-Touch-Icons (mind. 180×180) sowie maskierbare Icons für Android.

## Konfiguration

1. **`public/config.json`** anpassen:
   ```json
   {
     "tbBaseUrl": "https://thingsboard.example.com",
     "tbToken": "<TENANT_TOKEN>",
     "telemetryKeys": {
       "temperature": ["temperature"],
       "humidity": ["humidity"],
       "wind": ["windSpeed"],
       "uv": ["uvIndex"],
       "rain": ["rain"],
       "dailyRain": ["rainDaily"],
       "monthlyRain": ["rainMonthly"]
     }
   }
   ```
   Platzhalterwerte ersetzen. Patterns mit `{stationId}` oder `%s` werden automatisch pro Station aufgelöst.
2. ThingsBoard muss per HTTPS erreichbar sein und den `X-Authorization: Bearer <token>` Header akzeptieren.
3. Optional: `src/data/mock/*.json` für lokale/offline Tests anpassen.

## Entwicklung & Build

```bash
npm install
npm run dev       # Entwicklungsserver (Vite)
npm run build     # Produktions-Build (dist/)
npm run preview   # Build-Preview
npm run test      # Vitest-Tests
```

- Vite erzeugt ein `asset-manifest.json`, das der Service Worker für das Precaching nutzt.
- Build-Ziele: JS target `es2019`, Legacy-Bundle über `@vitejs/plugin-legacy`.

## Deployment

1. `npm run build`
2. `dist/` Inhalt auf statischem Webserver (z. B. Nginx) ausliefern
3. Service Worker & Manifest müssen unter `/sw.js` bzw. `/manifest.json` erreichbar sein
4. HTTPS zwingend (PWA + ThingsBoard API)

## Offline & Update-Strategie

- **Precaching**: App-Shell, Manifest, Config und Build-Assets
- **Runtime Caching**:
  - Telemetrie (ThingsBoard) → Stale-While-Revalidate
  - Statische Assets → Cache-First
  - Karten-Tiles (OSM/ESRI) → Cache-First mit Limit
- **Reload-Button**: sendet `FULL_REFRESH` an den Service Worker (Caches löschen, `skipWaiting`, `clients.claim`) und leert lokale IndexedDB Daten
- **IndexedDB**: letzte Stations-, Telemetrie-, Regen- und Kalenderdaten (über `idb-keyval`)
- **Offline-Banner**: automatische Anzeige bei `navigator.onLine === false`

## Datenmodell & Geschäftslogik

- Stationsdaten und Telemetrie werden via ThingsBoard REST geladen, Keys nach `config.json`
- Regenwerte > 800 mm werden als Ausreißer verworfen
- Stale-Erkennung: Werte > 60 Minuten alt → „veraltet“-Badge
- Kalender lädt Monate on-demand und prefetcht angrenzende Monate
- CSV-Export der Niederschlagsliste, Highlights werden aus Telemetrie berechnet

## Barrierefreiheit & 50+-Fokus

- Mindest-Schriftgrößen ≥ 18 px, große Tap-Ziele (≥ 44 px)
- Klare Icons mit Beschriftung, hoher Kontrast (Light-Mode only)
- Fokus-Ringe und ARIA-Labels für Buttons, Dropdowns & Navigation
- Safe-Area Insets (Notch) und `prefers-reduced-motion` umgesetzt

## Tests & Qualitätssicherung

- `npm run test` führt Vitest-Spezifikationen für zentrale Datenfunktionen aus
- Empfohlene manuelle Checks: Lighthouse (Performance, PWA, Accessibility ≥ 90), Offline-Modus, Kartenlayer, SW-Update-Flow, iOS/Android PWA Verhalten

## Datenschutz

- Keine externe Analytics per Default
- Info-Tab bietet optionales Opt-in für rein technische Performance-Metriken (lokal protokolliert)

## Support & Erweiterung

- Weitere Stationen, Telemetrie-Keys und UI-Texte lassen sich zentral in `config.json`, `src/data/models.ts` bzw. `src/core/i18n/de-AT.json` erweitern
- Modularer Aufbau ermöglicht zusätzliche Tabs/Widgets ohne Framework-Overhead

Viel Freude mit der connected Wetterstationen™ PWA!
