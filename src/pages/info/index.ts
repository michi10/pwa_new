import './info.css';
import { DateTime } from 'luxon';
import { t } from '../../core/i18n';
import { highlightsStore, rainfallStore, stationsStore, uiStore } from '../../core/stores';
import { formatNumber } from '../../ui/components/format';

let container: HTMLElement;
let highlightGrid: HTMLElement;
let rainList: HTMLElement;
let emptyEl: HTMLElement;
let optInContainer: HTMLElement;
let analyticsEnabled = false;
let observer: PerformanceObserver | null = null;

function ensureAnalytics() {
  if (!analyticsEnabled) return;
  if (observer || typeof PerformanceObserver === 'undefined') {
    return;
  }
  observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      console.info('[CWS][Analytics]', entry.name, Math.round(entry.duration || (entry as any).value));
    });
  });
  try {
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observer.observe({ type: 'event', buffered: true, durationThreshold: 40 });
  } catch (error) {
    console.warn('PerformanceObserver nicht verfügbar', error);
  }
}

function loadAnalyticsPreference() {
  analyticsEnabled = window.localStorage.getItem('cws-analytics-opt-in') === 'true';
  if (analyticsEnabled) {
    ensureAnalytics();
  }
}

function setAnalyticsPreference(enabled: boolean) {
  analyticsEnabled = enabled;
  window.localStorage.setItem('cws-analytics-opt-in', enabled ? 'true' : 'false');
  if (!enabled && observer) {
    observer.disconnect();
    observer = null;
  }
  ensureAnalytics();
  renderOptIn();
}

function renderHighlights() {
  const highlights = highlightsStore.get();
  const stations = stationsStore.get();
  highlightGrid.innerHTML = '';
  if (!highlights.length) {
    emptyEl.classList.remove('hidden');
    highlightGrid.classList.add('hidden');
    return;
  }
  emptyEl.classList.add('hidden');
  highlightGrid.classList.remove('hidden');
  highlights.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'info-card';
    const titleKey =
      item.type === 'rain' ? 'info.highestRain' : item.type === 'temperature' ? 'info.highestTemp' : 'info.highestWind';
    const station = stations.find((entry) => entry.id === item.stationId);
    const formatted = item.unit === '°C' ? formatNumber(item.value, { unit: item.unit, fractionDigits: 1 }) : formatNumber(item.value, { unit: item.unit });
    const ts = DateTime.fromMillis(item.ts).setZone('Europe/Vienna').toFormat('dd.LL.yyyy HH:mm');
    card.innerHTML = `
      <h3>${t(titleKey)}</h3>
      <div class="value">${formatted}</div>
      <div class="meta">${station?.name ?? item.stationId} · ${ts}</div>
    `;
    highlightGrid.appendChild(card);
  });
}

function renderRainLeaders() {
  const stations = stationsStore.get();
  const top = rainfallStore
    .get()
    .filter((entry) => entry.period === 'day')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
  rainList.innerHTML = '';
  if (!top.length) {
    return;
  }
  top.forEach((entry, index) => {
    const item = document.createElement('div');
    item.className = 'info-card';
    item.innerHTML = `
      <h3>${index + 1}. ${stations.find((station) => station.id === entry.stationId)?.name ?? entry.stationId}</h3>
      <div class="value">${formatNumber(entry.amount, { unit: 'mm', fractionDigits: 1 })}</div>
      <div class="meta">${t('rain.updated', { time: DateTime.fromMillis(entry.updatedAt).setZone('Europe/Vienna').toFormat('HH:mm') })}</div>
    `;
    rainList.appendChild(item);
  });
}

function renderOptIn() {
  optInContainer.innerHTML = '';
  const title = document.createElement('h3');
  title.textContent = t('analytics.optIn');
  const description = document.createElement('p');
  description.textContent = t('analytics.optInDescription');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = analyticsEnabled ? t('analytics.optInNo') : t('analytics.optInYes');
  button.addEventListener('click', () => setAnalyticsPreference(!analyticsEnabled));
  optInContainer.append(title, description, button);
}

export function initInfoPage(root: HTMLElement) {
  loadAnalyticsPreference();

  container = document.createElement('section');
  container.className = 'info-page safe-area-bottom';
  const heading = document.createElement('h2');
  heading.textContent = t('info.title');

  highlightGrid = document.createElement('div');
  highlightGrid.className = 'info-grid';

  rainList = document.createElement('div');
  rainList.className = 'info-grid';

  emptyEl = document.createElement('div');
  emptyEl.className = 'info-empty hidden';
  emptyEl.textContent = t('info.noData');

  optInContainer = document.createElement('div');
  optInContainer.className = 'analytics-optin';

  container.append(heading, highlightGrid, emptyEl);

  const rainHeading = document.createElement('h3');
  rainHeading.textContent = t('info.topStations');
  container.append(rainHeading, rainList, optInContainer);

  root.appendChild(container);

  renderOptIn();
  renderHighlights();
  renderRainLeaders();

  highlightsStore.subscribe(() => {
    renderHighlights();
  });
  rainfallStore.subscribe(() => {
    renderRainLeaders();
  });
  stationsStore.subscribe(() => {
    renderHighlights();
    renderRainLeaders();
  });
  uiStore.subscribe((state) => {
    if (state.activeTab === 'info') {
      renderHighlights();
      renderRainLeaders();
    }
  });
}
