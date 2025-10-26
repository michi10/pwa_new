const VERSION = '1.0.0';
const SHELL_CACHE = `cws-shell-${VERSION}`;
const RUNTIME_CACHE = `cws-runtime-${VERSION}`;
const TELEMETRY_CACHE = 'cws-telemetry';
const MAP_CACHE = 'cws-maps';
const SHELL_FILES = ['/', '/index.html', '/manifest.json', '/config.json', '/asset-manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(SHELL_FILES);
      try {
        const manifestResponse = await fetch('/asset-manifest.json', { cache: 'no-cache' });
        if (manifestResponse.ok) {
          const { assets } = await manifestResponse.clone().json();
          if (Array.isArray(assets)) {
            await Promise.all(
              assets.map(async (asset) => {
                try {
                  await cache.add(asset);
                } catch (error) {
                  console.warn('[CWS][SW] Asset konnte nicht vorgeladen werden:', asset, error);
                }
              })
            );
          }
        }
      } catch (error) {
        console.warn('[CWS][SW] Manifest nicht verfügbar', error);
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith('cws-') && name !== SHELL_CACHE && name !== RUNTIME_CACHE && name !== TELEMETRY_CACHE && name !== MAP_CACHE)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  const { data } = event;
  if (!data || typeof data !== 'object') {
    return;
  }
  if (data.type === 'FULL_REFRESH') {
    event.waitUntil(handleFullRefresh());
  }
});

async function handleFullRefresh() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name.startsWith('cws-') && name !== SHELL_CACHE)
      .map((name) => caches.delete(name))
  );
  await self.skipWaiting();
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type: 'SW_REFRESH_COMPLETE' });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(cacheFirstNavigate(request));
    return;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(staleWhileRevalidate(request, TELEMETRY_CACHE));
      return;
    }
    if (/\.(?:js|css|mjs)$/.test(url.pathname)) {
      event.respondWith(cacheFirst(request, RUNTIME_CACHE));
      return;
    }
    if (url.pathname.endsWith('/config.json')) {
      event.respondWith(networkFirst(request));
      return;
    }
  }

  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('arcgisonline.com')) {
    event.respondWith(cacheFirst(request, MAP_CACHE, 30));
    return;
  }

  if (url.hostname.includes('thingsboard')) {
    event.respondWith(staleWhileRevalidate(request, TELEMETRY_CACHE));
    return;
  }

  event.respondWith(networkFirst(request));
});

async function cacheFirstNavigate(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cachedResponse = await cache.match('/index.html');
  if (cachedResponse) {
    return cachedResponse;
  }
  const response = await fetch(request);
  cache.put('/index.html', response.clone());
  return response;
}

async function cacheFirst(request, cacheName, maxEntries = 60) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    trimCache(cache, maxEntries).catch(() => {});
    return response;
  } catch (error) {
    const fallback = await caches.match('/index.html');
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponsePromise = cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  const cachedResponse = await cachedResponsePromise;
  return cachedResponse || (await networkPromise) || new Response(null, { status: 504 });
}

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length <= maxEntries) {
    return;
  }
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
}
