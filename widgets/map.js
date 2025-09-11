(function(){
  const map = L.map('leaflet', { zoomControl: true }).setView([48.02, 13.05], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap'
  }).addTo(map);

  const icon = L.divIcon({
    className: 'cws-marker',
    html: `<div style="background:${getComputedStyle(document.documentElement).getPropertyValue('--cws-primary')};
                     color:#fff;border-radius:14px;padding:4px 8px;
                     box-shadow:0 6px 16px rgba(0,0,0,.18)">CWS</div>`
  });

  for (const s of CWS_DEMO.stations) {
    L.marker([s.lat, s.lon], { icon }).addTo(map).bindPopup(`<b>${s.name}</b>`);
  }
})();
