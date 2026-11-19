# Çerez Uygulamaları Hakkında Rehber — çalışma özeti

Kaynak: Kişisel Verileri Koruma Kurumu, *Çerez Uygulamaları Hakkında Rehber*,
KVKK Yayınları No: 69, Temmuz 2025, Ankara. Resmî metin: www.kvkk.gov.tr
(Yayınlar / Rehberler). Sayfa numaraları kitabın basılı numaralarıdır.

Bu dosya kendi özetimizdir; Rehber'in metni aynen aktarılmaz (kitapta
bireysel kullanım dışında çoğaltma yasağı var, s. 3). Kullanıcıya alıntı
gerekiyorsa sayfa numarası ver, resmî PDF'e yönlendir.

Rehber tavsiye niteliğindedir (s. 9). Bağlayıcı olan Kanun, yönetmelikler ve tebliğlerdir; Kurul kararları, Kurul'un uygulamasını gösterir.

**Etiketler.** Her kuralın yanında kaynak türü durur (SKILL.md → Üç kaynak ve
etiketler). Rehber "gerekmektedir / gerekli" diyorsa `[Rehber: gerekli]`;
"iyi uygulama / tavsiye / değerlendirilebilir / sayılabilir" diyorsa
`[Rehber: tavsiye]`. Fiil resmî metinden doğrulandıysa tırnakla verilir.
Fiili burada verilmeyen Rehber kuralları, Rehber'in kendini tavsiye niteliğinde
saymasına (s. 9) dayanarak `[Rehber: tavsiye]` sayılır [skill yorumu]. Aynı
kural Kanun, tebliğ ya da Kurul kararına da dayanıyorsa o etiket ayrıca yazılır.

## İçindekiler

1. Kapsam — neyi kapsar, neyi kapsamaz
2. Çerez türleri
3. 5809 EHK ile ilişki
4. Kriter A / Kriter B ve işleme şartları
5. Rıza gerektirmeyen senaryolar (5.1–5.10)
6. Rıza gerektiren senaryolar (6.1–6.2)
7. Açık rızanın unsurları ve şerit/panel tasarımı
8. Yurt dışına aktarım
9. Aydınlatma
10. Kurul kararı 2020/173
11. Ekler: kontrol listesi, iyi ve kötü örnekler
12. Rehber'in söylemedikleri — site sahibinin kararına kalanlar

---

## 1. Kapsam (s. 9, 10 dipnot 1–2)

- Yalnız **kişisel veri işlenen çerezler**. Kişisel veri işlemeyen çerez kapsam dışı.
- **Piksel, kullanıcı parmak izi (fingerprint), local storage, beacon gibi
  benzer teknolojiler için yönlendirme YOK.** Bunları "Rehber gereği" diye
  sınıflama; en yakın çerez senaryosuna benzetme yap ve bunu açıkça
  "benzetme" olarak, `[skill yorumu]` etiketiyle yaz. Ölçüm aracıysa
  `analitik.md` → Kural 2 ve K-Ölçüm kararı.
- Masaüstü ve mobil web siteleri ile web uygulamaları kapsanır. Terminal
  ekipman (akıllı TV, giyilebilir) için alternatif aydınlatma/rıza yöntemi
  gerekir (s. 30 dipnot 11).

## 2. Çerez türleri (s. 10–13)

Tanım: site operatörünün kullanıcı cihazına yerleştirdiği, HTTP(S) isteğinin
parçası olarak taşınan küçük metin dosyası.

| Eksen | Türler | Not |
|---|---|---|
| Süre (s. 11) | Oturum / Kalıcı | Kalıcı çerez her ziyarette veriyi sunucuya taşır; bu yüzden "izleme çerezi" de denir |
| Amaç (s. 11–13) | Kesinlikle gerekli (zorunlu) / İşlevsel / Performans-analitik / Reklam-pazarlama | Zorunlu çerez pazarlamada kullanılmamalı [Rehber: tavsiye]. İşlevsel çerezde, kullanıcının hizmeti açıkça talep ettiği aşikâr değilse rıza gerekir [Rehber: tavsiye] |
| Taraf (s. 13) | Birinci taraf / Üçüncü taraf | Adres çubuğundaki alan adı mı, farklı alan adı mı |

## 3. 5809 sayılı Elektronik Haberleşme Kanunu (s. 14–15)

EHK md. 51/3 yalnız **işletmecileri** (BTK yetkili elektronik haberleşme
şirketleri) bağlar [Kanun]. Diğer site operatörleri için çerezler 6698 sayılı KVKK
kapsamında değerlendirilir (s. 15) [Rehber: tavsiye]. İşletmeci değilsen EHK'yi dayanak gösterme.

## 4. Kriterler ve işleme şartları (s. 16–18)

Rehber iki kriteri tavsiye olarak sunar (s. 16) [Rehber: tavsiye]:

- **Kriter A:** çerez yalnızca iletişimin elektronik haberleşme şebekesi
  üzerinden sağlanması için kullanılıyor.
- **Kriter B:** çerez, kullanıcının açıkça talep ettiği bilgi toplumu hizmeti
  için kesinlikle gerekli.
- Sıra: önce açık rıza dışındaki şartlar (KVKK md. 5/2, 6) değerlendirilir;
  hiçbiri yoksa açık rıza (s. 16–17, s. 38) [Kurul kararı]. Rıza dışı bir şart varken rıza istemek dürüstlük
  kuralına aykırı sayılabilir (s. 38, EK-5 Kötü Örnek-1) [Kurul kararı].
- 5/2-f (meşru menfaat) dayanılıyorsa **denge testi** önerilir; Kriter A/B
  kapsamı yol gösterir (s. 17) [Rehber: tavsiye].
- Örnekler: yük dengeleme çerezi → Kriter A, 5/2-f (s. 17); sepete ürün
  ekleme → 5/2-c sözleşme (s. 18) [Rehber: tavsiye].

## 5. Rıza gerektirmeyen senaryolar (s. 18–26) — liste sınırlayıcı değil

| § | Senaryo | Kriter | Koşullar / dikkat |
|---|---|---|---|
| 5.1 (s. 18–19) | Kullanıcı girdili (form, sepet) | B | Birinci taraf, oturum kimliğine bağlı, en geç oturum sonunda biter [Rehber: tavsiye] |
| 5.2 (s. 19–20) | Kimlik doğrulama | B | Oturum çerezi. Tarayıcı oturumları arası kalıcı giriş Kriter B **değil** → "beni hatırla" kutusu. İkincil amaçla (takip) kullanılamaz [Rehber: tavsiye] |
| 5.3 (s. 20–21) | Kullanıcı merkezli güvenlik (başarısız giriş tespiti) | B | Daha uzun ömür olabilir [Rehber: tavsiye] |
| 5.4 (s. 21) | Multimedya oynatıcı oturum çerezi | B | Oturum sonunda biter; kullanıcı içeriği açıkça istedi [Rehber: tavsiye] |
| 5.5 (s. 21–22) | Yük dengeleme oturum çerezi | A | Tek amaç sunucu uç noktası [Rehber: tavsiye] |
| 5.6 (s. 22–23) | Arayüz kişiselleştirme (dil, sonuç sayısı) | B | Kullanıcının açık eylemiyle (buton/kutu) konur; kalıcı kimlikle bağlanmaz; ek bilgi yoksa oturumdan uzun hatırlama niyeti varsayılmaz [Rehber: tavsiye] |
| 5.7 (s. 23–24) | Sosyal eklenti içerik paylaşımı | B yalnız **oturum açmış üyeler** için | Üye olmayan / çıkış yapmış kişiler için rıza; oturum çerezi olmalı [Rehber: tavsiye] |
| 5.8 (s. 24) | Rıza yönetim platformu çerezi (tercihi hatırlama) | B | Rıza gerekmez; ömrü md. 4 ilkelerine göre (Rehber örneğinde 365 gün, s. 52) [Rehber: tavsiye] |
| 5.9 (s. 24–26) | **Birinci taraf analitik** | B | Gerekli (s. 25, "gerekmektedir") [Rehber: gerekli]: amaç yalnız sitenin kendi kitlesini/performansını ölçmek, veri amaçla sınırlı ve ölçülü; yalnız anonim istatistik; siteler/uygulamalar arası **çapraz takip yok**. Tavsiye (s. 25, "tavsiye edilmektedir") [Rehber: tavsiye]: gereksiz veri anonim (ör. IP maskeleme). Tedbir (s. 26, "tedbirler arasında sayılabilir") [Rehber: tavsiye]: makul ömür; **toplanan verinin üçüncü taraflara iletilmemesi**. Skill bu tedbiri şart olarak uygular: rızasız yol yalnız kendi sunucusunda çalışan araçla, veri bir sağlayıcıya gidiyorsa rıza paneli [skill yorumu]. Rehber üçüncü tarafa iletmemeyi tedbir sayar (s. 26); skill bunu şart olarak uygular, yani Rehber'den sıkıdır. Uygulama: `analitik.md` → Kural 1 |
| 5.10 (s. 26) | Site güvenliği (WAF, istek sınırlama) | B | 5/2-f'ye dayanılabilir [Rehber: tavsiye] |

## 6. Rıza gerektiren senaryolar (s. 27–28)

Başka işleme şartı olmadığı için açık rıza (md. 5/1) [Kanun]; senaryolar Rehber'in değerlendirmesidir [Rehber: tavsiye].

- 6.1 Sosyal eklenti **takip** çerezleri (davranışsal reklam, analitik, pazar
  araştırması için üye/üye olmayanı izleme). Üye olmayanlara gösterilen
  sayfalarda varsayılan olarak üçüncü taraf çerez yerleştirilmemeli.
- 6.2 Davranışsal reklamcılık çerezleri — gösterim sıklığı, finansal kayıt,
  reklam ortaklığı, tıklama sahtekârlığı tespiti, pazar analizi, ürün
  geliştirme ve hata ayıklama amaçlı reklam çerezleri **dahil**.

## 7. Açık rızanın unsurları ve arayüz (s. 28–33)

- Aktif, olumlayıcı eylem. **Siteye girmek rıza değildir** (s. 28) [Rehber: tavsiye];
  Kurul 2020/173'te "siteyi ziyaret ederek kabul" kalıbı da bu yüzden eleştirildi (s. 38–39) [Kurul kararı].
  Opt-in, opt-out değil (s. 37–38) [Kurul kararı].
- **Belirli konu** (s. 29): her çerez için amaç, amaçla ölçülü süre ve
  birinci/üçüncü taraf belirtilir. "Kişisel verilerimin işlenmesini kabul
  ediyorum" gibi açık uçlu rıza geçersiz. Açık rıza tanımı "belirli bir konuya
  ilişkin" rıza ister (md. 3/1-a) [Kanun]; Rehber'in uygulaması [Rehber: tavsiye].
- **Özgür irade** (s. 29–31):
  - Rıza her an geri alınabilmeli; yönetim paneline erişim sürekli olmalı (s. 29) —
    iyi örnek: içeriği engellemeyen küçük simge/bant (s. 30) [Rehber: tavsiye].
  - Rıza yorgunluğu: her girişte sorma; çerez ömrüyle orantılı periyodik
    hatırlatma uygun (s. 30) [Rehber: tavsiye]. Rehber gün sayısı vermez;
    yeniden sorma süresini site sahibi belirler; bilmiyorsa ölçülen ömür, yoksa
    skill'in varsayılan önerisi 365 gün (EK-4 örneği, s. 52) (SKILL.md → K-Yeniden sorma).
  - İlk katman: siteye girişte panel (pop-up/bant); **"Kabul et", "Reddet"
    ve "Tercihler" eşit derecede (renk, büyüklük, punto)** — Rehber bunu
    "iyi uygulama örneği olabilecektir" diye yazar (s. 30) [Rehber: tavsiye];
    üç düğmenin yokluğu EK-5'te kötü örnektir (s. 54–57) [Rehber: tavsiye].
  - Panelde aydınlatmaya bağlantı — "doğru uygulama örneği" (s. 30–31) [Rehber: tavsiye].
  - Rıza gerektiren çerezler panelde **varsayılan kapalı** — Rehber "önem arz
    etmektedir" der (s. 31) [Rehber: tavsiye]; opt-in (s. 37–38) [Kurul kararı].
  - Reklam çerezi rızası kullanım koşulları / gizlilik bildirimine
    iliştirilemez (bundled consent yok); sözleşmenin ön koşulu yapılamaz (s. 31) [Rehber: tavsiye].
  - Her farklı amaç için ayrı rıza mekanizması (s. 40) [Kurul kararı]; EK-5 Örnek-2 (s. 55, "önerilir") [Rehber: tavsiye].
- **Çerez duvarı** (s. 31–32): rıza hizmetin ön koşulu yapılırsa özgür irade
  sakatlanabilir; olay bazında, adil alternatif sunuluyorsa değerlendirilebilir
  [Rehber: tavsiye]. Skill çerez duvarı önermez; adil alternatifi tanımlamaz
  (metin-kurallari.md → Çerez duvarı).
- **Tarafların sorumluluğu** (s. 32–33): üçüncü taraf çerezde site sahibi ve
  üçüncü taraf birlikte bilgilendirme/rızadan sorumlu; sözleşmeye hüküm
  konulabilir [Rehber: tavsiye].

## 8. Yurt dışına aktarım (s. 33–35)

- KVKK md. 9 sırası: (1) md. 5/6 şartı + **yeterlilik kararı**; (2) yoksa
  md. 5/6 şartı + ilgili kişinin orada hak arama imkânı + **uygun güvence**
  (md. 9/4); (3) ikisi de yoksa yalnız **arızi** hâller (md. 9/6) [Kanun].
- Yönetmelik: Kişisel Verilerin Yurt Dışına Aktarılmasına İlişkin Usul ve
  Esaslar Hakkında Yönetmelik, RG 10.07.2024/32598 [Yönetmelik].
- Yurt dışı şirketler aracılığıyla çerez kullanılıyorsa aktarım md. 9 ve
  Yönetmeliğe uygun olmalı; Kurum'un Yurt Dışına Aktarım Rehberi de dikkate
  alınabilir (s. 34–35; Rehber "dikkate alınabilecektir" der) [Rehber: tavsiye].
- Rehber'de yazmayan ama md. 9/5'te olan: **standart sözleşmeye dayanılırsa
  imzadan itibaren 5 iş günü içinde Kurum'a bildirim** [Kanun]. Raporda K-Yurt dışı
  kararında site sahibine sor; yapılıp yapılmadığını varsayma.
- Uygulama kuralları (sağlayıcıları ad, ülke ve amaçla listeleme, önce
  azaltma, metinde genel cümle, yol belirlenmezse raporda uyum engeli, arızi
  hâllerin elenmesi, çerez rızasının aktarım rızası sayılmaması): SKILL.md →
  Sınıflama → Yurt dışı.

## 9. Aydınlatma (s. 35–37)

- KVKK md. 10 + Aydınlatma Tebliği. Hangi hukuki sebep olursa olsun, **en geç
  veri elde edilirken** aydınlatma; ispat yükü veri sorumlusunda (s. 35) [Kanun] + [Tebliğ].
- Açık rıza ile aydınlatma **ayrı ayrı** (Tebliğ 5/1-f) (s. 35–36) [Tebliğ].
- Kolay erişilebilir, fark edilebilir; açık, sade, anlaşılır. Karmaşık ve
  başka konularla dolu "Gizlilik Bildirimi" aydınlatma sayılmaz (s. 36) [Rehber: tavsiye];
  Kurul 2020/173'te de Gizlilik Bildirimi aydınlatma ve rıza yerine geçmedi (s. 38–39) [Kurul kararı].
- Ziyaretle birlikte veri işlenmeye başlanıyorsa aydınlatma **siteye giriş
  aşamasında** yapılır (ör. pop-up/bant); Rehber bunu "gerekmekte" diye yazar,
  yapılmazsa aykırılık gündeme gelebilir (s. 36) [Rehber: gerekli].
- Sunucu kayıtları (IP) de ziyaretle başlayan işlemedir; çerez olmasa da
  girişte bilgilendirme önermek için gerekçe [skill yorumu: s. 36 ve s. 39'dan
  genişletme — s. 36 çerez bağlamında konuşur; s. 39'daki "farklı veri işleme
  araçları" ifadesi geniş okumayı destekler].
- Aydınlatma metninde **çerezin adı, kullanım amacı, süresi, birinci/üçüncü
  taraf** bilgisi tavsiye edilir (s. 36, "tavsiye olunur") [Rehber: tavsiye].
- Hedef kitle çocuksa algı düzeyine uygun dil (s. 37) [Rehber: tavsiye].

## 10. Kurul kararı 27.02.2020, 2020/173 (s. 37–40)

Kararın kendi metni bu pakette yok; aşağıdakiler Rehber'deki anlatımına dayanır.

- Kararda geçen ifade "…ziyaret ederek işbu Gizlilik Bildiriminde belirtilen
  uygulamaları kabul…" kalıbındadır. Kararda iki ayrı bulgu var:
  1. Bu ifade, aydınlatma yapılırken aynı anda rıza alındığı izlenimi
     yaratır; Gizlilik Bildirimi aydınlatma ve rıza yerine geçmez (s. 38–39) [Kurul kararı].
  2. "Hem rıza şartına hem aydınlatmaya aykırılık" sonucu, girişte
     bilgilendirmenin ve izin isteminin hiç olmamasına dayanır (s. 39) [Kurul kararı].
- Rıza dışı sebep varken rıza istemek dürüstlük kuralına aykırı; rıza
  gereken yerde aydınlatma ile rıza birlikte yapılamaz [Kurul kararı].
- Siteye girildiği anda veri işleniyorsa girişte bilgilendirme yoksa aykırılık [Kurul kararı].
- Her farklı amaç için ayrı rıza mekanizması [Kurul kararı].
- Çerezlerde açık rıza dışında hukuki sebebe de dayanılabilir [Kurul kararı].

## 11. Ekler

### EK-1 Kontrol listesi (s. 44–45) — raporda bunu kullan

Rehber listeyi "örnek mahiyetinde" verir (dn. 15) [Rehber: tavsiye].

1. Anlamak: çerez nedir; oturum/kalıcı farkı; birinci/üçüncü taraf farkı.
2. Denetlemek: hangi çerezler var; gereksizler kaldırıldı mı; her çerezin
   amacı, işlediği veri, oturum/kalıcı, taraf, süre ve sürenin Kanun'a
   uygunluğu; kesinlikle gerekli olan/olmayan ayrımı.
3. Aydınlatma: net, kolay anlaşılır; kişisel veri işleyen tüm çerezleri kapsar.
4. Rıza: gerekli olmayan tüm çerezler için kullanıcı kontrolü; mekanizma
   Kanun'a uygun; rıza kaydı uygun süre saklanır.
5. Belgeleme: hepsi belgelendi; gözden geçirme periyodu belirlendi.

### EK-2 İyi örnek — ilk katman bant (s. 46) [Rehber: tavsiye]

Kısa metin: çerezlerle kişisel veri işlendiğini, gerekli çerezlerin hangi
amaçla, diğerlerinin rıza hâlinde hangi amaçlarla kullanılacağını söyler;
aydınlatma metni bağlantısı; üç eşit buton: **Hepsini Kabul Et / Hepsini
Reddet / Çerez Ayarlarını Yapılandır.**

### EK-3 İyi örnek — ikinci katman panel (s. 47) [Rehber: tavsiye]

Kategori satırları (Zorunlu — her zaman açık, açıklama, taraf, süre;
Reklam/Pazarlama — kapalı; İşlevsel — kapalı), aydınlatma bağlantısı,
**Hepsine İzin Ver / Hepsini Reddet / Ayarları Kaydet**.

### EK-4 Örnek Çerez Aydınlatma Metni (s. 48–53) — yapı [Rehber: tavsiye]

1. Kanun md. 10 + Tebliğ kapsamında veri sorumlusunun hazırladığı giriş.
2. Metnin amacı: hangi çerezler, hangi amaçla, nasıl yönetilir.
3. Zorunlu dışındakiler için rıza alındığı ve panelden değiştirilebildiği.
4. Çerez çeşitleri: süreye, tarafa, amaca göre.
5. Amaçlar ve hukuki sebepler — kategori bazında (zorunlu → 5/2-c veya
   5/2-f; reklam ve işlevsel → açık rıza md. 5/1).
6. Tablo: çerez adı, amacı, tipi (birinci/üçüncü taraf, hangi şirket),
   saklama süresi.
7. İlgili kişi talepleri: md. 11 hakları, Başvuru Tebliği'ne göre adres/e-posta.
8. Tarayıcı ayarları: panel simgesi + tarayıcıların **yardım sayfası
   bağlantıları** (menü yolu yazma; sürümle değişir).

Not: Örnekte birinci taraf analitik çerez "zorunlu" grubunda gösterilmiş
(5.9 ile tutarlı).

### EK-5 Kötü örnekler (s. 54–57) — şerit denetiminde kontrol et [Rehber: tavsiye]

1. Yalnız "Tüm çerezleri kabul et" butonu; "daha fazla bilgi" bağlantısının
   aydınlatma mı panel mi olduğu belirsiz; temel işlevsellik (Kriter A/B)
   için bile rıza istenmiş.
2. Farklı amaçlar (analiz, sosyal medya, reklam) tek "Kabul ediyorum"a
   bağlanmış; "Reddediyorum" ve "Tercihleri Yapılandır" yok, eşit görünüm yok.
3. Panelde rıza gerektiren kategoriler **önceden açık** (opt-out).
4. "Sitemizi kullanarak çerez kullanımına izin vermektesiniz" — geçersiz;
   amaç ve taraf bantta kısaca yazılmalı; üç buton yok.

## 12. Rehber'in söylemedikleri — site sahibinin kararına kalanlar

- Local storage, beacon, piksel, fingerprint: yönlendirme yok (s. 9).
  Çerezsiz ama cihazdan bilgi okuyup sağlayıcıya gönderen ölçüm betiklerinde
  (ör. Cloudflare Web Analytics) skill'in kuralı üç şarttır: ölçüm çerezsiz,
  birey düzeyinde kayıt yok, sağlayıcı veriyi yalnız site sahibi adına işler
  [skill yorumu: Rehber 5.9'a benzetme]. Ayrıntı: `analitik.md` → Kural 2;
  karar: K-Ölçüm. Raporda bunun benzetme olduğu söylenir.
- Rıza kaydının sunucuda tutulup tutulmayacağı: EK-1 "rıza kaydını uygun
  süre saklıyoruz" der (rıza için, s. 45) [Rehber: tavsiye]; karar: K-Rıza kaydı.
  Bilgi şeridi (rıza yok) için kayıt zorunluluğu yok; okudum beyanı alınmaz,
  tıklama sunucuya kaydedilmez; aydınlatmanın ispatı yöntemle (kod/sürüm
  geçmişi) yapılır [skill yorumu].
- Yurt dışı aktarımın somut yolu ve md. 9/5 bildirimi: K-Yurt dışı.
- Rızayı yeniden sorma süresi: Rehber gün vermez (s. 30); K-Yeniden sorma.
