// Stay Rich — funciona sem internet depois da primeira visita.
// Cada publicação gera um sw.js diferente (versão abaixo). O app pergunta ao abrir e ao voltar
// para a tela se há sw.js novo; o novo baixa tudo em segundo plano, espera, e só assume quando
// a pessoa toca em "Atualizar" (mensagem 'atualizar'). Assim nunca mistura versão velha e nova.
const VERSAO='stayrich2-ab70518086',ROTULO='2026.11.25 · ab70518';
const ARQ=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png','pdfjs-lib.js','pdfjs-wk.js'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(VERSAO);
  // baixa direto do servidor (sem cache do navegador/CDN), para não guardar a versão antiga por engano
  await Promise.all(ARQ.map(async u=>{const r=await fetch(new Request(u+(u.includes('?')?'&':'?')+'v=ab70518086',{cache:'reload'}));
    if(!r.ok)throw new Error(u+' '+r.status);await c.put(u,r);}));
  // primeira instalação (ou vindo do sw.js antigo, que não sabe mostrar o aviso): assume já.
  // Atualização normal: espera a pessoa tocar em "Atualizar".
  if(!self.registration.active||!(await caches.keys()).some(k=>k.startsWith('stayrich2-')&&k!==VERSAO))await self.skipWaiting();})());});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('stayrich')&&k!==VERSAO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',e=>{const d=e.data||{};
  if(d.tipo==='atualizar')self.skipWaiting();
  else if(d.tipo==='versao'&&e.ports[0])e.ports[0].postMessage({v:VERSAO,rotulo:ROTULO});});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  const nav=r.mode==='navigate',nome=new URL(r.url).pathname.split('/').pop();
  if(nome==='sw.js')return;
  e.respondWith((async()=>{
    const cache=await caches.open(VERSAO);
    // arquivos do app: sempre os desta versão (abre na hora, com ou sem internet)
    const g=nav?(await cache.match('index.html')):(await cache.match(r,{ignoreSearch:true}));
    if(g)return g;
    try{const resp=await fetch(r);if(resp&&resp.ok&&!nav)cache.put(r,resp.clone());return resp;}
    catch(_){return (nav&&await cache.match('./'))||Response.error();}
  })());
});
