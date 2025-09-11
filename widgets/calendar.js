(function(){
  const root = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(root, {
    initialView: 'dayGridMonth',
    locale: 'de',
    height: 'auto',
    events: demoEvents()
  });
  calendar.render();

  function demoEvents(){
    const today = new Date();
    const y = today.getFullYear(), m = today.getMonth();
    return [
      { title: 'Wartung Station Nussdorf', start: new Date(y, m, 3) },
      { title: 'Sensorwechsel Waidach', start: new Date(y, m, 10) },
      { title: 'Sturm – erhöhte Böen', start: new Date(y, m, 14), color: '#f43f5e' },
      { title: 'Softwareupdate', start: new Date(y, m, 21), color: '#22c55e' }
    ];
  }
})();
