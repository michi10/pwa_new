/* ============================================================================
   CWS PWA – App Shell
   - Routing, Splash, Settings, Personalisierung, Progressive Loading
   - Widgets werden on-demand geladen (Shadow DOM), Demodaten via data/demo.js
   ============================================================================ */

const state = {
  user: { firstName: '', lastName: '' },
  ui:   { dark: false, reduceMotion: false, highContrast: false },
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
    dataSource: 'Datenquelle',
    dataHint: 'Aktuell werden Demodaten verwendet. Später wird hier ThingsBoard verbunden.',
    save: 'Speichern',
    openSettings: 'Einstellungen öffnen',
    navigation: 'Navigation',
    header: 'Kopfzeile',
    settingsSaved: 'Danke, {name}! Einstellungen gespeichert.',
    friend: 'Freund',
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
    evtSoftwareUpdate: 'Softwareupdate'
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
    dataSource: 'Data source',
    dataHint: 'Currently demo data is used. Later, ThingsBoard will be connected here.',
    save: 'Save',
    openSettings: 'Open settings',
    navigation: 'Navigation',
    header: 'Header',
    settingsSaved: 'Thanks, {name}! Settings saved.',
    friend: 'friend',
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
    evtSoftwareUpdate: 'Software update'
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
const bar    = document.getElementById('progressBar');
function showSplash(to=10){ splash.classList.add('visible'); bar.style.width = `${to}%`; bar.setAttribute('aria-valuenow', to); }
function setProgress(to){ bar.style.width = `${to}%`; bar.setAttribute('aria-valuenow', to); }
function hideSplash(){ splash.classList.remove('visible'); }

/* ---------------- Helpers ---------------- */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
function save(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function load(k,def){ try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } }
function title(t){ $('#pageTitle').textContent = t; document.title = `CWS – ${t}`; }

/* ---------------- Settings ---------------- */
const dlg = $('#settings');
$('#btnSettings').addEventListener('click', () => {
  // Prefill
  $('#firstName').value    = state.user.firstName || '';
  $('#lastName').value     = state.user.lastName || '';
  $('#darkToggle').checked = state.ui.dark;
  $('#reduceMotion').checked = state.ui.reduceMotion;
  $('#highContrast').checked = state.ui.highContrast;
  $('#language').value     = state.lang;
  dlg.showModal();
});

$('#saveSettings').addEventListener('click', (e) => {
  e.preventDefault();
  state.user.firstName = $('#firstName').value.trim();
  state.user.lastName  = $('#lastName').value.trim();
  state.ui.dark        = $('#darkToggle').checked;
  state.ui.reduceMotion= $('#reduceMotion').checked;
  state.ui.highContrast= $('#highContrast').checked;
  const prevLang       = state.lang;
  state.lang           = $('#language').value;

  save('cws_user', state.user);
  save('cws_ui', state.ui);
  save('cws_lang', state.lang);
  applyUiPrefs();
  translate();
  document.documentElement.lang = state.lang;
  title(t(routes[state.route].titleKey));
  dlg.close();
  if (state.lang !== prevLang) mount(state.route);
  // freundlicher Toast
  toast(t('settingsSaved').replace('{name}', state.user.firstName || t('friend')));
});

/* ---------------- UI Prefs ---------------- */
function applyUiPrefs(){
  document.documentElement.classList.toggle('dark', state.ui.dark);
  document.documentElement.classList.toggle('hc', state.ui.highContrast);
}

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

  // mark active tab
  $$('.nav-btn').forEach(b=>{
    const on = b.dataset.route === route;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
  });

  title(t(r.titleKey));

  try {
    const html = await loadWidgetHtml(r.file);
    setProgress(35);
    const host = document.createElement('section');
    host.className = 'widget-grid';
    host.innerHTML = html; // enthält eigene CSS/JS Includes
    $('#app').innerHTML = '';
    $('#app').appendChild(host);
    translate(host);
    setProgress(70);

    // Personalisierung in Widgets verfügbar machen
    document.dispatchEvent(new CustomEvent('cws:user', { detail: state.user }));

    // kleine Pause für ruhigen Übergang
    await new Promise(r => setTimeout(r, 100));
    setProgress(100);
  } catch (e) {
    console.error(e);
    $('#app').innerHTML = `<div class="widget-card" style="padding:16px">${t('loadError')}: ${e.message}</div>`;
  } finally {
    hideSplash();
  }
}

/* ---------------- Nav ---------------- */
$$('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => mount(btn.dataset.route));
});

/* ---------------- First-Run ---------------- */
function firstRun(){
  const seen = load('cws_seen', false);
  if (seen) return;
  dlg.showModal();
  save('cws_seen', true);
}

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

/* ---------------- SW ---------------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}

/* ---------------- Boot ---------------- */
(async function boot(){
  // Load prefs
  state.user = load('cws_user', state.user);
  state.ui   = load('cws_ui', state.ui);
  state.lang = load('cws_lang', state.lang);
  document.documentElement.lang = state.lang;
  applyUiPrefs();
  translate();

  firstRun();
  await mount('dashboard'); // Startseite
})();
