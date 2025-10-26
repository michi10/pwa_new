import { DateTime } from 'luxon';
import { HttpClient, getLocalJson } from '../core/http';
import type {
  Station,
  TelemetryBundle,
  TelemetryValue,
  ThingsBoardConfig,
  CalendarEntry,
  RainfallSummary,
  HighlightItem
} from './models';
import mockStations from './mock/stations.json';
import mockTelemetry from './mock/telemetry-latest.json';
import mockCalendar from './mock/calendar.json';

let cachedConfig: ThingsBoardConfig | undefined;
let httpClient: HttpClient | undefined;

async function ensureConfig(): Promise<ThingsBoardConfig> {
  if (!cachedConfig) {
    cachedConfig = await getLocalJson<ThingsBoardConfig>('/config.json');
    if (!cachedConfig.tbBaseUrl) {
      cachedConfig.tbBaseUrl = '';
    }
  }
  return cachedConfig;
}

async function ensureClient(): Promise<HttpClient | undefined> {
  const config = await ensureConfig();
  if (!config.tbBaseUrl || !config.tbToken) {
    return undefined;
  }
  if (!httpClient) {
    httpClient = new HttpClient(config.tbBaseUrl, config.tbToken);
  }
  return httpClient;
}

function parseTelemetryEntry(key: string, entries?: { ts: number; value: string | number }[]): TelemetryValue | undefined {
  if (!entries || entries.length === 0) {
    return undefined;
  }
  const entry = entries[0];
  const value = Number(entry.value);
  if (Number.isNaN(value)) {
    return undefined;
  }
  return { key, ts: Number(entry.ts), value };
}

function sanitizeRain(value?: TelemetryValue): TelemetryValue | undefined {
  if (!value) return undefined;
  if (value.value > 800) {
    return { ...value, value: 0 };
  }
  return value;
}

function resolveKey(pattern: string, stationId: string): string {
  return pattern
    .replace('{stationId}', stationId)
    .replace('{STATION_ID}', stationId)
    .replace('%s', stationId);
}

function resolveKeys(config: ThingsBoardConfig, type: keyof ThingsBoardConfig['telemetryKeys'], stationId: string): string[] {
  const patterns = config.telemetryKeys[type] ?? [];
  if (!Array.isArray(patterns)) {
    return [];
  }
  return patterns.map((pattern) => resolveKey(pattern, stationId));
}

export async function fetchStations(): Promise<Station[]> {
  const client = await ensureClient();
  if (!client) {
    return mockStations as Station[];
  }
  try {
    const response = await client.get<{ data: Array<{ id: { id: string }; name: string; label?: string; additionalInfo?: Record<string, unknown>; }>; }>(
      '/api/tenant/devices',
      { query: { pageSize: 200, page: 0, sortProperty: 'name', sortOrder: 'ASC' } }
    );
    const stations: Station[] = response.data.map((device) => {
      const info = device.additionalInfo ?? {};
      return {
        id: device.id?.id ?? device.name,
        name: device.label ?? device.name,
        latitude: typeof info['latitude'] === 'number' ? (info['latitude'] as number) : Number(info['latitude'] ?? 0),
        longitude: typeof info['longitude'] === 'number' ? (info['longitude'] as number) : Number(info['longitude'] ?? 0),
        elevation: typeof info['elevation'] === 'number' ? (info['elevation'] as number) : Number(info['elevation'] ?? undefined),
        description: typeof info['description'] === 'string' ? (info['description'] as string) : undefined
      };
    });
    if (stations.length === 0) {
      return mockStations as Station[];
    }
    return stations;
  } catch (error) {
    console.warn('[CWS] Stationen via API nicht erreichbar', error);
    return mockStations as Station[];
  }
}

export async function fetchLatestTelemetry(stations: Station[]): Promise<TelemetryBundle[]> {
  const config = await ensureConfig();
  const client = await ensureClient();
  if (!client) {
    return mockTelemetry as TelemetryBundle[];
  }

  const bundles: TelemetryBundle[] = [];
  for (const station of stations) {
    const temperatureKeys = resolveKeys(config, 'temperature', station.id);
    const humidityKeys = resolveKeys(config, 'humidity', station.id);
    const windKeys = resolveKeys(config, 'wind', station.id);
    const uvKeys = resolveKeys(config, 'uv', station.id);
    const rainKeys = resolveKeys(config, 'rain', station.id);
    const dailyRainKeys = resolveKeys(config, 'dailyRain', station.id);
    const monthlyRainKeys = resolveKeys(config, 'monthlyRain', station.id);

    const keys = [
      ...temperatureKeys,
      ...humidityKeys,
      ...windKeys,
      ...uvKeys,
      ...rainKeys,
      ...dailyRainKeys,
      ...monthlyRainKeys
    ].filter((value, index, array) => value && array.indexOf(value) === index);

    if (keys.length === 0) {
      continue;
    }

    try {
      const response = await client.get<Record<string, { ts: number; value: string }[]>>(
        `/api/plugins/telemetry/DEVICE/${station.id}/values/timeseries`,
        {
          query: {
            keys: keys.join(','),
            useStrictDataTypes: true
          }
        }
      );

      const bundle: TelemetryBundle = {
        stationId: station.id,
        temperature: temperatureKeys[0] ? parseTelemetryEntry(temperatureKeys[0], response[temperatureKeys[0]]) : undefined,
        humidity: humidityKeys[0] ? parseTelemetryEntry(humidityKeys[0], response[humidityKeys[0]]) : undefined,
        wind: windKeys[0] ? parseTelemetryEntry(windKeys[0], response[windKeys[0]]) : undefined,
        uv: uvKeys[0] ? parseTelemetryEntry(uvKeys[0], response[uvKeys[0]]) : undefined,
        rain: sanitizeRain(rainKeys[0] ? parseTelemetryEntry(rainKeys[0], response[rainKeys[0]]) : undefined),
        dailyRain: sanitizeRain(dailyRainKeys[0] ? parseTelemetryEntry(dailyRainKeys[0], response[dailyRainKeys[0]]) : undefined),
        monthlyRain: sanitizeRain(monthlyRainKeys[0] ? parseTelemetryEntry(monthlyRainKeys[0], response[monthlyRainKeys[0]]) : undefined),
        updatedAt: DateTime.now().toMillis()
      };
      bundles.push(bundle);
    } catch (error) {
      console.warn(`[CWS] Telemetrie für ${station.id} nicht abrufbar`, error);
    }
  }

  if (bundles.length === 0) {
    return mockTelemetry as TelemetryBundle[];
  }

  return bundles;
}

export async function fetchCalendarRange(
  stationId: string,
  start: DateTime,
  end: DateTime,
  intervalMinutes = 60
): Promise<CalendarEntry[]> {
  const config = await ensureConfig();
  const client = await ensureClient();
  if (!client) {
    return (mockCalendar as CalendarEntry[]).filter((entry) => entry.stationId === stationId);
  }

  const rainKeys = resolveKeys(config, 'rain', stationId);
  const temperatureKeys = resolveKeys(config, 'temperature', stationId);
  const windKeys = resolveKeys(config, 'wind', stationId);
  const keys = [...rainKeys, ...temperatureKeys, ...windKeys];
  if (keys.length === 0) {
    return [];
  }

  try {
    const response = await client.get<Record<string, Array<{ ts: number; value: string }>>>(
      `/api/plugins/telemetry/DEVICE/${stationId}/values/timeseries`,
      {
        query: {
          keys: keys.join(','),
          startTs: start.toMillis(),
          endTs: end.toMillis(),
          interval: intervalMinutes * 60 * 1000,
          agg: 'AVG',
          limit: 1000
        }
      }
    );
    const buckets = new Map<string, { rain: number[]; temperature: number[]; wind: number[] }>();
    const rainKeySet = new Set(rainKeys);
    const tempKeySet = new Set(temperatureKeys);
    const windKeySet = new Set(windKeys);

    for (const key of keys) {
      const series = response[key];
      if (!series) continue;
      for (const point of series) {
        const dt = DateTime.fromMillis(point.ts, { zone: 'Europe/Vienna' }).startOf('day');
        const bucketKey = dt.toISODate();
        if (!bucketKey) continue;
        if (!buckets.has(bucketKey)) {
          buckets.set(bucketKey, { rain: [], temperature: [], wind: [] });
        }
        const bucket = buckets.get(bucketKey)!;
        const value = Number(point.value);
        if (Number.isNaN(value)) continue;
        if (rainKeySet.has(key)) {
          if (value <= 800) {
            bucket.rain.push(value);
          }
        } else if (tempKeySet.has(key)) {
          bucket.temperature.push(value);
        } else if (windKeySet.has(key)) {
          bucket.wind.push(value);
        }
      }
    }
    const entries: CalendarEntry[] = [];
    for (const [day, bucket] of buckets) {
      entries.push({
        stationId,
        dateISO: day,
        rain: bucket.rain.length ? Number(bucket.rain[bucket.rain.length - 1].toFixed(1)) : 0,
        temperatureAvg: bucket.temperature.length ? Number((bucket.temperature.reduce((sum, val) => sum + val, 0) / bucket.temperature.length).toFixed(1)) : undefined,
        windMax: bucket.wind.length ? Math.max(...bucket.wind) : undefined
      });
    }
    return entries.sort((a, b) => (a.dateISO > b.dateISO ? 1 : -1));
  } catch (error) {
    console.warn('[CWS] Kalenderwerte nicht verfügbar', error);
    return (mockCalendar as CalendarEntry[]).filter((entry) => entry.stationId === stationId);
  }
}

export function buildRainfallSummary(bundles: TelemetryBundle[], period: 'day' | 'month'): RainfallSummary[] {
  const list: RainfallSummary[] = [];
  for (const bundle of bundles) {
    const source = period === 'day' ? bundle.dailyRain : bundle.monthlyRain;
    if (source && source.value <= 800) {
      list.push({ stationId: bundle.stationId, amount: Number(source.value.toFixed(1)), period, updatedAt: source.ts });
    }
  }
  return list.sort((a, b) => b.amount - a.amount);
}

export function detectStale(bundle?: TelemetryBundle, thresholdMinutes = 60): boolean {
  if (!bundle) return false;
  const reference = bundle.updatedAt ?? bundle.temperature?.ts ?? bundle.humidity?.ts ?? 0;
  if (!reference) return true;
  return DateTime.now().diff(DateTime.fromMillis(reference), 'minutes').minutes > thresholdMinutes;
}

export function buildHighlights(bundles: TelemetryBundle[]): HighlightItem[] {
  const highlights: HighlightItem[] = [];
  const rainCandidates = bundles
    .filter((bundle) => bundle.dailyRain && bundle.dailyRain.value <= 800)
    .sort((a, b) => (b.dailyRain!.value - a.dailyRain!.value));
  if (rainCandidates[0]?.dailyRain) {
    highlights.push({
      type: 'rain',
      stationId: rainCandidates[0].stationId,
      value: Number(rainCandidates[0].dailyRain!.value.toFixed(1)),
      unit: 'mm',
      ts: rainCandidates[0].dailyRain!.ts
    });
  }

  const tempCandidates = bundles
    .filter((bundle) => bundle.temperature)
    .sort((a, b) => (b.temperature!.value - a.temperature!.value));
  if (tempCandidates[0]?.temperature) {
    highlights.push({
      type: 'temperature',
      stationId: tempCandidates[0].stationId,
      value: Number(tempCandidates[0].temperature!.value.toFixed(1)),
      unit: '°C',
      ts: tempCandidates[0].temperature!.ts
    });
  }

  const windCandidates = bundles
    .filter((bundle) => bundle.wind)
    .sort((a, b) => (b.wind!.value - a.wind!.value));
  if (windCandidates[0]?.wind) {
    highlights.push({
      type: 'wind',
      stationId: windCandidates[0].stationId,
      value: Number(windCandidates[0].wind!.value.toFixed(1)),
      unit: 'km/h',
      ts: windCandidates[0].wind!.ts
    });
  }

  return highlights;
}
