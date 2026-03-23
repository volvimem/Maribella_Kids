const CACHE_NAME = "maribella-kids-v9";
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./logo.png" // Obrigatório estar no cache para o Chrome aprovar a instalação!
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) return caches.delete(cache);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// REDE DE SEGURANÇA OFFLINE (Isso força o Chrome a aceitar como App!)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request).catch(() => {
            return caches.match(e.request).then((response) => {
                // Se não achar o arquivo específico, joga a página inicial
                return response || caches.match("./index.html");
            });
        })
    );
});
