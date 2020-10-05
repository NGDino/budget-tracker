const CACHE_NAME = 'budget-cache';
const DATA_CACHE_NAME = 'data-budget-cache';

const FILES_TO_CACHE = [
    "./manifest.json",
    "./index.html",
    "./css/styles.css",
    "./js/index.js",
    "/",
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    "/icons/icon-192x192.png",
    "/icons/icon-384x384.png",
    "/icons/icon-512x512.png",
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('your files were pre-cached successfully!');
            return cache.addAll(FILES_TO_CACHE);
        })
    )
    self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            caches
            .open(DATA_CACHE_NAME)
            .then(cache => {
                return fetch(event.request)
                    .then(response => {
                        //if response was good save and clone
                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        return cache.match(event.request);
                    });
            })
            .catch(err => console.log(err))
        );
        return;
    }

    event.respondWith(
        fetch(event.request).catch(function () {
            return caches.match(event.request).then(function (response) {
                if (response) {
                    return response;
                } else if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/');
                }
            });
        })
    );
});