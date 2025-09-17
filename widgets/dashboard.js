(function(){
  const pts = window.CWS_DEMO.series;
  const temps = pts.map(p => p.temp);
  const hums  = pts.map(p => p.hum);
  const winds = pts.map(p => p.wind);
  const rains = pts.map(p => p.rain);
  const sum = a => a.reduce((x,y)=>x+y,0);
  const min = a => Math.min(...a);
  const max = a => Math.max(...a);

  // Personal Greeting
  document.addEventListener('cws:user', (e)=>{
    const { firstName } = e.detail || {};
    const hello = document.getElementById('helloText');
    if (firstName) hello.textContent = t('helloName').replace('{name}', firstName);
    else hello.textContent = t('hello');
  });

  // NOW
  const nowT = temps[temps.length-1] || 0;
  const hiT  = max(temps);
  const loT  = min(temps);
  document.getElementById('nowDeg').textContent = `${nowT.toFixed(1)}°`;
  document.getElementById('nowHi').textContent  = `${t('highShort')} ${hiT.toFixed(1)}°`;
  document.getElementById('nowLo').textContent  = `${t('lowShort')} ${loT.toFixed(1)}°`;

  // KPIs
  $('#tempNow').textContent = `${nowT.toFixed(1)} °C`;
  $('#tempMin').textContent = `${loT.toFixed(1)} °C`;
  $('#tempMax').textContent = `${hiT.toFixed(1)} °C`;

  const r24 = sum(rains.slice(-48));
  const r1h = sum(rains.slice(-2));
  const rToday = sum(rains); // demo
  $('#rainToday').textContent = `${rToday.toFixed(1)} mm`;
  $('#rain1h').textContent    = `${r1h.toFixed(1)} mm`;
  $('#rain24h').textContent   = `${r24.toFixed(1)} mm`;

  const wNow = winds[winds.length-1] || 0;
  $('#windAvg').textContent  = `${(sum(winds)/winds.length).toFixed(1)} km/h`;
  $('#windGust').textContent = `${max(winds).toFixed(1)} km/h`;
  $('#windDir').textContent  = 'SW'; // Demo

  const hNow = hums[hums.length-1] || 0;
  $('#humNow').textContent = `${hNow.toFixed(0)} %`;
  $('#humMin').textContent = `${min(hums).toFixed(0)} %`;
  $('#humMax').textContent = `${max(hums).toFixed(0)} %`;

  // Sparklines (ECharts)
  makeSpark('sparkTemp', temps, '#e11d48');   // rot
  makeSpark('sparkRain', rains, '#0ea5e9');   // blau
  makeSpark('sparkWind', winds, '#22c55e');   // grün
  makeSpark('sparkHum',  hums,  '#f59e0b');   // amber

  function makeSpark(id, data, color){
    const el = document.getElementById(id);
    const chart = echarts.init(el, null, { renderer: 'canvas' });
    chart.setOption({
      animation: !document.documentElement.classList.contains('reduce'),
      grid: { top: 4, bottom: 4, left: 2, right: 2 },
      xAxis: { type: 'category', boundaryGap: false, show: false, data: data.map((_,i)=>i) },
      yAxis: { type: 'value', show: false },
      series: [{ type:'line', data, showSymbol:false, lineStyle:{ width:2, color }, areaStyle:{ color, opacity:.12 } }]
    });
    new ResizeObserver(()=>chart.resize()).observe(el);
  }

  function $(s){ return document.querySelector(s); }
})();
