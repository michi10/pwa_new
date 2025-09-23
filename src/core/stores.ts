import { DateTime } from 'luxon';
import { Store, EventBus } from './state';
import type { Station, TelemetryBundle, RainfallSummary, HighlightItem, CalendarEntry } from '../data/models';

export type TabRoute = 'dashboard' | 'map' | 'calendar' | 'rain' | 'info';

export interface UiState {
  activeTab: TabRoute;
  selectedStationId?: string;
  isOffline: boolean;
  dashboardLoadedOnce: boolean;
  calendarLoadedOnce: boolean;
  mapLoadedOnce: boolean;
  lastSyncTs?: number;
}

export interface Events {
  'station:selected': { stationId: string | undefined };
  'telemetry:updated': TelemetryBundle[];
  'rainfall:updated': RainfallSummary[];
  'highlights:updated': HighlightItem[];
  'calendar:updated': CalendarEntry[];
  'ui:tab-changed': TabRoute;
  'network:status': { offline: boolean };
}

export const eventBus = new EventBus<Events>();

export const uiStore = new Store<UiState>({
  activeTab: 'dashboard',
  selectedStationId: undefined,
  isOffline: false,
  dashboardLoadedOnce: false,
  calendarLoadedOnce: false,
  mapLoadedOnce: false,
  lastSyncTs: undefined
});

export const stationsStore = new Store<Station[]>([]);
export const telemetryStore = new Store<TelemetryBundle[]>([]);
export const rainfallStore = new Store<RainfallSummary[]>([]);
export const highlightsStore = new Store<HighlightItem[]>([]);
export const calendarStore = new Store<CalendarEntry[]>([]);

export function setActiveTab(tab: TabRoute): void {
  uiStore.update((current) => ({ ...current, activeTab: tab }));
  eventBus.emit('ui:tab-changed', tab);
}

export function selectStation(stationId: string | undefined): void {
  uiStore.update((state) => ({ ...state, selectedStationId: stationId }));
  eventBus.emit('station:selected', { stationId });
}

export function markDashboardLoaded(): void {
  uiStore.update((state) => ({ ...state, dashboardLoadedOnce: true }));
}

export function markCalendarLoaded(): void {
  uiStore.update((state) => ({ ...state, calendarLoadedOnce: true }));
}

export function markMapLoaded(): void {
  uiStore.update((state) => ({ ...state, mapLoadedOnce: true }));
}

export function updateNetworkStatus(offline: boolean): void {
  uiStore.update((state) => ({ ...state, isOffline: offline }));
  eventBus.emit('network:status', { offline });
}

export function updateTelemetry(bundles: TelemetryBundle[]): void {
  telemetryStore.set(bundles);
  uiStore.update((state) => ({ ...state, lastSyncTs: DateTime.now().toMillis() }));
  eventBus.emit('telemetry:updated', bundles);
}

export function updateStations(stations: Station[]): void {
  stationsStore.set(stations);
}

export function updateRainfall(entries: RainfallSummary[]): void {
  rainfallStore.set(entries);
  eventBus.emit('rainfall:updated', entries);
}

export function updateHighlights(entries: HighlightItem[]): void {
  highlightsStore.set(entries);
  eventBus.emit('highlights:updated', entries);
}

export function updateCalendar(entries: CalendarEntry[]): void {
  calendarStore.set(entries);
  eventBus.emit('calendar:updated', entries);
}
