(function(){
  const series = window.CWS_DEMO?.series || [];
  const perStation = window.CWS_DEMO?.perStation || {};
  let units = (window.CWS_PREFS && window.CWS_PREFS.units) || 'metric';
  let favorite = (window.CWS_PREFS && window.CWS_PREFS.favoriteStation) || '';
  const charts = {};
  const metricDetails = {};
  const metricCards = new Map();
  if (!series.length) return;

  const sum = arr => arr.reduce((s, v) => s + v, 0);
  const avg = arr => arr.length ? sum(arr) / arr.length : 0;

  const tempUnit = () => units === 'imperial' ? '°F' : '°C';
  const windUnit = () => units === 'imperial' ? t('unitMph') : t('unitKmH');
  const rainUnit = () => units === 'imperial' ? t('unitInch') : t('unitMillimeter');

  const convertTemp = v => units === 'imperial' ? v * 9/5 + 32 : v;
  const convertWind = v => units === 'imperial' ? v / 1.609 : v;
  const convertRain = v => units === 'imperial' ? v / 25.4 : v;

  function currentStation(){
    if (favorite && perStation[favorite]) return perStation[favorite];
    const firstKey = Object.keys(perStation)[0];
    return firstKey ? perStation[firstKey] : null;
  }

  function formatTimestamp(value){
    if (!value) return '—';
    try {
      return new Intl.DateTimeFormat(document.documentElement.lang || undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(value));
    } catch {
      try {
        return new Date(value).toLocaleString();
      } catch {
        return '—';
      }
    }
  }

  function formatCoord(value, positive, negative){
    if (!Number.isFinite(value)) return '—';
    const suffix = value >= 0 ? positive : negative;
    return `${Math.abs(value).toFixed(4)}°${suffix}`;
  }

  function buildStationMeta(station){
    if (!station?.info) return [];
    const meta = [];
    const info = station.info;
    if (info.name) meta.push({ label: t('metricDetailsStation'), value: info.name });
    if (Number.isFinite(info.lat) && Number.isFinite(info.lon)) {
      meta.push({
        label: t('metricDetailsLocation'),
        value: `${formatCoord(info.lat, 'N', 'S')}, ${formatCoord(info.lon, 'E', 'W')}`
      });
    }
    if (Number.isFinite(info.elevation)) {
      meta.push({ label: t('metricDetailsElevation'), value: `${Math.round(info.elevation)} m` });
    }
    return meta;
  }

  function describeTrend(symbol){
    switch (symbol) {
      case '↑': return t('metricDetailsTrendUp');
      case '↓': return t('metricDetailsTrendDown');
      case '→': return t('metricDetailsTrendStable');
      default: return '';
    }
  }

  function trendText(symbol){
    const word = describeTrend(symbol);
    return word ? `${symbol} ${word}` : symbol;
  }

  function openMetricDetails(key){
    const detail = metricDetails[key];
    const show = window.CWS?.showMetricDetails;
    if (detail && typeof show === 'function') {
      show(detail);
    }
  }

  function registerCard(id, key){
    const card = document.getElementById(id);
    if (!card || metricCards.has(key)) return;
    metricCards.set(key, card);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.classList.add('metric-card');
    card.addEventListener('click', () => openMetricDetails(key));
    card.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
        ev.preventDefault();
        openMetricDetails(key);
      }
    });
  }

  function updateCardLabels(){
    metricCards.forEach((card, key) => {
      if (!card) return;
      const detail = metricDetails[key];
      if (detail?.title) {
        const label = t('metricDetailsShow').replace('{metric}', detail.title);
        card.setAttribute('aria-label', label);
      } else {
        card.removeAttribute('aria-label');
      }
    });
  }

  function trendSymbol(values){
    if (!values.length) return '—';
    const compareIndex = Math.max(0, values.length - 6);
    const delta = values[values.length - 1] - values[compareIndex];
    if (delta > 0.6) return '↑';
    if (delta < -0.6) return '↓';
    return '→';
  }

  function formatRain(value){
    const digits = value < 1 ? 2 : 1;
    return `${value.toFixed(digits)} ${rainUnit()}`;
  }

  function render(){
    if (!series.length) return;
    const temps = series.map(p => convertTemp(p.temp));
    const hums  = series.map(p => p.hum);
    const winds = series.map(p => convertWind(p.wind));
    const rains = series.map(p => convertRain(p.rain));

    const nowTemp = temps[temps.length - 1] || 0;
    const hiTemp = Math.max(...temps);
    const loTemp = Math.min(...temps);
    const tempTrend = trendSymbol(temps);

    $('#nowDeg').textContent = `${nowTemp.toFixed(1)}${tempUnit()}`;
    $('#nowHi').textContent = `${t('highShort')} ${hiTemp.toFixed(1)}${tempUnit()}`;
    $('#nowLo').textContent = `${t('lowShort')} ${loTemp.toFixed(1)}${tempUnit()}`;

    $('#tempNow').textContent = `${nowTemp.toFixed(1)} ${tempUnit()}`;
    $('#tempMin').textContent = `${loTemp.toFixed(1)} ${tempUnit()}`;
    $('#tempMax').textContent = `${hiTemp.toFixed(1)} ${tempUnit()}`;
    $('#trendTemp').textContent = tempTrend;

    const rainToday = sum(rains);
    const rain1h = sum(rains.slice(-2));
    const rain24 = sum(rains.slice(-48));
    const rainTrend = trendSymbol(rains);
    $('#rainToday').textContent = formatRain(rainToday);
    $('#rain1h').textContent = formatRain(rain1h);
    $('#rain24h').textContent = formatRain(rain24);
    $('#rainIntensity').textContent = rainTrend;

    const windAverage = avg(winds);
    const station = currentStation();
    const stationCurrent = station?.current;
    const fallbackGustBase = winds.length ? Math.max(...winds) : windAverage;
    const gust = stationCurrent ? convertWind(stationCurrent.windGust) : fallbackGustBase + 2.4;
    const direction = stationCurrent?.windDirection || '—';
    const windTrend = trendSymbol(winds);

    $('#windAvg').textContent = `${windAverage.toFixed(1)} ${windUnit()}`;
    $('#windGust').textContent = `${gust.toFixed(1)} ${windUnit()}`;
    $('#windDir').textContent = direction;
    $('#trendWind').textContent = windTrend;

    const humNow = hums[hums.length - 1] || 0;
    const humMin = Math.min(...hums);
    const humMax = Math.max(...hums);
    const humTrend = trendSymbol(hums);
    $('#humNow').textContent = `${humNow.toFixed(0)} %`;
    $('#humMin').textContent = `${humMin.toFixed(0)} %`;
    $('#humMax').textContent = `${humMax.toFixed(0)} %`;
    $('#trendHum').textContent = humTrend;

    const stationSubtitle = station?.info?.name || '';
    const stationMeta = buildStationMeta(station);
    const lastPoint = series[series.length - 1] || {};
    const lastUpdateTs = stationCurrent?.lastUpdate || lastPoint.t || Date.now();
    const updatedAt = formatTimestamp(lastUpdateTs);
    const tempAvg = avg(temps);
    const rainAvg = avg(rains);
    const humAvg = avg(hums);
    const windMax = winds.length ? Math.max(...winds) : windAverage;

    metricDetails.temperature = {
      title: t('temperature'),
      subtitle: stationSubtitle,
      items: [
        { label: t('current'), value: `${nowTemp.toFixed(1)} ${tempUnit()}` },
        { label: t('minToday'), value: `${loTemp.toFixed(1)} ${tempUnit()}` },
        { label: t('maxToday'), value: `${hiTemp.toFixed(1)} ${tempUnit()}` },
        { label: `${t('average')} · ${t('range24h')}`, value: `${tempAvg.toFixed(1)} ${tempUnit()}`, hint: t('metricDetailsPeriod24h') }
      ],
      meta: [
        ...stationMeta,
        { label: t('metricDetailsTrend'), value: trendText(tempTrend) },
        { label: t('metricDetailsUnit'), value: tempUnit() },
        { label: t('metricDetailsUpdated'), value: updatedAt }
      ]
    };

    metricDetails.rain = {
      title: t('rain'),
      subtitle: stationSubtitle,
      items: [
        { label: t('today'), value: formatRain(rainToday) },
        { label: t('lastHour'), value: formatRain(rain1h) },
        { label: t('sum24h'), value: formatRain(rain24) },
        { label: `${t('average')} · ${t('range24h')}`, value: formatRain(rainAvg), hint: t('metricDetailsPeriod24h') }
      ],
      meta: [
        ...stationMeta,
        { label: t('metricDetailsTrend'), value: trendText(rainTrend) },
        { label: t('metricDetailsUnit'), value: rainUnit() },
        { label: t('metricDetailsUpdated'), value: updatedAt }
      ]
    };

    metricDetails.wind = {
      title: t('wind'),
      subtitle: stationSubtitle,
      items: [
        { label: `${t('average')} · ${t('range24h')}`, value: `${windAverage.toFixed(1)} ${windUnit()}`, hint: t('metricDetailsPeriod24h') },
        { label: t('gust'), value: `${gust.toFixed(1)} ${windUnit()}` },
        { label: t('statMax'), value: `${windMax.toFixed(1)} ${windUnit()}` },
        { label: t('direction'), value: direction }
      ],
      meta: [
        ...stationMeta,
        { label: t('metricDetailsTrend'), value: trendText(windTrend) },
        { label: t('metricDetailsUnit'), value: windUnit() },
        { label: t('metricDetailsUpdated'), value: updatedAt }
      ]
    };

    metricDetails.humidity = {
      title: t('humidity'),
      subtitle: stationSubtitle,
      items: [
        { label: t('current'), value: `${humNow.toFixed(0)} %` },
        { label: t('minToday'), value: `${humMin.toFixed(0)} %` },
        { label: t('maxToday'), value: `${humMax.toFixed(0)} %` },
        { label: `${t('average')} · ${t('range24h')}`, value: `${humAvg.toFixed(0)} %`, hint: t('metricDetailsPeriod24h') }
      ],
      meta: [
        ...stationMeta,
        { label: t('metricDetailsTrend'), value: trendText(humTrend) },
        { label: t('metricDetailsUnit'), value: '%' },
        { label: t('metricDetailsUpdated'), value: updatedAt }
      ]
    };

    updateCardLabels();

    makeSpark('sparkTemp', temps, '#e11d48');
    makeSpark('sparkRain', rains, '#80c0ed');
    makeSpark('sparkWind', winds, '#22c55e');
    makeSpark('sparkHum', hums, '#f59e0b');
  }

  function makeSpark(id, data, color){
    const el = document.getElementById(id);
    if (!el) return;
    if (!charts[id]) {
      charts[id] = echarts.init(el, null, { renderer: 'canvas' });
      new ResizeObserver(() => charts[id].resize()).observe(el);
    }
    charts[id].setOption({
      animation: !document.documentElement.classList.contains('reduce'),
      grid: { top: 4, bottom: 4, left: 2, right: 2 },
      xAxis: { type: 'category', boundaryGap: false, show: false, data: data.map((_, i) => i) },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'line',
        data: data.map(v => Number(v.toFixed(2))),
        showSymbol: false,
        lineStyle: { width: 2, color },
        areaStyle: { color, opacity: 0.12 }
      }]
    });
  }

  document.addEventListener('cws:prefs', e => {
    const prefs = e.detail || {};
    if (prefs.units && prefs.units !== units) {
      units = prefs.units;
      render();
    }
    if (prefs.favoriteStation && prefs.favoriteStation !== favorite) {
      favorite = prefs.favoriteStation;
      render();
    }
  });

  document.addEventListener('cws:user', e => {
    const { firstName } = e.detail || {};
    const hello = document.getElementById('helloText');
    if (!hello) return;
    hello.textContent = firstName ? t('helloName').replace('{name}', firstName) : t('hello');
  });

  registerCard('cardTemp', 'temperature');
  registerCard('cardRain', 'rain');
  registerCard('cardWind', 'wind');
  registerCard('cardHum', 'humidity');

  render();

  function $(sel){ return document.querySelector(sel); }
})();
