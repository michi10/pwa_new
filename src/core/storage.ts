import { get, set, del } from 'idb-keyval';
import type { Station, TelemetryBundle, RainfallSummary, CalendarEntry } from '../data/models';

const memory = new Map<string, unknown>();
const supportsIndexedDb = () => typeof indexedDB !== 'undefined';

async function safeSet<T>(key: string, value: T): Promise<void> {
  if (supportsIndexedDb()) {
    await set(key, value);
  } else {
    memory.set(key, value);
  }
}

async function safeGet<T>(key: string): Promise<T | undefined> {
  if (supportsIndexedDb()) {
    return (await get<T>(key)) ?? undefined;
  }
  return memory.get(key) as T | undefined;
}

async function safeDel(key: string): Promise<void> {
  if (supportsIndexedDb()) {
    await del(key);
  } else {
    memory.delete(key);
  }
}

export const STORAGE_KEYS = {
  stations: 'cws:stations',
  telemetry: 'cws:telemetry',
  rainfall: 'cws:rainfall',
  calendar: 'cws:calendar',
  highlights: 'cws:highlights'
} as const;

export async function saveStations(stations: Station[]): Promise<void> {
  await safeSet(STORAGE_KEYS.stations, stations);
}

export async function loadStations(): Promise<Station[] | undefined> {
  return safeGet<Station[]>(STORAGE_KEYS.stations);
}

export async function saveTelemetry(bundles: TelemetryBundle[]): Promise<void> {
  await safeSet(STORAGE_KEYS.telemetry, bundles);
}

export async function loadTelemetry(): Promise<TelemetryBundle[] | undefined> {
  return safeGet<TelemetryBundle[]>(STORAGE_KEYS.telemetry);
}

export async function saveRainfall(entries: RainfallSummary[]): Promise<void> {
  await safeSet(STORAGE_KEYS.rainfall, entries);
}

export async function loadRainfall(): Promise<RainfallSummary[] | undefined> {
  return safeGet<RainfallSummary[]>(STORAGE_KEYS.rainfall);
}

export async function saveCalendar(entries: CalendarEntry[]): Promise<void> {
  await safeSet(STORAGE_KEYS.calendar, entries);
}

export async function loadCalendar(): Promise<CalendarEntry[] | undefined> {
  return safeGet<CalendarEntry[]>(STORAGE_KEYS.calendar);
}

export async function clearAll(): Promise<void> {
  await Promise.all(Object.values(STORAGE_KEYS).map((key) => safeDel(key)));
}
