#!/usr/bin/env node
// metin-kontrol.mjs regresyon testi. Model çağrısı ve ağ isteği yapmaz.
//   node metin-kontrol-test.mjs   → her durum için TAMAM/HATA; başarısızlık varsa çıkış kodu 1.
// Yeni bir hatalı kalıp ya da kaçak bulunduğunda buraya bir durum eklenir.

import { siteKontrolMetin, raporKontrolMetin } from './metin-kontrol.mjs';

const sessiz = () => {};
let basarisiz = 0;
function durum(ad, sonuc, beklenenHata) {
  const tamam = beklenenHata ? sonuc.hata > 0 : sonuc.hata === 0;
  console.log(`${tamam ? 'TAMAM' : 'HATA '} ${ad} (hata: ${sonuc.hata})`);
  if (!tamam) basarisiz++;
}
const site = (html) => siteKontrolMetin(html, 't', sessiz);
const rapor = (md) => raporKontrolMetin(md, 't', sessiz);

// --- site: yakalanması gerekenler
durum('öznitelikte yer tutucu', site('<a href="{{CEREZ_URL}}">Çerez</a>'), true);
durum('data özniteliğinde yer tutucu', site('<div data-consent-version="{{TARIH}}"></div>'), true);
durum('betikte yer tutucu', site('<script>var MAX_MS = {{YENIDEN_SORMA_GUN}} * 1;</script>'), true);
durum('title içinde [DOĞRULA]', site('<p title="[DOĞRULA]">ok</p>'), true);
durum('görünen metinde etiket', site('<p>Dayanak [Kanun].</p>'), true);
durum('boş liste maddesi', site('<ul><li>,</li></ul>'), true);
for (const cumle of [
  'Siteyi kullanmaya devam ederseniz rıza vermiş sayılırsınız.',
  'Sitemizi kullanmaya devam etmekle bu koşulları kabul etmiş olursunuz.',
  'Sitemizi ziyaret etmeniz, koşulları kabul ettiğiniz anlamına gelir.',
  'Siteye girmeniz çerez kullanımını onayladığınız anlamına gelir.',
  'Sitemizi kullanarak çerez kullanımına izin vermektesiniz.',
  'Siteyi kullanmanız bu koşulları kabul ettiğiniz anlamına gelir.',
  'Verileriniz kısa süre saklanır.',
  'IP adresiniz kısa süreli olarak tutulur.',
  'Kimliği doğrulanamayan başvurular işleme alınmaz.',
  'Tedarikçiler veri işleme sözleşmelerine tabidir.',
  'Sağlayıcılar veri işleyen sıfatıyla hareket eder.',
  'Talep ettiğiniz teklif ticari elektronik ileti sayılmaz.',
  'Verileriniz üçüncü kişilerle paylaşılmaz.',
  'Ziyaretler çerezsiz ve anonim olarak ölçülür.',
  'Kullanım koşullarını okumuş ve kabul etmiş sayılırsınız.',
  "Kişisel verileriniz KVKK'nın 9. maddesinde öngörülen şartlara uygun olarak aktarılır.",
  "Chrome'da Ayarlar > Gizlilik > Çerezler menüsünden silebilirsiniz.",
  '[dogrula] kaldı',
  'Metin }} artık',
]) durum(`yasak: ${cumle.slice(0, 45)}`, site(`<p>${cumle}</p>`), true);
durum('yasak kalıp aria-label içinde', site('<button aria-label="Siteyi kullanarak kabul etmiş olursunuz">x</button>'), true);
for (const [ad, h] of [
  ['betikte yasak kalıp', "<script>bar.textContent='Siteyi kullanmaya devam ederek çerezleri kabul etmiş olursunuz.';</script>"],
  ['devam ettiğinizde', '<p>Sitede gezinmeye devam ettiğinizde çerez kullanımını kabul edersiniz.</p>'],
  ['kullandığınızda', '<p>Sitemizi kullandığınızda çerezleri kabul etmiş olursunuz.</p>'],
  ['gezinerek', '<p>Sitede gezinerek çerezlere onay vermiş olursunuz.</p>'],
  ['data-* özniteliğinde yasak', '<div data-mesaj="Siteyi kullanarak kabul etmiş olursunuz"></div>'],
  ['aria-description', '<div aria-description="Siteyi kullanarak kabul etmiş olursunuz"></div>'],
  ['tek tırnak öznitelik', "<button aria-label='Siteyi kullanarak kabul etmiş olursunuz'>x</button>"],
  ['üçüncü şahıslarla', '<p>Bilgileriniz üçüncü şahıslarla paylaşılmaz.</p>'],
  ['anonim istatistik', '<p>Vercel Web Analytics anonim istatistikler üretir.</p>'],
  ['anonimdir', '<p>Ziyaret verileri çerezsiz olarak toplanır ve anonimdir.</p>'],
  ['Adres: … kalmış', '<li>Adres: …</li>'],
  ['<grup> kalmış', '<li>&lt;grup&gt;: talebinizin karşılanması amacıyla</li>'],
  ['tek süslü', '<p>{VERI_SORUMLUSU} tarafından</p>'],
  ['kısa müddet', '<p>Kayıtlar kısa müddet tutulur.</p>'],
  ['rıza çelişkisi farklı yazım', '<li>Analitik çerezler: açık rızanıza (KVKK md. 5/1) dayanılarak</li><p>Şu an açık rızaya dayanan bir veri işleme faaliyeti bulunmamaktadır.</p>'],
  ['kabul edilmiş sayılır', '<p>Bu koşullar yayımlandığı anda kabul edilmiş sayılır.</p>'],
  ['rızası alınmış kabul edilir', '<p>Formu gönderen kişinin açık rızası alınmış kabul edilir.</p>'],
]) durum(`son deneme: ${ad}`, site(h), true);
durum('anonimleştirme yanlış alarm değil', site('<p>IP adresi anonimleştirilir.</p>'), false);
durum('href ve src yasak taramasına girmez', site('<a href="https://ornek.com/kullanarak-kabul">bağlantı</a>'), false);
durum('çelişki: rıza yok + rıza satırı', site('<li>Reklam çerezleri: açık rızanız (madde 5/1)</li><p>Şu an açık rızaya dayanan bir veri işleme faaliyeti bulunmamaktadır.</p>'), true);

// --- site: geçmesi gerekenler (yanlış alarm olmamalı)
durum('temiz metin', site('<p>Sunucu erişim kayıtları barındırma sağlayıcısının belirlediği süre boyunca tutulur.</p>'), false);
durum('rızayı geri alma cümlesi', site('<p>Sayfanın altındaki bağlantıyı kullanarak tercihlerinizi değiştirebilir, verdiğiniz rızayı geri alabilirsiniz.</p>'), false);
durum('yurt dışı genel cümlesi', site("<p>Kişisel verileriniz, sitenin barındırılması ve çalıştırılması amacıyla yurt dışında bulunan bulut hizmeti ve yazılım sağlayıcılarına, KVKK'nın 9. maddesine uygun olarak aktarılabilir.</p>"), false);
durum('başvuru: en kısa sürede', site('<p>Başvurular en kısa sürede ve en geç otuz gün içinde sonuçlandırılır.</p>'), false);
durum('anonim hâle getirme', site('<p>Sürenin sonunda silinir, yok edilir veya anonim hâle getirilir.</p>'), false);
durum('yorumdaki yer tutucu hata değil', site('<!-- {{TARIH}} --><p>Metin.</p>'), false);

// --- rapor
const bas = '# R\nBu rapor hukuki görüş değildir.\n';
const dayanak = '## Dayanak\n| # | Cümle | Kaynak | Dayanak | Bulgu / beyan |\n|---|---|---|---|---|\n| 1 | "x" | [Kanun] | md. 5 | K-Form |\n';
const iyi = `${bas}## Kararlar\n### K-Form — Form\n- Elenen: rıza — gerekçe [Kurul kararı]\n- Seçenek A: 5/2-c\n- Seçenek B: 5/2-f\n- Öneri: A, çünkü teklif\n- Seçim: A — seçen: site sahibi, 19.11.2026\n### K-Reklam — Reklam çerezi\n- Tek yol: açık rıza — md. 5/1 [Kanun]\n${dayanak}`;
durum('iyi rapor', rapor(iyi), false);
durum('seçenek yok, tarih yok', rapor(`${bas}## Kararlar\n### K-Form — x\n- Öneri: A\n- Seçim: A — seçen: site sahibi\n${dayanak}`), true);
durum('#### başlık ve "seçen: Core"', rapor(`${bas}## Kararlar\n#### K-Form — x\n- Seçenek A: c\n- Öneri: A\n- Seçim: A — seçen: Core, 19.11.2026\n${dayanak}`), true);
durum('Kararlar alan biçimi (başlık değil)', rapor(`${bas}Kararlar: K-Form, Seçim: A\n${dayanak}`), true);
durum('Kaynak sütununda etiketsiz değer', rapor(iyi.replace('| [Kanun] |', '| Kanun |')), true);
durum('Bulgu/beyan boş', rapor(iyi.replace('| md. 5 | K-Form |', '| md. 5 |  |')), true);
durum('bilinmiyor var, Sizden beklenenler yok', rapor(iyi.replace('| [Kanun] |', '| [site sahibi beyanı: bilinmiyor] |')), true);
durum('bilinmiyor ve Sizden beklenenler var', rapor(iyi.replace('| [Kanun] |', '| [site sahibi beyanı: bilinmiyor] |') + '## Sizden beklenenler\n- log süresi\n'), false);
durum('varsayılan öneri seçimi', rapor(iyi.replace('- Seçim: A — seçen: site sahibi, 19.11.2026', '- Seçim: varsayılan öneri A — site sahibi bilmiyor, 19.11.2026') + '## Sizden beklenenler\n- form\n'), false);
durum('hukuki görüş satırı yok', rapor(iyi.replace('Bu rapor hukuki görüş değildir.', '')), true);

console.log(basarisiz ? `\n${basarisiz} durum başarısız` : '\nBütün durumlar geçti');
process.exit(basarisiz ? 1 : 0);
