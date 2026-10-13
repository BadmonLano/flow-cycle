/* Flow Cycle Index service worker. NETWORK-FIRST for everything.
   Only the app shell + icons are ever stored (as an offline fallback).
   data/*.json and all cross-origin requests are never intercepted or cached. */
var CACHE = 'fci-shell-v1';
var SHELL = ['/', '/about/', '/site.webmanifest', '/assets/i18n.js', '/assets/extras.js', '/assets/analytics-config.js',
  '/assets/favicon.ico', '/assets/favicon-32.png', '/assets/apple-touch-icon.png', '/assets/icon-192.png', '/assets/icon-512.png', '/assets/logo.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).catch(function () {}).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // pass through
  if (url.pathname.indexOf('/data/') === 0 || /\.json$/i.test(url.pathname)) return; // never touch data
  var path = url.pathname === '/index.html' ? '/' : url.pathname;
  var inShell = SHELL.indexOf(path) !== -1 && !url.search;
  e.respondWith(fetch(req).then(function (res) {
    if (inShell && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(path, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(path).then(function (r) { return r || (req.mode === 'navigate' ? caches.match('/') : undefined) || Response.error(); });
  }));
});
