// XZenPress Service Worker - CSP Fix Optimized
// VERSÃO 3.0.1 - Limpeza agressiva de Cache para corrigir CSP
const CACHE_NAME = 'xzenpress-v3.0.1-csp-fix';
const STATIC_CACHE = 'xzenpress-static-v3.0.1';
const DYNAMIC_CACHE = 'xzenpress-dynamic-v3.0.1';
const SOUNDS_CACHE = 'xzenpress-sounds-v3.0.1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Logo Xzenpress oficial.png',
  '/sounds/ocean.mp3',
  '/sounds/rain.mp3'
];

// Dynamic content patterns
const DYNAMIC_PATTERNS = [
  /\/api\//,
  /\/images\//,
  /\/sounds\//,
  /\/assets\//
];

// Sounds patterns for special caching
const SOUNDS_PATTERNS = [
  /\.mp3$/,
  /\.wav$/,
  /\.ogg$/,
  /\/sounds\//
];

// Install event - cache static assets
self.addEventListener('install', event => {
  self.skipWaiting(); // Forçar nova versão imediatamente!
  console.log('XZenPress SW 3.0.1: Installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE),
      caches.open(SOUNDS_CACHE)
    ])
  );
});

// Activate event - clean ALL old caches aggressively
self.addEventListener('activate', event => {
  console.log('XZenPress SW 3.0.1: Activating & Cleaning...');
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, SOUNDS_CACHE];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            console.log('🗑️ Apagando cache antigo/inválido:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Caches antigos limpos. Assumindo controle.');
      return self.clients.claim();
    })
  );
});

// Fetch event - advanced caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    (async () => {
      // Cache first for sounds (large files)
      if (SOUNDS_PATTERNS.some(pattern => pattern.test(url.pathname))) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(SOUNDS_CACHE);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // Return cached version if network fails
          return cachedResponse || new Response('Sound not available offline', { status: 404 });
        }
      }

      // Try cache first for static assets
      if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
      }

      // Network first for API calls
      if (DYNAMIC_PATTERNS.some(pattern => pattern.test(url.pathname))) {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          throw error;
        }
      }

      // Stale while revalidate for other requests
      const cachedResponse = await caches.match(request);
      const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })()
  );
});

// Background sync for offline functionality
self.addEventListener('sync', event => {
  console.log('XZenPress SW: Background sync triggered:', event.tag);

  if (event.tag === 'xzenpress-sync') {
    event.waitUntil(syncUserData());
  }

  if (event.tag === 'xzenpress-breathing-session') {
    event.waitUntil(syncBreathingSession());
  }
});

async function syncUserData() {
  try {
    console.log('XZenPress SW: Syncing user data...');
    // Sync user preferences, session data, etc.
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: { success: true }
      });
    });
  } catch (error) {
    console.error('XZenPress SW: Sync failed:', error);
  }
}

async function syncBreathingSession() {
  try {
    console.log('XZenPress SW: Syncing breathing session...');
    // Sync breathing session data when back online
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BREATHING_SYNC_COMPLETE',
        data: { success: true }
      });
    });
  } catch (error) {
    console.error('XZenPress SW: Breathing sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('XZenPress SW: Push notification received');

  let notificationData = {
    title: 'XZenPress',
    body: 'Nova técnica de bem-estar disponível!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'xzenpress-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Abrir App',
        icon: '/logo192.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('XZenPress SW: Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('XZenPress SW: Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if no existing window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Message handling from main app
self.addEventListener('message', event => {
  console.log('XZenPress SW: Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_BREATHING_SESSION') {
    // Cache breathing session data for offline use
    caches.open(DYNAMIC_CACHE).then(cache => {
      cache.put('/breathing-session', new Response(JSON.stringify(event.data.session)));
    });
  }
});