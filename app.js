/* ============================================================================
   CWS PWA – App Shell
   - Routing, Splash, Settings, Personalisierung, Progressive Loading
   - Widgets werden on-demand geladen, Demodaten via data/demo.js
   ============================================================================ */

const routes = {
  dashboard: { title: 'Dashboard', file: 'widgets/dashboard.html' },
  map:       { title: 'Karte',     file: 'widgets/map.html' },
  calendar:  { title: 'Kalender',  file: 'widgets/calendar.html' },
  rain:      { title: 'Niederschlag', file: 'widgets/rain.html' }
};

const state = {
  user: { firstName: '', lastName: '' },
  ui:   { dark: false, reduceMotion: false, highContrast: false },
  route: 'dashboard'
};

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
  dlg.showModal();
});

$('#saveSettings').addEventListener('click', (e) => {
  e.preventDefault();
  state.user.firstName = $('#firstName').value.trim();
  state.user.lastName  = $('#lastName').value.trim();
  state.ui.dark        = $('#darkToggle').checked;
  state.ui.reduceMotion= $('#reduceMotion').checked;
  state.ui.highContrast= $('#highContrast').checked;

  save('cws_user', state.user);
  save('cws_ui', state.ui);
  applyUiPrefs();
  dlg.close();
  // freundlicher Toast
  toast(`Danke, ${state.user.firstName || 'Freund'}! Einstellungen gespeichert.`);
});

/* ---------------- UI Prefs ---------------- */
function applyUiPrefs(){
  document.documentElement.classList.toggle('dark', state.ui.dark);
  document.documentElement.classList.toggle('hc', state.ui.highContrast);
  document.documentElement.classList.toggle('reduce', state.ui.reduceMotion);
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

  title(r.title);

  try {
    const html = await loadWidgetHtml(r.file);
    setProgress(35);
    const host = document.createElement('section');
    host.className = 'widget-grid';
    host.innerHTML = html; // enthält eigene CSS/JS Includes
    $('#app').innerHTML = '';
    $('#app').appendChild(host);
    setProgress(70);

    // Personalisierung in Widgets verfügbar machen
    document.dispatchEvent(new CustomEvent('cws:user', { detail: state.user }));

    // kleine Pause für ruhigen Übergang
    await new Promise(r => setTimeout(r, 100));
    setProgress(100);
  } catch (e) {
    console.error(e);
    $('#app').innerHTML = `<div class="widget-card" style="padding:16px">Fehler beim Laden: ${e.message}</div>`;
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
  applyUiPrefs();

  firstRun();
  await mount('dashboard'); // Startseite
})();
