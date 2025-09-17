(function(){
  const host = document.getElementById('leaflet');
  if (!host || !window.L) return;

  const perStation = window.CWS_DEMO?.perStation || {};
  let units = (window.CWS_PREFS && window.CWS_PREFS.units) || 'metric';
  let favorite = (window.CWS_PREFS && window.CWS_PREFS.favoriteStation) || '';
  let currentLang = (window.CWS_PREFS && window.CWS_PREFS.lang) || document.documentElement.lang || 'de';

  const map = L.map(host, { zoomControl: false, attributionControl: true });

  const normalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const imagery = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: '© Esri'
  });
  const labels = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: ''
  });
  const hybridLayer = L.layerGroup([imagery, labels]);

  let layerControl = L.control.layers({
    [t('mapLayerNormal')]: normalLayer,
    [t('mapLayerHybrid')]: hybridLayer
  }, null, { position: 'topright' }).addTo(map);

  L.control.zoom({ position: 'topright' }).addTo(map);

  let fsButton;
  let fsActive = false;

  const FullscreenControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd() {
      const container = L.DomUtil.create('div', 'leaflet-bar cws-fullscreen-control');
      fsButton = L.DomUtil.create('button', 'cws-fullscreen-btn', container);
      fsButton.type = 'button';
      fsButton.addEventListener('click', toggleFullscreen);
      L.DomEvent.disableClickPropagation(fsButton);
      L.DomEvent.disableScrollPropagation(fsButton);
      updateFsButton();
      return container;
    }
  });
  map.addControl(new FullscreenControl());

  const markers = [];
  const bounds = L.latLngBounds([]);

  Object.values(perStation).forEach(station => {
    const { info } = station;
    const latLng = [info.lat, info.lon];
    bounds.extend(latLng);
    const marker = L.marker(latLng, { icon: buildIcon(station.info.id) }).addTo(map);
    marker.bindPopup(buildPopup(station.info.id));
    markers.push({ id: station.info.id, marker });
  });

  if (bounds.isValid()) {
    map.fitBounds(bounds.pad(0.2));
  } else {
    map.setView([48.02, 13.05], 11);
  }
  setTimeout(() => map.invalidateSize(), 180);

  document.addEventListener('fullscreenchange', () => {
    const active = document.fullscreenElement === host;
    if (active) {
      document.body.classList.add('map-expanded');
    } else if (!host.classList.contains('is-fullscreen')) {
      document.body.classList.remove('map-expanded');
    }
    fsActive = active || host.classList.contains('is-fullscreen');
    updateFsButton();
    setTimeout(() => map.invalidateSize(), 160);
  });

  document.addEventListener('cws:prefs', e => {
    const prefs = e.detail || {};
    let shouldRefreshMarkers = false;
    if (prefs.units && prefs.units !== units) {
      units = prefs.units;
      shouldRefreshMarkers = true;
    }
    if (prefs.favoriteStation && prefs.favoriteStation !== favorite) {
      favorite = prefs.favoriteStation;
      shouldRefreshMarkers = true;
    }
    if (prefs.lang && prefs.lang !== currentLang) {
      currentLang = prefs.lang;
      rebuildLayerControl();
      updateFsButton();
      shouldRefreshMarkers = true;
    }
    if (shouldRefreshMarkers) refreshMarkers();
  });

  function rebuildLayerControl(){
    if (layerControl) layerControl.remove();
    layerControl = L.control.layers({
      [t('mapLayerNormal')]: normalLayer,
      [t('mapLayerHybrid')]: hybridLayer
    }, null, { position: 'topright' }).addTo(map);
  }

  function refreshMarkers(){
    markers.forEach(m => {
      m.marker.setIcon(buildIcon(m.id));
      m.marker.setPopupContent(buildPopup(m.id));
    });
  }

  function buildIcon(id){
    const station = perStation[id];
    const current = station?.current;
    const temp = current ? convertTemp(current.temperature) : null;
    const isFav = favorite && id === favorite;
    const html = `<div class="marker-chip${isFav ? ' fav' : ''}">
                    <span class="marker-temp">${temp != null ? temp.toFixed(1) + tempUnit() : '—'}</span>
                    <span class="marker-name">${station?.info?.name || ''}</span>
                  </div>`;
    return L.divIcon({ className: 'cws-marker', html, iconSize: [120, 48], iconAnchor: [60, 48], popupAnchor: [0, -44] });
  }

  function buildPopup(id){
    const station = perStation[id];
    if (!station) return '<div>—</div>';
    const current = station.current;
    const updated = current?.lastUpdate ? new Date(current.lastUpdate) : new Date();
    const time = updated.toLocaleTimeString(currentLang || document.documentElement.lang || 'de', { hour: '2-digit', minute: '2-digit' });
    const rain24 = current ? convertRain(current.rain24h) : 0;
    const rain1 = current ? convertRain(current.rain1h) : 0;
    const windAvg = current ? convertWind(current.windAvg) : 0;
    const windGust = current ? convertWind(current.windGust) : 0;
    const temp = current ? convertTemp(current.temperature) : 0;
    return `<div class="map-popup">
              <h3>${station.info.name}</h3>
              <p class="meta">${t('today')} · ${time}</p>
              <div class="popup-grid">
                <div><span>${t('temperature')}</span><strong>${temp.toFixed(1)} ${tempUnit()}</strong></div>
                <div><span>${t('humidity')}</span><strong>${Math.round(current?.humidity ?? 0)} %</strong></div>
                <div><span>${t('wind')}</span><strong>${windAvg.toFixed(1)} / ${windGust.toFixed(1)} ${windUnit()}</strong></div>
                <div><span>${t('sum24h')}</span><strong>${formatRain(rain24)}</strong></div>
                <div><span>${t('lastHour')}</span><strong>${formatRain(rain1)}</strong></div>
                <div><span>${t('direction')}</span><strong>${current?.windDirection || '—'}</strong></div>
              </div>
            </div>`;
  }

  function tempUnit(){ return units === 'imperial' ? '°F' : '°C'; }
  function windUnit(){ return units === 'imperial' ? t('unitMph') : t('unitKmH'); }
  function rainUnit(){ return units === 'imperial' ? t('unitInch') : t('unitMillimeter'); }
  function convertTemp(v){ return units === 'imperial' ? v * 9/5 + 32 : v; }
  function convertWind(v){ return units === 'imperial' ? v / 1.609 : v; }
  function convertRain(v){ return units === 'imperial' ? v / 25.4 : v; }
  function formatRain(v){ const digits = v < 1 ? 2 : 1; return `${v.toFixed(digits)} ${rainUnit()}`; }

  function toggleFullscreen(){
    if (fsActive) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }

  function enterFullscreen(){
    if (host.requestFullscreen) {
      host.requestFullscreen().catch(fallbackEnter);
    } else {
      fallbackEnter();
    }
  }

  function exitFullscreen(){
    if (document.fullscreenElement === host) {
      document.exitFullscreen();
    } else if (host.classList.contains('is-fullscreen')) {
      fallbackExit();
    }
  }

  function fallbackEnter(){
    fsActive = true;
    document.body.classList.add('map-expanded');
    host.classList.add('is-fullscreen');
    updateFsButton();
    setTimeout(() => map.invalidateSize(), 80);
  }

  function fallbackExit(){
    fsActive = false;
    document.body.classList.remove('map-expanded');
    host.classList.remove('is-fullscreen');
    updateFsButton();
    setTimeout(() => map.invalidateSize(), 80);
  }

  function updateFsButton(){
    if (!fsButton) return;
    const expanded = fsActive || document.fullscreenElement === host;
    fsButton.innerHTML = expanded ? '<i class="fa-solid fa-compress"></i>' : '<i class="fa-solid fa-expand"></i>';
    const label = expanded ? t('mapExitFullscreen') : t('mapFullscreen');
    fsButton.setAttribute('aria-label', label);
    fsButton.title = label;
  }

})();
