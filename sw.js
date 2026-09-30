// 裝幀室的離線殼（只給 GitHub Pages 那份用；artifact 那份跑在 claude.ai，裝不了）。
// 第一次開過之後，沒網路也開得起來：頁面、圖示、指南先存起來，Google 字型看過哪個就留哪個。
// 改版時把 VERSION 換掉，舊快取會被清掉。
const VERSION = 'rp-book-v1';
const SHELL = ['./', './index.html', './guide.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (u.origin !== location.origin && !isFont) return;
  // 頁面：先拿網路（有更新就拿新的），拿不到才用存的；字型與圖示：有存就用存的
  if (isFont || /\.(png|json)$/.test(u.pathname)) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) caches.open(VERSION).then(c => c.put(e.request, r.clone())); return r; })));
  } else {
    e.respondWith(fetch(e.request).then(r => { if (r.ok) caches.open(VERSION).then(c => c.put(e.request, r.clone())); return r; }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html'))));
  }
});
