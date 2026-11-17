/* Service worker: l'app funziona offline. Le ricette (richieste cross-origin) non passano da qui: l'app tiene la sua copia. */
const CACHE = "ricettario-v4";
const SHELL = ["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png","config.js"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const req = e.request; if(req.method!=="GET") return;
  const url = new URL(req.url);
  if(url.origin!==location.origin){
    if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
      e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(hit=>{ const net=fetch(req).then(r=>{ c.put(req,r.clone()); return r; }).catch(()=>hit); return hit||net; })));
    }
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(r=>{ const copy=r.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); return r; }).catch(()=>caches.match("index.html"))));
});
