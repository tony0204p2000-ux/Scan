/* 手機工具:離線快取(掃描、儲位查詢、收料核對、WAFER 比對與共用掃描模組 scanner.js)。有網路時優先拿最新版並更新快取;沒網路或太慢就用快取。 */
var CACHE='scan-wm-20261019a';
var FILES=['./','./index.html','./Location.html','./Receiving.html','./WaferMatch.html','./ScanTest.html','./scanner.js','./bd/barcode-detector.js','./bd/zxing_reader.wasm','./manifest.webmanifest','./icon.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k.indexOf('scan-')===0 && k!==CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET' || new URL(req.url).origin!==self.location.origin) return;
  e.respondWith(new Promise(function(resolve){
    var done=false;
    var fromCache=function(){ return caches.match(req,{ignoreSearch:true}).then(function(r){ return r || (req.mode==='navigate'?caches.match('./index.html'):undefined); }); };
    /* 網路不穩:等超過 3 秒就先用快取,不讓畫面卡住 */
    var timer=setTimeout(function(){ if(!done){ fromCache().then(function(r){ if(r && !done){ done=true; resolve(r); } }); } },3000);
    fetch(req).then(function(res){
      if(res && res.ok){ var copy=res.clone(); caches.open(CACHE).then(function(c){ c.put(req,copy); }); }
      clearTimeout(timer); if(!done){ done=true; resolve(res); }
    }).catch(function(){
      clearTimeout(timer); if(!done) fromCache().then(function(r){ done=true; resolve(r || new Response('目前沒有網路,而且這支手機還沒有離線資料。請在有網路時先開啟一次。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})); });
    });
  }));
});
