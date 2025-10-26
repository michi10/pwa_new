import './ui/tokens.css';
import './ui/utilities.css';
import './ui/app.css';

import { t } from './core/i18n';
import { router } from './core/router';
import {
  uiStore,
  stationsStore,
  updateStations,
  updateTelemetry,
  updateRainfall,
  updateHighlights,
  updateCalendar,
  updateNetworkStatus,
  setActiveTab,
  selectStation
} from './core/stores';
import {
  loadStations,
  saveStations,
  loadTelemetry,
  saveTelemetry,
  loadRainfall,
  saveRainfall,
  loadCalendar,
  clearAll
} from './core/storage';
import {
  fetchStations,
  fetchLatestTelemetry,
  buildRainfallSummary,
  buildHighlights
} from './data/tb-client';
import type { TabRoute } from './core/stores';
import { initDashboard } from './pages/dashboard';
import { initMapPage } from './pages/map';
import { initCalendarPage } from './pages/calendar';
import { initRainPage } from './pages/rain';
import { initInfoPage } from './pages/info';
import { getIconMarkup, IconName } from './ui/components/icons';

const appRoot = document.getElementById('app');
if (!appRoot) {
  throw new Error('Root-Element nicht gefunden');
}

const shell = document.createElement('div');
shell.className = 'app-shell';

const topBar = document.createElement('header');
topBar.className = 'top-bar';

const homeButton = document.createElement('button');
homeButton.className = 'icon-button home-button';
homeButton.type = 'button';
homeButton.innerHTML = getIconMarkup('home');
homeButton.setAttribute('aria-label', t('home.label'));
homeButton.addEventListener('click', () => {
  router.go('dashboard');
});

topBar.appendChild(homeButton);

const brand = document.createElement('div');
brand.className = 'brand';
const brandTitle = document.createElement('p');
brandTitle.className = 'brand-title';
brandTitle.innerHTML = `<span>connected</span> Wetterstationen™`;
const brandSubtitle = document.createElement('p');
brandSubtitle.className = 'brand-subtitle';
brandSubtitle.textContent = t('app.subtitle');
brand.append(brandTitle, brandSubtitle);

topBar.appendChild(brand);

const reloadButton = document.createElement('button');
reloadButton.className = 'icon-button reload-button';
reloadButton.type = 'button';
reloadButton.innerHTML = getIconMarkup('reload');
reloadButton.setAttribute('aria-label', t('reload.label'));

topBar.appendChild(reloadButton);

const offlineBanner = document.createElement('div');
offlineBanner.className = 'offline-banner hidden';
offlineBanner.innerHTML = `${getIconMarkup('info')}<span>${t('offline.banner')}</span>`;

const mainContent = document.createElement('main');
mainContent.className = 'main-content';

const viewContainers: Record<TabRoute, HTMLElement> = {
  dashboard: document.createElement('div'),
  map: document.createElement('div'),
  calendar: document.createElement('div'),
  rain: document.createElement('div'),
  info: document.createElement('div')
};

Object.values(viewContainers).forEach((container) => {
  container.className = 'page-view';
  mainContent.appendChild(container);
});

const bottomNav = document.createElement('nav');
bottomNav.className = 'bottom-nav safe-area-bottom';

const navItems: Array<{ id: TabRoute; label: string; icon: IconName }> = [
  { id: 'dashboard', label: t('nav.dashboard'), icon: 'home' },
  { id: 'map', label: t('nav.map'), icon: 'map' },
  { id: 'calendar', label: t('nav.calendar'), icon: 'calendar' },
  { id: 'rain', label: t('nav.rain'), icon: 'rain' },
  { id: 'info', label: t('nav.info'), icon: 'info' }
];

const navButtons = new Map<TabRoute, HTMLButtonElement>();
navItems.forEach((item) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.innerHTML = `${getIconMarkup(item.icon)}<span>${item.label}</span>`;
  button.addEventListener('click', () => router.go(item.id));
  button.setAttribute('aria-label', item.label);
  navButtons.set(item.id, button);
  bottomNav.appendChild(button);
});

shell.append(topBar, offlineBanner, mainContent, bottomNav);
appRoot.appendChild(shell);

const stationWrapper = document.createElement('div');
stationWrapper.className = 'station-select';
const stationLabel = document.createElement('label');
stationLabel.textContent = t('dashboard.stationLabel');
stationLabel.setAttribute('for', 'station-select');
const stationSelect = document.createElement('select');
stationSelect.id = 'station-select';
stationSelect.setAttribute('aria-label', t('dashboard.dropdownLabel'));
stationSelect.addEventListener('change', (event) => {
  const value = (event.target as HTMLSelectElement).value;
  selectStation(value || undefined);
  window.localStorage.setItem('cws-selected-station', value);
});
stationWrapper.append(stationLabel, stationSelect);
brand.appendChild(stationWrapper);

function updateStationOptions() {
  const stations = stationsStore.get().slice().sort((a, b) => a.name.localeCompare(b.name, 'de-AT'));
  stationSelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = t('dashboard.dropdownLabel');
  stationSelect.appendChild(placeholder);
  stations.forEach((station) => {
    const option = document.createElement('option');
    option.value = station.id;
    option.textContent = station.name;
    stationSelect.appendChild(option);
  });
  const current = uiStore.get().selectedStationId;
  if (current) {
    stationSelect.value = current;
  }
}

const pageInitializers: Record<TabRoute, () => Promise<void> | void> = {
  dashboard: () => initDashboard(viewContainers.dashboard),
  map: () => initMapPage(viewContainers.map),
  calendar: () => initCalendarPage(viewContainers.calendar),
  rain: () => initRainPage(viewContainers.rain),
  info: () => initInfoPage(viewContainers.info)
};
const pageReady = new Set<TabRoute>();

async function showRoute(route: TabRoute) {
  if (!pageReady.has(route)) {
    const initializer = pageInitializers[route];
    if (initializer) {
      await initializer();
      pageReady.add(route);
    }
  }
  Object.entries(viewContainers).forEach(([key, element]) => {
    element.classList.toggle('active', key === route);
  });
  navButtons.forEach((button, key) => {
    button.setAttribute('aria-current', key === route ? 'page' : 'false');
  });
  setActiveTab(route);
  if (route === 'dashboard') {
    homeButton.classList.add('active');
    homeButton.style.visibility = 'visible';
    homeButton.disabled = false;
    homeButton.tabIndex = 0;
    homeButton.setAttribute('aria-hidden', 'false');
  } else {
    homeButton.classList.remove('active');
    homeButton.style.visibility = 'hidden';
    homeButton.disabled = true;
    homeButton.tabIndex = -1;
    homeButton.setAttribute('aria-hidden', 'true');
  }
}

pageInitializers.dashboard();
pageReady.add('dashboard');
viewContainers.dashboard.classList.add('active');
navButtons.get('dashboard')?.setAttribute('aria-current', 'page');
homeButton.style.visibility = 'visible';
homeButton.classList.add('active');
homeButton.disabled = false;
homeButton.tabIndex = 0;
homeButton.setAttribute('aria-hidden', 'false');

router.onChange((route) => {
  showRoute(route).catch((error) => console.error('Navigation fehlgeschlagen', error));
});
router.start();

stationsStore.subscribe(updateStationOptions);
uiStore.subscribe((state) => {
  updateStationOptions();
  stationSelect.value = state.selectedStationId ?? '';
});

function handleOfflineStatus() {
  const offline = !navigator.onLine;
  updateNetworkStatus(offline);
  offlineBanner.classList.toggle('hidden', !offline);
}

window.addEventListener('online', handleOfflineStatus);
window.addEventListener('offline', handleOfflineStatus);
handleOfflineStatus();

async function bootstrapFromStorage() {
  const [storedStations, storedTelemetry, storedRainfall, storedCalendar] = await Promise.all([
    loadStations(),
    loadTelemetry(),
    loadRainfall(),
    loadCalendar()
  ]);
  if (storedStations?.length) {
    updateStations(storedStations);
  }
  if (storedTelemetry?.length) {
    updateTelemetry(storedTelemetry);
    updateHighlights(buildHighlights(storedTelemetry));
  }
  if (storedRainfall?.length) {
    updateRainfall(storedRainfall);
  }
  if (storedCalendar?.length) {
    updateCalendar(storedCalendar);
  }
  const storedStation = window.localStorage.getItem('cws-selected-station');
  if (storedStation) {
    selectStation(storedStation);
  }
}

async function refreshData() {
  try {
    const stations = await fetchStations();
    updateStations(stations);
    await saveStations(stations);

    const telemetry = await fetchLatestTelemetry(stations);
    updateTelemetry(telemetry);
    await saveTelemetry(telemetry);

    const rainfallDay = buildRainfallSummary(telemetry, 'day');
    const rainfallMonth = buildRainfallSummary(telemetry, 'month');
    const rainfallCombined = [...rainfallDay, ...rainfallMonth];
    updateRainfall(rainfallCombined);
    await saveRainfall(rainfallCombined);

    const highlights = buildHighlights(telemetry);
    updateHighlights(highlights);

    updateNetworkStatus(false);
  } catch (error) {
    console.error('Aktualisierung fehlgeschlagen', error);
  }
}

bootstrapFromStorage().then(() => {
  refreshData().catch((error) => console.error(error));
});

setInterval(() => {
  if (navigator.onLine) {
    refreshData().catch(() => undefined);
  }
}, 120000);

async function triggerReload() {
  window.localStorage.removeItem('cws-selected-station');
  await clearAll();
  if (!('serviceWorker' in navigator)) {
    window.location.reload();
    return;
  }
  const registration = await navigator.serviceWorker.ready;
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'FULL_REFRESH' });
  } else if (registration.active) {
    registration.active.postMessage({ type: 'FULL_REFRESH' });
  }
}

reloadButton.addEventListener('click', () => {
  triggerReload().catch((error) => {
    console.error('Reload fehlgeschlagen', error);
    window.location.reload();
  });
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_REFRESH_COMPLETE') {
      window.location.reload();
    }
  });
  navigator.serviceWorker
    .register('/sw.js')
    .catch((error) => console.error('Service Worker Registrierung fehlgeschlagen', error));
}
