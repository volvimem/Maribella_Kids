const CACHE_NAME = "maribella-kids-v5-final";

// Força o novo arquivo a assumir o controle IMEDIATAMENTE
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

// A Faxineira: Apaga TODAS as versões antigas presas no celular
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
        }).then(() => self.clients.claim())
    );
});

// Estratégia NETWORK FIRST: Sempre tenta pegar a versão mais nova da internet primeiro. 
// Só usa o cache se o cliente estiver sem internet (Offline).
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
