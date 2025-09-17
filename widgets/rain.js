(function(){
  const list = document.getElementById('rainList');
  const rangeSel = document.getElementById('range');
  function render(range='24'){
    const pts = window.CWS_DEMO.series.slice();
    let last;
    switch(range){
      case '24': last = 48; break;
      case '48': last = 96; break;
      case '7d': last = 7*48; break;
      case '30d': last = 30*48; break;
    }
    const slice = pts.slice(-last);
    const total = slice.reduce((s,p)=>s+p.rain,0);
    list.innerHTML = '';
    // Stations (Demo: gleiche Summe, zur Illustration verteilt)
    for (const s of window.CWS_DEMO.stations) {
      const v = (total * (0.7 + Math.random()*0.6)).toFixed(1);
      const el = document.createElement('div');
      el.className = 'item';
        el.innerHTML = `<div><strong>${s.name}</strong><div style="color:var(--cws-muted)">${t('inPeriod')}</div></div>
                        <div class="amount">${v} mm</div>`;
      list.appendChild(el);
    }
  }
  rangeSel.addEventListener('change', e=>render(e.target.value));
  render();
})();
