const CACHE_NAME = 'chosung-v1';
const ASSETS = [
  '/chosung/',
  '/chosung/index.html',
  '/chosung/manifest.json',
  '/chosung/favicon.png',
  '/chosung/sns_th.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap',
  'https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgm203Tq4JJWq209pU0DPdWuqxJFA4GNDCBYtw.0.woff2',
  'https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgm203Tq4JJWq209pU0DPdWuqxJFA4GNDCBYtw.1.woff2',
];

// 설치: 핵심 파일 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // 외부 폰트는 실패해도 설치 계속
      return cache.addAll([
        '/chosung/',
        '/chosung/index.html',
        '/chosung/manifest.json',
        '/chosung/favicon.png',
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
  // POST 요청은 캐시 안 함
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(response => {
        // 유효한 응답만 캐시
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => {
        // 오프라인 + 캐시 없을 때 index.html 반환
        return caches.match('/chosung/index.html');
      });
    })
  );
});
