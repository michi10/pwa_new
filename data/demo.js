/* Simulierte Wetterdaten für Demo & Prototyping.
   - Konsistent über alle Widgets
   - Mehrtägige Statistiken + Stationsdaten
   - Zugangscode Pool (Demo-Server Simulation)
*/
(function(){
  const STATIONS = [
    { id: 'nussdorf', name: 'Nussdorf', lat: 48.0006, lon: 13.0003, elevation: 515 },
    { id: 'waidach',  name: 'Waidach',  lat: 48.0542, lon: 13.0795, elevation: 538 },
    { id: 'kreised',  name: 'Kreised',  lat: 47.9781, lon: 13.0312, elevation: 503 }
  ];

  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const avg = arr => arr.length ? arr.reduce((s,v)=>s+v,0) / arr.length : 0;

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const stepMs = 30 * 60 * 1000;
  const stepCount = 48; // letzte 24h in 30min Schritten
  const timeline = Array.from({ length: stepCount }, (_, i) => now.getTime() - (stepCount - 1 - i) * stepMs);

  const aggregatedSteps = timeline.map(t => ({ t, temp: [], hum: [], wind: [], rain: [] }));
  const aggregatedDailyMap = new Map();
  const perStation = {};
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const dayCount = 60; // 2 Monate Historie

  function dayOfYear(date){
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - start) / 86400000);
  }

  for (const [idx, station] of STATIONS.entries()) {
    const daily = [];

    for (let d = dayCount - 1; d >= 0; d--) {
      const date = new Date(now.getTime() - d * dayMs);
      const iso = date.toISOString().slice(0, 10);
      const doy = dayOfYear(date);

      const baseTemp = 11 + Math.sin((doy / 365) * 2 * Math.PI) * 10;
      const stationShift = idx * 0.9;
      const tempAvg = baseTemp + stationShift + (rand() - 0.5) * 1.6;
      const tempRange = 5.5 + rand() * 3.4;
      const tempMin = tempAvg - tempRange / 2;
      const tempMax = tempAvg + tempRange / 2;

      const humAvg = clamp(62 + Math.sin((doy / 45) + idx) * 16 + (rand() - 0.5) * 6, 32, 98);
      const humRange = 12 + rand() * 8;
      const humMin = clamp(humAvg - humRange / 2, 20, 100);
      const humMax = clamp(humAvg + humRange / 2, 35, 100);

      const windAvg = Math.max(2, 8 + Math.sin((doy / 18) + idx) * 2.8 + (rand() - 0.5) * 2.4);
      const windMax = windAvg + 8 + rand() * 3.5;
      const windMin = Math.max(0.4, windAvg - 3 - rand() * 2.5);

      const rainChance = 0.42 + Math.sin((doy / 9) + idx) * 0.12;
      const rainPulse = rand() < rainChance ? (rand() * 8.2) : (rand() * 1.8);
      const rainTotal = clamp(rainPulse + Math.max(0, Math.sin((doy / 14) + idx) * 1.6), 0, 28);

      daily.push({
        date: iso,
        metrics: {
          temperature: { min: tempMin, max: tempMax, avg: tempAvg },
          humidity:    { min: humMin,  max: humMax,  avg: humAvg },
          wind:        { min: windMin, max: windMax, avg: windAvg },
          rain:        { total: rainTotal }
        }
      });

      if (!aggregatedDailyMap.has(iso)) {
        aggregatedDailyMap.set(iso, {
          temperature: [],
          humidity: [],
          wind: [],
          rain: []
        });
      }
      const bucket = aggregatedDailyMap.get(iso);
      bucket.temperature.push({ min: tempMin, max: tempMax, avg: tempAvg });
      bucket.humidity.push({ min: humMin, max: humMax, avg: humAvg });
      bucket.wind.push({ min: windMin, max: windMax, avg: windAvg });
      bucket.rain.push(rainTotal);
    }

    const today = daily[daily.length - 1];
    const humMid = today.metrics.humidity.avg;
    const humAmp = Math.max(4, (today.metrics.humidity.max - today.metrics.humidity.min) / 2);
    const tempMid = today.metrics.temperature.avg;
    const tempAmp = Math.max(2.4, (today.metrics.temperature.max - today.metrics.temperature.min) / 2);
    const windMid = today.metrics.wind.avg;
    const windAmp = Math.max(1.6, (today.metrics.wind.max - today.metrics.wind.min) / 2);

    const stationSeries = timeline.map((t, i) => {
      const phase = (t / 3.6e6) + idx * 3.1;
      const temp = tempMid + Math.sin(phase / 1.6) * tempAmp * 0.9 + (rand() - 0.5) * 0.6;
      const hum = clamp(humMid + Math.sin(phase / 1.4) * humAmp * 0.85 + (rand() - 0.5) * 2.5, 18, 100);
      const wind = Math.max(0.2, windMid + Math.sin(phase / 1.8) * windAmp * 0.7 + (rand() - 0.5) * 1.8);
      const gust = wind + 4 + rand() * 3.4;
      const rainFactor = today.metrics.rain.total / 12;
      const rain = parseFloat((rand() < today.metrics.rain.total / 22 ? rand() * rainFactor : 0).toFixed(2));

      aggregatedSteps[i].temp.push(temp);
      aggregatedSteps[i].hum.push(hum);
      aggregatedSteps[i].wind.push(wind);
      aggregatedSteps[i].rain.push(rain);

      return { t, temp, hum, wind, gust, rain };
    });

    const rain24h = stationSeries.reduce((s, p) => s + p.rain, 0);
    const rain1h = stationSeries.slice(-2).reduce((s, p) => s + p.rain, 0);
    const windDirection = directions[(Math.floor(rand() * directions.length) + idx * 2) % directions.length];

    perStation[station.id] = {
      info: station,
      daily,
      series: stationSeries,
      current: {
        temperature: stationSeries[stationSeries.length - 1].temp,
        humidity: stationSeries[stationSeries.length - 1].hum,
        windAvg: stationSeries[stationSeries.length - 1].wind,
        windGust: stationSeries[stationSeries.length - 1].gust,
        windDirection,
        rain24h,
        rain1h,
        lastUpdate: timeline[timeline.length - 1]
      }
    };
  }

  const dailySummary = Array.from(aggregatedDailyMap.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([date, bucket]) => {
      const aggregate = list => ({
        min: Math.min(...list.map(v => v.min)),
        max: Math.max(...list.map(v => v.max)),
        avg: avg(list.map(v => v.avg))
      });
      const rainVals = bucket.rain;
      return {
        date,
        metrics: {
          temperature: aggregate(bucket.temperature),
          humidity: aggregate(bucket.humidity),
          wind: aggregate(bucket.wind),
          rain: {
            min: Math.min(...rainVals),
            max: Math.max(...rainVals),
            avg: avg(rainVals),
            total: rainVals.reduce((s, v) => s + v, 0)
          }
        }
      };
    });

  const series = aggregatedSteps.map(step => ({
    t: step.t,
    temp: avg(step.temp),
    hum: avg(step.hum),
    wind: avg(step.wind),
    rain: avg(step.rain)
  }));

  window.CWS_DEMO = {
    generatedAt: now.toISOString(),
    stations: STATIONS,
    series,
    perStation,
    dailySummary,
    codePool: {
      '123456': { limit: 3 },
      '654321': { limit: 3 }
    }
  };
})();
