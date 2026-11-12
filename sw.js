// Stay Rich — funciona sem internet depois da primeira visita.
const VERSAO='stayrich-edcde48bd8';
const ARQ=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSAO).then(c=>c.addAll(ARQ)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSAO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith((async()=>{
    const cache=await caches.open(VERSAO);
    try{ // com internet: pega a versão mais nova (até 4s) e guarda
      const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),4000);
      const resp=await fetch(r,{signal:ctl.signal,cache:'no-cache'});clearTimeout(t);
      if(resp&&resp.ok)cache.put(r,resp.clone());return resp;
    }catch(_){ // sem internet: usa o que está guardado
      return (await cache.match(r,{ignoreSearch:true}))||(await cache.match('index.html'))||Response.error();
    }})());
});
