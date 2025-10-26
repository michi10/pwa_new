import './map.css';
import { t } from '../../core/i18n';
import { router } from '../../core/router';
import {
  stationsStore,
  telemetryStore,
  uiStore,
  markMapLoaded,
  selectStation,
  setActiveTab
} from '../../core/stores';
import type { Station, TelemetryBundle } from '../../data/models';
import { formatNumber, formatTime } from '../../ui/components/format';

let leafletModule: typeof import('leaflet') | null = null;
let mapInstance: import('leaflet').Map | null = null;
let markersLayer: import('leaflet').LayerGroup | null = null;
let container: HTMLElement;
let sheetEl: HTMLElement;
let layerSwitch: HTMLElement;
let normalButton: HTMLButtonElement;
let hybridButton: HTMLButtonElement;
let baseLayers: { normal?: import('leaflet').TileLayer; hybrid?: import('leaflet').TileLayer } = {};
let mapReady = false;
let sheetStationId: string | undefined;
let globalClickHandler: ((event: MouseEvent) => void) | null = null;
let keyHandler: ((event: KeyboardEvent) => void) | null = null;

let leafletCssPromise: Promise<void> | null = null;
async function ensureLeafletStyles() {
  if (!leafletCssPromise) {
    leafletCssPromise = import('leaflet/dist/leaflet.css?inline').then((mod) => {
      const style = document.createElement('style');
      style.textContent = mod.default;
      document.head.appendChild(style);
    });
  }
  return leafletCssPromise;
}

async function loadLeaflet() {
  if (!leafletModule) {
    await ensureLeafletStyles();
    leafletModule = await import('leaflet');
  }
  return leafletModule;
}

function createLayerSwitch(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'map-layer-switch';
  normalButton = document.createElement('button');
  normalButton.className = 'map-layer-button';
  normalButton.type = 'button';
  normalButton.textContent = t('map.normalLayer');
  normalButton.setAttribute('aria-pressed', 'true');
  normalButton.addEventListener('click', () => activateLayer('normal'));
  hybridButton = document.createElement('button');
  hybridButton.className = 'map-layer-button';
  hybridButton.type = 'button';
  hybridButton.textContent = t('map.hybridLayer');
  hybridButton.setAttribute('aria-pressed', 'false');
  hybridButton.addEventListener('click', () => activateLayer('hybrid'));
  wrapper.append(normalButton, hybridButton);
  return wrapper;
}

async function initMap(root: HTMLElement) {
  if (mapReady) {
    return;
  }
  const L = await loadLeaflet();
  const mapContainer = document.createElement('div');
  mapContainer.className = 'map-container';
  root.appendChild(mapContainer);

  mapInstance = L.map(mapContainer, {
    zoomControl: false,
    attributionControl: true
  }).setView([47.5, 13.3], 7);

  const normal = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap-Mitwirkende'
  });
  const hybrid = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
  });
  normal.addTo(mapInstance);
  baseLayers = { normal, hybrid };
  markersLayer = L.layerGroup().addTo(mapInstance);
  mapReady = true;
  markMapLoaded();
  updateMarkers();
}

function activateLayer(layer: 'normal' | 'hybrid') {
  if (!mapInstance || !baseLayers.normal || !baseLayers.hybrid) {
    return;
  }
  if (layer === 'normal') {
    if (mapInstance.hasLayer(baseLayers.hybrid)) {
      mapInstance.removeLayer(baseLayers.hybrid);
    }
    if (!mapInstance.hasLayer(baseLayers.normal)) {
      baseLayers.normal.addTo(mapInstance);
    }
    normalButton.setAttribute('aria-pressed', 'true');
    hybridButton.setAttribute('aria-pressed', 'false');
  } else {
    if (mapInstance.hasLayer(baseLayers.normal)) {
      mapInstance.removeLayer(baseLayers.normal);
    }
    if (!mapInstance.hasLayer(baseLayers.hybrid)) {
      baseLayers.hybrid.addTo(mapInstance);
    }
    normalButton.setAttribute('aria-pressed', 'false');
    hybridButton.setAttribute('aria-pressed', 'true');
  }
}

function updateMarkers() {
  if (!mapInstance || !markersLayer || !leafletModule) {
    return;
  }
  markersLayer.clearLayers();
  const stations = stationsStore.get();
  const telemetry = telemetryStore.get();
  if (!stations.length) {
    return;
  }

  const buckets = new Map<string, Station[]>();
  stations.forEach((station) => {
    const key = `${Math.round(station.latitude * 40) / 40}:${Math.round(station.longitude * 40) / 40}`;
    const group = buckets.get(key) ?? [];
    group.push(station);
    buckets.set(key, group);
  });

  const L = leafletModule;
  buckets.forEach((group) => {
    if (group.length === 1) {
      const station = group[0];
      const telemetryBundle = telemetry.find((bundle) => bundle.stationId === station.id);
      const marker = L.marker([station.latitude, station.longitude], {
        title: station.name
      });
      marker.bindTooltip(buildTooltipContent(station, telemetryBundle));
      marker.on('click', () => openSheet(station, telemetryBundle));
      marker.addTo(markersLayer!);
    } else {
      const lat = group.reduce((sum, station) => sum + station.latitude, 0) / group.length;
      const lng = group.reduce((sum, station) => sum + station.longitude, 0) / group.length;
      const icon = L.divIcon({ className: 'cluster-icon', html: String(group.length) });
      const marker = L.marker([lat, lng], { icon });
      marker.on('click', () => {
        mapInstance!.setView([lat, lng], mapInstance!.getZoom() + 1);
      });
      marker.addTo(markersLayer!);
    }
  });
}

function buildTooltipContent(station: Station, telemetry?: TelemetryBundle) {
  const temp = telemetry?.temperature?.value;
  const rain = telemetry?.rain?.value;
  const time = telemetry?.temperature?.ts ?? telemetry?.updatedAt;
  return `${station.name}<br>${t('map.marker.temperature')}: ${formatNumber(temp, { unit: '°C' })}<br>${t('map.marker.rain')}: ${formatNumber(rain, { unit: 'mm' })}<br>${t('map.marker.updated')}: ${formatTime(time ?? 0)}`;
}

function openSheet(station: Station, telemetry?: TelemetryBundle) {
  sheetStationId = station.id;
  sheetEl.innerHTML = '';
  const title = document.createElement('h3');
  title.className = 'sheet-title';
  title.textContent = station.name;
  const infoGrid = document.createElement('div');
  infoGrid.className = 'sheet-grid';

  const details = [
    { label: t('dashboard.card.temperature'), value: formatNumber(telemetry?.temperature?.value, { unit: '°C' }) },
    { label: t('dashboard.card.humidity'), value: formatNumber(telemetry?.humidity?.value, { unit: '%' }) },
    { label: t('dashboard.card.wind'), value: formatNumber(telemetry?.wind?.value, { unit: 'km/h' }) },
    { label: t('dashboard.card.rain'), value: formatNumber(telemetry?.rain?.value, { unit: 'mm' }) }
  ];

  details.forEach((detail) => {
    const cell = document.createElement('div');
    cell.innerHTML = `<strong>${detail.label}</strong><div>${detail.value}</div>`;
    infoGrid.appendChild(cell);
  });

  const timeInfo = document.createElement('p');
  timeInfo.textContent = `${t('map.lastUpdate', { time: formatTime(telemetry?.updatedAt ?? telemetry?.temperature?.ts ?? 0) })}`;

  const action = document.createElement('button');
  action.type = 'button';
  action.textContent = t('map.showDetails');
  action.addEventListener('click', () => {
    selectStation(station.id);
    setActiveTab('dashboard');
    router.go('dashboard');
    closeSheet();
  });

  sheetEl.append(title, infoGrid, timeInfo, action);
  sheetEl.classList.add('bottom-sheet', 'map-bottom-sheet', 'active');
  document.body.appendChild(sheetEl);
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  sheetEl.classList.remove('active');
  sheetEl.remove();
  document.body.style.overflow = '';
  sheetStationId = undefined;
}

export async function initMapPage(root: HTMLElement) {
  container = document.createElement('section');
  container.className = 'map-page safe-area-bottom';
  layerSwitch = createLayerSwitch();
  container.append(layerSwitch);
  sheetEl = document.createElement('div');
  sheetEl.className = 'map-bottom-sheet bottom-sheet';
  sheetEl.addEventListener('click', (event) => {
    event.stopPropagation();
  });
  root.appendChild(container);

  if (!globalClickHandler) {
    globalClickHandler = (event: MouseEvent) => {
      if (sheetStationId && sheetEl.classList.contains('active') && !sheetEl.contains(event.target as Node)) {
        closeSheet();
      }
    };
    document.addEventListener('click', globalClickHandler);
  }

  if (!keyHandler) {
    keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sheetStationId) {
        closeSheet();
      }
    };
    document.addEventListener('keydown', keyHandler);
  }

  await initMap(container);
  updateMarkers();

  stationsStore.subscribe(() => updateMarkers());
  telemetryStore.subscribe(() => updateMarkers());
  uiStore.subscribe((state) => {
    if (state.activeTab === 'map' && mapInstance) {
      setTimeout(() => mapInstance!.invalidateSize(), 200);
    }
    if (state.activeTab !== 'map' && sheetStationId) {
      closeSheet();
    }
  });
}
