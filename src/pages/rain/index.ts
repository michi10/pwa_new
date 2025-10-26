import './rain.css';
import { DateTime } from 'luxon';
import { t } from '../../core/i18n';
import { rainfallStore, telemetryStore, stationsStore, uiStore } from '../../core/stores';
import { formatNumber, formatTime } from '../../ui/components/format';
import { detectStale } from '../../data/tb-client';

let container: HTMLElement;
let listEl: HTMLElement;
let emptyEl: HTMLElement;
let dayButton: HTMLButtonElement;
let monthButton: HTMLButtonElement;
let exportButton: HTMLButtonElement;
let updatedEl: HTMLElement;
let period: 'day' | 'month' = 'day';

function render(): void {
  const rainfall = rainfallStore.get().filter((entry) => entry.period === period);
  const stations = stationsStore.get();
  const telemetry = telemetryStore.get();
  rainfall.sort((a, b) => b.amount - a.amount);
  const max = Math.max(...rainfall.map((entry) => entry.amount), 1);

  dayButton.setAttribute('aria-pressed', period === 'day' ? 'true' : 'false');
  monthButton.setAttribute('aria-pressed', period === 'month' ? 'true' : 'false');

  if (!rainfall.length) {
    listEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    emptyEl.textContent = t('rain.empty');
    updatedEl.textContent = '';
    exportButton.disabled = true;
    return;
  }

  exportButton.disabled = false;
  emptyEl.classList.add('hidden');
  listEl.classList.remove('hidden');
  listEl.innerHTML = '';

  rainfall.forEach((entry) => {
    const station = stations.find((item) => item.id === entry.stationId);
    const tele = telemetry.find((bundle) => bundle.stationId === entry.stationId);
    const item = document.createElement('div');
    item.className = 'rain-item';
    const info = document.createElement('div');
    const stationName = station?.name ?? entry.stationId;
    const amount = formatNumber(entry.amount, { unit: 'mm', fractionDigits: 1 });
    const stale = detectStale(tele);
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${t('rain.updated', { time: formatTime(entry.updatedAt) })}${stale ? ` · ${t('dashboard.stale')}` : ''}`;
    info.innerHTML = `<strong>${stationName}</strong><div>${amount}</div>`;
    const bar = document.createElement('div');
    bar.className = 'rain-bar';
    const span = document.createElement('span');
    span.style.width = `${Math.min(100, (entry.amount / max) * 100)}%`;
    bar.appendChild(span);
    info.appendChild(meta);
    item.appendChild(info);
    item.appendChild(bar);
    listEl.appendChild(item);
  });

  const latestTs = rainfall[0]?.updatedAt;
  if (latestTs) {
    updatedEl.textContent = `${t('rain.updated', { time: DateTime.fromMillis(latestTs).setZone('Europe/Vienna').toFormat('dd.LL.yyyy HH:mm') })}`;
  } else {
    updatedEl.textContent = '';
  }
}

function exportCsv(): void {
  const rows = [['Station', 'Periode', 'Menge (mm)', 'Stand']];
  const stations = stationsStore.get();
  rainfallStore
    .get()
    .filter((entry) => entry.period === period)
    .forEach((entry) => {
      const station = stations.find((item) => item.id === entry.stationId);
      rows.push([
        station?.name ?? entry.stationId,
        period === 'day' ? t('rain.period.day') : t('rain.period.month'),
        String(entry.amount),
        DateTime.fromMillis(entry.updatedAt).setZone('Europe/Vienna').toISO()
      ]);
    });
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cws-niederschlag-${period}-${DateTime.now().toFormat('yyyyLLdd-HHmm')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function initRainPage(root: HTMLElement) {
  container = document.createElement('section');
  container.className = 'rain-page safe-area-bottom';

  const header = document.createElement('div');
  header.className = 'rain-header';

  const toggle = document.createElement('div');
  toggle.className = 'rain-period-toggle';
  dayButton = document.createElement('button');
  dayButton.type = 'button';
  dayButton.textContent = t('rain.period.day');
  dayButton.setAttribute('aria-pressed', 'true');
  monthButton = document.createElement('button');
  monthButton.type = 'button';
  monthButton.textContent = t('rain.period.month');
  monthButton.setAttribute('aria-pressed', 'false');
  toggle.append(dayButton, monthButton);

  exportButton = document.createElement('button');
  exportButton.className = 'rain-export';
  exportButton.type = 'button';
  exportButton.textContent = t('export.csv');

  header.append(toggle, exportButton);

  listEl = document.createElement('div');
  listEl.className = 'rain-list hidden';

  emptyEl = document.createElement('div');
  emptyEl.className = 'rain-empty hidden';

  updatedEl = document.createElement('div');
  updatedEl.className = 'rain-meta';
  updatedEl.style.marginTop = 'var(--spacing-md)';
  updatedEl.style.color = 'var(--cws-muted)';

  container.append(header, listEl, emptyEl, updatedEl);
  root.appendChild(container);

  dayButton.addEventListener('click', () => {
    period = 'day';
    render();
  });
  monthButton.addEventListener('click', () => {
    period = 'month';
    render();
  });
  exportButton.addEventListener('click', exportCsv);

  rainfallStore.subscribe(() => render());
  telemetryStore.subscribe(() => render());
  stationsStore.subscribe(() => render());
  uiStore.subscribe((state) => {
    if (state.activeTab === 'rain') {
      render();
    }
  });
}
