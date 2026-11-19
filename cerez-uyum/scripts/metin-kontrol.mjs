#!/usr/bin/env node
// Yayın öncesi metin kontrolü. Model çağrısı ve ağ isteği yapmaz.
//
//   node metin-kontrol.mjs site <dosya.html …>   siteye yazılacak metinler
//   node metin-kontrol.mjs rapor <rapor.md …>     kvkk-rapor / cerez-rapor dosyası
//
// site:  HTML yorumları dışındaki her yerde (görünen metin, öznitelik, <script>) kalan yer tutucu,
//        [DOĞRULA], [Örnek …], kaynak etiketi ve boş liste maddesi; görünen metin ve öznitelik
//        değerlerinde yasak kalıp; "rızaya dayanan işleme yok" ile rıza satırının birlikte
//        bulunması → HATA. HTML yorumunda kalan şablon talimatı → UYARI.
// rapor: "Bu rapor hukuki görüş değildir" satırı; ## Kararlar altında her ### K- kararında
//        Seçenek ya da Tek yol, Öneri ve geçerli Seçim satırı; ## Dayanak tablosunda izinli
//        etiket ve dolu Bulgu/beyan; "bilinmiyor" ya da varsayılan öneri varsa ## Sizden beklenenler.
// Bulgu çıkmaması "hukuken doğru" demek değildir: yalnız biçim ve bilinen hatalı kalıplar denetlenir.
// Çıkış kodu: hata varsa 1, yoksa 0. Regresyon testi: node metin-kontrol-test.mjs

import { readFileSync } from 'node:fs';

const ETIKETLER = 'Kanun|Yönetmelik|Tebliğ|Rehber: gerekli|Rehber: tavsiye|Kurul kararı|skill yorumu|site sahibi beyanı';
const ETIKET_RE = new RegExp(`\\[(?:${ETIKETLER})(?::[^\\]]*)?\\]`, 'gu');
const KAYNAK_HUCRE_RE = new RegExp(`^(?:\\[(?:${ETIKETLER}|DOĞRULA)(?::[^\\]]*)?\\]\\s*(?:\\+\\s*)?)+$`, 'u');

// Yasak kalıplar (küçük harfe çevrilmiş metinde): [kalıp, neden, istisna?]
export const YASAK = [
  [/(?:kullanman[ıi]z|kullanmaya\s+devam|gezinmeye\s+devam|devam\s+eder(?:seniz|ek)|devam\s+etmeniz|devam\s+etmekle|devam\s+etti[ğg]inizde|devam\s+etti[ğg]iniz\s+sürece|kullandı[ğg]ınızda|kullanmakla|kullanarak|gezinerek|ziyaret\s+(?:etmeniz|ederek|etmekle|etti[ğg]inizde)|siteye\s+girmeniz|siteye\s+girerek)[^.]{0,100}?(?:kabul|rıza|onay|izin)/u,
    'kullanmayla ya da devamla kabul/rıza (TBK md. 21, 24; Rehber EK-5 Örnek-4)',
    (m) => /geri\s+al|değiştir|yönet/u.test(m)],
  [/(?<!en\s)kısa\s+(?:bir\s+)?(?:süre|müddet)/u, '"kısa süre(li)" — gerçek süreyi ya da "barındırma sağlayıcısının belirlediği süre boyunca" yaz'],
  [/işleme\s+alınmaz/u, '"işleme alınmaz" — Başvuru Tebliği md. 6/2: "gerekçesi açıklanarak reddedilir"'],
  [/veri\s+işleme\s+sözleşme/u, '"veri işleme sözleşmesi" — teyitsiz olgu; TEDARIKCI_ROL cümlesini kullan'],
  [/veri\s+işleyen\s+sıfatıyla|veri\s+işleyendir/u, 'sağlayıcının rolü kesin iddia edilmiş — TEDARIKCI_ROL yalnız teyitle'],
  [/ticari\s+(?:elektronik\s+)?ileti\s+(?:değildir|sayılmaz)/u, 'kesin hüküm yok (K-Ticari ileti)'],
  [/açık\s+rızam(?:ın)?\s+bulunduğunu|açık\s+rıza\s+verdiğimi\s+kabul/u, 'aydınlatmaya rıza beyanı gömülmüş (Tebliğ 5/1-f)'],
  [/(?:üçüncü\s+(?:taraf|kişi|şahıs)\S*|kimseyle)\s+paylaşılmaz/u, '"paylaşılmaz" — barındırma ve diğer alıcılar varken yanlış beyan'],
  [/anonim(?!\s+h[âa]le\s+getir|leştir)/u, '"anonim" iddiası — ölçüme ya da veriye "anonim" denmez (KVKK md. 3); yalnız "anonim hâle getirme" anlamında kullanılır'],
  [/(?:kabul|onay)\s+edilmiş\s+sayılır|rıza(?:sı|nız)?\s+alınmış\s+(?:kabul\s+edilir|sayılır)/u, '"kabul edilmiş/rıza alınmış sayılır" kalıbı (TBK md. 21; Tebliğ 5/1-f)'],
  [/(?:kabul|onay)\s+etmiş\s+sayılırsınız|rıza\s+vermiş\s+sayılırsınız/u, '"kabul etmiş/rıza vermiş sayılırsınız" kalıbı (TBK md. 21; Rehber EK-5 Örnek-4)'],
  [/9\.\s*madde\S*[^.]{0,80}uygun\s+olarak\s+aktarılır\b/u, 'yurt dışı uyum iddiası kesin kipte — "…uygun olarak aktarılabilir" (K-Yurt dışı)'],
  [/(?:ayarlar|settings|tercihler)\s*(?:>|›|→)\s*\S/u, 'tarayıcı menü yolu tarifi — yardım sayfası bağlantısı ver'],
];

const lower = (s) => s.toLocaleLowerCase('tr-TR');
const TEKNIK_OZNITELIK = new Set(['href', 'src', 'srcset', 'class', 'id', 'style', 'type', 'name', 'for', 'rel', 'target', 'action', 'method', 'role', 'width', 'height', 'loading', 'allow', 'sizes', 'lang', 'dir', 'tabindex', 'data-src', 'data-consent-category']);
const satirNo = (metin, i) => metin.slice(0, i).split('\n').length;
const bosalt = (m) => m.replace(/[^\n]/g, ' ');
const kisalt = (s) => s.replace(/\s+/g, ' ').trim().slice(0, 80);
// {{…}} içinde kalmayan artıklar: önce tam yer tutucuları boşalt, sonra kalan }} / TODO / XXX'e bak.
const gorunenHam = (s) => s.replace(/\{\{[\s\S]*?\}\}/g, bosalt);

export function siteKontrolMetin(html, dosya = 'metin', yazdir = console.log) {
  let hata = 0, uyari = 0;
  const yaz = (tur, satir, mesaj, parca) => {
    yazdir(`${tur} ${dosya}:${satir}: ${mesaj}${parca ? ` — «${kisalt(parca)}»` : ''}`);
    if (tur === 'HATA') hata++; else uyari++;
  };
  const yorumsuz = html.replace(/<!--[\s\S]*?-->/g, bosalt);
  const betiksiz = yorumsuz.replace(/<script\b[\s\S]*?<\/script>/gi, bosalt).replace(/<style\b[\s\S]*?<\/style>/gi, bosalt);
  const gorunen = betiksiz.replace(/<[^>]*>/g, bosalt);
  const oznitelikler = [];
  for (const etiket of betiksiz.matchAll(/<[^>]*>/g)) {
    for (const m of etiket[0].matchAll(/\s([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      if (TEKNIK_OZNITELIK.has(m[1].toLowerCase())) continue;
      oznitelikler.push({ metin: m[2] ?? m[3] ?? '', satir: satirNo(betiksiz, etiket.index) });
    }
  }

  for (const m of yorumsuz.matchAll(/\{\{/g)) yaz('HATA', satirNo(yorumsuz, m.index), 'doldurulmamış yer tutucu (metin, öznitelik ya da betik)', yorumsuz.slice(m.index, m.index + 60));
  for (const m of yorumsuz.matchAll(/\[(?:DOĞRULA|DOGRULA|İÇERİK GEREKLİ|ICERIK GEREKLI|TODO)[^\]]*\]/giu)) yaz('HATA', satirNo(yorumsuz, m.index), 'teyit bekleyen işaret siteye girmiş', m[0]);
  for (const m of gorunenHam(yorumsuz).matchAll(/\}\}|\bTODO\b|\bXXX\b/g)) yaz('HATA', satirNo(yorumsuz, m.index), 'yer tutucu artığı', yorumsuz.slice(Math.max(0, m.index - 20), m.index + 20));
  for (const m of yorumsuz.matchAll(/\[Örnek\b/gu)) yaz('HATA', satirNo(yorumsuz, m.index), 'şablon örneği kalmış', yorumsuz.slice(m.index, m.index + 60));
  for (const m of yorumsuz.matchAll(ETIKET_RE)) yaz('HATA', satirNo(yorumsuz, m.index), 'kaynak etiketi siteye girmiş (yalnız raporda durur)', m[0]);
  for (const m of yorumsuz.matchAll(/<li\b[^>]*>\s*[,.;]?\s*<\/li>/gi)) yaz('HATA', satirNo(yorumsuz, m.index), 'boş liste maddesi (silinmesi gereken satır kalmış)', m[0]);
  for (const m of gorunen.matchAll(/(?:^|[\s:(])…(?=[\s)<.,;]|$)/gm)) yaz('HATA', satirNo(gorunen, m.index), 'doldurulmamış alan ("…")', gorunen.slice(Math.max(0, m.index - 20), m.index + 10));
  for (const m of yorumsuz.matchAll(/&lt;[^&<>]{1,30}&gt;|(?<!\{)\{[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ0-9_]{2,}\}(?!\})/gu)) yaz('HATA', satirNo(yorumsuz, m.index), 'yer tutucu artığı (<…> ya da {AD})', m[0]);

  const dizgeler = [];
  for (const b of yorumsuz.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    for (const d of b[1].matchAll(/'((?:[^'\\\n]|\\.){12,})'|"((?:[^"\\\n]|\\.){12,})"|`([^`]{12,})`/g)) {
      dizgeler.push({ metin: d[1] ?? d[2] ?? d[3], satir: satirNo(yorumsuz, b.index + b[0].indexOf(d[0])) });
    }
  }
  const parcalar = [{ metin: gorunen, satir: null }, ...oznitelikler, ...dizgeler];
  for (const p of parcalar) {
    const kucuk = lower(p.metin);
    for (const [kalip, neden, istisna] of YASAK) {
      for (const m of kucuk.matchAll(new RegExp(kalip.source, 'gu'))) {
        if (istisna && istisna(m[0])) continue;
        yaz('HATA', p.satir ?? satirNo(p.metin, m.index), `yasak kalıp: ${neden}`, p.metin.slice(m.index, m.index + m[0].length));
      }
    }
  }
  const kucuk = lower(gorunen);
  const rizaYok = kucuk.search(/açık\s+rızaya\s+dayanan\s+bir\s+veri\s+işleme\s+faaliyeti\s+bulunmamaktadır/u);
  if (rizaYok >= 0 && /açık\s+rıza(?:nız|nıza|nızla)?\s*\((?:kvkk\s+)?(?:madde|md\.)\s*5\/1\)/u.test(kucuk)) yaz('HATA', satirNo(gorunen, rizaYok), 'çelişki: "rızaya dayanan işleme yok" cümlesi ile açık rıza satırı birlikte');

  for (const m of html.matchAll(/<!--[\s\S]*?-->/g)) {
    if (m[0].includes('{{')) yaz('UYARI', satirNo(html, m.index), 'HTML yorumunda şablon talimatı kalmış (kaynak kodda görünür); yayından önce sil', m[0].slice(4, 80));
  }
  return { hata, uyari };
}

const TARIH = '\\d{1,2}\\.\\d{1,2}\\.\\d{4}';

export function raporKontrolMetin(md, dosya = 'rapor', yazdir = console.log) {
  let hata = 0, uyari = 0;
  const satirlar = md.split('\n');
  const yaz = (tur, s, mesaj) => { yazdir(`${tur} ${dosya}:${s}: ${mesaj}`); if (tur === 'HATA') hata++; else uyari++; };

  if (!/hukuki görüş değildir/iu.test(md)) yaz('HATA', 1, '"Bu rapor hukuki görüş değildir…" satırı yok');

  const bolum = (...adlar) => {
    for (const ad of adlar) {
      const bas = satirlar.findIndex((l) => new RegExp(`^##\\s+${ad}(?=\\s|$)`, 'u').test(l));
      if (bas < 0) continue;
      let son = satirlar.findIndex((l, i) => i > bas && /^##\s/.test(l));
      if (son < 0) son = satirlar.length;
      return { bas, son };
    }
    return null;
  };

  const dayanak = bolum('Dayanak');
  if (!dayanak) yaz('HATA', 1, '"## Dayanak" bölümü yok');
  else {
    let baslik = null, kaynak = -1, beyan = -1, satirSayisi = 0;
    for (let i = dayanak.bas + 1; i < dayanak.son; i++) {
      const l = satirlar[i].trim();
      if (!l.startsWith('|')) continue;
      const h = l.slice(1, l.endsWith('|') ? -1 : undefined).split('|').map((x) => x.trim());
      if (!baslik) { baslik = h; kaynak = h.findIndex((x) => /^kaynak$/iu.test(x)); beyan = h.findIndex((x) => /bulgu|beyan/iu.test(x)); continue; }
      if (h.every((x) => /^:?-{2,}:?$/.test(x))) continue;
      satirSayisi++;
      if (kaynak < 0) continue;
      const k = h[kaynak] || '';
      if (!KAYNAK_HUCRE_RE.test(k)) { yaz('HATA', i + 1, `Kaynak sütunu izinli etiket değil: «${k}»`); continue; }
      const dogrula = /\[DOĞRULA/u.test(k);
      if (dogrula) yaz('UYARI', i + 1, 'teyit bekleyen satır ([DOĞRULA]); bu cümle siteye yazılmamalı');
      if (beyan >= 0 && !dogrula && !(h[beyan] || '').replace(/[—–-]/g, '').trim()) yaz('HATA', i + 1, 'Bulgu / beyan sütunu boş: cümlenin kaynağı gösterilmemiş');
    }
    if (kaynak < 0) yaz('HATA', dayanak.bas + 1, 'Dayanak tablosunda "Kaynak" sütunu yok');
    if (satirSayisi === 0) yaz('HATA', dayanak.bas + 1, 'Dayanak tablosu boş');
  }

  const kararlar = bolum('Kararlar', 'Site sahibinin kararları');
  if (!kararlar) {
    if (/karar gerektiren seçim yok/iu.test(md)) yaz('UYARI', 1, 'Kararlar bölümü yok (raporda "karar gerektiren seçim yok" yazıyor)');
    else yaz('HATA', 1, '"## Kararlar" bölümü yok (seçim yoksa raporda "Karar gerektiren seçim yok" yazılır)');
  } else {
    let k = null, sayi = 0;
    const kapat = () => {
      if (!k) return;
      sayi++;
      if (!/^K-/u.test(k.ad)) yaz('HATA', k.satir, `karar başlığı "### K-<Konu>" biçiminde değil: «${k.ad}»`);
      if (k.tekYol) return;
      if (!k.secenek) yaz('HATA', k.satir, `${k.ad}: "- Seçenek" ya da "- Tek yol:" satırı yok`);
      if (!k.oneri) yaz('HATA', k.satir, `${k.ad}: "- Öneri:" satırı yok`);
      if (!k.secim) { yaz('HATA', k.satir, `${k.ad}: "- Seçim:" satırı yok`); return; }
      if (/\[DOĞRULA/u.test(k.secim)) yaz('UYARI', k.satir, `${k.ad}: seçim henüz sorulmadı ([DOĞRULA])`);
      else if (new RegExp(`varsayılan\\s+öneri.*bilmiyor.*${TARIH}`, 'iu').test(k.secim)) yaz('UYARI', k.satir, `${k.ad}: site sahibi bilmiyor, varsayılan öneri uygulandı ("Sizden beklenenler"de olmalı)`);
      else if (!new RegExp(`seçen:\\s*site sahibi,\\s*${TARIH}`, 'iu').test(k.secim)) yaz('HATA', k.satir, `${k.ad}: Seçim satırı geçerli biçimde değil ("seçen: site sahibi, GG.AA.YYYY" ya da "varsayılan öneri — site sahibi bilmiyor, GG.AA.YYYY")`);
    };
    for (let i = kararlar.bas + 1; i < kararlar.son; i++) {
      const l = satirlar[i];
      if (/^#{3,}\s/.test(l)) { kapat(); k = { ad: l.replace(/^#{3,}\s+/, '').trim().slice(0, 60), satir: i + 1, secenek: false, tekYol: false, oneri: false, secim: null }; continue; }
      if (!k) continue;
      if (/^\s*-\s*Seçenek\b/u.test(l)) k.secenek = true;
      if (/^\s*-\s*Tek yol:/u.test(l)) k.tekYol = true;
      if (/^\s*-\s*Öneri:/u.test(l)) k.oneri = true;
      if (/^\s*-\s*Seçim:/u.test(l)) k.secim = l;
    }
    kapat();
    if (sayi === 0) yaz('HATA', kararlar.bas + 1, 'Kararlar bölümünde hiç ### K- kararı yok');
  }

  if (/bilinmiyor|varsayılan\s+öneri/iu.test(md) && !bolum('Sizden beklenenler')) yaz('HATA', 1, '"bilinmiyor" ya da varsayılan öneri var ama "## Sizden beklenenler" bölümü yok');

  const dogrula = (md.match(/\[DOĞRULA/gu) || []).length;
  if (dogrula) yazdir(`BİLGİ ${dosya}: ${dogrula} adet [DOĞRULA] — site sahibinden teyit bekleyen nokta`);
  return { hata, uyari };
}

function oku(dosya) {
  try { return readFileSync(dosya, 'utf8'); } catch (e) { console.log(`HATA ${dosya}: okunamadı (${e.code})`); return null; }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('metin-kontrol.mjs')) {
  const [mod, ...dosyalar] = process.argv.slice(2);
  if (!['site', 'rapor'].includes(mod) || dosyalar.length === 0) {
    console.log('Kullanım: node metin-kontrol.mjs site <dosya.html …> | rapor <rapor.md …>');
    process.exit(2);
  }
  let toplam = { hata: 0, uyari: 0 };
  for (const d of dosyalar) {
    const icerik = oku(d);
    if (icerik === null) { toplam.hata++; continue; }
    const r = mod === 'site' ? siteKontrolMetin(icerik, d) : raporKontrolMetin(icerik, d);
    toplam = { hata: toplam.hata + r.hata, uyari: toplam.uyari + r.uyari };
  }
  console.log(`Sonuç: ${toplam.hata} hata, ${toplam.uyari} uyarı${toplam.hata ? '' : ' (biçim temiz; hukuki doğruluk ayrıca gözden geçirilir)'}`);
  process.exit(toplam.hata ? 1 : 0);
}
