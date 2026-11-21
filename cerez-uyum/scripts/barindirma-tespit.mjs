#!/usr/bin/env node
// Barındırma ve edge sağlayıcısı tespiti — sitenin HTTP yanıt başlıklarından.
// Bağımlılık yok: Node >= 22 (yerleşik fetch).
//
// Kullanım: node barindirma-tespit.mjs <url> [--json]
//   --json   yalnız yapılandırılmış sonucu (JSON) yaz
//
// Yalnız verilen adrese (ve onun yönlendirdiği adrese) istek atar; başka bir hizmete (IP konumu, DNS sorgu hizmeti
// vb.) gitmez. Önce HEAD; HEAD başarısız olursa ya da 403/405/5xx dönerse GET (gövde okunmadan kapatılır).
// Yönlendirmeler izlenir; her istekte zaman aşımı 10 sn.
//
// Desenler references/tedarikciler.json → "barindirma" bölümündedir. Öncelik: (a) platforma özgü başlık >
// (b) origin depolama ya da platform başlığı; ilk origin barındırma sağlayıcısıdır. (c) edge/CDN yalnız "Önünde" diye
// raporlanır: asıl barındırıcıyı gizleyebilir. (d) sunucu yazılımı sağlayıcı ve ülke göstermez.
// "Önerilen" satırı kvkk-yansima.mjs bayraklarını hazır verir: origin için --barindirma <ad>, her edge için
// --onunde <ad> (ör. "--barindirma Render --onunde Cloudflare"). Origin tanınmazsa --barindirma önerilmez (yalnız
// --onunde kalabilir); barındırma site sahibine sorulur.
// Ülke ya da veri konumu edge kodlarından ÇIKARILMAZ: cf-ray son eki (…-IST), x-amz-cf-pop (IST50-…), BunnyCDN-TR1,
// cdn-requestcountrycode: TR ziyaretçiye en yakın edge noktasını ya da ziyaretçinin ülkesini gösterir, sitenin
// barındırıldığı yeri göstermez. Bölge ipucu yalnız Vercel'de verilir (x-vercel-id'de kimlikten önceki son bölge);
// sözleşme ya da veri konumu beyanı değildir.
// Çıktı öneridir: önerilen bayraklar kvkk-yansima.mjs'e verilir, sağlayıcılar site sahibiyle teyit edilir.
// tani(basliklar) ağ kullanmayan saf işlevdir; barindirma-tespit-test.mjs onu yakalanmış başlıklarla dener.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const db = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'references', 'tedarikciler.json'), 'utf8'));
export const BARINDIRMA = db.barindirma || [];
export const ZAMAN_ASIMI_MS = 10_000;
export const BOLGE_NOTU = 'bölge ipucu (başlıktan; sözleşme ya da veri konumu beyanı değil)';

const ONCELIK = { a: 0, b: 1, c: 2, d: 3 };
const GUVEN = { 'yüksek': 0, 'orta': 1 };

// Aynı başlık birden çok kez gelirse fetch (Headers) değerleri ", " ile birleştirir (ör. "x-powered-by: PHP/8.3.37,
// PleskLin", "via: 1.1 spaces-router (…), 1.1 ….cloudfront.net (CloudFront)"). Desen değerin tamamında ya da virgülle
// ayrılan her parçada aranır; ^…$ ile yazılmış desen birleşik değerde de çalışır.
const parcalar = (deger) => [deger, ...deger.split(/,\s*/)];
function baslikEslesir(h, { ad, desen }) {
  const deger = h.get(ad);
  if (deger === null) return null;
  const re = new RegExp(desen, 'i');
  return parcalar(deger).some((p) => re.test(p)) ? { ad, deger } : null;
}

const tirnakla = (ad) => (/^[\w.-]+$/.test(ad) ? ad : `"${ad}"`);

export function tani(basliklar, kayitlar = BARINDIRMA) {
  const h = basliklar instanceof Headers ? basliklar : new Headers(basliklar || {});
  const bulunan = [];
  kayitlar.forEach((k, sira) => {
    const sonuc = k.basliklar.map((b) => baslikEslesir(h, b));
    const tamam = k.eslesme === 'hepsi' ? sonuc.every(Boolean) : sonuc.some(Boolean);
    if (tamam) bulunan.push({ ...k, kanit: sonuc.filter(Boolean), sira });
  });
  const ozet = ({ saglayici, oncelik, konum, guven, kaynak, kanit }) => ({ saglayici, oncelik, konum, guven, kaynak, kanit });
  const originler = bulunan.filter((x) => x.tur === 'origin')
    .sort((x, y) => ONCELIK[x.oncelik] - ONCELIK[y.oncelik] || GUVEN[x.guven] - GUVEN[y.guven] || x.sira - y.sira);
  const origin = originler[0] || null;
  let bolgeIpucu = null;
  if (origin?.saglayici === 'Vercel') {
    const parca = (h.get('x-vercel-id') || '').split('::');
    const bolge = parca.length > 1 ? parca[parca.length - 2] : null;
    if (bolge && /^[a-z]{3}\d+$/i.test(bolge)) bolgeIpucu = { bolge, baslik: 'x-vercel-id', not: BOLGE_NOTU };
  }
  const edge = bulunan.filter((x) => x.tur === 'edge').map(ozet);
  // kvkk-yansima bayrakları: --barindirma <origin> ve her edge için --onunde <ad>; hiçbiri yoksa öneri yok.
  const bayraklar = [...(origin ? [`--barindirma ${tirnakla(origin.saglayici)}`] : []), ...edge.map((e) => `--onunde ${tirnakla(e.saglayici)}`)];
  return {
    origin: origin && ozet(origin),
    oneri: bayraklar.length ? bayraklar.join(' ') : null,
    digerOriginler: originler.slice(1).map(ozet),
    edge,
    yazilim: bulunan.filter((x) => x.tur === 'yazilim').map(ozet),
    bolgeIpucu,
  };
}

const adlar = (kanit) => [...new Set(kanit.map((k) => k.ad))].join(', ');

// Metin çıktısı; başlık değerleri yazılmaz (edge kodu ülke diye okunmasın), değerler --json çıktısında. Bulgulardan
// sonra son satır "Önerilen": kvkk-yansima.mjs'e verilecek bayraklar.
export function metin(sonuc) {
  const s = [];
  if (sonuc.adres) s.push(`Adres: ${sonuc.adres}${sonuc.sonAdres && sonuc.sonAdres !== sonuc.adres ? ` → son adres: ${sonuc.sonAdres}` : ''}`);
  if (sonuc.istek) s.push(`İstek: ${sonuc.istek.yontem} ${sonuc.istek.durum}${sonuc.istek.not ? ` (${sonuc.istek.not})` : ''}`);
  if (sonuc.origin) {
    s.push(`Barındırma sağlayıcısı: ${sonuc.origin.saglayici}`);
    s.push(`  konum: ${sonuc.origin.konum} · güven: ${sonuc.origin.guven} · başlık: ${adlar(sonuc.origin.kanit)}`);
    if (sonuc.bolgeIpucu) s.push(`  ${sonuc.bolgeIpucu.not}: ${sonuc.bolgeIpucu.bolge}`);
    for (const d of sonuc.digerOriginler) s.push(`  başka aday: ${d.saglayici} (öncelik ${d.oncelik}, güven: ${d.guven}, başlık: ${adlar(d.kanit)}) — önerilmedi`);
  } else {
    s.push('Barındırma sağlayıcısı başlıktan tanınmadı → site sahibine sorun');
  }
  for (const e of sonuc.edge) {
    s.push(`Önünde: ${e.saglayici} (asıl barındırıcıyı gizleyebilir)`);
    s.push(`  konum: ${e.konum} · başlık: ${adlar(e.kanit)}`);
  }
  for (const y of sonuc.yazilim) {
    s.push(`Sunucu yazılımı: ${y.saglayici} (sağlayıcı ve ülke göstermez)`);
    s.push(`  başlık: ${adlar(y.kanit)}`);
  }
  if (sonuc.oneri) s.push(`Önerilen: ${sonuc.oneri}`);
  return s;
}

const GET_GEREKIR = (durum) => durum === 403 || durum === 405 || durum >= 500;
const hataMetni = (e, ms) => (e?.name === 'TimeoutError' || e?.name === 'AbortError'
  ? `zaman aşımı (${ms / 1000} sn)`
  : e?.cause?.code || e?.cause?.message || e?.message || String(e));

// fetchFn testte sahte fetch'tir; betik yerleşik fetch'i kullanır.
export async function basliklariAl(adres, { fetchFn = fetch, zamanAsimiMs = ZAMAN_ASIMI_MS } = {}) {
  const iste = async (method) => {
    const res = await fetchFn(adres, { method, redirect: 'follow', signal: AbortSignal.timeout(zamanAsimiMs) });
    if (method === 'GET') { try { await res.body?.cancel(); } catch { /* gövde zaten kapalı */ } }
    return res;
  };
  const sonuc = (res, yontem, not) => ({ yontem, durum: res.status, sonAdres: res.url || adres, basliklar: res.headers, not });
  let head = null;
  let headHata = null;
  try { head = await iste('HEAD'); } catch (e) { headHata = e; }
  if (head && !GET_GEREKIR(head.status)) return sonuc(head, 'HEAD', null);
  try {
    const get = await iste('GET');
    return sonuc(get, 'GET', head ? `HEAD ${head.status} döndü` : `HEAD başarısız: ${hataMetni(headHata, zamanAsimiMs)}`);
  } catch (e) {
    if (head) return sonuc(head, 'HEAD', `GET başarısız: ${hataMetni(e, zamanAsimiMs)}; HEAD ${head.status} yanıtının başlıkları kullanıldı`);
    throw new Error(`HEAD: ${hataMetni(headHata, zamanAsimiMs)}; GET: ${hataMetni(e, zamanAsimiMs)}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('barindirma-tespit.mjs')) {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const adres = argv.find((a) => !a.startsWith('--'));
  let url = null;
  try { url = new URL(adres); } catch { /* aşağıda kullanım hatası */ }
  if (!url || !/^https?:$/.test(url.protocol)) {
    console.error('Kullanım: node barindirma-tespit.mjs <http(s)://adres> [--json]');
    process.exit(2);
  }
  try {
    const yanit = await basliklariAl(url.href);
    const sonuc = { adres: url.href, sonAdres: yanit.sonAdres, istek: { yontem: yanit.yontem, durum: yanit.durum, not: yanit.not }, zaman: new Date().toISOString(), ...tani(yanit.basliklar) };
    if (json) console.log(JSON.stringify(sonuc, null, 2));
    else console.log(['Barındırma tespiti (yanıt başlıkları; öneri, site sahibiyle teyit edilir)', ...metin(sonuc)].join('\n'));
  } catch (e) {
    console.error(`İstek başarısız (${adres}): ${e.message}`);
    console.error('Başlıklar okunamadı → adresi kontrol edin ya da barındırmayı site sahibine sorun');
    process.exit(1);
  }
}
