#!/usr/bin/env node
// metin-kontrol.mjs regresyon testi. Model çağrısı ve ağ isteği yapmaz.
//   node metin-kontrol-test.mjs   → her durum için TAMAM/HATA; başarısızlık varsa çıkış kodu 1.
// Her durum hangi kuralın tetiklenmesi gerektiğini kural kimliğiyle söyler: HATA veren kuralların kümesi beklenen
// kümeyle aynı olmalı (fazlası yanlış alarm, eksiği kaçak sayılır). Uyarı beklenen durumda uyarı kümesi de denetlenir.
// Yeni bir hatalı kalıp, kaçak ya da yanlış alarm bulunduğunda buraya bir durum eklenir.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { siteKontrolMetin, raporKontrolMetin } from './metin-kontrol.mjs';

const sessiz = () => {};
let basarisiz = 0, sayi = 0;
const kume = (xs) => [...new Set(xs)].sort();
const ayni = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
// beklenen: { hata: [kural…], uyari?: [kural…] } — H(…) hata, U(…) uyarı (hata yok), GECER (hata yok, uyarıya bakılmaz)
const H = (...kurallar) => ({ hata: kurallar });
const U = (...kurallar) => ({ hata: [], uyari: kurallar });
const GECER = { hata: [] };
function durum(ad, sonuc, beklenen) {
  sayi++;
  const hatalar = kume(sonuc.bulgular.filter((b) => b.tur === 'HATA').map((b) => b.kural));
  const uyarilar = kume(sonuc.bulgular.filter((b) => b.tur === 'UYARI').map((b) => b.kural));
  const tamam = ayni(hatalar, kume(beklenen.hata)) && (!beklenen.uyari || ayni(uyarilar, kume(beklenen.uyari)));
  console.log(`${tamam ? 'TAMAM' : 'HATA '} ${ad} (hata: ${hatalar.join(', ') || '—'}${uyarilar.length ? `; uyarı: ${uyarilar.join(', ')}` : ''})${tamam ? '' : ` — beklenen hata: ${kume(beklenen.hata).join(', ') || '—'}${beklenen.uyari ? `; uyarı: ${kume(beklenen.uyari).join(', ') || '—'}` : ''}`}`);
  if (!tamam) basarisiz++;
}
const site = (html) => siteKontrolMetin(html, 't', sessiz);
const rapor = (md) => raporKontrolMetin(md, 't', sessiz);

// --- site: yakalanması gerekenler
durum('öznitelikte yer tutucu', site('<a href="{{CEREZ_URL}}">Çerez</a>'), H('yer-tutucu'));
durum('data özniteliğinde yer tutucu', site('<div data-consent-version="{{TARIH}}"></div>'), H('yer-tutucu'));
durum('betikte yer tutucu', site('<script>var MAX_MS = {{YENIDEN_SORMA_GUN}} * 1;</script>'), H('yer-tutucu'));
durum('title içinde [DOĞRULA]', site('<p title="[DOĞRULA]">ok</p>'), H('dogrula'));
durum('görünen metinde etiket', site('<p>Dayanak [Kanun].</p>'), H('etiket'));
durum('görünen metinde açıklamalı etiket', site('<p>Süre 365 gün [Rehber: tavsiye — örnek].</p>'), H('etiket'));
durum('boş liste maddesi', site('<ul><li>,</li></ul>'), H('bos-madde'));
for (const [cumle, kural] of [
  ['Siteyi kullanmaya devam ederseniz rıza vermiş sayılırsınız.', ['kullanma-kabul', 'sayilirsiniz']],
  ['Sitemizi kullanmaya devam etmekle bu koşulları kabul etmiş olursunuz.', ['kullanma-kabul']],
  ['Sitemizi ziyaret etmeniz, koşulları kabul ettiğiniz anlamına gelir.', ['kullanma-kabul']],
  ['Siteye girmeniz çerez kullanımını onayladığınız anlamına gelir.', ['kullanma-kabul']],
  ['Sitemizi kullanarak çerez kullanımına izin vermektesiniz.', ['kullanma-kabul']],
  ['Siteyi kullanmanız bu koşulları kabul ettiğiniz anlamına gelir.', ['kullanma-kabul']],
  ['Verileriniz kısa süre saklanır.', ['kisa-sure']],
  ['IP adresiniz kısa süreli olarak tutulur.', ['kisa-sure']],
  ['Kimliği doğrulanamayan başvurular işleme alınmaz.', ['isleme-alinmaz']],
  ['Tedarikçiler veri işleme sözleşmelerine tabidir.', ['veri-isleme-sozlesmesi']],
  ['Sağlayıcılar veri işleyen sıfatıyla hareket eder.', ['veri-isleyen']],
  ['Talep ettiğiniz teklif ticari elektronik ileti sayılmaz.', ['ticari-ileti-hukmu']],
  ['Verileriniz üçüncü kişilerle paylaşılmaz.', ['paylasilmaz']],
  ['Ziyaretler çerezsiz ve anonim olarak ölçülür.', ['anonim']],
  ['Kullanım koşullarını okumuş ve kabul etmiş sayılırsınız.', ['sayilirsiniz']],
  ["Kişisel verileriniz KVKK'nın 9. maddesinde öngörülen şartlara uygun olarak aktarılır.", ['yurt-disi-kesin']],
  ["Chrome'da Ayarlar > Gizlilik > Çerezler menüsünden silebilirsiniz.", ['menu-yolu']],
  ['Aydınlatma metnini okudum, açık rızamın bulunduğunu kabul ederim.', ['riza-gomme']],
  ['Bu metni okudum ve açık rızam bulunduğunu beyan ederim.', ['riza-gomme']],
  ['Formu göndererek açık rıza verdiğimi kabul ediyorum.', ['riza-gomme']],
  ['[dogrula] kaldı', ['dogrula']],
  ['Metin }} artık', ['yer-tutucu-artigi']],
]) durum(`yasak: ${cumle.slice(0, 45)}`, site(`<p>${cumle}</p>`), H(...kural));
durum('yasak kalıp aria-label içinde', site('<button aria-label="Siteyi kullanarak kabul etmiş olursunuz">x</button>'), H('kullanma-kabul'));
for (const [ad, h, kural] of [
  ['betikte yasak kalıp', "<script>bar.textContent='Siteyi kullanmaya devam ederek çerezleri kabul etmiş olursunuz.';</script>", ['kullanma-kabul']],
  ['devam ettiğinizde', '<p>Sitede gezinmeye devam ettiğinizde çerez kullanımını kabul edersiniz.</p>', ['kullanma-kabul']],
  ['kullandığınızda', '<p>Sitemizi kullandığınızda çerezleri kabul etmiş olursunuz.</p>', ['kullanma-kabul']],
  ['gezinerek', '<p>Sitede gezinerek çerezlere onay vermiş olursunuz.</p>', ['kullanma-kabul']],
  ['data-* özniteliğinde yasak', '<div data-mesaj="Siteyi kullanarak kabul etmiş olursunuz"></div>', ['kullanma-kabul']],
  ['aria-description', '<div aria-description="Siteyi kullanarak kabul etmiş olursunuz"></div>', ['kullanma-kabul']],
  ['tek tırnak öznitelik', "<button aria-label='Siteyi kullanarak kabul etmiş olursunuz'>x</button>", ['kullanma-kabul']],
  ['kullanarak kabul + başka cümlede geri al', '<p>Siteyi kullanarak çerezleri kabul etmiş olursunuz. Tercihlerinizi değiştirebilirsiniz.</p>', ['kullanma-kabul']],
  ['kullanarak kabul + sonraki maddede değiştir', '<ul><li>Siteyi kullanarak çerezleri kabul edersiniz</li><li>Tercihlerinizi değiştirebilirsiniz.</li></ul>', ['kullanma-kabul']],
  ['üçüncü şahıslarla', '<p>Bilgileriniz üçüncü şahıslarla paylaşılmaz.</p>', ['paylasilmaz']],
  ['anonim istatistik', '<p>Vercel Web Analytics anonim istatistikler üretir.</p>', ['anonim']],
  ['anonimdir', '<p>Ziyaret verileri çerezsiz olarak toplanır ve anonimdir.</p>', ['anonim']],
  ['Adres: … kalmış', '<li>Adres: …</li>', ['bos-alan']],
  ['<grup> kalmış', '<li>&lt;grup&gt;: talebinizin karşılanması amacıyla</li>', ['ayrac-artigi']],
  ['tek süslü', '<p>{VERI_SORUMLUSU} tarafından</p>', ['ayrac-artigi']],
  ['kısa müddet', '<p>Kayıtlar kısa müddet tutulur.</p>', ['kisa-sure']],
  ['rıza çelişkisi farklı yazım', '<li>Analitik çerezler: açık rızanıza (KVKK md. 5/1) dayanılarak</li><p>Şu an açık rızaya dayanan bir veri işleme faaliyeti bulunmamaktadır.</p>', ['riza-celiskisi']],
  ['kabul edilmiş sayılır', '<p>Bu koşullar yayımlandığı anda kabul edilmiş sayılır.</p>', ['sayilir']],
  ['rızası alınmış kabul edilir', '<p>Formu gönderen kişinin açık rızası alınmış kabul edilir.</p>', ['sayilir']],
]) durum(`son deneme: ${ad}`, site(h), H(...kural));
durum('anonimleştirme yanlış alarm değil', site('<p>IP adresi anonimleştirilir.</p>'), GECER);
durum('href ve src yasak taramasına girmez', site('<a href="https://ornek.com/kullanarak-kabul">bağlantı</a>'), GECER);
durum('çelişki: rıza yok + rıza satırı', site('<li>Reklam çerezleri: açık rızanız (madde 5/1)</li><p>Şu an açık rızaya dayanan bir veri işleme faaliyeti bulunmamaktadır.</p>'), H('riza-celiskisi'));

// --- site: boş öğe, çıplak ad, iç terim, kaynak koddaki notlar (O12), liste sonu virgülü (K9), parantez eki (K11)
durum('boş paragraf ve boş bölüm', site('<h2>10. Veri güvenliği</h2>\n<p> </p>\n<h2>11. Üçüncü taraf siteler</h2><p>Metin.</p>'), H('bos-paragraf', 'bos-bolum'));
durum('boş bölüm (paragraf silinmiş)', site('<h2>10. Veri güvenliği</h2>\n<h2>11. Üçüncü taraf siteler</h2><p>Metin.</p>'), H('bos-bolum'));
durum('boş bölüm (sayfanın sonunda)', site('<h2>11. Üçüncü taraf siteler</h2><p>Metin.</p><h2>12. Güncelleme</h2>'), H('bos-bolum'));
durum('boş liste', site('<p>Haklarınız:</p><ul>\n</ul>'), H('bos-liste'));
durum('çıplak yer tutucu adı', site('<p>Sunucu erişim kayıtları LOG_SURESI tutulur.</p>'), H('ciplak-ad'));
durum('çıplak ad (Türkçe harfli)', site('<p>Metin: BÜYÜK_HARF_ALT_ÇİZGİ.</p>'), H('ciplak-ad'));
durum('çıplak ad öznitelikte', site('<input type="checkbox" data-consent-cookies="ANALITIK_CEREZLERI">'), H('ciplak-ad'));
durum('iç terim: K-Ölçüm', site('<p>Ölçüm K-Ölçüm kararına göre yapılır.</p>'), H('ic-terim'));
durum('iç terim: Seçenek B', site('<p>Bu yöntem için Seçenek B seçilmiştir.</p>'), H('ic-terim'));
durum('iç terim: §6', site('<p>Ayrıntısı §6 altında verilmiştir.</p>'), H('ic-terim'));
durum('iç terim: kvkk-yansima', site('<p>Liste kvkk-yansima çıktısından alınmıştır.</p>'), H('ic-terim'));
durum('iç terimler birlikte', site('<p>Ölçüm K-Ölçüm kararında Seçenek B seçildiği için rızasız yürütülür (bkz. kvkk-yansima §6).</p>'), H('ic-terim'));
durum('liste sonu virgülü', site('<ul><li>Bir,</li><li>İki,</li></ul>'), H('liste-sonu-virgul'));
durum('HTML yorumu uyarı verir ({{ yok)', site('<!-- görüldüğü senaryo: ilk — DİKKAT: rıza gerektiriyor ama ilk açılışta var --><p>Metin.</p>'), U('html-yorumu'));
durum('yorumdaki yer tutucu hata değil, uyarı', site('<!-- {{TARIH}} --><p>Metin.</p>'), U('html-yorumu'));
durum('betikte satır yorumu', site('<script>// Panel varsa aynı değerler kullanılır.\nvar a = 1;</script>'), U('betik-notu'));
durum('betikte blok yorum', site('<script>/* Rehber s. 30: birini öne çıkarma. */ var a = 1;</script>'), U('betik-notu'));
durum('stilde yorum', site('<style>/* Üç düğme aynı sınıf. Birini öne çıkarma. */ .a { color: red; }</style>'), U('betik-notu'));
durum('parantezden sonra ek (\'ye)', site("<p>Logo Ayşe Örnek (Örnek Atölye)'ye aittir.</p>"), U('ek-parantez'));
durum('parantezden sonra ek (\'nin)', site("<p>Ayşe Örnek (Örnek Atölye)'nin sitesidir.</p>"), U('ek-parantez'));

// --- site: geçmesi gerekenler (yanlış alarm olmamalı)
durum('temiz metin', site('<p>Sunucu erişim kayıtları barındırma sağlayıcısının belirlediği süre boyunca tutulur.</p>'), U());
durum('rızayı geri alma cümlesi', site('<p>Sayfanın altındaki bağlantıyı kullanarak tercihlerinizi değiştirebilir, verdiğiniz rızayı geri alabilirsiniz.</p>'), U());
durum('yurt dışı genel cümlesi (eski biçim)', site("<p>Kişisel verileriniz, sitenin barındırılması ve çalıştırılması amacıyla yurt dışında bulunan bulut hizmeti ve yazılım sağlayıcılarına, KVKK'nın 9. maddesine uygun olarak aktarılabilir.</p>"), U());
durum('yurt dışı teknik cümle: kapsamında', site("<p>Kişisel verileriniz, form gönderimlerinin iletilmesi amacıyla yurt dışında bulunan bulut hizmeti ve yazılım sağlayıcılarına, KVKK'nın 9. maddesi kapsamında aktarılabilir.</p>"), U());
durum('yurt dışı teknik cümle: birden çok amaç', site("<p>Kişisel verileriniz, sitenin barındırılması, yazı tiplerinin sunulması, e‑posta yazışmalarının yürütülmesi ve ziyaretlerin ölçülmesi amacıyla yurt dışında bulunan bulut hizmeti ve yazılım sağlayıcılarına, KVKK'nın 9. maddesine uygun olarak aktarılabilir.</p>"), U());
durum('yurt dışı teknik cümle: ek amaçlar', site("<p>Kişisel verileriniz, sitenin güvenli ve hızlı sunulması, formun kötüye kullanıma karşı korunması, site bileşenlerinin sunulması, canlı destek hizmetinin sunulması ve çerez tercihlerinizin yönetilmesi amacıyla yurt dışında bulunan bulut hizmeti ve yazılım sağlayıcılarına, KVKK'nın 9. maddesi kapsamında aktarılabilir.</p>"), U());
durum('yurt dışı ikinci cümle: güvenlik ve destek hizmeti ortakları', site('<p>İzin vermeniz hâlinde, ziyaret istatistikleri, formun kötüye kullanıma karşı korunması ve canlı destek hizmetinin sunulması amacıyla yurt dışında bulunan ölçüm, güvenlik hizmeti ve destek hizmeti ortaklarına da aktarılabilir.</p>'), U());
durum('yurt dışı ikinci cümle: amaçlar ayrı', site('<p>İzin vermeniz ya da içeriği açmanız hâlinde, ziyaret istatistikleri ve reklam amacıyla, ayrıca video gibi gömülü içeriklerin gösterilmesi için yurt dışında bulunan ölçüm, reklam ve içerik ortaklarına da aktarılabilir.</p>'), U());
durum('başvuru: en kısa sürede', site('<p>Başvurular en kısa sürede ve en geç otuz gün içinde sonuçlandırılır.</p>'), U());
durum('anonim hâle getirme', site('<p>Sürenin sonunda silinir, yok edilir veya anonim hâle getirilir.</p>'), U());
durum('E4: ticaret unvanı "Anonim Şirketi"', site('<p>Bu aydınlatma metni, veri sorumlusu sıfatıyla Örnek Teknoloji Anonim Şirketi tarafından hazırlanmıştır.</p>'), U());
durum('E4: "IP adresinizin" (-inizin eki)', site('<p>Siteyi ziyaret ettiğinizde IP adresinizin ve tarayıcı bilginizin kaydı tutulur.</p>'), U());
durum('E4: "verilerinizin" (-inizin eki)', site('<p>Bu siteyi ziyaret ettiğinizde kişisel verilerinizin bir kısmı sitenin çalışması için işlenir.</p>'), U());
durum('E4: "talebinizin" (-inizin eki)', site('<ul><li>Formu kullanarak ilettiğiniz teklif talebinizin değerlendirilmesi,</li><li>Hukuki uyuşmazlıklarda hakların korunması.</li></ul>'), U());
durum('E4: onayı geri alma (istisna eşleşmenin dışında)', site('<p>Her e‑postadaki bağlantıyı kullanarak onayınızı geri alabilirsiniz.</p>'), U());
durum('panel bağlantısıyla izni geri alma', site('<p>Sayfanın altındaki "Çerez Tercihleri" bağlantısını kullanarak izninizi istediğiniz an geri alabilirsiniz.</p>'), U());
durum('toplama yöntemi cümlesi', site('<p>Bu veriler, siteyi ziyaret ettiğinizde tarayıcınıza yerleştirilen çerezler ve benzeri teknolojiler aracılığıyla otomatik yollarla toplanır.</p>'), U());
durum('tıkla-yükle kutu metni (amaçlı)', site("<p>Bu video YouTube'dan yüklenir; yüklendiğinde YouTube, videoyu göstermek ve kendi amaçları (ör. reklam) için çerez kullanır. <a href=\"/cerez\">Ayrıntı: Çerez Aydınlatma Metni</a></p>"), U());
durum('ek parantezden önce (TDK)', site("<p>Örnek Atölye adı ve logosu Ayşe Örnek'e aittir.</p>"), U());
durum('tabloda büyük harfli çerez adları', site('<table><tr><td>VISITOR_INFO1_LIVE</td><td>LOGIN_INFO</td><td>Gömülü içerik</td></tr></table>'), U());
durum('açıklamada çerez adları', site('<p>YouTube çerezleri (VISITOR_INFO1_LIVE, YSC, __Secure-YNID, __Secure-ROLLOUT_TOKEN) içerik yüklenince kullanılır.</p>'), U());
durum('liste: son madde noktalı', site('<ul><li>Bir,</li><li>İki.</li></ul>'), U());
durum('başlık ve alt başlıkla dolu bölüm', site('<h2>3. Teknolojiler</h2><h3>Tablo</h3><table><tr><td>_ga</td></tr></table><h2>4. Tercihler</h2><p>Metin.</p>'), U());
durum('betikte adres (yorum sayılmaz)', site("<script>var u = 'https://ornek.com/a'; var v = '//cdn.ornek.com/b.js';</script>"), U());
durum('"seçenek" sıradan kelime', site('<p>Tercihler düğmesi her kategori için ayrı bir seçenek sunar.</p>'), U());

// --- rapor
const bas = '# R\nBu rapor hukuki görüş değildir.\n';
const degisiklik = (...adlar) => `## Değişiklik\n- kvkk-aydinlatma.html — Yer tutucular: ${adlar.join(', ')}\n`;
const dayanak = (...satirlar) => `## Dayanak\n| # | Yer tutucu / karar | Cümle | Kaynak | Dayanak | Bulgu / beyan |\n|---|---|---|---|---|---|\n${satirlar.map((s, i) => `| ${i + 1} | ${s} | "x" | [Kanun] | md. 5 | K-Form |`).join('\n')}\n`;
const kararlar = '## Kararlar\n### K-Form — Form\n- Elenen: rıza — gerekçe [Kurul kararı]\n- Seçenek A: 5/2-c\n- Seçenek B: 5/2-f\n- Öneri: A, çünkü teklif\n- Seçim: A — seçen: site sahibi, 19.11.2026\n### K-Reklam — Reklam çerezi\n- Tek yol: açık rıza — md. 5/1 [Kanun]\n';
const iyi = `${bas}${degisiklik('LOG_SURESI', 'FORM_SEBEP_C')}${kararlar}${dayanak('LOG_SURESI', 'FORM_SEBEP_C, K-Form', 'K-Reklam')}`;
const eskiDayanak = '## Dayanak\n| # | Cümle | Kaynak | Dayanak | Bulgu / beyan |\n|---|---|---|---|---|\n| 1 | "x" | [Kanun] | md. 5 | K-Form |\n';
durum('iyi rapor', rapor(iyi), U());
durum('seçenek yok, tarih yok', rapor(`${bas}## Kararlar\n### K-Form — x\n- Öneri: A\n- Seçim: A — seçen: site sahibi\n${dayanak('K-Form')}`), H('secenek-yok', 'secim-bicimi'));
durum('#### başlık ve "seçen: asistan"', rapor(`${bas}## Kararlar\n#### K-Form — x\n- Seçenek A: c\n- Öneri: A\n- Seçim: A — seçen: asistan, 19.11.2026\n${dayanak('K-Form')}`), H('secim-bicimi'));
durum('Kararlar alan biçimi (başlık değil)', rapor(`${bas}Kararlar: K-Form, Seçim: A\n${dayanak('LOG_SURESI')}`), H('kararlar-yok'));
durum('Kaynak sütununda etiketsiz değer', rapor(iyi.replace('| [Kanun] |', '| Kanun |')), H('kaynak-etiket'));
durum('Bulgu/beyan boş', rapor(iyi.replace('| md. 5 | K-Form |', '| md. 5 |  |')), H('bulgu-bos'));
durum('bilinmiyor var, Sizden beklenenler yok', rapor(iyi.replace('| [Kanun] |', '| [site sahibi beyanı: bilinmiyor] |')), H('sizden-beklenenler-yok'));
durum('bilinmiyor ve Sizden beklenenler var', rapor(iyi.replace('| [Kanun] |', '| [site sahibi beyanı: bilinmiyor] |') + '## Sizden beklenenler\n- log süresi\n'), U());
durum('varsayılan öneri seçimi', rapor(iyi.replace('- Seçim: A — seçen: site sahibi, 19.11.2026', '- Seçim: varsayılan öneri A — site sahibi bilmiyor, 19.11.2026') + '## Sizden beklenenler\n- form\n'), U('secim-varsayilan'));
durum('hukuki görüş satırı yok', rapor(iyi.replace('Bu rapor hukuki görüş değildir.', '')), H('hukuki-gorus-satiri'));
// K20: her yer tutucu ve her karar Dayanak'ta bir satır
durum('K20: yer tutucunun satırı yok', rapor(`${bas}${degisiklik('LOG_SURESI', 'FORM_SEBEP_C', 'TALEP_SURESI')}${kararlar}${dayanak('LOG_SURESI', 'FORM_SEBEP_C, K-Form', 'K-Reklam')}`), H('dayanak-eslesme'));
durum('K20: kararın satırı yok', rapor(`${bas}${degisiklik('LOG_SURESI', 'FORM_SEBEP_C')}${kararlar}${dayanak('LOG_SURESI', 'FORM_SEBEP_C, K-Form')}`), H('dayanak-eslesme'));
durum('K20: "Yer tutucu / karar" sütunu yok', rapor(`${bas}${degisiklik('LOG_SURESI')}${kararlar}${eskiDayanak}`), H('dayanak-kimlik-sutunu'));
durum('K20: Değişiklik\'te yer tutucu listesi yok (uyarı)', rapor(`${bas}## Değişiklik\n- kvkk-aydinlatma.html: §2 güncellendi\n${kararlar}${dayanak('K-Form', 'K-Reklam')}`), U('yer-tutucu-listesi-yok'));
durum('K20: karar adı başlığıyla yazılmış', rapor(`${bas}${degisiklik('LOG_SURESI')}${kararlar}${dayanak('LOG_SURESI', 'K-Form — Form', '`K-Reklam`')}`), U());

// Küçük 5: Kaynak hücresinde etiketin yanına kısa açıklama
durum('Kaynak: açıklamalı etiket ([Rehber: tavsiye — örnek])', rapor(iyi.replace('| [Kanun] |', '| [Rehber: tavsiye — örnek] |')), U());
// Küçük 10: bir kararda iki seçim satırı (K-Bülten: KVKK sebebi tek yol, bilgilendirme biçimi K/L)
const bulten = (secimler) => `${bas}${degisiklik('BULTEN_SATIRI')}## Kararlar\n### K-Bülten — Bülten\n- Tek yol: açık rıza (md. 5/1) [Kanun]\n- Elenen: tek onay (6563), 5/2-c — öneri açık rıza (R) [skill yorumu]\n- Seçenek K (kilit): aydınlatma açılmadan rıza kutusu etkinleşmez\n- Seçenek L (katmanlı): kısa aydınlatma ve bağlantı\n- Öneri: L, çünkü metin kısa\n${secimler}${dayanak('BULTEN_SATIRI, K-Bülten')}`;
durum('K-Bülten: tek yol + bilgilendirme seçimi', rapor(bulten('- Seçim (bilgilendirme biçimi): L — seçen: site sahibi, 20.11.2026\n')), U());
durum('K-Bülten: iki seçim satırı, ilki tarihsiz', rapor(bulten('- Seçim: iki kutu — seçen: site sahibi\n- Seçim (bilgilendirme biçimi): L — seçen: site sahibi, 20.11.2026\n')), H('secim-bicimi'));
durum('K-Bülten: iki seçim satırı, ikincisi tarihsiz', rapor(bulten('- Seçim: iki kutu — seçen: site sahibi, 20.11.2026\n- Seçim (bilgilendirme biçimi): L — seçen: site sahibi\n')), H('secim-bicimi'));
durum('K-Bülten: tek yol + seçenek, seçim yok', rapor(bulten('')), H('secim-yok'));

// Ö2: her SKILL'in rapor şablonuna harfiyen uyan rapor denetimden geçer. Rapor SKILL'deki şablon ve örnek bloklardan
// kurulur (başlık sırası şablondan; Değişiklik, Dayanak ve Kararlar örnek bloklardan); SKILL değişip denetimle
// ayrışırsa bu durum kırılır. kvkk-site-uyum aynı klasörde değilse onun durumu atlanır.
const dosya = (g) => { const p = fileURLToPath(new URL(g, import.meta.url)); return existsSync(p) ? readFileSync(p, 'utf8') : null; };
const kodBlogu = (metin, bas) => { const i = metin.indexOf('```\n' + bas); if (i < 0) return null; const j = metin.indexOf('\n```', i + 4); return metin.slice(i + 4, j); };
const ornekDoldur = (s, konu = 'Örnek') => s.replace(/\s+\(seçim yoksa:.*$/gm, '').replace(/<Konu>/g, konu).replace(/<GG\.AA\.YYYY>/g, '20.11.2026')
  .replace(/<A\/B>/g, 'A').replace(/<K\/L>/g, 'L').replace(/<[^<>\n]+>/g, 'örnek').replace(/\[etiket\]/g, '[skill yorumu]');
function sablondanRapor(sablon, { ust = '', degisiklik, dayanak, kararlar }) {
  const out = ust ? [ust] : [];
  for (const satir of sablon.split('\n')) {
    const b = satir.match(/^##\s+([^[]+?)\s*(?:\[.*)?$/u);
    if (b) {
      const ad = b[1].trim();
      out.push(`## ${ad}`, ad === 'Değişiklik' ? degisiklik : ad === 'Dayanak' ? dayanak : ad === 'Kararlar' ? kararlar : ad === 'Sizden beklenenler' ? '- Sunucu kayıtlarının süresi: site sahibi bilmiyor' : '- örnek');
    } else if (/^#\s/.test(satir)) out.push(ornekDoldur(satir));
    else if (/hukuki görüş değildir/u.test(satir)) out.push(satir);
    else if (/^[A-ZÇĞİÖŞÜ][\p{L}\d -]*:\s/u.test(satir)) out.push(satir.replace(/:.*$/u, ': örnek'));
  }
  return out.join('\n') + '\n';
}
const parcala = (ornek) => { const i = ornek.indexOf('## Dayanak'); return { degisiklik: ornek.slice('## Değişiklik\n'.length, i).trim(), dayanak: ornek.slice(i + '## Dayanak\n'.length).trim() }; };
const cerezSkill = dosya('../SKILL.md');
const cerezOrnek = parcala(kodBlogu(cerezSkill, '## Değişiklik'));
const bilmiyorumSatiri = (cerezSkill.match(/^`(\| 1 \| LOG_SURESI \|.*\|)`$/mu) || [])[1];
const cerezUst = `# Çerez raporu — ornek.com.tr — 20.11.2026\n${((cerezSkill.match(/şu satır: "([^"]+)"/u) || [])[1] || '').replace(/\s+/gu, ' ')}`;
const cerezParcalar = { ust: cerezUst, degisiklik: cerezOrnek.degisiklik, dayanak: `${cerezOrnek.dayanak}\n${bilmiyorumSatiri.replace('| 1 |', '| 4 |')}`, kararlar: ornekDoldur(kodBlogu(cerezSkill, '## Kararlar').replace(/^## Kararlar\n/u, ''), 'Ölçüm') };
const cerezSablonu = kodBlogu(cerezSkill, '## Sizden beklenenler');
durum('Ö2: cerez-uyum şablonuna uyan rapor', rapor(sablondanRapor(cerezSablonu, cerezParcalar)), GECER);
durum('Ö2: eski cerez şablonu (Sizden beklenenler düz etiket)', rapor(sablondanRapor(cerezSablonu.replace(/^## Sizden beklenenler\s+\[/mu, 'Sizden beklenenler: ['), cerezParcalar)), H('sizden-beklenenler-yok'));
const kvkkSkill = dosya('../../kvkk-site-uyum/SKILL.md'); const kararAgaci = dosya('../../kvkk-site-uyum/references/karar-agaci.md');
if (kvkkSkill && kararAgaci) {
  const kvkkOrnek = parcala(kodBlogu(kvkkSkill, '## Değişiklik'));
  durum('Ö2: kvkk-site-uyum şablonuna uyan rapor', rapor(sablondanRapor(kodBlogu(kvkkSkill, '# KVKK raporu'), { ...kvkkOrnek, kararlar: ornekDoldur(kodBlogu(kararAgaci, '### K-<Konu>'), 'Sunucu') })), GECER);
} else console.log('ATLANDI kvkk-site-uyum şablonuna uyan rapor (kvkk-site-uyum aynı klasörde değil)');

console.log(basarisiz ? `\n${basarisiz}/${sayi} durum başarısız` : `\nBütün durumlar geçti (${sayi} durum)`);
process.exit(basarisiz ? 1 : 0);
