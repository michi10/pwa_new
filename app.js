/* ============================================================================
   CWS PWA – App Shell 2025
   - Routing, Splash, Settings, Personalisierung, Progressive Loading
   - Zugriffscode-Prüfung (Demo-Server Simulation)
   - Widgets werden on-demand geladen (Shadow DOM), Demodaten via data/demo.js
   ============================================================================ */

const state = {
  user: { firstName: '', lastName: '' },
  ui:   { dark: false, reduceMotion: false, highContrast: false },
  app:  { units: 'metric', notifications: true, autoRefresh: true, favoriteStation: '' },
  route: 'dashboard',
  lang: 'de'
};

const routes = {
  dashboard: { titleKey: 'titleDashboard', file: 'widgets/dashboard.html' },
  map:       { titleKey: 'titleMap',       file: 'widgets/map.html' },
  calendar:  { titleKey: 'titleCalendar',  file: 'widgets/calendar.html' },
  rain:      { titleKey: 'titleRain',      file: 'widgets/rain.html' }
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
    navHome: 'Home',
    navMap: 'Karte',
    navCalendar: 'Kalender',
    navRain: 'Regen',
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
    measurementUnits: 'Einheiten',
    unitsMetric: 'Metrisch (°C, km/h)',
    unitsImperial: 'Imperial (°F, mph)',
    favoriteStation: 'Lieblingsstation',
    favoriteStationNone: 'Keine Auswahl',
    dataSource: 'Datenquelle',
    dataHint: 'Aktuell werden Demodaten verwendet. Später wird hier ThingsBoard verbunden.',
    save: 'Speichern',
    openSettings: 'Einstellungen öffnen',
    navigation: 'Navigation',
    header: 'Kopfzeile',
    settingsSaved: 'Danke, {name}! Einstellungen gespeichert.',
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
    unitMph: 'mph'
  },
  en: {
    splashLoading: 'Loading app…',
    loading: 'Loading',
    progress: 'Progress',
    titleDashboard: 'Dashboard',
    titleMap: 'Map',
    titleCalendar: 'Calendar',
    titleRain: 'Rain',
    navHome: 'Home',
    navMap: 'Map',
    navCalendar: 'Calendar',
    navRain: 'Rain',
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
    measurementUnits: 'Units',
    unitsMetric: 'Metric (°C, km/h)',
    unitsImperial: 'Imperial (°F, mph)',
    favoriteStation: 'Favourite station',
    favoriteStationNone: 'No selection',
    dataSource: 'Data source',
    dataHint: 'Currently demo data is used. Later, ThingsBoard will be connected here.',
    save: 'Save',
    openSettings: 'Open settings',
    navigation: 'Navigation',
    header: 'Header',
    settingsSaved: 'Thanks, {name}! Settings saved.',
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
    unitMph: 'mph'
  }
};

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
  const select = $('#favoriteStation');
  if (!select) return;
  const current = state.app.favoriteStation || '';
  select.innerHTML = '';
  const optNone = document.createElement('option');
  optNone.value = '';
  optNone.textContent = t('favoriteStationNone');
  select.appendChild(optNone);
  (window.CWS_DEMO?.stations || []).forEach(station => {
    const opt = document.createElement('option');
    opt.value = station.id;
    opt.textContent = station.name;
    select.appendChild(opt);
  });
  select.value = current;
}

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
  broadcastPrefs(true);
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

async function mount(route){
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
  applyPersonalization();

  await gateAccess();
  firstRun();
  await mount('dashboard');
})();
