const CACHE_NAME = 'brew-journal-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png'
]

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response
        }

        // Clone the request
        const fetchRequest = event.request.clone()

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          }
        ).catch(() => {
          // Return offline page or cached version
          return caches.match('/')
        })
      })
  )
})

// Activate service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData())
  }
})

async function syncOfflineData() {
  try {
    // This would sync offline data when connection is restored
    console.log('Background sync triggered')
    
    // Send any pending data to Supabase
    const pendingData = await getPendingData()
    if (pendingData.length > 0) {
      await syncToSupabase(pendingData)
      await clearPendingData()
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

async function getPendingData() {
  // Get data that needs to be synced
  return []
}

async function syncToSupabase(data) {
  // Sync data to Supabase
  return Promise.resolve()
}

async function clearPendingData() {
  // Clear pending data after successful sync
  return Promise.resolve()
}
