// Service worker minimal : permet l'installation sur l'écran d'accueil et garde
// l'interface en cache. Les données passent toujours par le réseau.
const CACHE = 'mes-devoirs-v2'
// Page d'accueil de l'appli (elle peut être servie dans un sous-dossier)
const ACCUEIL = self.registration.scope

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((cles) => Promise.all(cles.filter((c) => c !== CACHE).map((c) => caches.delete(c)))))
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET' || url.origin !== location.origin) return
  // Réseau d'abord, cache en secours (hors connexion).
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copie = r.clone()
        caches.open(CACHE).then((c) => c.put(e.request.mode === 'navigate' ? ACCUEIL : e.request, copie))
        return r
      })
      .catch(() => caches.match(e.request.mode === 'navigate' ? ACCUEIL : e.request)),
  )
})
