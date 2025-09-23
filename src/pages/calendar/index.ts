import './calendar.css';
import { DateTime } from 'luxon';
import { t } from '../../core/i18n';
import {
  uiStore,
  calendarStore,
  markCalendarLoaded
} from '../../core/stores';
import { fetchCalendarRange } from '../../data/tb-client';
import type { CalendarEntry } from '../../data/models';
import { formatDate, formatNumber } from '../../ui/components/format';
import { saveCalendar } from '../../core/storage';

let container: HTMLElement;
let listEl: HTMLElement;
let loaderEl: HTMLElement;
let emptyEl: HTMLElement;
let headerLabel: HTMLElement;
let dayButton: HTMLButtonElement;
let monthButton: HTMLButtonElement;
let prevButton: HTMLButtonElement;
let nextButton: HTMLButtonElement;

let currentView: 'day' | 'month' = 'day';
let currentMonth = DateTime.now().setZone('Europe/Vienna').startOf('month');
let loading = false;
let splashShown = false;

const cache = new Map<string, CalendarEntry[]>();

function showLoader(): void {
  if (!splashShown) {
    loaderEl.classList.remove('hidden');
    listEl.classList.add('hidden');
    emptyEl.classList.add('hidden');
    splashShown = true;
  }
}

function hideLoader(): void {
  loaderEl.classList.add('hidden');
  listEl.classList.remove('hidden');
  markCalendarLoaded();
}

function getEntriesForStation(stationId: string): CalendarEntry[] {
  if (!cache.has(stationId)) {
    cache.set(stationId, calendarStore.get().filter((entry) => entry.stationId === stationId));
  }
  return cache.get(stationId) ?? [];
}

function mergeEntries(stationId: string, entries: CalendarEntry[]): void {
  const existing = getEntriesForStation(stationId);
  const map = new Map<string, CalendarEntry>();
  existing.forEach((entry) => map.set(entry.dateISO, entry));
  entries.forEach((entry) => map.set(entry.dateISO, entry));
  const merged = Array.from(map.values()).sort((a, b) => (a.dateISO > b.dateISO ? 1 : -1));
  cache.set(stationId, merged);
  calendarStore.set([...calendarStore.get().filter((entry) => entry.stationId !== stationId), ...merged]);
  saveCalendar(calendarStore.get()).catch(() => undefined);
}

async function ensureMonthData(stationId: string, month: DateTime, silent = false): Promise<void> {
  const entries = getEntriesForStation(stationId);
  const monthKey = month.toFormat('yyyy-LL');
  const hasMonth = entries.some((entry) => entry.dateISO.startsWith(monthKey));
  if (hasMonth) {
    return;
  }
  if (!silent) {
    loading = true;
    showLoader();
  }
  const start = month.startOf('month');
  const end = month.endOf('month');
  const fetched = await fetchCalendarRange(stationId, start, end);
  mergeEntries(stationId, fetched);
  if (!silent) {
    loading = false;
    hideLoader();
  }
  prefetchAdjacent(stationId, month);
}

function prefetchAdjacent(stationId: string, month: DateTime) {
  const next = month.plus({ months: 1 });
  const prev = month.minus({ months: 1 });
  ensureMonthData(stationId, next, true).catch(() => undefined);
  ensureMonthData(stationId, prev, true).catch(() => undefined);
}

function render(): void {
  const stationId = uiStore.get().selectedStationId;
  if (!stationId) {
    listEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    emptyEl.textContent = t('dashboard.chooseStation');
    loaderEl.classList.add('hidden');
    return;
  }

  headerLabel.textContent = currentMonth.setLocale('de-AT').toFormat('LLLL yyyy');
  dayButton.setAttribute('aria-pressed', currentView === 'day' ? 'true' : 'false');
  monthButton.setAttribute('aria-pressed', currentView === 'month' ? 'true' : 'false');

  const entries = getEntriesForStation(stationId);
  const monthKey = currentMonth.toFormat('yyyy-LL');
  const monthEntries = entries.filter((entry) => entry.dateISO.startsWith(monthKey));

  if (loading && !monthEntries.length) {
    showLoader();
    return;
  }
  hideLoader();

  if (!monthEntries.length) {
    listEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    emptyEl.textContent = t('calendar.noData');
    return;
  }

  emptyEl.classList.add('hidden');
  listEl.classList.remove('hidden');
  listEl.innerHTML = '';

  if (currentView === 'day') {
    monthEntries.forEach((entry) => {
      const card = document.createElement('div');
      card.className = 'calendar-card';
      card.innerHTML = `
        <div><strong>${formatDate(DateTime.fromISO(entry.dateISO, { zone: 'Europe/Vienna' }).toMillis())}</strong></div>
        <div><strong>${t('calendar.rain')}</strong><div>${formatNumber(entry.rain, { unit: 'mm' })}</div></div>
        <div><strong>${t('calendar.temperature')}</strong><div>${formatNumber(entry.temperatureAvg, { unit: '°C' })}</div></div>
        <div><strong>${t('calendar.wind')}</strong><div>${formatNumber(entry.windMax, { unit: 'km/h' })}</div></div>
      `;
      listEl.appendChild(card);
    });
  } else {
    const grouped = new Map<string, { rain: number; tempSum: number; tempCount: number; windMax: number }>();
    monthEntries.forEach((entry) => {
      const monthId = entry.dateISO.slice(0, 7);
      if (!grouped.has(monthId)) {
        grouped.set(monthId, { rain: 0, tempSum: 0, tempCount: 0, windMax: 0 });
      }
      const bucket = grouped.get(monthId)!;
      bucket.rain += entry.rain ?? 0;
      if (entry.temperatureAvg !== undefined) {
        bucket.tempSum += entry.temperatureAvg;
        bucket.tempCount += 1;
      }
      if (entry.windMax !== undefined) {
        bucket.windMax = Math.max(bucket.windMax, entry.windMax);
      }
    });
    Array.from(grouped.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .forEach(([monthId, bucket]) => {
        const card = document.createElement('div');
        card.className = 'calendar-card';
        const dt = DateTime.fromFormat(`${monthId}-01`, 'yyyy-LL-dd', { zone: 'Europe/Vienna' });
        const tempAvg = bucket.tempCount ? bucket.tempSum / bucket.tempCount : undefined;
        card.innerHTML = `
          <div><strong>${dt.toFormat('LLLL yyyy')}</strong></div>
          <div><strong>${t('calendar.rain')}</strong><div>${formatNumber(bucket.rain, { unit: 'mm', fractionDigits: 1 })}</div></div>
          <div><strong>${t('calendar.temperature')}</strong><div>${formatNumber(tempAvg, { unit: '°C' })}</div></div>
          <div><strong>${t('calendar.wind')}</strong><div>${formatNumber(bucket.windMax, { unit: 'km/h' })}</div></div>
        `;
        listEl.appendChild(card);
      });
  }
}

function updateView(): void {
  render();
}

async function refreshData(): Promise<void> {
  const stationId = uiStore.get().selectedStationId;
  if (!stationId) {
    render();
    return;
  }
  await ensureMonthData(stationId, currentMonth);
  render();
}

function attachEvents() {
  dayButton.addEventListener('click', () => {
    currentView = 'day';
    render();
  });
  monthButton.addEventListener('click', () => {
    currentView = 'month';
    render();
  });
  prevButton.addEventListener('click', async () => {
    currentMonth = currentMonth.minus({ months: 1 });
    await refreshData();
  });
  nextButton.addEventListener('click', async () => {
    currentMonth = currentMonth.plus({ months: 1 });
    await refreshData();
  });
}

export function initCalendarPage(root: HTMLElement) {
  container = document.createElement('section');
  container.className = 'calendar-page safe-area-bottom';

  const toolbar = document.createElement('div');
  toolbar.className = 'calendar-toolbar';

  const toggle = document.createElement('div');
  toggle.className = 'calendar-toggle';
  dayButton = document.createElement('button');
  dayButton.type = 'button';
  dayButton.textContent = t('calendar.day');
  dayButton.setAttribute('aria-pressed', 'true');
  monthButton = document.createElement('button');
  monthButton.type = 'button';
  monthButton.textContent = t('calendar.month');
  monthButton.setAttribute('aria-pressed', 'false');
  toggle.append(dayButton, monthButton);

  const nav = document.createElement('div');
  nav.className = 'calendar-nav';
  prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.setAttribute('aria-label', t('calendar.prev'));
  prevButton.textContent = '‹';
  nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.setAttribute('aria-label', t('calendar.next'));
  nextButton.textContent = '›';
  headerLabel = document.createElement('div');
  headerLabel.style.fontSize = '1.2rem';
  headerLabel.style.fontWeight = '600';
  nav.append(prevButton, headerLabel, nextButton);

  toolbar.append(toggle, nav);

  loaderEl = document.createElement('div');
  loaderEl.className = 'calendar-loader hidden';
  const loaderIcon = document.createElement('div');
  loaderIcon.className = 'loader-sun';
  const loaderText = document.createElement('p');
  loaderText.textContent = t('calendar.loader');
  loaderText.style.margin = '0';
  loaderEl.append(loaderIcon, loaderText);

  listEl = document.createElement('div');
  listEl.className = 'calendar-list hidden';

  emptyEl = document.createElement('div');
  emptyEl.className = 'calendar-empty hidden';

  container.append(toolbar, loaderEl, listEl, emptyEl);
  root.appendChild(container);

  attachEvents();

  uiStore.subscribe(async (state) => {
    if (state.activeTab === 'calendar') {
      await refreshData();
    }
  });
}
