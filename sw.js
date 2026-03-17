// Mudamos para v2! Isso avisa o celular que tem atualização.
const CACHE_NAME = "maribella-kids-v2";

self.addEventListener('install', (e) => {
    // Força o novo arquivo a assumir o controle imediatamente
    self.skipWaiting(); 
    
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                './',
                './index.html',
                './style.css',
                './app.js'
                // Removemos o produtos.js daqui porque agora puxa do Firebase!
            ]);
        })
    );
});

// Essa parte nova é a "faxineira": ela apaga a versão antiga (v1) do celular da cliente
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            // Tenta pegar do cache, se não tiver, busca da internet
            return response || fetch(e.request);
        })
    );
});
