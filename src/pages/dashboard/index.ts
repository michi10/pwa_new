import './dashboard.css';
import { DateTime } from 'luxon';
import { t } from '../../core/i18n';
import {
  uiStore,
  telemetryStore,
  stationsStore,
  eventBus,
  markDashboardLoaded,
  selectStation
} from '../../core/stores';
import type { TelemetryBundle } from '../../data/models';
import { detectStale } from '../../data/tb-client';
import { formatNumber, formatTime } from '../../ui/components/format';
import { getIconMarkup } from '../../ui/components/icons';

interface DashboardCardDefinition {
  key: keyof TelemetryBundle;
  labelKey: Parameters<typeof t>[0];
  unit?: string;
  icon: keyof typeof cardIcons;
  fractionDigits?: number;
}

const cardIcons = {
  temperature: 'temperature',
  humidity: 'humidity',
  wind: 'wind',
  uv: 'uv',
  rain: 'rain',
  dailyRain: 'rain',
  monthlyRain: 'rain'
} as const;

const cards: DashboardCardDefinition[] = [
  { key: 'temperature', labelKey: 'dashboard.card.temperature', unit: '°C', icon: 'temperature', fractionDigits: 1 },
  { key: 'humidity', labelKey: 'dashboard.card.humidity', unit: '%', icon: 'humidity', fractionDigits: 0 },
  { key: 'wind', labelKey: 'dashboard.card.wind', unit: 'km/h', icon: 'wind', fractionDigits: 0 },
  { key: 'uv', labelKey: 'dashboard.card.uv', icon: 'uv', fractionDigits: 1 },
  { key: 'rain', labelKey: 'dashboard.card.rain', unit: 'mm', icon: 'rain', fractionDigits: 1 },
  { key: 'dailyRain', labelKey: 'dashboard.card.rainDaily', unit: 'mm', icon: 'rain', fractionDigits: 1 },
  { key: 'monthlyRain', labelKey: 'dashboard.card.rainMonthly', unit: 'mm', icon: 'rain', fractionDigits: 1 }
];

let container: HTMLElement;
let hintEl: HTMLElement;
let cardsWrapper: HTMLElement;
let loaderEl: HTMLElement;
let updatedEl: HTMLElement;
let staleBadge: HTMLElement;
const cardRefs = new Map<string, { value: HTMLElement; meta: HTMLElement }>();
let currentStationId: string | undefined;
let splashShown = false;

function createCard(def: DashboardCardDefinition): HTMLElement {
  const card = document.createElement('article');
  card.className = 'card';
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  const title = document.createElement('h2');
  title.textContent = t(def.labelKey);
  const iconWrap = document.createElement('span');
  iconWrap.className = 'dashboard-card-icon';
  iconWrap.innerHTML = getIconMarkup(cardIcons[def.icon]);
  header.appendChild(title);
  header.appendChild(iconWrap);
  const value = document.createElement('div');
  value.className = 'value';
  value.textContent = '–';
  const meta = document.createElement('div');
  meta.className = 'meta';
  card.appendChild(header);
  card.appendChild(value);
  card.appendChild(meta);
  cardRefs.set(def.key, { value, meta });
  return card;
}

function ensureSplash(): void {
  if (!splashShown) {
    loaderEl.classList.remove('hidden');
    cardsWrapper.classList.add('hidden');
    splashShown = true;
  }
}

function hideSplash(): void {
  loaderEl.classList.add('hidden');
  cardsWrapper.classList.remove('hidden');
  markDashboardLoaded();
}

function updateView(): void {
  const telemetry = telemetryStore.get();
  const stationBundle = telemetry.find((bundle) => bundle.stationId === currentStationId);
  if (!currentStationId) {
    hintEl.classList.remove('hidden');
    cardsWrapper.classList.add('hidden');
    loaderEl.classList.add('hidden');
    updatedEl.textContent = '';
    staleBadge.classList.add('hidden');
    return;
  }
  hintEl.classList.add('hidden');

  if (!stationBundle) {
    ensureSplash();
    return;
  }
  hideSplash();

  const stale = detectStale(stationBundle);
  if (stale) {
    staleBadge.classList.remove('hidden');
  } else {
    staleBadge.classList.add('hidden');
  }

  cards.forEach((card) => {
    const ref = cardRefs.get(card.key);
    if (!ref) return;
    const measurement = stationBundle[card.key];
    if (measurement && typeof measurement === 'object' && 'value' in measurement) {
      ref.value.textContent = formatNumber(measurement.value, { unit: card.unit, fractionDigits: card.fractionDigits });
      ref.meta.textContent = t('dashboard.updatedAt', { time: formatTime(measurement.ts) });
    } else {
      ref.value.textContent = '–';
      ref.meta.textContent = '';
    }
  });

  const lastUpdated = stationBundle.updatedAt ?? stationBundle.temperature?.ts ?? stationBundle.humidity?.ts;
  if (lastUpdated) {
    const formatted = DateTime.fromMillis(lastUpdated).setZone('Europe/Vienna').toFormat('dd.LL.yyyy HH:mm');
    updatedEl.textContent = `${t('dashboard.updatedAt', { time: formatted })}`;
  } else {
    updatedEl.textContent = '';
  }
}

export function initDashboard(root: HTMLElement): void {
  container = document.createElement('section');
  container.className = 'dashboard-page safe-area-bottom';

  hintEl = document.createElement('p');
  hintEl.className = 'dashboard-hint';
  hintEl.textContent = t('dashboard.chooseStation');

  loaderEl = document.createElement('div');
  loaderEl.className = 'dashboard-loader hidden';
  const loaderIcon = document.createElement('div');
  loaderIcon.className = 'loader-sun';
  const loaderText = document.createElement('p');
  loaderText.textContent = t('dashboard.loader');
  loaderText.setAttribute('role', 'status');
  loaderText.style.margin = '0';
  loaderEl.appendChild(loaderIcon);
  loaderEl.appendChild(loaderText);

  staleBadge = document.createElement('span');
  staleBadge.className = 'dashboard-stale hidden';
  staleBadge.textContent = t('dashboard.stale');

  cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'dashboard-cards hidden';
  cards.forEach((def) => {
    cardsWrapper.appendChild(createCard(def));
  });

  updatedEl = document.createElement('div');
  updatedEl.className = 'dashboard-updated';

  container.append(hintEl, loaderEl, staleBadge, cardsWrapper, updatedEl);
  root.appendChild(container);

  telemetryStore.subscribe(() => updateView());
  uiStore.subscribe((state) => {
    currentStationId = state.selectedStationId;
    updateView();
  });

  stationsStore.subscribe((stations) => {
    if (!stations.length) return;
    const first = stations[0];
    if (!uiStore.get().selectedStationId) {
      selectStation(first.id);
    }
  });

  eventBus.on('telemetry:updated', () => {
    updateView();
  });
}

export function destroyDashboard(): void {
  container?.remove();
  cardRefs.clear();
}
