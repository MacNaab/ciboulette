/*
 * Ciboulette service worker — offline app shell + local cooking-timer notifications.
 *
 * Bump VERSION whenever the precache list or the caching strategy changes:
 * old caches are purged on activate.
 *
 * All URLs are relative (./...) so the app works under a sub-path,
 * e.g. GitHub Pages project sites (https://user.github.io/ciboulette/).
 */
const VERSION = 'v1';
const SHELL_CACHE = `ciboulette-shell-${VERSION}`;
const RUNTIME_CACHE = `ciboulette-runtime-${VERSION}`;
const FONT_CACHE = `ciboulette-fonts-${VERSION}`;
const IMAGE_CACHE = `ciboulette-images-${VERSION}`;
const OWNED_PREFIX = 'ciboulette-';
const MAX_IMAGES = 80;

const SHELL_URLS = [
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
];

const STATIC_EXT = /\.(?:css|js|mjs|map|woff2?|ttf|otf|png|jpe?g|gif|svg|webp|avif|ico|webmanifest)$/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(SHELL_URLS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(OWNED_PREFIX) && ![SHELL_CACHE, RUNTIME_CACHE, FONT_CACHE, IMAGE_CACHE].includes(key))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function isSameOriginStatic(url) {
  return url.origin === self.location.origin && (url.pathname.includes('/assets/') || STATIC_EXT.test(url.pathname));
}

/** Network first (fresh HTML), fall back to the cached app shell when offline. */
async function networkFirstShell(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      // Keep the shell in sync so a later offline load gets the latest HTML.
      cache.put('./index.html', fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch (err) {
    const cached = (await cache.match('./index.html')) || (await caches.match(request));
    if (cached) return cached;
    throw err;
  }
}

/** Cache first, then network (and store the result). Hashed assets never change. */
async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;

  const response = await fetch(request);
  if (response && (response.ok || response.type === 'opaque')) {
    try {
      await cache.put(request, response.clone());
      if (maxEntries) {
        const keys = await cache.keys();
        if (keys.length > maxEntries) await cache.delete(keys[0]);
      }
    } catch {
      /* 206/partial responses can't be cached — serve them anyway */
    }
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // App shell (SPA navigation)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstShell(request));
    return;
  }

  // Build output + static files (hashed filenames → cache forever)
  if (isSameOriginStatic(url)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  // Google Fonts (fonts loaded from index.html)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // Recipe photos (may point to external hosts such as Unsplash)
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGES));
  }
});

/** Timer finished while the app is in the background: focus or open the app. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of windows) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })()
  );
});
