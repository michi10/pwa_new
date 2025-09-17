/* ============================================================================
   CWS PWA – App Shell 2025
   - Routing, Splash, Settings, Personalisierung, Progressive Loading
   - Zugriffscode-Prüfung (Demo-Server Simulation)
   - Widgets werden on-demand geladen (Shadow DOM), Demodaten via data/demo.js
   ============================================================================ */

const state = {
  user: { firstName: '', lastName: '' },
  ui:   { dark: false, reduceMotion: false, highContrast: false },
  app:  { units: 'metric', notifications: true, autoRefresh: true, refreshInterval: 5, favoriteStation: '' },
  route: 'dashboard',
  lang: 'de'
};

const routes = {
  dashboard: { titleKey: 'titleDashboard', file: 'widgets/dashboard.html' },
  map:       { titleKey: 'titleMap',       file: 'widgets/map.html' },
  calendar:  { titleKey: 'titleCalendar',  file: 'widgets/calendar.html' },
  rain:      { titleKey: 'titleRain',      file: 'widgets/rain.html' },
  insights:  { titleKey: 'titleInsights',  file: 'widgets/insights.html' }
};

const translations = {
  de: {
    splashLoading: 'App wird geladen…',
    loading: 'Ladevorgang',
    progress: 'Fortschritt',
    titleDashboard: 'Dashboard',
    titleMap: 'Karte',
    titleCalendar: 'Kalender',
    titleRain: 'Niederschlag',
    titleInsights: 'Analysen',
    navHome: 'Home',
    navMap: 'Karte',
    navCalendar: 'Kalender',
    navRain: 'Regen',
    navInsights: 'Analysen',
    settings: 'Einstellungen',
    close: 'Schließen',
    appearance: 'Darstellung',
    darkMode: 'Dark Mode aktivieren',
    reduceMotion: 'Animationen reduzieren',
    highContrast: 'Hohen Kontrast (AAA) aktivieren',
    personalization: 'Personalisierung',
    firstName: 'Vorname',
    lastName: 'Nachname',
    nameHint: 'Dein Name erscheint an mehreren Stellen (z. B. „Guten Morgen, Michael“).',
    language: 'Sprache',
    generalSettings: 'Allgemein',
    notifications: 'Benachrichtigungen zu Wetterereignissen',
    autoRefresh: 'Daten automatisch aktualisieren',
    refreshInterval: 'Intervall',
    refreshInterval2: 'Alle 2 Minuten',
    refreshInterval5: 'Alle 5 Minuten',
    refreshInterval15: 'Alle 15 Minuten',
    measurementUnits: 'Einheiten',
    unitsMetric: 'Metrisch (°C, km/h)',
    unitsImperial: 'Imperial (°F, mph)',
    favoriteStation: 'Lieblingsstation',
    stationQuickSelect: 'Station',
    favoriteStationNone: 'Keine Auswahl',
    dataSource: 'Datenquelle',
    dataHint: 'Aktuell werden Demodaten verwendet. Später wird hier ThingsBoard verbunden.',
    save: 'Speichern',
    openSettings: 'Einstellungen öffnen',
    navigation: 'Navigation',
    header: 'Kopfzeile',
    settingsSaved: 'Danke, {name}! Einstellungen gespeichert.',
    favoriteUpdated: 'Lieblingsstation aktualisiert: {station}.',
    favoriteCleared: 'Lieblingsstation entfernt.',
    friend: 'Freund',
    badgeDefault: 'Schön, dass du da bist!',
    badgeHello: 'Hallo {name}!',
    loadError: 'Fehler beim Laden',
    hello: 'Hallo!',
    helloName: 'Hallo {name}!',
    demoSub: 'Demodaten – ThingsBoard Anbindung folgt.',
    temperature: 'Temperatur',
    rain: 'Niederschlag',
    wind: 'Wind',
    humidity: 'Luftfeuchte',
    metricDetailsTitle: 'Messwert-Details',
    metricDetailsAria: 'Details zum Messwert',
    metricDetailsStation: 'Station',
    metricDetailsLocation: 'Position',
    metricDetailsElevation: 'Höhe',
    metricDetailsUnit: 'Einheit',
    metricDetailsUpdated: 'Letzte Aktualisierung',
    metricDetailsTrend: 'Trend',
    metricDetailsTrendUp: 'steigend',
    metricDetailsTrendDown: 'fallend',
    metricDetailsTrendStable: 'stabil',
    metricDetailsShow: 'Details anzeigen: {metric}',
    metricDetailsNoData: 'Keine Detaildaten verfügbar.',
    metricDetailsPeriod24h: 'letzte 24 h',
    current: 'Aktuell',
    minToday: 'Min heute',
    maxToday: 'Max heute',
    today: 'Heute',
    lastHour: 'Letzte Stunde',
    sum24h: '24 h Summe',
    average: 'Ø',
    gust: 'Böe',
    direction: 'Richtung',
    highShort: 'H',
    lowShort: 'T',
    rainOverview: 'Niederschlags-Übersicht',
    range24h: '24 h',
    range48h: '48 h',
    range7d: '7 Tage',
    range30d: '30 Tage',
    inPeriod: 'im Zeitraum',
    evtMaintNussdorf: 'Wartung Station Nussdorf',
    evtSensorWaidach: 'Sensorwechsel Waidach',
    evtStorm: 'Sturm – erhöhte Böen',
    evtSoftwareUpdate: 'Softwareupdate',
    footerMotto: 'Gemeinsam durch jede Wetterlage.',
    footerGreetingDefault: 'Bleib neugierig auf den Himmel über dir.',
    footerGreetingName: 'Bleib neugierig, {name}!',
    footerGreetingNameStation: 'Bleib neugierig, {name}! Lieblingsstation: {station}.',
    footerPrivacy: 'Datenschutz',
    footerImprint: 'Impressum',
    footerTerms: 'Nutzungsbedingungen',
    accessTitle: 'Zugangscode',
    accessDescription: 'Bitte gib deinen persönlichen Zugangscode ein. Jeder Code kann nur drei Mal aktiviert werden.',
    accessCodeLabel: 'Code',
    accessCodePlaceholder: '123456',
    accessHint: 'Noch {count} Freischaltungen verfügbar. Kontaktier uns, falls dein Code bereits verwendet wurde.',
    accessInvalid: 'Bitte gib einen gültigen sechsstelligen Code ein.',
    accessExhausted: 'Dieser Code wurde bereits drei Mal verwendet.',
    accessRemaining: 'Noch {count} Aktivierungen für diesen Code.',
    accessGranted: 'Zugang erfolgreich aktiviert.',
    accessRetry: 'Bitte versuch es erneut.',
    statMin: 'Minimum',
    statMax: 'Maximum',
    statAvg: 'Durchschnitt',
    calendarMetric: 'Messwert',
    calendarStatistic: 'Auswertung',
    calendarIntro: 'Wähle Messwert und Statistik, um den Monat zu analysieren.',
    calendarNoData: 'Keine Daten im gewählten Zeitraum.',
    mapLayerNormal: 'Standard',
    mapLayerHybrid: 'Hybrid',
    mapFullscreen: 'Vollbild',
    mapExitFullscreen: 'Vollbild verlassen',
    rainSummary: 'Netzwerk-Summe',
    rainStationShare: 'Station',
    unitMillimeter: 'mm',
    unitInch: 'in',
    unitKmH: 'km/h',
    unitMph: 'mph',
    insights: 'Analysen',
    insightsTimeframe: 'Zeitraum',
    insightsMetric: 'Messwert',
    insightsTop: 'Höchster Wert',
    insightsLow: 'Niedrigster Wert',
    insightsNetworkAvg: 'Netzwerkdurchschnitt',
    insightsRankingTitle: 'Stationsranking',
    insightsBestDaysTitle: 'Spitzentage',
    insightsBestDaysSubtitle: 'Top-Tage im Zeitraum',
    insightsNoData: 'Keine Daten im ausgewählten Zeitraum.',
    insightsFavoriteAction: 'Als Favorit setzen',
    insightsFavoriteActive: 'Lieblingsstation',
    insightsFavoritesHint: 'Tipp: Stern anwählen, um die Lieblingsstation zu wechseln.',
    insightsRange60d: '60 Tage',
    insightsAvgPerDay: 'Ø pro Tag'
  },
  en: {
    splashLoading: 'Loading app…',
    loading: 'Loading',
    progress: 'Progress',
    titleDashboard: 'Dashboard',
    titleMap: 'Map',
    titleCalendar: 'Calendar',
    titleRain: 'Rain',
    titleInsights: 'Insights',
    navHome: 'Home',
    navMap: 'Map',
    navCalendar: 'Calendar',
    navRain: 'Rain',
    navInsights: 'Insights',
    settings: 'Settings',
    close: 'Close',
    appearance: 'Appearance',
    darkMode: 'Enable dark mode',
    reduceMotion: 'Reduce motion',
    highContrast: 'Enable high contrast (AAA)',
    personalization: 'Personalization',
    firstName: 'First name',
    lastName: 'Last name',
    nameHint: 'Your name appears in several places (e.g., “Good morning, Michael”).',
    language: 'Language',
    generalSettings: 'General',
    notifications: 'Weather alerts',
    autoRefresh: 'Refresh data automatically',
    refreshInterval: 'Interval',
    refreshInterval2: 'Every 2 minutes',
    refreshInterval5: 'Every 5 minutes',
    refreshInterval15: 'Every 15 minutes',
    measurementUnits: 'Units',
    unitsMetric: 'Metric (°C, km/h)',
    unitsImperial: 'Imperial (°F, mph)',
    favoriteStation: 'Favourite station',
    stationQuickSelect: 'Station',
    favoriteStationNone: 'No selection',
    dataSource: 'Data source',
    dataHint: 'Currently demo data is used. Later, ThingsBoard will be connected here.',
    save: 'Save',
    openSettings: 'Open settings',
    navigation: 'Navigation',
    header: 'Header',
    settingsSaved: 'Thanks, {name}! Settings saved.',
    favoriteUpdated: 'Favourite station updated: {station}.',
    favoriteCleared: 'Favourite station removed.',
    friend: 'friend',
    badgeDefault: 'Great to see you!',
    badgeHello: 'Hello {name}!',
    loadError: 'Error loading',
    hello: 'Hello!',
    helloName: 'Hello {name}!',
    demoSub: 'Demo data – ThingsBoard integration coming soon.',
    temperature: 'Temperature',
    rain: 'Rain',
    wind: 'Wind',
    humidity: 'Humidity',
    metricDetailsTitle: 'Measurement details',
    metricDetailsAria: 'Measurement details dialog',
    metricDetailsStation: 'Station',
    metricDetailsLocation: 'Location',
    metricDetailsElevation: 'Elevation',
    metricDetailsUnit: 'Unit',
    metricDetailsUpdated: 'Last update',
    metricDetailsTrend: 'Trend',
    metricDetailsTrendUp: 'rising',
    metricDetailsTrendDown: 'falling',
    metricDetailsTrendStable: 'steady',
    metricDetailsShow: 'Show details: {metric}',
    metricDetailsNoData: 'No detailed data available.',
    metricDetailsPeriod24h: 'last 24 h',
    current: 'Current',
    minToday: 'Min today',
    maxToday: 'Max today',
    today: 'Today',
    lastHour: 'Last hour',
    sum24h: '24 h total',
    average: 'Avg',
    gust: 'Gust',
    direction: 'Direction',
    highShort: 'H',
    lowShort: 'L',
    rainOverview: 'Rainfall overview',
    range24h: '24 h',
    range48h: '48 h',
    range7d: '7 days',
    range30d: '30 days',
    inPeriod: 'during period',
    evtMaintNussdorf: 'Maintenance Nussdorf station',
    evtSensorWaidach: 'Sensor replacement Waidach',
    evtStorm: 'Storm – increased gusts',
    evtSoftwareUpdate: 'Software update',
    footerMotto: 'Weather inspiration for every day.',
    footerGreetingDefault: 'Keep exploring the sky above you.',
    footerGreetingName: 'Keep exploring, {name}!',
    footerGreetingNameStation: 'Keep exploring, {name}! Favourite station: {station}.',
    footerPrivacy: 'Privacy',
    footerImprint: 'Imprint',
    footerTerms: 'Terms of use',
    accessTitle: 'Access code',
    accessDescription: 'Enter your personal access code. Each code can be activated three times only.',
    accessCodeLabel: 'Code',
    accessCodePlaceholder: '123456',
    accessHint: '{count} unlocks remaining. Contact us if your code is exhausted.',
    accessInvalid: 'Enter a valid six-digit code.',
    accessExhausted: 'This code has already been used three times.',
    accessRemaining: '{count} activations remaining for this code.',
    accessGranted: 'Access granted.',
    accessRetry: 'Please try again.',
    statMin: 'Minimum',
    statMax: 'Maximum',
    statAvg: 'Average',
    calendarMetric: 'Metric',
    calendarStatistic: 'Statistic',
    calendarIntro: 'Choose metric and statistic to review the month.',
    calendarNoData: 'No data in the selected range.',
    mapLayerNormal: 'Standard',
    mapLayerHybrid: 'Hybrid',
    mapFullscreen: 'Fullscreen',
    mapExitFullscreen: 'Exit fullscreen',
    rainSummary: 'Network total',
    rainStationShare: 'Station',
    unitMillimeter: 'mm',
    unitInch: 'in',
    unitKmH: 'km/h',
    unitMph: 'mph',
    insights: 'Insights',
    insightsTimeframe: 'Time range',
    insightsMetric: 'Metric',
    insightsTop: 'Highest value',
    insightsLow: 'Lowest value',
    insightsNetworkAvg: 'Network average',
    insightsRankingTitle: 'Station ranking',
    insightsBestDaysTitle: 'Peak days',
    insightsBestDaysSubtitle: 'Top days in range',
    insightsNoData: 'No data in the selected range.',
    insightsFavoriteAction: 'Set as favourite',
    insightsFavoriteActive: 'Favourite',
    insightsFavoritesHint: 'Tip: tap the star to change your favourite station.',
    insightsRange60d: '60 days',
    insightsAvgPerDay: 'Avg per day'
  }
};

window.CWS = window.CWS || {};

const legalTexts = {
  privacy: {
    de: {
      title: 'Datenschutz',
      body: `<p>Wir behandeln deine Daten vertraulich. Die aktuellen Messwerte werden ausschließlich simuliert und dienen der Visualisierung.</p>
            <ul>
              <li>Personalisierungsangaben (Name, Lieblingsstation) bleiben lokal auf deinem Gerät.</li>
              <li>Für Testzwecke werden keine echten Sensordaten verarbeitet.</li>
              <li>Kontakt: <a href="mailto:hello@cws.app">hello@cws.app</a></li>
            </ul>`
    },
    en: {
      title: 'Privacy',
      body: `<p>Your information stays on this device. All measurements are simulated demo values for showcasing the interface.</p>
            <ul>
              <li>Personal details (name, favourite station) never leave your browser.</li>
              <li>No real sensor readings are processed during this preview.</li>
              <li>Contact: <a href="mailto:hello@cws.app">hello@cws.app</a></li>
            </ul>`
    }
  },
  imprint: {
    de: {
      title: 'Impressum',
      body: `<p>CWS Demo GmbH · Wetterstraße 7 · 5020 Salzburg</p>
             <p>Geschäftsführung: Lea Sonnig · UID: ATU12345678</p>`
    },
    en: {
      title: 'Imprint',
      body: `<p>CWS Demo GmbH · Wetterstraße 7 · 5020 Salzburg · Austria</p>
             <p>Managing director: Lea Sonnig · VAT: ATU12345678</p>`
    }
  },
  terms: {
    de: {
      title: 'Nutzungsbedingungen',
      body: `<p>Die Anwendung dient der Vorabvisualisierung einer Wetterplattform.</p>
             <ul>
               <li>Kein Anspruch auf Verfügbarkeit oder Korrektheit der Daten.</li>
               <li>Zugangscodes dürfen nicht weitergegeben werden.</li>
               <li>Feedback ist jederzeit willkommen.</li>
             </ul>`
    },
    en: {
      title: 'Terms of use',
      body: `<p>This preview showcases the future weather experience.</p>
             <ul>
               <li>No guarantee for availability or data accuracy.</li>
               <li>Do not share access codes publicly.</li>
               <li>We appreciate your feedback.</li>
             </ul>`
    }
  }
};

function t(key){
  return (translations[state.lang] || {})[key] || key;
}

function translate(root=document){
  $$('[data-i18n]', root).forEach(el=>{ el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-placeholder]', root).forEach(el=>{ el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder)); });
  $$('[data-i18n-aria-label]', root).forEach(el=>{ el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel)); });
}

window.t = t;

/* ---------------- Splash ---------------- */
const splash = document.getElementById('splash');
const spinner = document.getElementById('progressSpinner');
function clampProgress(to){
  return Math.max(0, Math.min(100, Number.isFinite(to) ? Number(to) : 0));
}
function setSpinner(to){
  if (!spinner) return;
  const safe = clampProgress(to);
  spinner.style.setProperty('--angle', `${safe * 3.6}deg`);
  spinner.setAttribute('aria-valuenow', String(Math.round(safe)));
}
function showSplash(to=10){
  splash?.classList.add('visible');
  setSpinner(to);
}
function setProgress(to){
  setSpinner(to);
}
function hideSplash(){
  splash?.classList.remove('visible');
  setSpinner(0);
}

/* ---------------- Helpers ---------------- */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
function save(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function load(k,def){ try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } }
function title(txt){ $('#pageTitle').textContent = txt; document.title = `CWS – ${txt}`; }
function getStationById(id){
  return (window.CWS_DEMO?.stations || []).find(s => s.id === id);
}
function normalizeAppState(){
  if (!state.app) state.app = {};
  state.app.units = state.app.units === 'imperial' ? 'imperial' : 'metric';
  state.app.notifications = state.app.notifications !== false;
  state.app.autoRefresh = state.app.autoRefresh !== false;
  const interval = Number(state.app.refreshInterval);
  state.app.refreshInterval = Number.isFinite(interval) && interval > 0 ? interval : 5;
  if (state.app.favoriteStation === undefined) {
    const first = window.CWS_DEMO?.stations?.[0]?.id || '';
    state.app.favoriteStation = first;
  }
}

/* ---------------- Access Server (Simulation) ---------------- */
const AccessServer = {
  key: 'cws_code_pool',
  load(){
    const base = {};
    const pool = window.CWS_DEMO?.codePool || {};
    Object.entries(pool).forEach(([code, meta]) => {
      const limit = Number(meta?.limit ?? 0);
      base[code] = { remaining: limit };
    });
    const stored = load(this.key, null);
    if (!stored) {
      save(this.key, base);
      return JSON.parse(JSON.stringify(base));
    }
    const merged = { ...base };
    Object.entries(stored).forEach(([code, data]) => {
      const remaining = Number(data?.remaining);
      if (Number.isFinite(remaining)) {
        merged[code] = { remaining: Math.max(0, remaining) };
      }
    });
    save(this.key, merged);
    return JSON.parse(JSON.stringify(merged));
  },
  async claim(rawCode){
    await new Promise(r => setTimeout(r, 360));
    const code = String(rawCode || '').trim();
    const pool = this.load();
    if (!pool[code]) return { ok: false, reason: 'invalid' };
    if (pool[code].remaining <= 0) return { ok: false, reason: 'exhausted' };
    pool[code].remaining -= 1;
    save(this.key, pool);
    return { ok: true, remaining: pool[code].remaining };
  }
};

/* ---------------- UI Helpers ---------------- */
function applyUiPrefs(){
  document.documentElement.classList.toggle('dark', state.ui.dark);
  document.documentElement.classList.toggle('hc', state.ui.highContrast);
  document.documentElement.classList.toggle('reduce', state.ui.reduceMotion);
}

function ensureStationOptions(){
  const selects = [];
  const settingsSelect = $('#favoriteStation');
  const quickSelect = $('#stationQuickSelect');
  if (settingsSelect) selects.push(settingsSelect);
  if (quickSelect) selects.push(quickSelect);
  if (!selects.length) return;

  const current = state.app.favoriteStation || '';
  const stations = window.CWS_DEMO?.stations || [];

  selects.forEach(select => {
    const prev = select.value;
    select.innerHTML = '';
    const optNone = document.createElement('option');
    optNone.value = '';
    optNone.textContent = t('favoriteStationNone');
    select.appendChild(optNone);
    stations.forEach(station => {
      const opt = document.createElement('option');
      opt.value = station.id;
      opt.textContent = station.name;
      select.appendChild(opt);
    });
    select.value = current || prev || '';
  });
}

const stationQuickSelect = $('#stationQuickSelect');
stationQuickSelect?.addEventListener('change', () => {
  state.app.favoriteStation = stationQuickSelect.value || '';
  save('cws_app', state.app);
  updateFooter();
  ensureStationOptions();
  broadcastPrefs(true);
  if (state.app.favoriteStation) {
    const station = getStationById(state.app.favoriteStation);
    toast(t('favoriteUpdated').replace('{station}', station?.name || state.app.favoriteStation));
  } else {
    toast(t('favoriteCleared'));
  }
});

document.addEventListener('cws:set-favorite', ev => {
  const stationId = typeof ev.detail?.stationId === 'string' ? ev.detail.stationId : '';
  if (stationId === state.app.favoriteStation) return;
  state.app.favoriteStation = stationId;
  save('cws_app', state.app);
  updateFooter();
  ensureStationOptions();
  broadcastPrefs(true);
  if (stationId) {
    const station = getStationById(stationId);
    toast(t('favoriteUpdated').replace('{station}', station?.name || stationId));
  } else {
    toast(t('favoriteCleared'));
  }
});

function applyPersonalization(){
  const badge = $('#personalBadge');
  if (!badge) return;
  const fullName = `${state.user.firstName || ''} ${state.user.lastName || ''}`.trim();
  if (fullName) {
    badge.hidden = false;
    badge.textContent = t('badgeHello').replace('{name}', fullName);
  } else {
    badge.hidden = false;
    badge.textContent = t('badgeDefault');
  }
  document.dispatchEvent(new CustomEvent('cws:user', { detail: state.user }));
  updateFooter();
}

function updateFooter(){
  const el = $('#footerGreeting');
  if (!el) return;
  const name = state.user.firstName?.trim();
  const station = getStationById(state.app.favoriteStation)?.name;
  if (name && station) {
    el.textContent = t('footerGreetingNameStation').replace('{name}', name).replace('{station}', station);
  } else if (name) {
    el.textContent = t('footerGreetingName').replace('{name}', name);
  } else {
    el.textContent = t('footerGreetingDefault');
  }
}

function broadcastPrefs(immediate=false){
  const station = getStationById(state.app.favoriteStation);
  window.CWS_PREFS = {
    ...state.app,
    favoriteStationName: station?.name || null,
    lang: state.lang
  };
  const emit = () => document.dispatchEvent(new CustomEvent('cws:prefs', { detail: window.CWS_PREFS }));
  if (immediate) emit(); else setTimeout(emit, 0);
}

let refreshTimer = null;
function scheduleAutoRefresh(immediate=false){
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  if (!state.app?.autoRefresh) return;
  const minutes = Number(state.app.refreshInterval);
  const delay = Math.max(1, Number.isFinite(minutes) ? minutes : 5) * 60 * 1000;
  const run = async () => {
    refreshTimer = null;
    if (document.hidden) {
      scheduleAutoRefresh();
      return;
    }
    await mount(state.route);
  };
  refreshTimer = setTimeout(run, immediate ? 0 : delay);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  } else if (state.app?.autoRefresh) {
    scheduleAutoRefresh(true);
  }
});

function openLegal(kind){
  const dialog = $('#legalDialog');
  const titleEl = $('#legalTitle');
  const bodyEl = $('#legalContent');
  const variant = legalTexts[kind];
  if (!dialog || !variant) return;
  const lang = state.lang in variant ? state.lang : 'de';
  titleEl.textContent = variant[lang].title;
  bodyEl.innerHTML = variant[lang].body;
  translate(dialog);
  dialog.showModal();
}

async function gateAccess(){
  if (!window.CWS_DEMO?.codePool) return true;
  const granted = load('cws_access_granted', null);
  if (granted?.code) return true;

  const dialog = $('#accessGate');
  const input = $('#accessCode');
  const error = $('#accessError');
  const hint = $('#accessHint');
  const submitBtn = $('#submitCode');
  const form = dialog?.querySelector('form');
  if (!dialog || !input || !error || !hint || !submitBtn || !form) return true;

  return new Promise(resolve => {
    let unlocked = false;

    const updateHint = () => {
      const pool = AccessServer.load();
      const total = Object.values(pool).reduce((sum, entry) => sum + Math.max(0, entry.remaining ?? 0), 0);
      hint.textContent = t('accessHint').replace('{count}', total);
    };

    const blockClose = ev => ev.preventDefault();
    dialog.addEventListener('cancel', blockClose);

    const submitHandler = async (ev) => {
      ev.preventDefault();
      const code = input.value.replace(/\D/g, '');
      if (code.length !== 6) {
        error.textContent = t('accessInvalid');
        input.focus();
        input.select();
        return;
      }
      error.textContent = '';
      submitBtn.disabled = true;
      const result = await AccessServer.claim(code);
      submitBtn.disabled = false;
      if (!result.ok) {
        error.textContent = result.reason === 'exhausted' ? t('accessExhausted') : t('accessInvalid');
        updateHint();
        input.focus();
        input.select();
        return;
      }
      save('cws_access_granted', { code, at: Date.now() });
      unlocked = true;
      toast(t('accessGranted'));
      if (Number.isFinite(result.remaining)) {
        toast(t('accessRemaining').replace('{count}', result.remaining));
      }
      cleanup();
      dialog.close('granted');
      resolve(true);
    };

    const cleanup = () => {
      form.removeEventListener('submit', submitHandler);
      dialog.removeEventListener('close', closeHandler);
      dialog.removeEventListener('cancel', blockClose);
    };

    const closeHandler = () => {
      if (unlocked) {
        cleanup();
        resolve(true);
      } else {
        setTimeout(() => {
          updateHint();
          error.textContent = '';
          dialog.showModal();
          input.focus();
        }, 40);
      }
    };

    form.addEventListener('submit', submitHandler);
    dialog.addEventListener('close', closeHandler);

    updateHint();
    input.value = '';
    error.textContent = '';
    dialog.showModal();
    input.focus();
  });
}

/* ---------------- Settings ---------------- */
const settingsDialog = $('#settings');
function openSettingsDialog(){
  ensureStationOptions();
  $('#firstName').value    = state.user.firstName || '';
  $('#lastName').value     = state.user.lastName || '';
  $('#darkToggle').checked = state.ui.dark;
  $('#reduceMotion').checked = state.ui.reduceMotion;
  $('#highContrast').checked = state.ui.highContrast;
  $('#language').value     = state.lang;
  $('#notifyToggle').checked = state.app.notifications;
  $('#autoRefreshToggle').checked = state.app.autoRefresh;
  $('#units').value = state.app.units;
  $('#favoriteStation').value = state.app.favoriteStation || '';
  translate(settingsDialog);
  settingsDialog.showModal();
}

$('#btnSettings').addEventListener('click', openSettingsDialog);

$('#saveSettings').addEventListener('click', (e) => {
  e.preventDefault();
  state.user.firstName = $('#firstName').value.trim();
  state.user.lastName  = $('#lastName').value.trim();
  state.ui.dark        = $('#darkToggle').checked;
  state.ui.reduceMotion= $('#reduceMotion').checked;
  state.ui.highContrast= $('#highContrast').checked;
  state.app.notifications = $('#notifyToggle').checked;
  state.app.autoRefresh   = $('#autoRefreshToggle').checked;
  state.app.units         = $('#units').value;
  state.app.favoriteStation = $('#favoriteStation').value;
  const prevLang       = state.lang;
  state.lang           = $('#language').value;

  save('cws_user', state.user);
  save('cws_ui', state.ui);
  save('cws_lang', state.lang);
  save('cws_app', state.app);

  applyUiPrefs();
  translate();
  document.documentElement.lang = state.lang;
  title(t(routes[state.route].titleKey));
  applyPersonalization();
  ensureStationOptions();
  broadcastPrefs(true);
  scheduleAutoRefresh();
  settingsDialog.close();

  if (state.lang !== prevLang) mount(state.route);

  toast(t('settingsSaved').replace('{name}', state.user.firstName || t('friend')));
});

/* ---------------- Router ---------------- */
async function loadWidgetHtml(url){
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Laden fehlgeschlagen: ${url}`);
  return await res.text();
}

async function activateWidgetScripts(root){
  const scripts = $$('script', root);
  for (const original of scripts) {
    const script = document.createElement('script');
    for (const attr of original.attributes) {
      if (attr.name === 'defer' || attr.name === 'async') continue;
      script.setAttribute(attr.name, attr.value);
    }
    script.async = false;
    let ready = null;
    if (script.src) {
      ready = new Promise((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Script load failed: ${script.src}`));
      });
    } else {
      script.textContent = original.textContent;
    }
    original.replaceWith(script);
    if (ready) await ready;
  }
}

async function mount(route){
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  showSplash(8);
  const r = routes[route];
  state.route = route;

  $$('.nav-btn').forEach(b => {
    const on = b.dataset.route === route;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
  });

  title(t(r.titleKey));

  try {
    const html = await loadWidgetHtml(r.file);
    setProgress(45);
    const host = document.createElement('section');
    host.className = 'widget-grid';
    host.innerHTML = html;
    $('#app').innerHTML = '';
    $('#app').appendChild(host);
    translate(host);
    await activateWidgetScripts(host);
    setProgress(70);

    document.dispatchEvent(new CustomEvent('cws:user', { detail: state.user }));
    broadcastPrefs();

    await new Promise(res => setTimeout(res, 120));
    setProgress(100);
  } catch (e) {
    console.error(e);
    $('#app').innerHTML = `<div class="widget-card" style="padding:16px">${t('loadError')}: ${e.message}</div>`;
  } finally {
    setTimeout(hideSplash, 180);
  }
  scheduleAutoRefresh();
}

/* ---------------- Navigation ---------------- */
$$('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => mount(btn.dataset.route));
});

/* ---------------- First-Run ---------------- */
function firstRun(){
  const seen = load('cws_seen', false);
  if (seen) return;
  openSettingsDialog();
  save('cws_seen', true);
}

/* ---------------- Metric Details Dialog ---------------- */
const metricDialog = $('#metricDialog');
const metricDialogTitle = $('#metricDialogTitle');
const metricDialogSubtitle = $('#metricDialogSubtitle');
const metricDialogList = $('#metricDialogList');
const metricDialogMeta = $('#metricDialogMeta');
const metricDialogNote = $('#metricDialogNote');
const metricDialogEmpty = $('#metricDialogEmpty');

function resetMetricDialog(){
  if (metricDialogList) {
    metricDialogList.innerHTML = '';
    metricDialogList.hidden = true;
  }
  if (metricDialogMeta) {
    metricDialogMeta.innerHTML = '';
    metricDialogMeta.hidden = true;
  }
  if (metricDialogNote) {
    metricDialogNote.textContent = '';
    metricDialogNote.hidden = true;
  }
  if (metricDialogEmpty) {
    metricDialogEmpty.hidden = true;
  }
}

function fillMetricItems(container, items){
  if (!container) return false;
  container.innerHTML = '';
  if (!Array.isArray(items) || !items.length) {
    container.hidden = true;
    return false;
  }
  container.hidden = false;
  items.forEach(item => {
    const block = document.createElement('div');
    block.className = 'metric-item';
    const label = document.createElement('div');
    label.className = 'metric-item-label';
    label.textContent = item?.label ?? '';
    const value = document.createElement('div');
    value.className = 'metric-item-value';
    value.textContent = item?.value ?? '';
    block.append(label, value);
    if (item?.hint) {
      const hint = document.createElement('div');
      hint.className = 'metric-item-hint';
      hint.textContent = item.hint;
      block.appendChild(hint);
    }
    container.appendChild(block);
  });
  return true;
}

function fillMetricMeta(container, meta){
  if (!container) return false;
  container.innerHTML = '';
  if (!Array.isArray(meta) || !meta.length) {
    container.hidden = true;
    return false;
  }
  container.hidden = false;
  meta.forEach(item => {
    const row = document.createElement('div');
    row.className = 'metric-meta-row';
    const label = document.createElement('span');
    label.className = 'metric-meta-label';
    label.textContent = item?.label ?? '';
    const value = document.createElement('span');
    value.className = 'metric-meta-value';
    value.textContent = item?.value ?? '';
    row.append(label, value);
    container.appendChild(row);
  });
  return true;
}

function showMetricDetails(detail={}){
  if (!metricDialog) return;
  resetMetricDialog();
  const title = detail.title || t('metricDetailsTitle');
  if (metricDialogTitle) metricDialogTitle.textContent = title;
  if (metricDialogSubtitle) {
    const subtitle = (detail.subtitle || '').toString().trim();
    metricDialogSubtitle.textContent = subtitle;
    metricDialogSubtitle.hidden = subtitle.length === 0;
  }
  const hasItems = fillMetricItems(metricDialogList, detail.items);
  const hasMeta = fillMetricMeta(metricDialogMeta, detail.meta);
  if (metricDialogNote) {
    const note = (detail.note || '').toString().trim();
    metricDialogNote.textContent = note;
    metricDialogNote.hidden = note.length === 0;
  }
  if (metricDialogEmpty) {
    const showEmpty = !(hasItems || hasMeta || ((detail.note || '').toString().trim().length > 0));
    metricDialogEmpty.hidden = !showEmpty;
    if (showEmpty) {
      metricDialogEmpty.textContent = t('metricDetailsNoData');
    }
  }
  metricDialog.showModal();
}

if (metricDialog) {
  metricDialog.addEventListener('close', resetMetricDialog);
}

window.CWS.showMetricDetails = showMetricDetails;

/* ---------------- Legal Buttons ---------------- */
$$('.footer-btn[data-legal]').forEach(btn => {
  btn.addEventListener('click', () => openLegal(btn.dataset.legal));
});

/* ---------------- Toast (ARIA live) ---------------- */
let liveDiv;
function toast(msg){
  if (!liveDiv) {
    liveDiv = document.createElement('div');
    liveDiv.setAttribute('aria-live','polite');
    liveDiv.className = 'visually-hidden';
    document.body.appendChild(liveDiv);
  }
  liveDiv.textContent = msg;
}

/* ---------------- Service Worker ---------------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}

/* ---------------- Boot ---------------- */
(async function boot(){
  state.user = { ...state.user, ...load('cws_user', state.user) };
  state.ui   = { ...state.ui,   ...load('cws_ui', state.ui) };
  state.lang = load('cws_lang', state.lang);
  state.app  = { ...state.app,  ...load('cws_app', state.app) };
  normalizeAppState();
  document.documentElement.lang = state.lang;

  applyUiPrefs();
  translate();
  broadcastPrefs(true);
  ensureStationOptions();
  applyPersonalization();

  hideSplash();
  const accessGranted = await gateAccess();
  if (!accessGranted) return;

  showSplash(12);
  firstRun();
  await mount('dashboard');
})();
