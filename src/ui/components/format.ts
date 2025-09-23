import { DateTime } from 'luxon';

const numberFormatter = new Intl.NumberFormat('de-AT', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1
});

const integerFormatter = new Intl.NumberFormat('de-AT', {
  maximumFractionDigits: 0
});

export function formatNumber(value: number | undefined, options?: { unit?: string; fractionDigits?: number }): string {
  if (value === undefined || Number.isNaN(value)) {
    return '–';
  }
  const { unit, fractionDigits } = options ?? {};
  const formatter = fractionDigits !== undefined
    ? new Intl.NumberFormat('de-AT', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      })
    : numberFormatter;
  const formatted = formatter.format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatInteger(value: number | undefined, unit?: string): string {
  if (value === undefined || Number.isNaN(value)) {
    return '–';
  }
  const formatted = integerFormatter.format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatTime(ts: number | undefined): string {
  if (!ts) return '–';
  return DateTime.fromMillis(ts).setZone('Europe/Vienna').toFormat('HH:mm');
}

export function formatDate(ts: number | undefined): string {
  if (!ts) return '–';
  return DateTime.fromMillis(ts).setZone('Europe/Vienna').toFormat('dd.LL.yyyy');
}
