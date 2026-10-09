const V="sr5-v2";
const SHELL=["./","index.html","style.css","app.js","logo.png","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// network-first: always fresh when online, cached copy when offline
self.addEventListener("fetch",e=>{const r=e.request,u=new URL(r.url);
 if(r.method!="GET"||u.origin!=location.origin||u.pathname.endsWith(".mp4")||/\/sf-\d+\.webp$/.test(u.pathname)||r.headers.has("range"))return;
 e.respondWith(fetch(new Request(r,{cache:"no-cache"})).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match("index.html"))))});
