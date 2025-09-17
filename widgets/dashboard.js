(function(){
  const series = window.CWS_DEMO?.series || [];
  const perStation = window.CWS_DEMO?.perStation || {};
  let units = (window.CWS_PREFS && window.CWS_PREFS.units) || 'metric';
  let favorite = (window.CWS_PREFS && window.CWS_PREFS.favoriteStation) || '';
  const charts = {};
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

    $('#nowDeg').textContent = `${nowTemp.toFixed(1)}${tempUnit()}`;
    $('#nowHi').textContent = `${t('highShort')} ${hiTemp.toFixed(1)}${tempUnit()}`;
    $('#nowLo').textContent = `${t('lowShort')} ${loTemp.toFixed(1)}${tempUnit()}`;

    $('#tempNow').textContent = `${nowTemp.toFixed(1)} ${tempUnit()}`;
    $('#tempMin').textContent = `${loTemp.toFixed(1)} ${tempUnit()}`;
    $('#tempMax').textContent = `${hiTemp.toFixed(1)} ${tempUnit()}`;
    $('#trendTemp').textContent = trendSymbol(temps);

    const rainToday = sum(rains);
    const rain1h = sum(rains.slice(-2));
    const rain24 = sum(rains.slice(-48));
    $('#rainToday').textContent = formatRain(rainToday);
    $('#rain1h').textContent = formatRain(rain1h);
    $('#rain24h').textContent = formatRain(rain24);
    $('#rainIntensity').textContent = trendSymbol(rains);

    const windAverage = avg(winds);
    const station = currentStation();
    const stationCurrent = station?.current;
    const gust = stationCurrent ? convertWind(stationCurrent.windGust) : Math.max(...winds) + 2.4;
    const direction = stationCurrent?.windDirection || '—';

    $('#windAvg').textContent = `${windAverage.toFixed(1)} ${windUnit()}`;
    $('#windGust').textContent = `${gust.toFixed(1)} ${windUnit()}`;
    $('#windDir').textContent = direction;
    $('#trendWind').textContent = trendSymbol(winds);

    const humNow = hums[hums.length - 1] || 0;
    $('#humNow').textContent = `${humNow.toFixed(0)} %`;
    $('#humMin').textContent = `${Math.min(...hums).toFixed(0)} %`;
    $('#humMax').textContent = `${Math.max(...hums).toFixed(0)} %`;
    $('#trendHum').textContent = trendSymbol(hums);

    makeSpark('sparkTemp', temps, '#e11d48');
    makeSpark('sparkRain', rains, '#0ea5e9');
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

  render();

  function $(sel){ return document.querySelector(sel); }
})();
