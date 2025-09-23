export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  description?: string;
}

export interface TelemetryValue {
  key: string;
  ts: number;
  value: number;
}

export interface TelemetryBundle {
  stationId: string;
  temperature?: TelemetryValue;
  humidity?: TelemetryValue;
  wind?: TelemetryValue;
  uv?: TelemetryValue;
  rain?: TelemetryValue;
  dailyRain?: TelemetryValue;
  monthlyRain?: TelemetryValue;
  updatedAt: number;
}

export interface RainfallSummary {
  stationId: string;
  amount: number;
  period: 'day' | 'month';
  updatedAt: number;
}

export interface HighlightItem {
  type: 'rain' | 'temperature' | 'wind';
  stationId: string;
  value: number;
  unit: string;
  ts: number;
}

export interface ThingsBoardConfig {
  tbBaseUrl: string;
  tbToken: string;
  telemetryKeys: Record<string, string[]>;
}

export interface CalendarEntry {
  stationId: string;
  dateISO: string;
  rain?: number;
  temperatureAvg?: number;
  windMax?: number;
}

export interface TelemetryRequestParams {
  stationId: string;
  keys: string[];
  startTs?: number;
  endTs?: number;
  interval?: number;
}
