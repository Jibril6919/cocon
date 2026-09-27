/* cocon-sw.js — Cocon : service worker des notifications de fin de session.
   À mettre dans LE MÊME DOSSIER que le fichier HTML de Cocon (même site, en https).
   Il n'intercepte AUCUNE requête : les radios et vidéos passent directement. */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

/* Clic sur la notif : on revient sur l'onglet Cocon déjà ouvert, sinon on l'ouvre. */
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      return self.clients.openWindow ? self.clients.openWindow(url) : null;
    })
  );
});

/* Prêt pour plus tard : notifications "push" envoyées par un serveur
   (utile pour sonner même quand le téléphone est verrouillé depuis longtemps). */
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(
    self.registration.showNotification(d.title || '🍅 Session terminée', {
      body: d.body || 'Place à la pause 🌿',
      tag: 'cocon-pomo', renotify: true, requireInteraction: true,
      vibrate: [300, 120, 300, 120, 500],
      data: { url: d.url || self.registration.scope }
    })
  );
});
