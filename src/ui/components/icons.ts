const icons: Record<string, string> = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M11.4 2.3a1 1 0 0 1 1.2 0l8.4 6.3a1 1 0 0 1-.6 1.8h-1v9.6a1 1 0 0 1-1 1h-4.5a1 1 0 0 1-1-1v-4.8H10v4.8a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V10.4h-1a1 1 0 0 1-.6-1.8z" /></svg>',
  reload: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M5 4v4.2a1 1 0 0 0 1 1h4.2a1 1 0 0 0 0-2H8.4a6 6 0 1 1-1.1 8.5 1 1 0 1 0-1.6 1.2A8 8 0 1 0 12 4h-1.8a1 1 0 0 0-1 .8V4a1 1 0 0 0-2 0z" /></svg>',
  chevronDown: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="currentColor"><path d="M3.2 5.7a1 1 0 0 1 1.4 0L8 9.1l3.4-3.4a1 1 0 1 1 1.4 1.4l-4.1 4.1a1 1 0 0 1-1.4 0L3.2 7.1a1 1 0 0 1 0-1.4z" /></svg>',
  map: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M9 4.5 3 6.8v13.7l6-2.3 6 2.3 6-2.3V4.5l-6 2.3-6-2.3zm0 2.6 4 1.5v10.8l-4-1.5V7.1zm-2 0v10.8l-2 0.8V8l2-.9zm10 0 2-.9v9.9l-2 .8V7.1z" /></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 0 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9zm-8 3a1 1 0 0 1 1 1v3h-3a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 1-1z" /></svg>',
  rain: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M7.4 3.1a1 1 0 0 1 1.8 0l3 5.9a4.5 4.5 0 1 1-7.8 0l3-5.9zm7.2 10.6a1 1 0 0 1 1.8 0l3 5.9a4.5 4.5 0 1 1-7.8 0l3-5.9z" /></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.1 5.2a1.3 1.3 0 1 1-.2 2.6 1.3 1.3 0 0 1 .2-2.6zM10 11a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v6h1a1 1 0 1 1 0 2h-4a1 1 0 1 1 0-2h1v-5h-1a1 1 0 0 1-1-1z" /></svg>',
  temperature: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M9 4a3 3 0 0 1 6 0v7.1a5 5 0 1 1-6 0V4zm4 7.1V4a1 1 0 1 0-2 0v7.1a3 3 0 1 0 2 0z" /></svg>',
  humidity: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M12 2.4 7.1 8.5a6 6 0 1 0 9.8 0L12 2.4zm0 4.2 2.6 3.3a4 4 0 1 1-5.2 0L12 6.6z" /></svg>',
  wind: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M5 9a1 1 0 0 1 0-2h9a2 2 0 1 0-2-2 1 1 0 1 1-2 0 4 4 0 1 1 4 4H5zm0 6a1 1 0 0 1 0-2h13.5a1.5 1.5 0 1 0-1.5-1.5 1 1 0 1 1-2 0 3.5 3.5 0 1 1 3.5 3.5H5zm0 4a1 1 0 0 1 0-2h6.5a1.5 1.5 0 1 0-1.5-1.5 1 1 0 1 1-2 0A3.5 3.5 0 1 1 11.5 21H5z" /></svg>',
  uv: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M12 3a1 1 0 0 1 1 1v1.1a5 5 0 0 1 3.9 3.9H18a1 1 0 1 1 0 2h-1.1a5 5 0 0 1-3.9 3.9V18a1 1 0 1 1-2 0v-1.1a5 5 0 0 1-3.9-3.9H6a1 1 0 1 1 0-2h1.1A5 5 0 0 1 11 5.1V4a1 1 0 0 1 1-1zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" /></svg>',
  arrowRight: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="currentColor"><path d="M6 3a1 1 0 0 1 1.7-.7l4 4a1 1 0 0 1 0 1.4l-4 4A1 1 0 0 1 6 11.3L8.6 8 6 5.4A1 1 0 0 1 6 3z" /></svg>',
  station: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M12 2a8 8 0 0 0-5.7 13.6l-1.6 4.3a1 1 0 0 0 1.3 1.3l4.3-1.6A8 8 0 1 0 12 2zm0 2a6 6 0 1 1-4.2 10.2 1 1 0 0 0-1.1-.2l-1.6.6.6-1.6a1 1 0 0 0-.2-1.1A6 6 0 0 1 12 4zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 4a3 3 0 1 1-3 3 3 3 0 0 1 3-3z" /></svg>',
  time: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 2a8 8 0 1 1-8 8 8 8 0 0 1 8-8zm-.5 3a1 1 0 0 0-1 1v4.4a1 1 0 0 0 .4.8l3 2.2a1 1 0 1 0 1.2-1.6L12.5 11V8a1 1 0 0 0-1-1z" /></svg>'
};

export type IconName = keyof typeof icons;

export function renderIcon(name: keyof typeof icons, label?: string): HTMLElement {
  const span = document.createElement('span');
  span.className = 'icon';
  span.innerHTML = icons[name] ?? '';
  if (label) {
    span.setAttribute('aria-hidden', 'true');
    span.setAttribute('data-label', label);
  } else {
    span.setAttribute('aria-hidden', 'true');
  }
  return span;
}

export function getIconMarkup(name: keyof typeof icons): string {
  return icons[name] ?? '';
}
