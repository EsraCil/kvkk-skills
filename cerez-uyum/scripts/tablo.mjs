#!/usr/bin/env node
// cerez-tespit.mjs --cikti sonuc.json çıktısından Çerez Aydınlatma Metni tablosu taslağı üretir.
// Sütunlar: ad, amaç, süre ve taraf Rehber s. 36 ve EK-4 tablosundan (s. 51–52) [Rehber: tavsiye];
// tür sütunu Rehber 2.2'deki türlerden (s. 11–13) [skill yorumu]; hukuki sebep sütunu Tebliğ 5/1-h
// ve EK-4 metninden (s. 50–51) eklendi [Tebliğ]. Hücreler site metnine girer: etiket yazılmaz.
//
// Kullanım: node tablo.mjs sonuc.json [--md]
//   varsayılan çıktı: templates/cerez-aydinlatma.html içindeki <tbody>'ye konacak <tr> satırları; yalnız satırlar,
//                     HTML yorumu yok (yayımlanan sayfanın kaynak koduna denetim notu girmesin). Notlar --md'dedir.
//   --md            : sohbette göstermek için Markdown tablo, her satırın kaynağı (görüldüğü senaryo, DİKKAT notları)
//                     ve rıza panelinin kategori listesi (riza-paneli.html: kategori açıklamaları ve data-consent-cookies)
//
// Bu bir TASLAKTIR. [DOĞRULA] işaretli her hücre site sahibine sorulmadan ya da
// tedarikçi dokümanından doğrulanmadan yayına gitmez. Süreler ölçülen gerçek
// sürelerdir (tedarikçi beyanı değil); rıza sonrası senaryo varsa oradan alınır.
//
// Ölçümde şerit ya da panelin tercih kaydı (Rehber 5.8) yoksa yeni kurulum sayılır: şablonun kuracağı kaydın
// satırı {{KAYIT_ADI}} ve {{YENIDEN_SORMA_GUN}} yer tutucularıyla en başa eklenir. Gömülü içerik varsa tıklayınca yükle
// kutusunun kaydı ({{KAYIT_ADI}}-gomulu; templates/tikla-yukle.html) da yeni kurulum satırı olarak eklenir. Birinci taraf ölçüm yolları
// (ör. /_vercel/insights) references/tedarikciler.json → "yollar" ile sınıflanır. Gömülü içerik sağlayıcısının
// (YouTube, Vimeo, Google Haritalar) kalemleri "Gömülü içerik" türüyle ayrı kategoride durur (K-Gömülü; rıza
// panelindeki "Gömülü içerik" kategorisiyle aynı). Yerel depolama kalemi ölçülen bir iframe'in sağlayıcısına
// aitse "birinci taraf" yazılmaz; kaynağı bilinmiyorsa taraf hücresi [DOĞRULA: taraf] kalır.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [file, ...rest] = process.argv.slice(2);
if (!file) { console.error('Kullanım: tablo.mjs sonuc.json [--md]'); process.exit(2); }
const md = rest.includes('--md');
const res = JSON.parse(readFileSync(file, 'utf8'));
const S = res.senaryolar;
const db = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'references', 'tedarikciler.json'), 'utf8'));
const eslestir = (liste, deger) => (liste || []).find((e) => new RegExp(e.desen, 'i').test(deger)) || null;

const TUR = { zorunlu: 'Kesinlikle gerekli', analitik: 'Performans ve analitik', reklam: 'Reklam ve pazarlama', 'reklam/tercih': 'Reklam ve pazarlama', işlevsel: 'İşlevsel', 'analitik/pazarlama': 'Performans ve analitik / pazarlama', güvenlik: 'Kesinlikle gerekli (güvenlik)', 'çerezsiz ölçüm': 'Analitik ölçüm (çerezsiz)', 'gömülü içerik': 'Gömülü içerik', 'etiket yöneticisi': 'Site araçlarını yükleyen hizmet' };
// Hukuki sebep taslağı. Rıza gerektiren → açık rıza (md. 5/1). Rıza dışı kalemde kesin varsayılan yok: işlem bir
// sözleşmeyi gerektiriyorsa (sepet, giriş: kriter 5.1 / 5.2) 5/2-c, değilse 5/2-f; ikisi de [DOĞRULA] ile
// (Rehber s. 17–18; EK-4 s. 50–51 "c veya f"). Koşullu ölçüm kaleminde sebep K-Ölçüm seçimine bağlıdır (rızasız
// ölçümde 5/2-f, rıza panelinde 5/1). Diğer koşullu ve tanınmayan kalemde yalnız [DOĞRULA].
const olcum = (x) => /analitik|çerezsiz ölçüm/.test(x?.sinif || '');
const SEBEP = (x) => {
  const r = x ? x.riza : null;
  if (r === true) return 'Açık rıza (KVKK md. 5/1)';
  if (r === false) return /\b5\.[12]\b/.test(x.kriter || '')
    ? 'Sözleşmenin kurulması veya ifası (KVKK md. 5/2-c) [DOĞRULA: işlem bir sözleşmeyi gerektiriyor mu; gerektirmiyorsa 5/2-f]'
    : 'Meşru menfaat (KVKK md. 5/2-f) [DOĞRULA: denge testi; işlem bir sözleşmeyi gerektiriyorsa (sepet, giriş) 5/2-c]';
  if (r === 'kosullu' && olcum(x)) return 'Rızasız ölçümde meşru menfaat (KVKK md. 5/2-f), rıza panelinde açık rıza (KVKK md. 5/1) [DOĞRULA: K-Ölçüm seçimi]';
  return '[DOĞRULA: hukuki sebep]';
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Aynı sağlayıcının tedarikciler.json'daki farklı adları ("Google Analytics 4", "Meta Pixel", "Google DoubleClick")
// tek ada indirilir; kvkk-yansima.mjs aynı listeyi kullanır. Böylece tabloda ve KVKK yansımasında aynı ad görünür ve
// çerezi tabloda olan sağlayıcı için ikinci bir "üçüncü taraf hizmet sağlayıcı" satırı açılmaz.
const AYNI_AD = [
  [/^Google Analytics(?: 4)?$/, 'Google Analytics'],
  [/^Meta(?: Pixel)?$/, 'Meta'],
  [/^Google (?:Ads|DoubleClick|Ads \/ DoubleClick)$/, 'Google Ads / DoubleClick'],
  [/^Yandex(?: Metrica)?$/, 'Yandex Metrica'],
  [/^LinkedIn(?: Insight)?$/, 'LinkedIn'],
  [/^TikTok(?: Pixel)?$/, 'TikTok'],
  [/^Vercel \(önizleme araç çubuğu\)$/, 'Vercel'],
];
const ad = (s) => { if (!s) return s; for (const [re, yeni] of AYNI_AD) if (re.test(s)) return yeni; return s; };

// Gömülü içerik sağlayıcısı (K-Gömülü): kalemleri reklam ya da analitik satırına değil, "Gömülü içerik" türüne girer;
// amaç hücresi sağlayıcının kendi amaçlarını (ör. reklam) yine söyler. kvkk-yansima.mjs aynı ayrımı yapar.
const GOMULU_AD = /^(YouTube|Vimeo|Google Haritalar)/;
const gomulu = (x) => x.sinif === 'gömülü içerik' || GOMULU_AD.test(ad(x.saglayici) || '');
const turAdi = (x) => (gomulu(x) ? 'Gömülü içerik' : TUR[x.sinif] || '[DOĞRULA: tür]');
const kok = (s) => String(s || '').replace(/\s*\(.*\)$/, '');

// Hangi senaryoda görüldü: ilk açılışta görülen, rıza sonrası görülenden önce gelir.
const order = ['ilk', 'okudum', 'kabul', 'reddet'].filter((k) => S[k]);
const rows = new Map();
const add = (key, row, scen) => { if (!rows.has(key)) rows.set(key, { ...row, gorulen: new Set() }); rows.get(key).gorulen.add(scen); return rows.get(key); };
const tumKayitlar = order.flatMap((k) => [...S[k].cerezler, ...S[k].yerelDepolama, ...S[k].oturumDepolama]);

// Ölçülen iframe'lerin sağlayıcıları: yerel depolama kalemi bunlardan birine aitse kayıt iframe'in kaynağından gelir,
// "birinci taraf" yazılmaz. Sağlayıcısı bilinmeyen ya da iframe'i ölçülmemiş gömülü içerik kaleminde taraf [DOĞRULA].
const iframeSaglayici = new Set(order.flatMap((k) => (S[k].iframeler || []).map((u) => { try { return kok(ad(eslestir(db.hostlar, new URL(u).hostname)?.saglayici)); } catch { return ''; } })).filter(Boolean));
const depolamaTaraf = (d) => {
  const v = kok(ad(d.saglayici));
  if (!v) return '[DOĞRULA: taraf]';
  if (iframeSaglayici.has(v)) return `Üçüncü taraf (${v})`;
  if (gomulu(d)) return '[DOĞRULA: taraf]';
  return 'Birinci taraf';
};

// Yeni kurulum: şerit ya da panelin tercih kaydı (Rehber 5.8) ölçülmediyse şablonun (serit-bilgi.html /
// riza-paneli.html) kuracağı kayıt tabloya girer. Kalemi skill'in şablonu kurar ve bir sözleşmeyi gerektirmez: hukuki
// sebebi 5/2-f (Rehber 5.8, s. 24) [Rehber: tavsiye]; süresi YENIDEN_SORMA_GUN (K-Yeniden sorma). Kayıt ölçüldüyse
// ölçülen satır kullanılır (ömrü tarama bulgusu).
if (!tumKayitlar.some((x) => /5\.8/.test(x.kriter || ''))) rows.set('yeni:kayit', {
  ad: '{{KAYIT_ADI}}',
  tur: 'Kesinlikle gerekli (yerel depolama, çerez değil)',
  taraf: 'Birinci taraf',
  amac: '{{KAYIT_AMACI — rıza paneli: "Tercihinizi (izin ya da ret) hatırlamak"; bilgi şeridi: "Bilgilendirme şeridinin kapatıldığını hatırlamak"}}',
  sebep: 'Meşru menfaat (KVKK md. 5/2-f)',
  sure: '{{YENIDEN_SORMA_GUN}} gün',
  riza: false, yeni: true, gorulen: new Set(),
});
// Tıklayınca yükle kutusunun kaydı: gömülü içerik ölçüldüyse ve kayıt henüz ölçülmediyse yeni kurulum satırı. Kutu yalnız
// tıklamayla verilen izni sağlayıcı bazında tutar (sürüm, zaman, sağlayıcı alan adları); ömrü YENIDEN_SORMA_GUN ile aynı.
const gomuluVar = order.some((k) => [...S[k].cerezler, ...S[k].yerelDepolama, ...S[k].oturumDepolama, ...S[k].ucuncuTaraf].some(gomulu))
  || [...iframeSaglayici].some((v) => GOMULU_AD.test(v));
if (gomuluVar && !tumKayitlar.some((x) => /-gomulu$/.test(x.key || x.name || ''))) rows.set('yeni:gomulu', {
  ad: '{{KAYIT_ADI}}-gomulu',
  tur: 'Kesinlikle gerekli (yerel depolama, çerez değil)',
  taraf: 'Birinci taraf',
  amac: '{{GOMULU_KAYIT_AMACI — tıklayınca yükle kutusunda verdiğiniz izni yalnız o sağlayıcı için hatırlamak; örn. "Gömülü içeriği açma izninizi, yalnız izin verdiğiniz sağlayıcı için hatırlamak"}}',
  sebep: 'Meşru menfaat (KVKK md. 5/2-f)',
  sure: '{{YENIDEN_SORMA_GUN}} gün',
  riza: false, yeni: 'gomulu', gorulen: new Set(),
});
// Birinci taraf ölçüm yolu sınıflandıysa (tedarikciler.json → yollar) "cihazda saklanmaz" tarama bulgusudur; yalnız
// sağlayıcısı bilinmeyen bir çerez ya da depolama kalemi varsa [DOĞRULA] kalır.
const bilinmeyenKayit = tumKayitlar.some((x) => !x.saglayici);

for (const scen of order) {
  const r = S[scen];
  for (const c of r.cerezler) {
    add('c:' + c.name, {
      ad: c.name,
      tur: `${turAdi(c)}, ${c.days <= 0 ? 'oturum çerezi' : 'kalıcı çerez'}`,
      taraf: c.party === 'birinci' ? 'Birinci taraf' : `Üçüncü taraf (${ad(c.saglayici) || c.domain.replace(/^\./, '')})`,
      amac: c.amac || '[DOĞRULA: amaç — site sahibine sor]',
      sebep: SEBEP(c),
      sure: c.sure === 'oturum' ? 'Oturum süresince' : c.sure,
      riza: c.riza, gomulu: gomulu(c), sinif: c.sinif, birinciCerez: c.party === 'birinci',
    }, scen);
  }
  for (const d of [...r.yerelDepolama, ...r.oturumDepolama]) {
    const taraf = depolamaTaraf(d);
    add('d:' + d.key, {
      ad: d.key,
      tur: `${turAdi(d)} (${d.tur === 'localStorage' ? 'yerel depolama' : 'oturum depolaması'}, çerez değil)`,
      taraf,
      amac: d.amac || '[DOĞRULA: amaç — site sahibine sor]',
      sebep: SEBEP(d),
      // Tercih kaydı (kriter 5.8): ömrü şerit/panel kodundaki yeniden sorma süresiyle aynıdır (metin-kurallari.md → Sürüm).
      sure: d.tur !== 'localStorage' ? 'Sekme kapanınca silinir'
        : /5\.8/.test(d.kriter || '') ? '[DOĞRULA: tercih kaydının ömrü — şerit/panel kodundaki YENIDEN_SORMA_GUN ile aynı gün sayısı]'
        : taraf.startsWith('Üçüncü') ? '[DOĞRULA: sağlayıcının belirlediği süre]'
        : '[DOĞRULA: site kodundaki süre; yoksa "silinene kadar"]',
      riza: d.riza, gomulu: gomulu(d), sinif: d.sinif,
    }, scen);
  }
  for (const m of r.birinciTarafOlcum || []) {
    const v = eslestir(db.yollar, m.yol);
    if (!v) { add('m:' + m.yol, { ad: `[DOĞRULA: ${m.yol} hangi ölçüm aracı?]`, tur: 'Analitik ölçüm [DOĞRULA]', taraf: 'Birinci taraf alan adı (proxy olabilir) [DOĞRULA]', amac: '[DOĞRULA: amaç]', sebep: SEBEP(null), sure: '[DOĞRULA]', riza: null }, scen); continue; }
    const satir = add('m:' + v.saglayici, {
      ad: v.saglayici,
      tur: TUR[v.sinif] || '[DOĞRULA: tür]',
      taraf: `Birinci taraf alan adı (hizmeti ${v.isletici || v.saglayici} sunar)`,
      amac: v.amac || '[DOĞRULA: amaç]',
      sebep: SEBEP(v),
      sure: bilinmeyenKayit ? 'Cihazda saklanmaz [DOĞRULA]' : 'Cihazda saklanmaz',
      riza: v.riza, yollar: new Set(), sinif: v.sinif,
    }, scen);
    satir.yollar.add(m.yol);
  }
  // Çerez bırakmayan ama veri gönderen üçüncü taraflar (ölçüm betiği, piksel, gömülü içerik)
  const cookieVendors = new Set(r.cerezler.map((c) => ad(c.saglayici)).filter(Boolean));
  for (const h of r.ucuncuTaraf) {
    if (h.sinif === 'üçüncü taraf kaynak') continue; // font/CDN: tabloya değil, aydınlatmada "altyapı sağlayıcıları"na
    const v = ad(h.saglayici);
    if (v && cookieVendors.has(v)) continue;
    const key = 'h:' + (v || h.host);
    add(key, {
      ad: v ? `${v}${/betiği|pikseli/.test(v) ? '' : h.beacon ? ' (betik/piksel)' : ''}` : `[DOĞRULA: ${h.host} ne yüklüyor?]`,
      tur: turAdi(h),
      taraf: 'Üçüncü taraf hizmet sağlayıcı',
      amac: '[DOĞRULA: amaç]',
      sebep: SEBEP(h),
      sure: 'Cihazda saklanmaz [DOĞRULA]',
      riza: h.riza, gomulu: gomulu(h), sinif: h.sinif,
    }, scen);
  }
}

const list = [...rows.values()];
const infra = [...new Set(order.flatMap((k) => S[k].ucuncuTaraf.filter((h) => h.sinif === 'üçüncü taraf kaynak').map((h) => `${h.host} (${h.saglayici})`)))];
const infraNote = infra.length ? `Tabloya girmeyen altyapı kaynakları (IP bu sunuculara gider; KVKK metninde "Aktarım" / altyapı sağlayıcıları altında anlat, self-host öner): ${infra.join(', ')}` : '';
// HTML çıktısı yalnız <tr> satırlarıdır; not ve uyarılar standart hataya yazılır, sayfanın kaynak koduna girmez.
if (!list.length) {
  if (md) console.log(`_Tabloya girecek çerez, depolama veya ölçüm kalemi yok._${infraNote ? '\n\n' + infraNote : ''}`);
  else console.error(`Tabloya girecek kalem yok.${infraNote ? ` ${infraNote}` : ''}`);
  process.exit(0);
}
// Gömülü içerik ilk açılışta görülüyorsa RIZA ÖNCESİ bulgusudur (SKILL.md → Ölçüm, K-Gömülü).
const dikkat = (r) => (!r.gorulen.has('ilk') ? '' : r.gomulu ? ' — DİKKAT: gömülü içerik ilk açılışta, izin ya da tıklama olmadan yükleniyor (RIZA ÖNCESİ, K-Gömülü)' : r.riza === true ? ' — DİKKAT: rıza gerektiriyor ama ilk açılışta var' : '');
const note = (r) => (r.yeni === 'gomulu'
  ? 'yeni kurulum: tıklayınca yükle kutusunun izin kaydı (templates/tikla-yukle.html; sürüm, zaman, sağlayıcı alan adları); ad ve süre şablondaki değerlerle aynı yazılır; tıklayınca yükle kutusu kullanılmayacaksa (K-Gömülü C) satırı sil'
  : r.yeni
    ? 'yeni kurulum: şerit ya da panelin kendi tercih kaydı (Rehber 5.8); ad, amaç ve süre şablondaki değerlerle aynı yazılır; şerit ya da panel kurulmayacaksa satırı sil'
    : `görüldüğü senaryo: ${[...r.gorulen].join(', ')}${r.yollar?.size ? ` (yol: ${[...r.yollar].join(', ')})` : ''}${dikkat(r)}`);

// Rıza paneli kategorileri (riza-paneli.html): tablodaki her rıza kalemi bir kategoride yer alır. Kategori açıklaması
// (ANALITIK_ACIKLAMA, PAZARLAMA_ACIKLAMA, GOMULU_ACIKLAMA) kategorideki bütün kalemleri anar; data-consent-cookies yalnız
// birinci taraf çerez adlarını taşır (üçüncü taraf çerezi site silemez). Böylece panel ile tablo ayrışmaz.
const KATEGORI = [
  ['analitik', 'Analitik', (r) => !r.gomulu && /^(analitik|çerezsiz ölçüm)$/.test(r.sinif || '')],
  ['pazarlama', 'Reklam ve pazarlama', (r) => !r.gomulu && /reklam|pazarlama/.test(r.sinif || '')],
  ['gomulu', 'Gömülü içerik', (r) => r.gomulu],
];
const panelKategorileri = () => {
  const satirlar = [];
  for (const [kod, baslik, uyar] of KATEGORI) {
    const kalemler = list.filter((r) => !r.yeni && r.riza !== false && uyar(r));
    if (!kalemler.length) continue;
    const birinci = kalemler.filter((r) => r.birinciCerez).map((r) => r.ad);
    satirlar.push(`- ${baslik} (data-consent-cat="${kod}"): ${kalemler.map((r) => `${r.ad} — ${r.taraf.charAt(0).toLocaleLowerCase('tr-TR')}${r.taraf.slice(1)}`).join('; ')} — ${birinci.length ? `data-consent-cookies="${birinci.join(' ')}"` : 'birinci taraf çerez yok, data-consent-cookies özniteliği silinir'}`);
  }
  const yonetici = list.filter((r) => !r.yeni && r.sinif === 'etiket yöneticisi').map((r) => r.ad);
  if (yonetici.length) satirlar.push(`- ${yonetici.join(', ')}: kendi kategorisi yoktur; yüklediği etiketin kategorisinde bekler (örn. Google Analytics etiketi → Analitik)`);
  const kararli = list.filter((r) => !r.yeni && r.riza === 'kosullu' && !KATEGORI.some(([, , uyar]) => uyar(r)) && r.sinif !== 'etiket yöneticisi').map((r) => r.ad);
  if (kararli.length) satirlar.push(`- Kategorisi karara bağlı (K-Sohbet, K-Tercih, K-Form güvenliği; cerez-uyum SKILL.md → Kararlar): ${kararli.join(', ')}`);
  return satirlar;
};

if (md) {
  console.log('| Ad | Tür | Taraf | Amaç | Hukuki sebep | Süre |');
  console.log('|---|---|---|---|---|---|');
  for (const r of list) console.log(`| ${r.ad} | ${r.tur} | ${r.taraf} | ${r.amac} | ${r.sebep} | ${r.sure} |`);
  console.log('\nKaynak: ' + list.map((r) => `${r.ad} (${note(r)})`).join('; '));
  const panel = panelKategorileri();
  if (panel.length) console.log(`\nRıza paneli kategorileri (riza-paneli.html; kategori açıklaması kategorideki bütün kalemleri anar, data-consent-cookies yalnız birinci taraf çerezleri taşır):\n${panel.join('\n')}`);
  if (infraNote) console.log('\n' + infraNote);
} else {
  for (const r of list) console.log(`      <tr><td>${esc(r.ad)}</td><td>${esc(r.tur)}</td><td>${esc(r.taraf)}</td><td>${esc(r.amac)}</td><td>${esc(r.sebep)}</td><td>${esc(r.sure)}</td></tr>`);
  console.error(`Not: satırların kaynağı (görüldüğü senaryo, DİKKAT notları) ve rıza paneli kategorileri yalnız --md çıktısında.${infraNote ? ` ${infraNote}` : ''}`);
}
