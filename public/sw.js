// iori-nav Service Worker
// 目标：重复打开页面时本地直接出内容（类浏览器新标签页秒开）
// 策略：
//  - 首页 HTML：stale-while-revalidate（缓存直出 + 后台静默更新）；从后台返回时强制走网络拿最新
//  - 跨域图标：首次加载后本地缓存，之后零延迟
//  - /admin、/api：永不缓存
const PAGE_CACHE = 'iori-page-v1';
const ICON_CACHE = 'iori-icons-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== PAGE_CACHE && k !== ICON_CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

function isHomeNavigation(request) {
  return request.mode === 'navigate' && new URL(request.url).pathname === '/';
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 后台与接口永不缓存
  if (url.origin === self.location.origin && (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api'))) return;

  // 首页导航：缓存直出 + 后台静默更新
  if (isHomeNavigation(request)) {
    const fromAdmin = (request.referrer || '').includes('/admin');
    const cacheKey = request.url.split('#')[0];
    event.respondWith((async () => {
      const cache = await caches.open(PAGE_CACHE);
      const cached = await cache.match(cacheKey);
      if (fromAdmin || !cached) {
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.ok) await cache.put(cacheKey, fresh.clone());
          return fresh;
        } catch (e) {
          if (cached) return cached;
          throw e;
        }
      }
      event.waitUntil((async () => {
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.ok) await cache.put(cacheKey, fresh.clone());
        } catch (e) { /* 离线或网络异常时保留旧缓存 */ }
      })());
      return cached;
    })());
    return;
  }

  // 跨域图标：首次加载后本地缓存
  if (url.origin !== self.location.origin && request.destination === 'image') {
    event.respondWith((async () => {
      const cache = await caches.open(ICON_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const res = await fetch(request);
        if (res && (res.ok || res.type === 'opaque')) await cache.put(request, res.clone());
        return res;
      } catch (e) {
        const fallback = await cache.match(request, { ignoreSearch: true });
        if (fallback) return fallback;
        throw e;
      }
    })());
  }
});
