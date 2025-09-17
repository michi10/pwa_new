(function(){
  const perStation = window.CWS_DEMO?.perStation || {};
  const dailySummary = window.CWS_DEMO?.dailySummary || [];
  const rangeSelect = document.getElementById('insightsRange');
  const metricSelect = document.getElementById('insightsMetric');
  const rankingEl = document.getElementById('insightsRanking');
  const bestDaysEl = document.getElementById('insightsBestDays');
  const emptyEl = document.getElementById('insightsEmpty');
  const highlightEls = {
    top: {
      title: document.getElementById('highlightTopTitle'),
      value: document.getElementById('highlightTopValue'),
      subtitle: document.getElementById('highlightTopStation'),
      detail: document.getElementById('highlightTopDetail')
    },
    low: {
      title: document.getElementById('highlightLowTitle'),
      value: document.getElementById('highlightLowValue'),
      subtitle: document.getElementById('highlightLowStation'),
      detail: document.getElementById('highlightLowDetail')
    },
    network: {
      title: document.getElementById('highlightNetworkTitle'),
      value: document.getElementById('highlightNetworkValue'),
      subtitle: null,
      detail: document.getElementById('highlightNetworkDetail')
    }
  };

  if (!rangeSelect || !metricSelect || !rankingEl || Object.keys(perStation).length === 0) return;

  let units = (window.CWS_PREFS && window.CWS_PREFS.units) || 'metric';
  let favorite = (window.CWS_PREFS && window.CWS_PREFS.favoriteStation) || '';
  let currentLang = (window.CWS_PREFS && window.CWS_PREFS.lang) || document.documentElement.lang || 'de';

  rangeSelect.addEventListener('change', render);
  metricSelect.addEventListener('change', render);

  rankingEl.addEventListener('click', ev => {
    const btn = ev.target.closest('button[data-station]');
    if (!btn) return;
    const stationId = btn.dataset.station;
    const next = stationId === favorite ? '' : stationId;
    document.dispatchEvent(new CustomEvent('cws:set-favorite', { detail: { stationId: next } }));
  });

  document.addEventListener('cws:prefs', ev => {
    const prefs = ev.detail || {};
    let shouldRender = false;
    if (prefs.units && prefs.units !== units) {
      units = prefs.units;
      shouldRender = true;
    }
    if (typeof prefs.favoriteStation === 'string' && prefs.favoriteStation !== favorite) {
      favorite = prefs.favoriteStation;
      shouldRender = true;
    }
    if (prefs.lang && prefs.lang !== currentLang) {
      currentLang = prefs.lang;
      shouldRender = true;
    }
    if (shouldRender) render();
  });

  render();

  function render(){
    const metric = metricSelect.value || 'temperature';
    const range = Number(rangeSelect.value) || 7;
    const { ranking, top, low, network, bestDays } = compute(range, metric);

    updateHighlight('top', metric, top, ranking.length > 0);
    updateHighlight('low', metric, low, ranking.length > 0);
    updateHighlight('network', metric, network, !!network);

    rankingEl.innerHTML = '';
    if (!ranking.length) {
      emptyEl.hidden = false;
    } else {
      emptyEl.hidden = true;
      ranking.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'ranking-item' + (entry.id === favorite ? ' fav' : '');
        item.setAttribute('role', 'listitem');
        item.innerHTML = `
          <div class="info">
            <strong>${entry.name}</strong>
            <span class="muted">${entry.detail}</span>
          </div>
          <div class="value">${entry.displayValue}</div>
          <button type="button"
                  class="favorite-btn${entry.id === favorite ? ' active' : ''}"
                  data-station="${entry.id}"
                  aria-pressed="${entry.id === favorite}"
                  aria-label="${entry.id === favorite ? t('insightsFavoriteActive') : t('insightsFavoriteAction')}">
            <i class="${entry.id === favorite ? 'fa-solid' : 'fa-regular'} fa-star"></i>
          </button>`;
        rankingEl.appendChild(item);
      });
    }

    bestDaysEl.innerHTML = '';
    if (!bestDays.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = t('insightsNoData');
      bestDaysEl.appendChild(empty);
    } else {
      bestDays.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'day-entry';
        item.innerHTML = `
          <div>
            <strong>${entry.dateLabel}</strong>
            <div class="meta">${entry.detail}</div>
          </div>
          <div class="value">${entry.displayValue}</div>`;
        bestDaysEl.appendChild(item);
      });
    }
  }

  function updateHighlight(kind, metric, data, hasData){
    const el = highlightEls[kind];
    if (!el) return;
    const label = metricLabel(metric);
    if (el.title) {
      el.title.textContent = kind === 'network'
        ? `${t('insightsNetworkAvg')} · ${label}`
        : `${kind === 'top' ? t('insightsTop') : t('insightsLow')} · ${label}`;
    }
    if (!hasData || !data) {
      if (el.value) el.value.textContent = '--';
      if (el.subtitle) el.subtitle.textContent = '—';
      if (el.detail) el.detail.textContent = '';
      return;
    }
    if (el.value) el.value.textContent = data.displayValue;
    if (el.subtitle) el.subtitle.textContent = data.name || '—';
    if (el.detail) el.detail.textContent = data.detail || '';
  }

  function compute(range, metric){
    const days = Math.max(1, range);
    const ranking = Object.values(perStation).map(station => {
      const daily = station.daily.slice(-days);
      if (!daily.length) return null;
      const stats = stationStats(daily, metric);
      if (!stats) return null;
      return { id: station.info.id, name: station.info.name, ...stats };
    }).filter(Boolean);

    ranking.sort((a, b) => b.value - a.value);
    const top = ranking[0] || null;
    const low = ranking.length > 1 ? ranking[ranking.length - 1] : ranking[0] || null;
    const network = networkStats(days, metric);
    const bestDays = topDays(days, metric);
    return { ranking, top, low, network, bestDays };
  }

  function stationStats(list, metric){
    switch (metric) {
      case 'temperature': {
        const avgs = list.map(d => d.metrics?.temperature?.avg ?? null).filter(isFinite);
        if (!avgs.length) return null;
        const avg = average(avgs);
        const max = Math.max(...list.map(d => d.metrics?.temperature?.max ?? avg));
        const min = Math.min(...list.map(d => d.metrics?.temperature?.min ?? avg));
        const convertedAvg = convertMetric('temperature', avg);
        return {
          value: convertedAvg,
          displayValue: formatValue('temperature', convertedAvg),
          detail: `${t('statMax')}: ${formatValue('temperature', convertMetric('temperature', max))} · ${t('statMin')}: ${formatValue('temperature', convertMetric('temperature', min))}`
        };
      }
      case 'rain': {
        const totals = list.map(d => d.metrics?.rain?.total ?? 0);
        const total = totals.reduce((s, v) => s + v, 0);
        const avgDay = total / list.length;
        const convertedTotal = convertMetric('rain', total);
        return {
          value: convertedTotal,
          displayValue: formatValue('rain', convertedTotal),
          detail: `${t('insightsAvgPerDay')}: ${formatValue('rain', convertMetric('rain', avgDay))}`
        };
      }
      case 'wind': {
        const avgs = list.map(d => d.metrics?.wind?.avg ?? null).filter(isFinite);
        if (!avgs.length) return null;
        const avg = average(avgs);
        const gust = Math.max(...list.map(d => d.metrics?.wind?.max ?? avg));
        const convertedAvg = convertMetric('wind', avg);
        return {
          value: convertedAvg,
          displayValue: formatValue('wind', convertedAvg),
          detail: `${t('gust')}: ${formatValue('wind', convertMetric('wind', gust))}`
        };
      }
      case 'humidity': {
        const avgs = list.map(d => d.metrics?.humidity?.avg ?? null).filter(isFinite);
        if (!avgs.length) return null;
        const avg = average(avgs);
        const max = Math.max(...list.map(d => d.metrics?.humidity?.max ?? avg));
        const min = Math.min(...list.map(d => d.metrics?.humidity?.min ?? avg));
        return {
          value: avg,
          displayValue: formatValue('humidity', avg),
          detail: `${t('statMax')}: ${formatValue('humidity', max)} · ${t('statMin')}: ${formatValue('humidity', min)}`
        };
      }
      default:
        return null;
    }
  }

  function networkStats(days, metric){
    const span = dailySummary.slice(-days);
    if (!span.length) return null;
    switch (metric) {
      case 'temperature': {
        const avg = average(span.map(d => d.metrics?.temperature?.avg ?? 0));
        const max = Math.max(...span.map(d => d.metrics?.temperature?.max ?? avg));
        const min = Math.min(...span.map(d => d.metrics?.temperature?.min ?? avg));
        const converted = convertMetric('temperature', avg);
        return {
          displayValue: formatValue('temperature', converted),
          detail: `${t('statMax')}: ${formatValue('temperature', convertMetric('temperature', max))} · ${t('statMin')}: ${formatValue('temperature', convertMetric('temperature', min))}`
        };
      }
      case 'rain': {
        const total = span.reduce((s, d) => s + (d.metrics?.rain?.total ?? 0), 0);
        const avgDay = total / span.length;
        const converted = convertMetric('rain', total);
        return {
          displayValue: formatValue('rain', converted),
          detail: `${t('insightsAvgPerDay')}: ${formatValue('rain', convertMetric('rain', avgDay))}`
        };
      }
      case 'wind': {
        const avg = average(span.map(d => d.metrics?.wind?.avg ?? 0));
        const max = Math.max(...span.map(d => d.metrics?.wind?.max ?? avg));
        const converted = convertMetric('wind', avg);
        return {
          displayValue: formatValue('wind', converted),
          detail: `${t('gust')}: ${formatValue('wind', convertMetric('wind', max))}`
        };
      }
      case 'humidity': {
        const avg = average(span.map(d => d.metrics?.humidity?.avg ?? 0));
        const max = Math.max(...span.map(d => d.metrics?.humidity?.max ?? avg));
        const min = Math.min(...span.map(d => d.metrics?.humidity?.min ?? avg));
        return {
          displayValue: formatValue('humidity', avg),
          detail: `${t('statMax')}: ${formatValue('humidity', max)} · ${t('statMin')}: ${formatValue('humidity', min)}`
        };
      }
      default:
        return null;
    }
  }

  function topDays(days, metric){
    const span = dailySummary.slice(-days);
    return span.map(day => {
      const metrics = day.metrics || {};
      switch (metric) {
        case 'temperature': {
          const avg = metrics.temperature?.avg;
          if (!isFinite(avg)) return null;
          const max = metrics.temperature?.max ?? avg;
          const min = metrics.temperature?.min ?? avg;
          return {
            raw: avg,
            displayValue: formatValue('temperature', convertMetric('temperature', avg)),
            detail: `${t('statMax')}: ${formatValue('temperature', convertMetric('temperature', max))} · ${t('statMin')}: ${formatValue('temperature', convertMetric('temperature', min))}`,
            dateLabel: formatDate(day.date)
          };
        }
        case 'rain': {
          const total = metrics.rain?.total ?? 0;
          const stationCount = Math.max(1, Object.keys(perStation).length);
          const avgDay = metrics.rain?.avg ?? (total / stationCount);
          return {
            raw: total,
            displayValue: formatValue('rain', convertMetric('rain', total)),
            detail: `${t('insightsAvgPerDay')}: ${formatValue('rain', convertMetric('rain', avgDay))}`,
            dateLabel: formatDate(day.date)
          };
        }
        case 'wind': {
          const avg = metrics.wind?.avg;
          if (!isFinite(avg)) return null;
          const max = metrics.wind?.max ?? avg;
          return {
            raw: avg,
            displayValue: formatValue('wind', convertMetric('wind', avg)),
            detail: `${t('gust')}: ${formatValue('wind', convertMetric('wind', max))}`,
            dateLabel: formatDate(day.date)
          };
        }
        case 'humidity': {
          const avg = metrics.humidity?.avg;
          if (!isFinite(avg)) return null;
          const max = metrics.humidity?.max ?? avg;
          const min = metrics.humidity?.min ?? avg;
          return {
            raw: avg,
            displayValue: formatValue('humidity', avg),
            detail: `${t('statMax')}: ${formatValue('humidity', max)} · ${t('statMin')}: ${formatValue('humidity', min)}`,
            dateLabel: formatDate(day.date)
          };
        }
        default:
          return null;
      }
    }).filter(Boolean)
      .sort((a, b) => b.raw - a.raw)
      .slice(0, 3);
  }

  function metricLabel(metric){
    switch (metric) {
      case 'temperature': return t('temperature');
      case 'rain': return t('rain');
      case 'wind': return t('wind');
      case 'humidity': return t('humidity');
      default: return metric;
    }
  }

  function convertMetric(metric, value){
    if (!isFinite(value)) return 0;
    switch (metric) {
      case 'temperature':
        return units === 'imperial' ? value * 9/5 + 32 : value;
      case 'rain':
        return units === 'imperial' ? value / 25.4 : value;
      case 'wind':
        return units === 'imperial' ? value / 1.609 : value;
      default:
        return value;
    }
  }

  function metricUnit(metric){
    switch (metric) {
      case 'temperature': return units === 'imperial' ? '°F' : '°C';
      case 'rain': return units === 'imperial' ? t('unitInch') : t('unitMillimeter');
      case 'wind': return units === 'imperial' ? t('unitMph') : t('unitKmH');
      case 'humidity': return '%';
      default: return '';
    }
  }

  function formatValue(metric, value){
    if (!isFinite(value)) return '—';
    let digits = 1;
    if (metric === 'rain') digits = value < 1 ? 2 : 1;
    if (metric === 'wind') digits = 1;
    if (metric === 'humidity') digits = 0;
    if (metric === 'temperature') digits = 1;
    const unit = metricUnit(metric);
    return `${value.toFixed(digits)}${unit ? ' ' + unit : ''}`;
  }

  function average(list){
    return list.length ? list.reduce((sum, v) => sum + v, 0) / list.length : 0;
  }

  function formatDate(dateStr){
    const safe = typeof dateStr === 'string' ? dateStr : '';
    const date = new Date(`${safe}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return safe;
    return date.toLocaleDateString(currentLang || document.documentElement.lang || 'de', {
      day: '2-digit',
      month: 'short'
    });
  }

  function isFinite(value){
    return Number.isFinite(value);
  }
})();
