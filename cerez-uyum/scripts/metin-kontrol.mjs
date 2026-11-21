#!/usr/bin/env node
// Yayın öncesi metin kontrolü. Model çağrısı ve ağ isteği yapmaz.
//
//   node metin-kontrol.mjs site <dosya.html …>   siteye yazılacak metinler
//   node metin-kontrol.mjs rapor <rapor.md …>     kvkk-rapor / cerez-rapor dosyası
//
// site:  HTML yorumları dışındaki her yerde (görünen metin, öznitelik, <script>) kalan yer tutucu,
//        [DOĞRULA], [Örnek …], kaynak etiketi; boş liste maddesi, paragraf, liste ya da bölüm; listenin son
//        maddesinde kalan virgül; çıplak yer tutucu adı (LOG_SURESI gibi); iç terim (K-<Ad>, "Seçenek X", "§6",
//        kvkk-yansima); görünen metin, öznitelik ve betik dizgelerinde yasak kalıp; "rızaya dayanan işleme yok" ile
//        rıza satırının birlikte bulunması → HATA. Her HTML yorumu, <script> ve <style> içindeki yorumlar (şablon ya da
//        denetim notu kaynak kodda görünür) ve parantezden sonra gelen ek ("…)'ye", "…)'nin") → UYARI.
// rapor: "Bu rapor hukuki görüş değildir" satırı; ## Kararlar altında her ### K- kararında Seçenek ya da Tek yol,
//        Öneri ve geçerli Seçim satırı (birden çok seçim satırı varsa, ör. "- Seçim (bilgilendirme biçimi):", her biri); ## Dayanak tablosunda izinli etiket ve dolu Bulgu/beyan; ## Değişiklik
//        bölümündeki "Yer tutucular:" satırlarında adı geçen her yer tutucu ve her ### K- kararı için Dayanak'ın
//        "Yer tutucu / karar" sütununda bir satır; "bilinmiyor" ya da varsayılan öneri varsa ## Sizden beklenenler.
// Her bulgu bir kural kimliğiyle yazılır (ör. [kullanma-kabul], [ciplak-ad]); regresyon testi kimliği doğrular.
// Bulgu çıkmaması "hukuken doğru" demek değildir: yalnız biçim ve bilinen hatalı kalıplar denetlenir.
// Çıkış kodu: hata varsa 1, yoksa 0. Regresyon testi: node metin-kontrol-test.mjs

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ETIKETLER = 'Kanun|Yönetmelik|Tebliğ|Rehber: gerekli|Rehber: tavsiye|Kurul kararı|skill yorumu|site sahibi beyanı';
// Etiketin yanına kısa açıklama eklenebilir: "[site sahibi beyanı: bilinmiyor]", "[Rehber: tavsiye — örnek]".
const ETIKET_RE = new RegExp(`\\[(?:${ETIKETLER})(?:\\s*[:—–-][^\\]]*)?\\]`, 'gu');
const KAYNAK_HUCRE_RE = new RegExp(`^(?:\\[(?:${ETIKETLER}|DOĞRULA)(?:\\s*[:—–-][^\\]]*)?\\]\\s*(?:\\+\\s*)?)+$`, 'u');

// Çerez ve depolama adları (references/tedarikciler.json) çıplak yer tutucu adı sayılmaz: VISITOR_INFO1_LIVE,
// LOGIN_INFO gibi büyük harfli ve alt çizgili adlar çerez tablosunda ve panel açıklamasında meşru olarak geçer.
let BILINEN_ADLAR = [];
try {
  const db = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'references', 'tedarikciler.json'), 'utf8'));
  BILINEN_ADLAR = [...(db.cerezler || []), ...(db.depolama || [])].map((e) => new RegExp(e.desen, 'i'));
} catch { /* liste okunamazsa ayıklama yapılmaz */ }

// Yasak kalıplar (küçük harfe çevrilmiş metinde). istisna cümlenin tamamına bakar.
// kullanma-kabul: anahtar kelimenin (kabul, rıza, onay, izin) önünde harf olmamalı; "adresinizin", "talebinizin"
// içindeki "izin" eşleşmez. "geri al / değiştir / yönet" cümlenin herhangi bir yerindeyse kalıp istisnadır.
export const YASAK = [
  { kural: 'kullanma-kabul',
    kalip: /(?:kullanman[ıi]z|kullanmaya\s+devam|gezinmeye\s+devam|devam\s+eder(?:seniz|ek)|devam\s+etmeniz|devam\s+etmekle|devam\s+etti[ğg]inizde|devam\s+etti[ğg]iniz\s+sürece|kullandı[ğg]ınızda|kullanmakla|kullanarak|gezinerek|ziyaret\s+(?:etmeniz|ederek|etmekle|etti[ğg]inizde)|siteye\s+girmeniz|siteye\s+girerek)[^.]{0,100}?(?<![\p{L}\p{N}])(?:kabul|rıza|onay|izin)/u,
    neden: 'kullanmayla ya da devamla kabul/rıza (TBK md. 21, 24; Rehber EK-5 Örnek-4)',
    istisna: (cumle) => /geri\s+al|değiştir|yönet/u.test(cumle) },
  { kural: 'kisa-sure', kalip: /(?<!en\s)kısa\s+(?:bir\s+)?(?:süre|müddet)/u, neden: '"kısa süre(li)" — gerçek süreyi ya da "barındırma sağlayıcısının belirlediği süre boyunca" yaz' },
  { kural: 'isleme-alinmaz', kalip: /işleme\s+alınmaz/u, neden: '"işleme alınmaz" — Başvuru Tebliği md. 6/2: "gerekçesi açıklanarak reddedilir"' },
  { kural: 'veri-isleme-sozlesmesi', kalip: /veri\s+işleme\s+sözleşme/u, neden: '"veri işleme sözleşmesi" — teyitsiz olgu; TEDARIKCI_ROL cümlesini kullan' },
  { kural: 'veri-isleyen', kalip: /veri\s+işleyen\s+sıfatıyla|veri\s+işleyendir/u, neden: 'sağlayıcının rolü kesin iddia edilmiş — TEDARIKCI_ROL yalnız teyitle' },
  { kural: 'ticari-ileti-hukmu', kalip: /ticari\s+(?:elektronik\s+)?ileti\s+(?:değildir|sayılmaz)/u, neden: 'kesin hüküm yok (K-Ticari ileti)' },
  { kural: 'riza-gomme', kalip: /açık\s+rızam(?:ın)?\s+bulunduğunu|açık\s+rıza\s+verdiğimi\s+kabul/u, neden: 'aydınlatmaya rıza beyanı gömülmüş (Tebliğ 5/1-f)' },
  { kural: 'paylasilmaz', kalip: /(?:üçüncü\s+(?:taraf|kişi|şahıs)\S*|kimseyle)\s+paylaşılmaz/u, neden: '"paylaşılmaz" — barındırma ve diğer alıcılar varken yanlış beyan' },
  { kural: 'anonim', kalip: /anonim(?!\s+h[âa]le\s+getir|leştir|\s+şirket)/u, neden: '"anonim" iddiası — ölçüme ya da veriye "anonim" denmez (KVKK md. 3); yalnız "anonim hâle getirme" anlamında ve "Anonim Şirketi" unvanında kullanılır' },
  { kural: 'sayilir', kalip: /(?:kabul|onay)\s+edilmiş\s+sayılır|rıza(?:sı|nız)?\s+alınmış\s+(?:kabul\s+edilir|sayılır)/u, neden: '"kabul edilmiş/rıza alınmış sayılır" kalıbı (TBK md. 21; Tebliğ 5/1-f)' },
  { kural: 'sayilirsiniz', kalip: /(?:kabul|onay)\s+etmiş\s+sayılırsınız|rıza\s+vermiş\s+sayılırsınız/u, neden: '"kabul etmiş/rıza vermiş sayılırsınız" kalıbı (TBK md. 21; Rehber EK-5 Örnek-4)' },
  { kural: 'yurt-disi-kesin', kalip: /9\.\s*madde\S*[^.]{0,80}uygun\s+olarak\s+aktarılır\b/u, neden: 'yurt dışı uyum iddiası kesin kipte — "…uygun olarak aktarılabilir" ya da "…kapsamında aktarılabilir" (K-Yurt dışı)' },
  { kural: 'menu-yolu', kalip: /(?:ayarlar|settings|tercihler)\s*(?:>|›|→)\s*\S/u, neden: 'tarayıcı menü yolu tarifi — yardım sayfası bağlantısı ver' },
];

// Çıplak yer tutucu adı: büyük harf ve alt çizgiyle yazılmış ad (LOG_SURESI, BÜYÜK_HARF_ALT_ÇİZGİ). Süslü ayraçlı
// biçim ({{…}}, {AD}) ayrı kurallarla yakalanır; tire ya da alt çizgiyle başlayan çerez adı (__Secure-ROLLOUT_TOKEN)
// ve tedarikciler.json'daki çerez/depolama adları ayıklanır; tablo hücreleri bu denetime girmez.
const CIPLAK_AD_RE = /(?<![\p{L}\p{N}_{}-])[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ0-9]*(?:_[A-ZÇĞİÖŞÜ0-9]+)+(?![\p{L}\p{N}_{}-])/gu;
// Paketin iç terimleri: karar kimliği (K-Ölçüm), seçenek harfi (Seçenek B), şablon bölüm işareti (§6), betik adı.
const IC_TERIM = [
  /(?<![\p{L}\p{N}_-])K-\p{Lu}\p{L}*/gu,
  /(?<!\p{L})[Ss]eçenek\s+\p{Lu}(?![\p{L}\p{N}])/gu,
  /§\s*\d/gu,
  /kvkk-yansima/giu,
];
// Blok öğelerin sonu cümle sınırı sayılır: bir liste maddesindeki "kullanarak" sonraki maddedeki "kabul" ile birleşmez
// ve istisna yalnız kendi cümlesinde aranır. Uzunluk korunur (satır numarası için).
const BLOK_SONU = /<\/(?:p|li|h[1-6]|td|th|dt|dd|div|section|article|blockquote|figcaption|caption|label|button|summary|option)\s*>|<br\s*\/?>/gi;
// Görünür metni olmasa da içerik sayılan öğeler (boş bölüm denetimi).
const ICERIK_OGESI = /<(?:img|iframe|video|audio|picture|svg|table|figure|canvas|object|embed|input|select|textarea|button|form)\b/i;

const lower = (s) => s.toLocaleLowerCase('tr-TR');
const TEKNIK_OZNITELIK = new Set(['href', 'src', 'srcset', 'class', 'id', 'style', 'type', 'name', 'for', 'rel', 'target', 'action', 'method', 'role', 'width', 'height', 'loading', 'allow', 'sizes', 'lang', 'dir', 'tabindex', 'data-src', 'data-consent-category']);
const satirNo = (metin, i) => metin.slice(0, i).split('\n').length;
const bosalt = (m) => m.replace(/[^\n]/g, ' ');
const kisalt = (s) => s.replace(/\s+/g, ' ').trim().slice(0, 80);
// {{…}} içinde kalmayan artıklar: önce tam yer tutucuları boşalt, sonra kalan }} / TODO / XXX'e bak.
const gorunenHam = (s) => s.replace(/\{\{[\s\S]*?\}\}/g, bosalt);
// Eşleşmenin içinde bulunduğu cümle: önceki ve sonraki . ! ? arası.
const cumleBul = (metin, bas, son) => {
  let b = bas; while (b > 0 && !/[.!?]/.test(metin[b - 1])) b--;
  let s = son; while (s < metin.length && !/[.!?]/.test(metin[s])) s++;
  return metin.slice(b, s);
};

export function siteKontrolMetin(html, dosya = 'metin', yazdir = console.log) {
  let hata = 0, uyari = 0;
  const bulgular = [];
  const yaz = (tur, kural, satir, mesaj, parca) => {
    yazdir(`${tur} ${dosya}:${satir} [${kural}]: ${mesaj}${parca ? ` — «${kisalt(parca)}»` : ''}`);
    bulgular.push({ tur, kural, satir });
    if (tur === 'HATA') hata++; else uyari++;
  };
  const yorumsuz = html.replace(/<!--[\s\S]*?-->/g, bosalt);
  const betiksiz = yorumsuz.replace(/<script\b[\s\S]*?<\/script>/gi, bosalt).replace(/<style\b[\s\S]*?<\/style>/gi, bosalt);
  const gorunen = betiksiz.replace(/<[^>]*>/g, bosalt);
  const cumleli = betiksiz.replace(BLOK_SONU, (m) => `.${bosalt(m.slice(1))}`).replace(/<[^>]*>/g, bosalt);
  const tablosuz = betiksiz.replace(/<t([dh])\b[^>]*>[\s\S]*?<\/t\1\s*>/gi, bosalt).replace(/<[^>]*>/g, bosalt);
  const oznitelikler = [];
  for (const etiket of betiksiz.matchAll(/<[^>]*>/g)) {
    for (const m of etiket[0].matchAll(/\s([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      if (TEKNIK_OZNITELIK.has(m[1].toLowerCase())) continue;
      oznitelikler.push({ metin: m[2] ?? m[3] ?? '', satir: satirNo(betiksiz, etiket.index) });
    }
  }

  for (const m of yorumsuz.matchAll(/\{\{/g)) yaz('HATA', 'yer-tutucu', satirNo(yorumsuz, m.index), 'doldurulmamış yer tutucu (metin, öznitelik ya da betik)', yorumsuz.slice(m.index, m.index + 60));
  for (const m of yorumsuz.matchAll(/\[(?:DOĞRULA|DOGRULA|İÇERİK GEREKLİ|ICERIK GEREKLI|TODO)[^\]]*\]/giu)) yaz('HATA', 'dogrula', satirNo(yorumsuz, m.index), 'teyit bekleyen işaret siteye girmiş', m[0]);
  for (const m of gorunenHam(yorumsuz).matchAll(/\}\}|\bTODO\b|\bXXX\b/g)) yaz('HATA', 'yer-tutucu-artigi', satirNo(yorumsuz, m.index), 'yer tutucu artığı', yorumsuz.slice(Math.max(0, m.index - 20), m.index + 20));
  for (const m of yorumsuz.matchAll(/\[Örnek\b/gu)) yaz('HATA', 'ornek', satirNo(yorumsuz, m.index), 'şablon örneği kalmış', yorumsuz.slice(m.index, m.index + 60));
  for (const m of yorumsuz.matchAll(ETIKET_RE)) yaz('HATA', 'etiket', satirNo(yorumsuz, m.index), 'kaynak etiketi siteye girmiş (yalnız raporda durur)', m[0]);
  for (const m of yorumsuz.matchAll(/<li\b[^>]*>\s*[,.;]?\s*<\/li>/gi)) yaz('HATA', 'bos-madde', satirNo(yorumsuz, m.index), 'boş liste maddesi (silinmesi gereken satır kalmış)', m[0]);
  for (const m of yorumsuz.matchAll(/<p\b[^>]*>(?:\s|&nbsp;|&#160;)*[,.;]?(?:\s|&nbsp;|&#160;)*<\/p>/gi)) yaz('HATA', 'bos-paragraf', satirNo(yorumsuz, m.index), 'boş paragraf (silinen cümlelerin paragrafı kalmış)', m[0]);
  // hidden ya da data-* özniteliği taşıyan boş liste çoğunlukla betiğin sonradan doldurduğu bir kaptır: hata değil uyarı.
  for (const m of yorumsuz.matchAll(/<(ul|ol)\b([^>]*)>\s*<\/\1\s*>/gi)) {
    if (/\shidden\b|\sdata-[\w-]+/i.test(m[2])) yaz('UYARI', 'bos-liste-betik', satirNo(yorumsuz, m.index), 'boş liste; hidden ya da data-* özniteliği var, betikle dolduruluyor olabilir (yasal metindeyse silinen maddeleri kontrol et)', m[0]);
    else yaz('HATA', 'bos-liste', satirNo(yorumsuz, m.index), 'boş liste (bütün maddeleri silinmiş)', m[0]);
  }
  for (const m of yorumsuz.matchAll(/(?<![>\s]),\s*<\/li>\s*<\/(?:ul|ol)\s*>/gi)) yaz('HATA', 'liste-sonu-virgul', satirNo(yorumsuz, m.index), 'listenin son maddesi virgülle bitiyor (silinen maddeden sonra virgül noktaya çevrilir)', yorumsuz.slice(Math.max(0, m.index - 40), m.index + 1));
  // Boş bölüm: başlıktan sonra, aynı ya da üst düzeydeki bir sonraki başlığa (ya da metnin sonuna) kadar görünür içerik yok.
  const basliklar = [...betiksiz.matchAll(/<h([1-6])\b[^>]*>[\s\S]*?<\/h\1\s*>/gi)].map((m) => ({ duzey: Number(m[1]), bas: m.index, son: m.index + m[0].length, metin: m[0] }));
  basliklar.forEach((b, i) => {
    const sonraki = basliklar.slice(i + 1).find((x) => x.duzey <= b.duzey);
    const bolum = betiksiz.slice(b.son, sonraki ? sonraki.bas : betiksiz.length);
    if (ICERIK_OGESI.test(bolum)) return;
    if (!bolum.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').trim()) yaz('HATA', 'bos-bolum', satirNo(betiksiz, b.bas), 'boş bölüm (başlığın altında metin kalmamış; başlık silinir ve sonraki numaralar kaydırılır)', b.metin.replace(/<[^>]*>/g, ''));
  });
  for (const m of gorunen.matchAll(/(?:^|[\s:(])…(?=[\s)<.,;]|$)/gm)) yaz('HATA', 'bos-alan', satirNo(gorunen, m.index), 'doldurulmamış alan ("…")', gorunen.slice(Math.max(0, m.index - 20), m.index + 10));
  for (const m of yorumsuz.matchAll(/&lt;[^&<>]{1,30}&gt;|(?<!\{)\{[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ0-9_]{2,}\}(?!\})/gu)) yaz('HATA', 'ayrac-artigi', satirNo(yorumsuz, m.index), 'yer tutucu artığı (<…> ya da {AD})', m[0]);

  const dizgeler = [];
  for (const b of yorumsuz.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    for (const d of b[1].matchAll(/'((?:[^'\\\n]|\\.){12,})'|"((?:[^"\\\n]|\\.){12,})"|`([^`]{12,})`/g)) {
      dizgeler.push({ metin: d[1] ?? d[2] ?? d[3], satir: satirNo(yorumsuz, b.index + b[0].indexOf(d[0])) });
    }
  }
  const parcalar = [{ metin: cumleli, satir: null }, ...oznitelikler, ...dizgeler];
  for (const p of parcalar) {
    const kucuk = lower(p.metin);
    for (const { kural, kalip, neden, istisna } of YASAK) {
      for (const m of kucuk.matchAll(new RegExp(kalip.source, 'gu'))) {
        if (istisna && istisna(cumleBul(kucuk, m.index, m.index + m[0].length))) continue;
        yaz('HATA', kural, p.satir ?? satirNo(p.metin, m.index), `yasak kalıp: ${neden}`, p.metin.slice(m.index, m.index + m[0].length));
      }
    }
    for (const re of IC_TERIM) {
      for (const m of p.metin.matchAll(re)) yaz('HATA', 'ic-terim', p.satir ?? satirNo(p.metin, m.index), 'paketin iç terimi siteye girmiş (karar kimliği, seçenek harfi, § işareti ya da betik adı yalnız raporda durur)', p.metin.slice(Math.max(0, m.index - 20), m.index + m[0].length + 20));
    }
    for (const m of p.metin.matchAll(/\)['’]\p{Ll}+/gu)) yaz('UYARI', 'ek-parantez', p.satir ?? satirNo(p.metin, m.index), 'parantezden sonra ek: parantezli adda ek parantezden önceki kelimeye gelir (TDK)', p.metin.slice(Math.max(0, m.index - 30), m.index + m[0].length));
  }
  for (const p of [{ metin: tablosuz, satir: null }, ...oznitelikler, ...dizgeler]) {
    for (const m of p.metin.matchAll(CIPLAK_AD_RE)) {
      if (BILINEN_ADLAR.some((re) => re.test(m[0]))) continue;
      yaz('HATA', 'ciplak-ad', p.satir ?? satirNo(p.metin, m.index), 'çıplak yer tutucu adı (süslü ayraçları silinmiş ama doldurulmamış)', m[0]);
    }
  }
  const kucuk = lower(gorunen);
  const rizaYok = kucuk.search(/açık\s+rızaya\s+dayanan\s+bir\s+veri\s+işleme\s+faaliyeti\s+bulunmamaktadır/u);
  if (rizaYok >= 0 && /açık\s+rıza(?:nız|nıza|nızla)?\s*\((?:kvkk\s+)?(?:madde|md\.)\s*5\/1\)/u.test(kucuk)) yaz('HATA', 'riza-celiskisi', satirNo(gorunen, rizaYok), 'çelişki: "rızaya dayanan işleme yok" cümlesi ile açık rıza satırı birlikte');

  // Kaynak kodda görünen notlar: her HTML yorumu, <script> ve <style> içindeki yorumlar.
  for (const m of html.matchAll(/<!--[\s\S]*?-->/g)) {
    const icerik = m[0].slice(4, -3);
    yaz('UYARI', 'html-yorumu', satirNo(html, m.index), icerik.includes('{{') ? 'HTML yorumunda şablon talimatı kalmış (kaynak kodda görünür); yayından önce sil' : 'HTML yorumu kaynak kodda görünür (şablon ya da denetim notu olabilir); yayından önce sil', icerik);
  }
  for (const b of yorumsuz.matchAll(/<(script|style)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)) {
    const bas = b.index + b[0].indexOf('>') + 1;
    const ic = b[2];
    for (const y of ic.matchAll(/\/\*[\s\S]*?\*\//g)) yaz('UYARI', 'betik-notu', satirNo(yorumsuz, bas + y.index), `<${b[1].toLowerCase()}> içinde yorum (kaynak kodda görünür; şablon notu olabilir); yayından önce sil`, y[0]);
    if (b[1].toLowerCase() !== 'script') continue;
    for (const y of ic.replace(/\/\*[\s\S]*?\*\//g, bosalt).matchAll(/(?<![:'"`\\/*])\/\/[^\n]*/g)) yaz('UYARI', 'betik-notu', satirNo(yorumsuz, bas + y.index), '<script> içinde yorum (kaynak kodda görünür; şablon notu olabilir); yayından önce sil', y[0]);
  }
  return { hata, uyari, bulgular };
}

const TARIH = '\\d{1,2}\\.\\d{1,2}\\.\\d{4}';
// Dayanak'taki "Yer tutucu / karar" hücresi ve Değişiklik'teki "Yer tutucular:" satırı: virgülle ayrılmış adlar.
const adNormal = (s) => s.replace(/\(.*?\)/g, '').replace(/[`{}*]/g, '').split(/\s+[—–]\s+/)[0].replace(/\s+/g, ' ').trim();

export function raporKontrolMetin(md, dosya = 'rapor', yazdir = console.log) {
  let hata = 0, uyari = 0;
  const bulgular = [];
  const satirlar = md.split('\n');
  const yaz = (tur, kural, s, mesaj) => { yazdir(`${tur} ${dosya}:${s} [${kural}]: ${mesaj}`); bulgular.push({ tur, kural, satir: s }); if (tur === 'HATA') hata++; else uyari++; };

  if (!/hukuki görüş değildir/iu.test(md)) yaz('HATA', 'hukuki-gorus-satiri', 1, '"Bu rapor hukuki görüş değildir…" satırı yok');

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

  const kararAdlari = [];
  const kararlar = bolum('Kararlar', 'Site sahibinin kararları');
  if (!kararlar) {
    if (/karar gerektiren seçim yok/iu.test(md)) yaz('UYARI', 'kararlar-yok', 1, 'Kararlar bölümü yok (raporda "karar gerektiren seçim yok" yazıyor)');
    else yaz('HATA', 'kararlar-yok', 1, '"## Kararlar" bölümü yok (seçim yoksa raporda "Karar gerektiren seçim yok" yazılır)');
  } else {
    let k = null, sayi = 0;
    const kapat = () => {
      if (!k) return;
      sayi++;
      if (!/^K-/u.test(k.ad)) yaz('HATA', 'karar-basligi', k.satir, `karar başlığı "### K-<Konu>" biçiminde değil: «${k.ad}»`);
      else kararAdlari.push(adNormal(k.ad));
      // Yalnız "Tek yol" olan karar seçim istemez; "Tek yol" ile birlikte Seçenek satırı da varsa (ör. K-Bülten: KVKK sebebi
      // tek yol, bilgilendirme biçimi K/L seçimi) seçim denetlenir.
      if (k.tekYol && !k.secenek) return;
      if (!k.secenek) yaz('HATA', 'secenek-yok', k.satir, `${k.ad}: "- Seçenek" ya da "- Tek yol:" satırı yok`);
      if (!k.oneri) yaz('HATA', 'oneri-yok', k.satir, `${k.ad}: "- Öneri:" satırı yok`);
      if (!k.secimler.length) { yaz('HATA', 'secim-yok', k.satir, `${k.ad}: "- Seçim:" satırı yok`); return; }
      // Bir kararda birden çok seçim satırı olabilir ("- Seçim:" ve "- Seçim (bilgilendirme biçimi):"); her biri denetlenir.
      for (const { etiket, satir } of k.secimler) {
        if (/\[DOĞRULA/u.test(satir)) yaz('UYARI', 'secim-sorulmadi', k.satir, `${k.ad}: ${etiket} henüz sorulmadı ([DOĞRULA])`);
        else if (new RegExp(`varsayılan\\s+öneri.*bilmiyor.*${TARIH}`, 'iu').test(satir)) yaz('UYARI', 'secim-varsayilan', k.satir, `${k.ad}: ${etiket} — site sahibi bilmiyor, varsayılan öneri uygulandı ("Sizden beklenenler"de olmalı)`);
        else if (!new RegExp(`seçen:\\s*site sahibi,\\s*${TARIH}`, 'iu').test(satir)) yaz('HATA', 'secim-bicimi', k.satir, `${k.ad}: ${etiket} satırı geçerli biçimde değil ("seçen: site sahibi, GG.AA.YYYY" ya da "varsayılan öneri — site sahibi bilmiyor, GG.AA.YYYY")`);
      }
    };
    for (let i = kararlar.bas + 1; i < kararlar.son; i++) {
      const l = satirlar[i];
      if (/^#{3,}\s/.test(l)) { kapat(); k = { ad: l.replace(/^#{3,}\s+/, '').trim().slice(0, 60), satir: i + 1, secenek: false, tekYol: false, oneri: false, secimler: [] }; continue; }
      if (!k) continue;
      if (/^\s*-\s*Seçenek\b/u.test(l)) k.secenek = true;
      if (/^\s*-\s*Tek yol:/u.test(l)) k.tekYol = true;
      if (/^\s*-\s*Öneri:/u.test(l)) k.oneri = true;
      const secim = l.match(/^\s*-\s*(Seçim(?:\s*\([^)]*\))?)\s*:/u);
      if (secim) k.secimler.push({ etiket: secim[1], satir: l });
    }
    kapat();
    if (sayi === 0) yaz('HATA', 'karar-yok', kararlar.bas + 1, 'Kararlar bölümünde hiç ### K- kararı yok');
  }

  // Doldurulan yer tutucular: ## Değişiklik bölümündeki "Yer tutucular:" satırları (dosya başına bir satır olabilir).
  const yerTutucular = new Set();
  let listeVar = false;
  const degisiklik = bolum('Değişiklik');
  if (degisiklik) {
    for (let i = degisiklik.bas + 1; i < degisiklik.son; i++) {
      const m = satirlar[i].match(/Yer tutucular\s*:\s*(.*)$/iu);
      if (!m) continue;
      listeVar = true;
      for (const t of m[1].split(/[,;]/)) { const a = adNormal(t); if (/^[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ0-9_]*$/u.test(a)) yerTutucular.add(a); }
    }
  }

  const dayanak = bolum('Dayanak');
  if (!dayanak) yaz('HATA', 'dayanak-yok', 1, '"## Dayanak" bölümü yok');
  else {
    let baslik = null, kaynak = -1, beyan = -1, kimlik = -1, satirSayisi = 0;
    const kimlikler = new Set();
    for (let i = dayanak.bas + 1; i < dayanak.son; i++) {
      const l = satirlar[i].trim();
      if (!l.startsWith('|')) continue;
      const h = l.slice(1, l.endsWith('|') ? -1 : undefined).split('|').map((x) => x.trim());
      if (!baslik) { baslik = h; kaynak = h.findIndex((x) => /^kaynak$/iu.test(x)); beyan = h.findIndex((x) => /bulgu|beyan/iu.test(x)); kimlik = h.findIndex((x) => /^yer\s*tutucu/iu.test(x)); continue; }
      if (h.every((x) => /^:?-{2,}:?$/.test(x))) continue;
      satirSayisi++;
      if (kimlik >= 0) for (const a of (h[kimlik] || '').split(/[,;]/)) { const n = adNormal(a); if (n) kimlikler.add(n); }
      if (kaynak < 0) continue;
      const k = h[kaynak] || '';
      if (!KAYNAK_HUCRE_RE.test(k)) { yaz('HATA', 'kaynak-etiket', i + 1, `Kaynak sütunu izinli etiket değil: «${k}»`); continue; }
      const dogrula = /\[DOĞRULA/u.test(k);
      if (dogrula) yaz('UYARI', 'dayanak-dogrula', i + 1, 'teyit bekleyen satır ([DOĞRULA]); bu cümle siteye yazılmamalı');
      if (beyan >= 0 && !dogrula && !(h[beyan] || '').replace(/[—–-]/g, '').trim()) yaz('HATA', 'bulgu-bos', i + 1, 'Bulgu / beyan sütunu boş: cümlenin kaynağı gösterilmemiş');
    }
    if (kaynak < 0) yaz('HATA', 'kaynak-sutunu-yok', dayanak.bas + 1, 'Dayanak tablosunda "Kaynak" sütunu yok');
    if (satirSayisi === 0) yaz('HATA', 'dayanak-bos', dayanak.bas + 1, 'Dayanak tablosu boş');
    // Her yer tutucu ve her karar Dayanak'ta bir satırda (kural: SKILL.md → Rapor formatı → Dayanak).
    const gerekli = [...new Set([...yerTutucular, ...kararAdlari])];
    if (gerekli.length && satirSayisi > 0) {
      if (kimlik < 0) yaz('HATA', 'dayanak-kimlik-sutunu', dayanak.bas + 1, 'Dayanak tablosunda "Yer tutucu / karar" sütunu yok: her yer tutucu ve her karar bir satırda gösterilir');
      else for (const g of gerekli) if (!kimlikler.has(g)) yaz('HATA', 'dayanak-eslesme', dayanak.bas + 1, `Dayanak tablosunda satırı yok: ${g}`);
    }
  }
  if (!listeVar) yaz('UYARI', 'yer-tutucu-listesi-yok', degisiklik ? degisiklik.bas + 1 : 1, '"## Değişiklik" bölümünde "Yer tutucular:" satırı yok; yer tutucuların Dayanak eşleşmesi denetlenmedi');

  if (/bilinmiyor|varsayılan\s+öneri/iu.test(md) && !bolum('Sizden beklenenler')) yaz('HATA', 'sizden-beklenenler-yok', 1, '"bilinmiyor" ya da varsayılan öneri var ama "## Sizden beklenenler" bölümü yok');

  const dogrula = (md.match(/\[DOĞRULA/gu) || []).length;
  if (dogrula) yazdir(`BİLGİ ${dosya}: ${dogrula} adet [DOĞRULA] — site sahibinden teyit bekleyen nokta`);
  return { hata, uyari, bulgular };
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
