#!/usr/bin/env node
// barindirma-tespit.mjs testi. Ağ isteği ve model çağrısı yapmaz.
//   node barindirma-tespit-test.mjs   → her durum için TAMAM/HATA; başarısızlık varsa çıkış kodu 1.
// tani() 21.11.2026 tarihli canlı `curl -sI` yakalamalarıyla denenir. Fikstürlerden standart başlıklar (date,
// content-type, cache-control, vary, strict-transport-security…) ve uzun satırlar (content-security-policy, link,
// report-to, set-cookie…) çıkarıldı; sağlayıcıya özgü olabilecek her başlık kaldı. "sentetik" yazan durum canlı örneği
// olmayan bir mekanizmayı dener. basliklariAl() sahte fetch ile denenir (HEAD → GET geri düşüşü). Son bölüm
// kvkk-yansima.mjs'i önerilen bayraklarla (--barindirma, --onunde) alt süreçte çalıştırır; girdi geçici klasöre
// yazılan küçük bir ölçüm dosyasıdır, klasör sonda silinir.
// Yeni bir sağlayıcı, kaçak ya da yanlış alarm bulunduğunda buraya bir durum eklenir.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tani, metin, basliklariAl, BARINDIRMA } from './barindirma-tespit.mjs';

let basarisiz = 0, sayi = 0;
function durum(ad, gercek, beklenen) {
  sayi++;
  const g = JSON.stringify(gercek), b = JSON.stringify(beklenen);
  const tamam = g === b;
  console.log(`${tamam ? 'TAMAM' : 'HATA '} ${ad}${tamam ? '' : `\n      gerçek:   ${g}\n      beklenen: ${b}`}`);
  if (!tamam) basarisiz++;
}

// Yakalanan başlık satırlarını Headers'a çevirir; aynı başlık iki kez gelirse fetch gibi ", " ile birleşir.
const H = (satirlar) => {
  const h = new Headers();
  for (const s of satirlar.trim().split('\n')) { const m = s.match(/^([^:\s]+):\s?(.*)$/); if (m) h.append(m[1], m[2]); }
  return h;
};
// tani() sonucunun karşılaştırılan özeti; origin "ad (öncelik)" biçiminde
const ozet = (r) => ({
  origin: r.origin ? `${r.origin.saglayici} (${r.origin.oncelik})` : null, oneri: r.oneri, konum: r.origin?.konum ?? null,
  diger: r.digerOriginler.map((d) => `${d.saglayici} (${d.oncelik})`), edge: r.edge.map((e) => e.saglayici),
  yazilim: r.yazilim.map((y) => y.saglayici), bolge: r.bolgeIpucu?.bolge ?? null,
});
const B = ({ origin = null, oneri = null, diger = [], edge = [], yazilim = [], bolge = null }) => ({
  origin, oneri, konum: origin ? 'yurt dışı' : null, diger, edge, yazilim, bolge,
});

const F = {
  // https://vercel.com — HTTP/2 200
  vercel: `server: Vercel
x-nextjs-prerender: 1
x-nextjs-stale-time: 300
x-pathname: /
x-powered-by: Next.js, Payload
x-vercel-cache: HIT
x-vercel-id: fra1::tp7nj-1795263737734-263aaadb861b`,
  // https://vercel.com/docs — HTTP/2 200
  vercelDocs: `server: Vercel
x-vercel-cache: MISS
x-vercel-id: fra1::iad1::lbxl4-1795263777534-98648e92dd49`,
  // https://www.netlify.com — HTTP/2 200
  netlify: `cache-status: "Netlify Edge"; hit; ttl=31480602
server: Netlify
server-timing: cr;desc="hit-fresh", ds;dur=2, dc;desc="aws-fra", cg;desc="global-production", cl;dur=197291, dist;dur=2197, tls;desc="new";dur=59
x-nf-request-id: 01M7Z0XC3GCS0AH6BJVVJ0SZD8`,
  // https://render.com — HTTP/2 200
  render: `rndr-id: 007bdc68-f972-4b14
server: cloudflare
x-nextjs-cache: HIT
x-nextjs-prerender: 1
x-nextjs-stale-time: 300
x-render-origin-server: Render
cf-cache-status: DYNAMIC
cf-ray: a5dfa8cbfdc2f64d-AMS`,
  // https://www.plesk.com — HTTP/2 200
  plesk: `x-powered-by: PHP/8.3.37
x-powered-by: PleskLin
x-turbo-charged-by: LiteSpeed
x-nitro-cache: HIT
x-nitro-cache-from: drop-in
x-nitro-rev: 262c6d8
x-cache-ctime: 1795196278
x-litespeed-cache: hit
server: cloudflare
cf-cache-status: DYNAMIC
cf-ray: a5dfac85df013d74-IST`,
  // https://pages.github.com — HTTP/2 200
  githubPages: `server: GitHub.com
x-origin-cache: HIT
x-proxy-cache: HIT
x-github-request-id: 8EBC:FDE05:28E73A6:291C8F2:6B018CBB
x-github-edge-region: fra
via: 1.1 varnish
x-served-by: cache-ams-eham8680089-AMS
x-cache: HIT
x-cache-hits: 1
x-timer: S1795263739.973881,VS0,VE1
x-fastly-request-id: c20305a73b06e2330bcb5df6248d8a23da4683a6`,
  // https://docs.github.com — HTTP/2 302
  docsGithub: `x-github-backend: Kubernetes
x-github-request-id: C2F6:3A4EC6:4266FAF:4925EC6:6B018B32
x-github-edge-region: iad
via: 1.1 varnish, 1.1 varnish
x-served-by: cache-iad-kiad7000120-IAD, cache-ams-eham8680066-AMS
x-cache: HIT, HIT
x-cache-hits: 34, 5
x-timer: S1795263778.893219,VS0,VE0`,
  // https://www.fastly.com — HTTP/2 200
  fastly: `x-served-by: cache-sjc1000127-SJC, cache-sjc1000128-SJC, cache-ams-eham8680091-AMS
x-cache: MISS, HIT, HIT
x-cache-hits: 0, 10, 19
x-timer: S1795263742.749462,VS0,VE1
server: Artisanal bits`,
  // https://www.fastly.com/documentation/ — HTTP/2 200
  fastlyDocs: `server-timing: fastly;desc="AMS:HIT:2"
x-served-by: cache-ams-eham8680040-AMS, cache-ams-eham8680040-AMS, cache-ams-eham8680040-AMS
x-cache: MISS, MISS
x-cache-hits: 0, 0
server: Artisanal bits`,
  // https://docs.amplify.aws — HTTP/2 200
  amplify: `server: AmazonS3
x-cache: Hit from cloudfront
via: 1.1 97cdd7ada3ce5dca3680ce3224b1e3aa.cloudfront.net (CloudFront)
x-amz-cf-pop: IST50-P5
x-amz-cf-id: 6mfATmbxg--JcOcjJY2htuWlk92l0CveI_PUVaBjkya9ImSyuXIZMw==`,
  // https://firebase.google.com — HTTP/2 200
  google: `x-cloud-trace-context: 612a188d8cc43b6c0bb0998f5bc917ca
server: Google Frontend`,
  // https://nginx.org — HTTP/1.1 200 OK
  nginx: `Server: nginx/1.31.8`,
  // https://aws.amazon.com — HTTP/2 200
  awsAmazon: `server: Server
x-amz-id-1: 0C6938F51F9145CC97D9
x-cache: Miss from cloudfront
via: 1.1 97f77ed7d8b98a87768577009dcdb53c.cloudfront.net (CloudFront)
x-amz-cf-pop: IST50-P1
x-amz-cf-id: 9h0zv-pIRN0q-PJNXqImrX0y8QJFKitiFwEhZQ9oZfleQP5FnIQNpw==`,
  // https://www.cloudflare.com — HTTP/2 200
  cloudflareCom: `x-served-by: marketing-site
x-rm: GW
server: cloudflare
cf-ray: a5dfa8bc9f8b6610-AMS`,
  // https://bunny.net — HTTP/2 200
  bunny: `server: BunnyCDN-TR1-942
cdn-pullzone: 876725
cdn-requestcountrycode: TR
cdn-storageserver: DE-1136
cdn-fileserver: 1238
cdn-proxyver: 1.72
cdn-requestpullsuccess: True
cdn-requestpullcode: 200
cdn-cachedat: 11/19/2026 16:55:08
cdn-edgestorageid: 942
cdn-requestid: a1755b1ab8cd12c038a54c7a9fb26e85
cdn-cache: HIT
cdn-status: 200
cdn-requesttime: 0`,
  // https://learn.microsoft.com/en-us/azure/ — HTTP/2 200
  learnMicrosoft: `x-buildversion: 0.4.03603.8379-b7d5d6ac
x-azure-ref: 20261117T194715Z-176d7f68bd4cbvmrhC1FRA46qn0000002bhg000000006pck
akamai-cache-status: RefreshHit from child, Hit from parent`,
  // https://devcenter.heroku.com — HTTP/2 200
  devcenterHeroku: `via: 1.1 spaces-router (616cf2ff3f21), 1.1 dd43068ba5b2046aa9ecb6ca4a45170e.cloudfront.net (CloudFront)
x-request-id: 514e2ac8-35c9-97f8-30b0-1dd4380eeb15
x-runtime: 0.017145
x-cache: Miss from cloudfront
x-amz-cf-pop: IST50-P5
x-amz-cf-id: kIF4V5Z9AqoSIrLw2hZ2KbRnzZo9Un8W8pwyiWxlKGiWeoNMLtWCwg==`,
  // https://www.litespeedtech.com — HTTP/2 200
  litespeed: `x-powered-by: PHP/7.4.33
x-logged-in: False
x-content-powered-by: K2 v2.7.1 (by JoomlaWorks)
x-lsadc-cache: hit
server: LiteSpeed`,
  // https://wordpress.com — HTTP/2 200
  wordpress: `server: nginx
x-hacker: Want root?  Visit join.a8c.com/hacker and mention this header.
host-header: WordPress.com
x-ac: 12.mxp _dca BYPASS
server-timing: a8c-cdn, dc;desc=mxp, cache;desc=BYPASS;dur=105.0`,
};

// --- tani(): yakalanmış başlıklar ("oneri": kvkk-yansima bayrakları)
durum('Vercel (bölge ipucu: kimlikten önceki son bölge)', ozet(tani(H(F.vercel))), B({ origin: 'Vercel (a)', oneri: '--barindirma Vercel', bolge: 'fra1' }));
durum('Vercel, iki bölgeli x-vercel-id', ozet(tani(H(F.vercelDocs))), B({ origin: 'Vercel (a)', oneri: '--barindirma Vercel', bolge: 'iad1' }));
durum('Netlify', ozet(tani(H(F.netlify))), B({ origin: 'Netlify (a)', oneri: '--barindirma Netlify' }));
durum('Cloudflare + Render: origin Render, edge Cloudflare', ozet(tani(H(F.render))), B({ origin: 'Render (a)', oneri: '--barindirma Render --onunde Cloudflare', edge: ['Cloudflare'] }));
durum('Cloudflare + LiteSpeed + Plesk: origin yok, yalnız --onunde', ozet(tani(H(F.plesk))), B({ oneri: '--onunde Cloudflare', edge: ['Cloudflare'], yazilim: ['LiteSpeed', 'Plesk'] }));
durum('GitHub Pages + Fastly', ozet(tani(H(F.githubPages))), B({ origin: 'GitHub Pages (a)', oneri: '--barindirma "GitHub Pages" --onunde Fastly', edge: ['Fastly'] }));
durum('x-github-request-id tek başına GitHub Pages değil (server: GitHub.com yok)', ozet(tani(H(F.docsGithub))), B({ oneri: '--onunde Fastly', edge: ['Fastly'] }));
durum('Fastly tek başına: yalnız edge', ozet(tani(H(F.fastly))), B({ oneri: '--onunde Fastly', edge: ['Fastly'] }));
durum('Fastly yalnız x-served-by ile (cache-ams-eham…-AMS biçimi)', ozet(tani(H(F.fastlyDocs))), B({ oneri: '--onunde Fastly', edge: ['Fastly'] }));
durum('CloudFront + S3: origin S3 (b), edge CloudFront', ozet(tani(H(F.amplify))), B({ origin: 'Amazon S3 (b)', oneri: '--barindirma "Amazon S3" --onunde "Amazon CloudFront"', edge: ['Amazon CloudFront'] }));
durum('Google Frontend', ozet(tani(H(F.google))), B({ origin: 'Google Cloud (b)', oneri: '--barindirma "Google Cloud"' }));
durum('yalnız nginx: yazılım, öneri yok', ozet(tani(H(F.nginx))), B({ yazilim: ['nginx'] }));
durum('boş başlıklar', ozet(tani(new Headers())), B({}));
durum('başlık verilmedi', ozet(tani()), B({}));
durum('CloudFront x-cache Fastly sayılmaz', ozet(tani(H(F.awsAmazon))), B({ oneri: '--onunde "Amazon CloudFront"', edge: ['Amazon CloudFront'] }));
durum('x-served-by: marketing-site Fastly sayılmaz', ozet(tani(H(F.cloudflareCom))), B({ oneri: '--onunde Cloudflare', edge: ['Cloudflare'] }));
durum('Bunny CDN: yalnız edge', ozet(tani(H(F.bunny))), B({ oneri: '--onunde "Bunny CDN"', edge: ['Bunny CDN'] }));
durum('Akamai + Azure Front Door: iki edge, origin yok', ozet(tani(H(F.learnMicrosoft))), B({ oneri: '--onunde "Azure Front Door" --onunde Akamai', edge: ['Azure Front Door', 'Akamai'] }));
durum('birleşik via (spaces-router, CloudFront) Heroku sayılmaz', ozet(tani(H(F.devcenterHeroku))), B({ oneri: '--onunde "Amazon CloudFront"', edge: ['Amazon CloudFront'] }));
durum('LiteSpeed sunucusu: yazılım, öneri yok', ozet(tani(H(F.litespeed))), B({ yazilim: ['LiteSpeed'] }));
durum('WordPress.com + nginx', ozet(tani(H(F.wordpress))), B({ origin: 'WordPress.com (a)', oneri: '--barindirma WordPress.com', yazilim: ['nginx'] }));
durum('sentetik: çoklu set-cookie içinde ARRAffinity', ozet(tani(H('set-cookie: oturum=1; Path=/; Expires=Sat, 21 Nov 2026 12:22:42 GMT\nset-cookie: ARRAffinity=0123abcd; Path=/; HttpOnly; Secure'))),
  B({ origin: 'Azure App Service (b)', oneri: '--barindirma "Azure App Service"' }));
durum('sentetik: (a) ve (b) birlikte → (a) önerilir, (b) başka aday', ozet(tani(H('server: Google Frontend\nx-nf-request-id: 01M7Z0XC3GCS0AH6BJVVJ0SZD8'))),
  B({ origin: 'Netlify (a)', oneri: '--barindirma Netlify', diger: ['Google Cloud (b)'] }));
durum('kanıt: eşleşen başlık adı ve değeri', tani(H(F.render)).origin.kanit, [{ ad: 'rndr-id', deger: '007bdc68-f972-4b14' }, { ad: 'x-render-origin-server', deger: 'Render' }]);

// --- metin(): çıktı satırları; bulgulardan sonra son satır "Önerilen" (kvkk-yansima bayrakları)
const satirlar = (f) => metin(tani(H(f)));
durum('metin: origin + edge → Önerilen: --barindirma Render --onunde Cloudflare', satirlar(F.render), [
  'Barındırma sağlayıcısı: Render',
  '  konum: yurt dışı · güven: orta · başlık: rndr-id, x-render-origin-server',
  'Önünde: Cloudflare (asıl barındırıcıyı gizleyebilir)',
  '  konum: yurt dışı · başlık: cf-ray, server, cf-cache-status',
  'Önerilen: --barindirma Render --onunde Cloudflare',
]);
durum('metin: origin yoksa site sahibine sorulur, öneri yalnız --onunde', satirlar(F.plesk), [
  'Barındırma sağlayıcısı başlıktan tanınmadı → site sahibine sorun',
  'Önünde: Cloudflare (asıl barındırıcıyı gizleyebilir)',
  '  konum: yurt dışı · başlık: cf-ray, server, cf-cache-status',
  'Sunucu yazılımı: LiteSpeed (sağlayıcı ve ülke göstermez)',
  '  başlık: x-litespeed-cache, x-turbo-charged-by',
  'Sunucu yazılımı: Plesk (sağlayıcı ve ülke göstermez)',
  '  başlık: x-powered-by',
  'Önerilen: --onunde Cloudflare',
]);
durum('metin: yalnız yazılım → Önerilen satırı yok', satirlar(F.nginx), ['Barındırma sağlayıcısı başlıktan tanınmadı → site sahibine sorun', 'Sunucu yazılımı: nginx (sağlayıcı ve ülke göstermez)', '  başlık: server']);
durum('metin: boşluklu adlar tırnaklı (GitHub Pages + Fastly)', satirlar(F.githubPages).at(-1), 'Önerilen: --barindirma "GitHub Pages" --onunde Fastly');
durum('metin: iki edge → iki --onunde', satirlar(F.learnMicrosoft).at(-1), 'Önerilen: --onunde "Azure Front Door" --onunde Akamai');
durum('metin: yalnız origin → yalnız --barindirma', satirlar(F.vercel).at(-1), 'Önerilen: --barindirma Vercel');
durum('metin: Vercel bölge ipucu etiketi', satirlar(F.vercel).includes('  bölge ipucu (başlıktan; sözleşme ya da veri konumu beyanı değil): fra1'), true);
durum('metin: edge kodundan ülke çıkmaz (cf-ray …-IST, BunnyCDN-TR1, cdn-requestcountrycode: TR)', [F.plesk, F.bunny, F.amplify].map((f) => satirlar(f).join('\n')).some((m) => /Türkiye|yurt içi|\bTR\b|\bIST|\bAMS\b/.test(m)), false);
durum('metin: bölge ipucu yalnız Vercel', [F.render, F.githubPages, F.amplify, F.netlify].some((f) => satirlar(f).some((x) => x.includes('bölge ipucu'))), false);

// --- tedarikciler.json → barindirma kayıtları
const TUR_ONCELIK = { origin: ['a', 'b'], edge: ['c'], yazilim: ['d'] };
const kayitHatalari = BARINDIRMA.flatMap((k) => {
  const h = [];
  if (!k.saglayici) h.push('saglayici yok');
  if (!(TUR_ONCELIK[k.tur] || []).includes(k.oncelik)) h.push(`tur/oncelik: ${k.tur}/${k.oncelik}`);
  if (!['hepsi', 'biri'].includes(k.eslesme)) h.push(`eslesme: ${k.eslesme}`);
  if (k.konum !== (k.tur === 'yazilim' ? 'bilinmiyor' : 'yurt dışı')) h.push(`konum: ${k.konum}`);
  if (!['yüksek', 'orta'].includes(k.guven)) h.push(`guven: ${k.guven}`);
  if (!/^https:\/\/\S+$/.test(k.kaynak) && k.kaynak !== 'canlı başlık, 2026-11-21') h.push(`kaynak: ${k.kaynak}`);
  if (!Array.isArray(k.basliklar) || !k.basliklar.length) h.push('basliklar boş');
  for (const b of k.basliklar || []) {
    if (b.ad !== String(b.ad).toLowerCase()) h.push(`başlık adı küçük harf değil: ${b.ad}`);
    try { new RegExp(b.desen, 'i'); } catch { h.push(`desen derlenmiyor: ${b.desen}`); }
  }
  return h.map((x) => `${k.saglayici}: ${x}`);
});
durum('kayıtlar: alanlar ve değerler geçerli', kayitHatalari, []);
durum('kayıtlar: hariç tutulanlar yok (Firebase, DigitalOcean, Amplify, Ghost, Cloudflare Pages, Azure Static Web Apps, GitLab Pages, cPanel, x-shopid)',
  BARINDIRMA.filter((k) => /firebase|digitalocean|amplify|ghost|cloudflare pages|static web apps|gitlab|cpanel/i.test(k.saglayici) || k.basliklar.some((b) => b.ad === 'x-shopid')).map((k) => k.saglayici), []);
durum('kayıtlar: GitHub Pages iki başlığı birlikte ister', (() => { const k = BARINDIRMA.find((x) => x.saglayici === 'GitHub Pages'); return [k.eslesme, k.basliklar.map((b) => b.ad).sort()]; })(), ['hepsi', ['server', 'x-github-request-id']]);
durum('kayıtlar: Fastly yalnız edge', BARINDIRMA.filter((x) => x.saglayici === 'Fastly').map((x) => x.tur), ['edge']);
durum('kayıtlar: sağlayıcı adları tekil', BARINDIRMA.length === new Set(BARINDIRMA.map((k) => k.saglayici)).size, true);

// --- basliklariAl(): HEAD → GET geri düşüşü (sahte fetch, ağ yok)
function sahteFetch(plan) {
  const cagrilar = [];
  const fn = async (url, init) => {
    const c = { url, method: init.method, redirect: init.redirect, signal: init.signal instanceof AbortSignal, iptal: false };
    cagrilar.push(c);
    const p = plan[init.method];
    if (p instanceof Error) throw p;
    return { status: p.durum, url: p.url || url, headers: new Headers(p.basliklar || {}), body: init.method === 'GET' ? { cancel: async () => { c.iptal = true; } } : null };
  };
  return { fn, cagrilar };
}
const agHatasi = () => Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNRESET' } });
const ADRES = 'https://ornek.test/';
async function alDurumu(ad, plan, beklenen) {
  const s = sahteFetch(plan);
  let r;
  try { const y = await basliklariAl(ADRES, { fetchFn: s.fn }); r = { yontem: y.yontem, durum: y.durum, not: y.not, sonAdres: y.sonAdres }; } catch (e) { r = { hata: e.message }; }
  durum(ad, { ...r, cagri: s.cagrilar.map((c) => c.method + (c.iptal ? '(gövde kapatıldı)' : '')) }, beklenen);
  return s;
}
await alDurumu('HEAD 200: GET yok', { HEAD: { durum: 200 } }, { yontem: 'HEAD', durum: 200, not: null, sonAdres: ADRES, cagri: ['HEAD'] });
await alDurumu('HEAD 404: GET yok', { HEAD: { durum: 404 } }, { yontem: 'HEAD', durum: 404, not: null, sonAdres: ADRES, cagri: ['HEAD'] });
await alDurumu('HEAD 405 → GET', { HEAD: { durum: 405 }, GET: { durum: 200 } }, { yontem: 'GET', durum: 200, not: 'HEAD 405 döndü', sonAdres: ADRES, cagri: ['HEAD', 'GET(gövde kapatıldı)'] });
await alDurumu('HEAD 403 → GET', { HEAD: { durum: 403 }, GET: { durum: 200 } }, { yontem: 'GET', durum: 200, not: 'HEAD 403 döndü', sonAdres: ADRES, cagri: ['HEAD', 'GET(gövde kapatıldı)'] });
await alDurumu('HEAD 503 → GET', { HEAD: { durum: 503 }, GET: { durum: 200 } }, { yontem: 'GET', durum: 200, not: 'HEAD 503 döndü', sonAdres: ADRES, cagri: ['HEAD', 'GET(gövde kapatıldı)'] });
await alDurumu('HEAD ağ hatası → GET', { HEAD: agHatasi(), GET: { durum: 200 } }, { yontem: 'GET', durum: 200, not: 'HEAD başarısız: ECONNRESET', sonAdres: ADRES, cagri: ['HEAD', 'GET(gövde kapatıldı)'] });
await alDurumu('HEAD 403, GET hata → HEAD başlıkları', { HEAD: { durum: 403 }, GET: agHatasi() }, { yontem: 'HEAD', durum: 403, not: 'GET başarısız: ECONNRESET; HEAD 403 yanıtının başlıkları kullanıldı', sonAdres: ADRES, cagri: ['HEAD', 'GET'] });
await alDurumu('HEAD ve GET hata → hata', { HEAD: agHatasi(), GET: Object.assign(new Error('zaman'), { name: 'TimeoutError' }) }, { hata: 'HEAD: ECONNRESET; GET: zaman aşımı (10 sn)', cagri: ['HEAD', 'GET'] });
await alDurumu('yönlendirme: son adres yanıttan', { HEAD: { durum: 200, url: 'https://www.ornek.test/' } }, { yontem: 'HEAD', durum: 200, not: null, sonAdres: 'https://www.ornek.test/', cagri: ['HEAD'] });
{
  const s = sahteFetch({ HEAD: { durum: 405 }, GET: { durum: 200 } });
  await basliklariAl(ADRES, { fetchFn: s.fn });
  durum('istekler yalnız verilen adrese, yönlendirme izlenir, zaman aşımı sinyali var', s.cagrilar.map((c) => [c.url, c.redirect, c.signal]), [[ADRES, 'follow', true], [ADRES, 'follow', true]]);
}

// --- kvkk-yansima.mjs bağlantısı: önerilen bayraklar (alt süreç, ağ yok)
// İki küçük ölçüm dosyası: biri boş, biri yalnız Cloudflare'ın __cf_bm çereziyle (--onunde Cloudflare aynı kayda düşmeli).
{
  const YANSIMA = fileURLToPath(new URL('./kvkk-yansima.mjs', import.meta.url));
  const olcum = (cerezler) => ({ url: 'https://ornek.test/', zaman: '2026-11-21T12:00:00.000Z', senaryolar: { ilk: { ucuncuTaraf: [], cerezler, yerelDepolama: [], oturumDepolama: [], formlar: [] } } });
  const klasor = mkdtempSync(join(tmpdir(), 'barindirma-tespit-test-'));
  try {
    const bos = join(klasor, 'bos.json'); const cerezli = join(klasor, 'cerezli.json');
    writeFileSync(bos, JSON.stringify(olcum([])));
    writeFileSync(cerezli, JSON.stringify(olcum([{ name: '__cf_bm', domain: 'ornek.test', party: 'birinci', saglayici: 'Cloudflare', sinif: 'zorunlu', riza: false }])));
    const yansima = (dosya, ...bayraklar) => execFileSync(process.execPath, [YANSIMA, dosya, ...bayraklar], { encoding: 'utf8' });
    // §6 yurt dışı listesi: "  - <ad> — <ülke> — <amaç> — azaltma: …"
    const satirlari = (cikti, ad) => cikti.split('\n').filter((x) => x.startsWith(`  - ${ad} — `));
    const ulkeler = (cikti, ad) => satirlari(cikti, ad).map((x) => x.split(' — ')[1]);
    const teknik = (cikti) => (cikti.match(/EKLE "(Kişisel verileriniz[^"]*)"/u) || [])[1] || null;
    const c = yansima(cerezli, '--barindirma', 'GitHub Pages', '--onunde', 'Cloudflare');
    durum('kvkk-yansima: --barindirma "GitHub Pages" ülkesi tablodan (yurt dışı)', ulkeler(c, 'GitHub Pages'), ['yurt dışı']);
    durum('kvkk-yansima: --onunde Cloudflare çerezdeki Cloudflare ile tek kayıt, ülke ULKE listesinden', satirlari(c, 'Cloudflare').map((x) => [x.split(' — ')[1], x.includes('(tanındığı yer: sunucu başlıkları (--onunde))')]), [['ABD (küresel ağ)', true]]);
    durum('kvkk-yansima: GitHub Pages ve Cloudflare için [DOĞRULA: ülke] yok', /(GitHub Pages|Cloudflare) — \[DOĞRULA: ülke\]/u.test(c), false);
    durum('kvkk-yansima: teknik cümle barındırma ve edge amacını taşır', teknik(c), "Kişisel verileriniz, sitenin barındırılması ve sitenin güvenli ve hızlı sunulması amacıyla yurt dışında bulunan bulut hizmeti ve yazılım sağlayıcılarına, KVKK'nın 9. maddesi kapsamında aktarılabilir.");
    durum('kvkk-yansima: bayraksız boş ölçümde teknik cümle yok', teknik(yansima(bos)), null);
    const c2 = yansima(bos, '--onunde', 'fastly', '--onunde', 'Bilinmeyen CDN');
    durum('kvkk-yansima: --onunde tek başına yurt dışı listesine ve teknik cümleye girer', [ulkeler(c2, 'Fastly'), teknik(c2)], [['yurt dışı'], "Kişisel verileriniz, sitenin güvenli ve hızlı sunulması amacıyla yurt dışında bulunan bulut hizmeti ve yazılım sağlayıcılarına, KVKK'nın 9. maddesi kapsamında aktarılabilir."]);
    durum('kvkk-yansima: tabloda olmayan ad [DOĞRULA: ülke] kalır', ulkeler(c2, 'Bilinmeyen CDN'), ['[DOĞRULA: ülke]']);
    durum('kvkk-yansima: ULKE listesindeki ülke kalır (--barindirma vercel → Vercel, ABD)', ulkeler(yansima(bos, '--barindirma', 'vercel'), 'Vercel'), ['ABD']);
  } finally {
    rmSync(klasor, { recursive: true, force: true });
  }
}

console.log(basarisiz ? `\n${basarisiz}/${sayi} durum başarısız` : `\nBütün durumlar geçti (${sayi} durum)`);
process.exit(basarisiz ? 1 : 0);
