(function(){
  const list = document.getElementById('rainList');
  const rangeSel = document.getElementById('range');
  const summaryEl = document.getElementById('rainSummary');
  if (!list || !rangeSel || !window.CWS_DEMO) return;

  const perStation = window.CWS_DEMO.perStation || {};
  const daily = window.CWS_DEMO.dailySummary || [];
  let units = (window.CWS_PREFS && window.CWS_PREFS.units) || 'metric';
  let favorite = (window.CWS_PREFS && window.CWS_PREFS.favoriteStation) || '';

  rangeSel.addEventListener('change', e => render(e.target.value));

  document.addEventListener('cws:prefs', e => {
    const prefs = e.detail || {};
    let shouldRender = false;
    if (prefs.units && prefs.units !== units) {
      units = prefs.units;
      shouldRender = true;
    }
    if (prefs.favoriteStation && prefs.favoriteStation !== favorite) {
      favorite = prefs.favoriteStation;
      shouldRender = true;
    }
    if (shouldRender) render(rangeSel.value);
  });

  render(rangeSel.value);

  function render(range){
    const { stationTotals, total } = computeTotals(range);
    if (summaryEl) summaryEl.textContent = `${t('rainSummary')}: ${formatRain(total)}`;
    list.innerHTML = '';
    stationTotals.forEach(entry => {
      const item = document.createElement('div');
      item.className = 'item' + (entry.id === favorite ? ' fav' : '');
      item.innerHTML = `<div><strong>${entry.name}</strong><div class="muted">${t('rainStationShare')}</div></div>
                        <div class="amount">${formatRain(entry.value)}</div>`;
      list.appendChild(item);
    });
  }

  function computeTotals(range){
    const days = rangeToDays(range);
    const stationTotals = Object.values(perStation).map(station => {
      const recent = station.daily.slice(-days);
      const sum = recent.reduce((s, entry) => s + (entry.metrics?.rain?.total || 0), 0);
      return { id: station.info.id, name: station.info.name, value: convertRain(sum) };
    }).sort((a, b) => b.value - a.value);

    const recentNetwork = daily.slice(-days);
    const total = recentNetwork.reduce((s, entry) => s + convertRain(entry.metrics?.rain?.total || 0), 0);
    return { stationTotals, total };
  }

  function rangeToDays(range){
    switch (range) {
      case '48': return 2;
      case '7d': return 7;
      case '30d': return 30;
      default: return 1;
    }
  }

  function convertRain(v){
    return units === 'imperial' ? v / 25.4 : v;
  }

  function formatRain(v){
    const digits = v < 1 ? 2 : 1;
    return `${v.toFixed(digits)} ${units === 'imperial' ? t('unitInch') : t('unitMillimeter')}`;
  }
})();
