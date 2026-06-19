const CACHE_NAME = 'chosung-v2';

// 설치: 핵심 파일 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/chosung/',
        '/chosung/index.html',
        '/chosung/manifest.json',
      ]).then(() => {
        // 폰트는 별도로 시도 (실패해도 무시)
        return cache.addAll([
          'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap',
        ]).catch(() => {});
      });
    })
  );
  self.skipWaiting();
});

// 활성화: 오래된 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 요청 처리: 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => {
        return caches.match('/chosung/index.html');
      });
    })
  );
});
