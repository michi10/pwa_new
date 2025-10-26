import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { buildRainfallSummary, detectStale } from '../src/data/tb-client';
import type { TelemetryBundle } from '../src/data/models';

const base: TelemetryBundle = {
  stationId: 'test',
  updatedAt: DateTime.now().toMillis()
};

describe('telemetry helpers', () => {
  it('aggregates rainfall correctly', () => {
    const bundles: TelemetryBundle[] = [
      {
        ...base,
        stationId: 'a',
        dailyRain: { key: 'rainDaily', ts: 1, value: 12.3 },
        monthlyRain: { key: 'rainMonthly', ts: 1, value: 20 }
      },
      {
        ...base,
        stationId: 'b',
        dailyRain: { key: 'rainDaily', ts: 1, value: 5 },
        monthlyRain: { key: 'rainMonthly', ts: 1, value: 50 }
      }
    ];
    const day = buildRainfallSummary(bundles, 'day');
    expect(day[0].stationId).toBe('a');
    expect(day[0].amount).toBeCloseTo(12.3);
    const month = buildRainfallSummary(bundles, 'month');
    expect(month[0].stationId).toBe('b');
    expect(month[0].amount).toBeCloseTo(50);
  });

  it('detects stale data after threshold', () => {
    const staleBundle: TelemetryBundle = {
      ...base,
      updatedAt: DateTime.now().minus({ hours: 2 }).toMillis()
    };
    expect(detectStale(staleBundle, 60)).toBe(true);
    expect(detectStale(base, 60)).toBe(false);
  });
});
