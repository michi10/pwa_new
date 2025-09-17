(function(){
  const root = document.getElementById('calendar');
  const metricSel = document.getElementById('calendarMetric');
  const statSel = document.getElementById('calendarStatistic');
  if (!root || !window.FullCalendar) return;

  const daily = window.CWS_DEMO?.dailySummary || [];
  let units = (window.CWS_PREFS && window.CWS_PREFS.units) || 'metric';

  const calendar = new FullCalendar.Calendar(root, {
    initialView: 'dayGridMonth',
    locale: document.documentElement.lang,
    height: 'auto',
    events: buildEvents(),
    eventContent(info) {
      const pill = document.createElement('div');
      pill.className = 'calendar-pill';
      pill.textContent = info.event.extendedProps.display || '';
      return { domNodes: [pill] };
    }
  });
  calendar.render();

  metricSel.addEventListener('change', refresh);
  statSel.addEventListener('change', refresh);

  document.addEventListener('cws:prefs', e => {
    const prefs = e.detail || {};
    if (prefs.units && prefs.units !== units) {
      units = prefs.units;
      refresh();
    }
    if (prefs.lang) {
      calendar.setOption('locale', prefs.lang);
    }
  });

  function refresh(){
    calendar.batchRendering(() => {
      calendar.removeAllEvents();
      buildEvents().forEach(evt => calendar.addEvent(evt));
    });
  }

  function buildEvents(){
    const metric = metricSel.value;
    const stat = statSel.value;
    const events = [];
    daily.forEach(entry => {
      const data = entry.metrics?.[metric];
      if (!data) return;
      let raw;
      switch (stat) {
        case 'min': raw = data.min; break;
        case 'max': raw = data.max; break;
        default: raw = data.avg; break;
      }
      if (raw == null) return;
      const converted = convert(metric, raw);
      const label = formatDisplay(metric, converted);
      events.push({
        start: entry.date,
        allDay: true,
        display: 'block',
        extendedProps: { display: label }
      });
    });
    return events;
  }

  function convert(metric, value){
    switch (metric) {
      case 'temperature':
        return units === 'imperial' ? value * 9/5 + 32 : value;
      case 'wind':
        return units === 'imperial' ? value / 1.609 : value;
      case 'rain':
        return units === 'imperial' ? value / 25.4 : value;
      default:
        return value;
    }
  }

  function formatDisplay(metric, value){
    switch (metric) {
      case 'temperature':
        return `${value.toFixed(1)} ${tempUnit()}`;
      case 'wind':
        return `${value.toFixed(1)} ${windUnit()}`;
      case 'rain':
        return `${value < 1 ? value.toFixed(2) : value.toFixed(1)} ${rainUnit()}`;
      case 'humidity':
        return `${Math.round(value)} %`;
      default:
        return `${value.toFixed(1)}`;
    }
  }

  function tempUnit(){ return units === 'imperial' ? '°F' : '°C'; }
  function windUnit(){ return units === 'imperial' ? t('unitMph') : t('unitKmH'); }
  function rainUnit(){ return units === 'imperial' ? t('unitInch') : t('unitMillimeter'); }
})();
