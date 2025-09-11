/* Demodaten – konsistent über Widgets. Später mit TB ersetzen. */
window.CWS_DEMO = {
  stations: [
    { id: 'nussdorf', name: 'Nussdorf', lat: 48.0, lon: 13.0 },
    { id: 'waidach',  name: 'Waidach',  lat: 48.05, lon: 13.08 },
    { id: 'kreised',  name: 'Kreised',  lat: 47.98, lon: 13.03 }
  ],
  // Zeitreihen (letzte 24h, Schritt 30min)
  series: (() => {
    const now = Date.now();
    const step = 30 * 60 * 1000;
    const pts = [];
    for (let t = now - 24*60*60*1000; t <= now; t += step) {
      pts.push({
        t,
        temp: 10 + Math.sin((t/3.6e6)) * 8 + (Math.random()*1.5),
        hum: 60 + Math.sin((t/4e6)) * 15,
        wind: 5 + Math.random()*10,
        rain: Math.max(0, (Math.random() < 0.08) ? Math.random()*3 : 0)
      });
    }
    return pts;
  })()
};
