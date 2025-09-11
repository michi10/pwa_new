(function(){
  const root = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(root, {
    initialView: 'dayGridMonth',
    locale: document.documentElement.lang,
    height: 'auto',
    events: demoEvents()
  });
  calendar.render();

  function demoEvents(){
    const today = new Date();
    const y = today.getFullYear(), m = today.getMonth();
    return [
      { title: t('evtMaintNussdorf'), start: new Date(y, m, 3) },
      { title: t('evtSensorWaidach'), start: new Date(y, m, 10) },
      { title: t('evtStorm'), start: new Date(y, m, 14), color: '#f43f5e' },
      { title: t('evtSoftwareUpdate'), start: new Date(y, m, 21), color: '#22c55e' }
    ];
  }
})();
