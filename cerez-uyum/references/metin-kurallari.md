# Çerez Aydınlatma Metni ve şerit — yazım kuralları

## Temel ilke

Metin sitenin **ölçülen** davranışını anlatır; ne fazla ne eksik. Şerit,
Çerez Aydınlatma Metni, tablo ve KVKK aydınlatma metni **aynı şeyi**
söylemeli. Biri "çerez yok" deyip diğeri iki satırlık tablo gösterirse
okur "bir şey saklanıyor" diye okur. Şeritte "çerez kullanmaz" gibi bir iddia
yerine "ne işleniyor ve neden" yazılır.

Siteye yazılan her cümle üç kaynaktan birine dayanır: mevzuat sabiti, tarama
bulgusu (`cerez-tespit`, `tarama.sh`) ya da site sahibinin beyanı. Hiçbirine
dayanmayan cümle siteye yazılmaz; raporda `[DOĞRULA]` olarak kalır ve Dayanak
tablosunda görünür (SKILL.md → Üç kaynak ve etiketler). Kaynak türü etiketleri
ve `[DOĞRULA]` site metnine girmez; şablonlarda yalnız HTML yorumunda durabilir.

## Mevzuat dayanakları

- KVKK md. 10 + Aydınlatma Tebliği md. 5/1 [Kanun] + [Tebliğ]:
  - (e) ispat veri sorumlusunda → metin sürümü tut (bkz. sürüm) [Tebliğ].
  - (f) aydınlatma ile açık rıza **ayrı** [Tebliğ] → aydınlatma metnine rıza
    cümlesi koyma; bilgi şeridindeki "Tamam" rıza ya da okudum beyanı değildir
    ve rıza panelindeki "Kabul" ile aynı düğme olamaz [skill yorumu].
  - (g) belirli, açık ve meşru amaç; genel ve muğlak ifade yok; "muhtemel
    başka amaçlar için işlenebileceği" izlenimi verilmez [Tebliğ]. Yazım
    kuralı: **kesin olan işleme kesin kiple** ("işlenir"), yalnız gerçekten
    koşullu olan "-bilir" [skill yorumu: Tebliğ 5/1-g'den çıkarılan yazım kuralı].
    İstisna: yurt dışı genel cümlesi "aktarılabilir" der; bu, Kanun md. 10/1-c
    ve Aydınlatma Tebliği md. 4'ün dilidir ("aktarılabileceği") [Kanun] +
    [Tebliğ] (K-Yurt dışı).
  - (ğ) sade dil [Tebliğ].
  - (h) hukuki sebep açıkça [Tebliğ]. EK-4 hukuki sebebi kategori bazında
    yazar (s. 50–51) [Rehber: tavsiye]; kalem bazında yazmak "açıkça" şartını
    güçlendirir [skill yorumu].
  - (ı) aktarım amacı + alıcı grupları [Tebliğ]. (i) tamamen/kısmen otomatik
    yöntem [Tebliğ]. (j) eksik/yanıltıcı bilgi yok [Tebliğ].
- Rehber §9 (s. 35–37): girişte bilgilendirme (s. 36, "gerekmekte")
  [Rehber: gerekli]; çerez adı, amaç, süre, taraf (s. 36, "tavsiye olunur")
  [Rehber: tavsiye]. Rehber EK-4 (s. 48–53): örnek metin yapısı [Rehber: tavsiye].

## Çerez Aydınlatma Metni — bölümler

Başlık: **"Çerez Aydınlatma Metni"** — EK-4 metninde geçen ad (s. 48); EK-4'ün
kendi başlığı "Çerezlere İlişkin Örnek Aydınlatma Metni"dir. URL mevcutsa
değiştirme (bağlantılar ve sitemap kırılmasın), yalnız başlık/etiket değişsin.

- **Giriş** (numarasız, başlığın altında) — veri sorumlusunun kimliği ve
  metnin amacı: "Bu çerez aydınlatma metni, veri sorumlusu sıfatıyla …
  tarafından …". Kimlik KVKK md. 10/1-a [Kanun]; EK-4'ün ilk unsuru (s. 48)
  [Rehber: tavsiye]. Tüzel kişide ticaret unvanı; şahıs işletmesinde veri
  sorumlusu gerçek kişidir, adı soyadı (varsa işletme adıyla) yazılır
  (kvkk-site-uyum ile aynı kural). Kimlik site sahibinin beyanıdır.

1. **Çerez nedir** — kısa tanım + sitenin durumu. Durum cümlesi tabloyla
   çelişmesin:
   - Çerez yok ama depolama/betik var → "Bu sitede reklam ve takip amaçlı
     çerez kullanılmamaktadır. Sitenin çalışması ve ziyaretlerin toplu ölçümü
     için kullanılan teknolojiler, tarayıcınızda bilgi saklayanlar ve
     tarayıcınızdan bilgi alanlar dahil, 3. bölümde gösterilmiştir."
   - Yalnız zorunlu çerez → "Bu sitede yalnızca sitenin çalışması için
     gerekli çerezler kullanılır; ayrıntısı 3. bölümdedir."
   - Rıza gerektiren var → "Zorunlu çerezler dışındaki çerezler yalnızca
     izninizle kullanılır; tercihlerinizi her zaman değiştirebilirsiniz."
   - Çerez yok; izinle çalışan çerezsiz ölçüm ya da gömülü içerik var → "Bu
     site kendi çerezini kullanmaz." + ölçüm varsa "Ziyaret ölçümü çerez
     kullanmaz ve yalnızca izninizle çalışır." + gömülü içerik varsa
     "Videolar yalnızca izninizle ya da içeriği açmanız hâlinde yüklenir;
     yüklendiğinde sağlayıcısı kendi çerezlerini kullanır." (yalnız ölçülen
     tür: videolar, haritalar ya da ikisi) + "Ayrıntısı 3. bölümdedir." Rıza
     panelinin başlığı bu durumda "Gizlilik tercihleri"dir (aşağıda, iki
     katmanlı panel) [skill yorumu].
2. **Çerez türleri** — süre / amaç / taraf (Rehber 2.2). Gömülü içerik
   varsa (K-Gömülü) türlerin altına bir cümle (GOMULU_CUMLESI): içerik başka
   bir siteden yüklenir, yüklendiğinde sağlayıcısı kendi çerezlerini kullanır,
   tabloda "Gömülü içerik" türüyle gösterilir. Gömülü içerik Rehber'in amaç
   türlerine eklenmez; panelde ve tabloda ayrı kategoridir [skill yorumu]. Son
   cümle: "Bu sitede kullanılan teknolojilerin türü ve tarafı 3. bölümdeki
   tabloda gösterilmiştir."
3. **Bu sitede kullanılan teknolojiler** — tablo: Ad | Tür | Taraf | Amaç |
   Hukuki sebep | Süre (`scripts/tablo.mjs`). Gömülü içerik sağlayıcısının
   (YouTube, Vimeo, Google Haritalar) kalemleri ayrı satırlarda, "Gömülü
   içerik" türüyle durur; amaç hücresi sağlayıcının kendi amaçlarını (reklam
   dahil) söyler, rıza panelindeki kategoriyle aynı ad kullanılır (K-Gömülü)
   [skill yorumu]. Gömülü içeriğin yerel depolama kaydı "birinci taraf"
   yazılmaz. Yeni kurulumda şerit ya da panelin kendi tercih kaydı da bir
   satırdır (KAYIT_ADI, YENIDEN_SORMA_GUN; 5/2-f, Rehber 5.8 s. 24)
   [Rehber: tavsiye]. Altında: yurt dışı notu ve
   "ileride çerez eklenirse" cümlesi. Yurt dışı notu, tablodaki bir kalemle
   yurt dışına veri gidiyorsa yazılır: sağlayıcı adı vermeden "aktarılabilir"
   der ve KVKK metninin "Aktarım" bölümüne yönlendirir. Aktarım yolu teyit
   edilmese de yazılır; raporda K-Yurt dışı altında uyum engeli kalır [skill yorumu].
4. **Tercihlerinizi yönetme** — rıza paneli varsa nasıl açılır; tarayıcı
   **yardım sayfası bağlantıları** (menü yolu yazma). Bağlantıları `curl -sL`
   ile doğrula; bot koruması yüzünden doğrulanamayanı kullanıcıya söyle.
   Bilgi şeridinde değiştirilecek bir izin yoktur; şerit kaydı "tercih" diye
   anılmaz, şeridin kapatıldığını hatırlayan kayıttır (tablodaki amacı da öyle yazılır).
5. **Kişisel veriler ve haklarınız** — KVKK metnine bağlantı, md. 11,
   "Başvuru" bölümü.
6. **Değişiklikler** — güncelleme ve tarih. Sonrası modele göre: bilgi
   şeridinde şerit yeniden gösterilir; rıza panelinde tercih yeniden sorulur.
7. **İletişim**.

Hukuki sebep:

- Rıza gerektiren kalem → açık rıza, md. 5/1 [Kanun].
- Rıza dışı kalem → 5/2-c ya da 5/2-f; EK-4 zorunlu çerezler için "c veya f"
  der (s. 50–51) [Rehber: tavsiye]. İşlem bir sözleşmeyi gerektiriyorsa
  (sepet, giriş) 5/2-c (s. 18) [Rehber: tavsiye]; değilse 5/2-f, denge testiyle
  (s. 17) [Rehber: tavsiye]. Kesin varsayılan yazılmaz; tabloda `[DOĞRULA]`
  kalır, site sahibi doğrular [skill yorumu].
- Hukuki sebep kalem bazında yazılır; EK-4 kategori bazında yazar (s. 50–51),
  kalem bazı Tebliğ 5/1-h'deki "açıkça" şartını güçlendirir [skill yorumu].

Belirsiz olan her şey raporda `[DOĞRULA]` / `[İÇERİK GEREKLİ]` ile işaretlenir;
tahmin yazılmaz, siteye de yazılmaz. Site sahibi bir olgu sorusuna "bilmiyorum"
derse: SKILL.md → "Bilmiyorum" cevabı. Yurt dışı aktarım ayrıca düzenlenir:
aktarım olgusu taramadan gelir ve metin genel cümleyle yazılır; aktarımın
yolu teyit edilmese de cümle kalır, raporda K-Yurt dışı altında "aktarımın
dayanağı belirlenmedi" uyum engeli durur.

## Şerit (ilk katman)

### Rıza gerektiren çerez YOKSA → bilgi şeridi

Rıza istenmez: amaç Kriter A/B içindeyse rıza istemek hukuka ve dürüstlük
kuralına aykırılık şeklinde yorumlanır (s. 38, Kurul 2020/173 özeti) [Kurul kararı];
Rehber'in kendi metni de aynı yönde (s. 16–17; EK-5 Kötü Örnek-1, s. 54) [Rehber: gerekli].
Rehber'de bilgi şeridi ya da tek düğmeli bant için bir model yoktur; bu desen
skill'in uygulamasıdır [skill yorumu]. Çerezsiz ölçüm (beacon, localStorage
ile ölçüm) varsa bilgi şeridi ancak K-Ölçüm'de rızasız ölçüm seçildiyse
(`analitik.md` → Kural 2, üç şart) kullanılır.

Tek düğme **"Tamam"**, iki bağlantı. Aydınlatma ile rıza ayrıdır (Tebliğ
5/1-f) [Tebliğ]: "Tamam" yalnız şeridi kapatır; okudum beyanı alınmaz
[skill yorumu].

Önerilen kalıp:
> Bu siteyi ziyaret ettiğinizde kişisel verileriniz sitenin çalışması,
> güvenliği ve ziyaretlerin toplu ölçümü için işlenir; reklam ve takip amaçlı
> çerez kullanılmaz. Form gönderirseniz işlenen veriler KVKK Aydınlatma
> Metni'nde açıklanmıştır. **Çerez Aydınlatma Metni · KVKK Aydınlatma Metni**
> [Tamam]

Kalıbı sitenin gerçek amaçlarına göre uyarla: ölçüm yoksa "ve ziyaretlerin
toplu ölçümü" kısmını, form yoksa son cümleyi çıkar. Kullanıcıya 2–3 seçenek
sun (A önerilen), kararı o versin.

Gömülü içerik tıklayınca yükle kutusuyla açılıyorsa (`templates/tikla-yukle.html`,
K-Gömülü Seçenek B) "reklam ve takip amaçlı çerez kullanılmaz" kısmı yazılmaz ya
da sitenin kendisiyle sınırlanır: içerik açıldığında sağlayıcının kendi
çerezleri devreye girer; bunu kutunun metni söyler ("Bu video YouTube'dan
yüklenir; yüklendiğinde YouTube çerez kullanır.") [skill yorumu]. Kutu yalnız
tıklamayla yükler; tıklama açık rızadır ve yalnız o sağlayıcı için tarayıcıda kaydedilir, geri alma düğmesi (panelde "Çerezleri yönet") içeriğin altında durur; önizleme görseli sitenin kendi
sunucusundan gelir, tıklamadan önce sağlayıcıya istek gitmez.

### Rıza gerektiren çerez VARSA → iki katmanlı panel

- 1. katman (Rehber s. 30, EK-2): kısa metin — çerezlerle veri işlendiği,
  zorunluların amacı, diğerlerinin rıza hâlinde hangi amaçla; aydınlatma
  bağlantısı; **Hepsini Kabul Et / Hepsini Reddet / Tercihler** eşit renk,
  boyut, punto. Rehber eşitliği "iyi uygulama örneği olabilecektir" diye
  yazar (s. 30) [Rehber: tavsiye]. EK-5'e göre aydınlatma ile çerez yönetim
  paneli ayrı olmalı ve Reddet düğmesi bulunmalı (s. 54 "gerekmektedir", s. 55
  "yer almalı") [Rehber: gerekli]; eşit büyüklük/renk ve Tercihler düğmesi
  (s. 55) [Rehber: tavsiye].
- Giriş cümlesi ve başlık ölçüme göre (PANEL_GIRIS, PANEL_BASLIK): çerez
  varsa "İnternet sitemizde çerezler yoluyla kişisel veri işlenir." ve
  "Çerez tercihleri"; çerez yoksa ve yalnız çerezsiz ölçüm ya da gömülü
  içerik izne bağlıysa "İnternet sitemizde bazı hizmetler yalnızca izninizle
  çalışır." ve "Gizlilik tercihleri"; bu durumda ilk katmanda "çerez" denmez,
  hizmet ve amacı yazılır. Footer bağlantısının adı başlıkla aynıdır
  [skill yorumu].
- Düğmeler aydınlatma metnini açma şartına bağlanmaz (kilit yok): ilk katman
  bilgilendirmenin kendisidir; kilit düğme eşitliğini bozar [skill yorumu].
- 2. katman (EK-3) [Rehber: tavsiye]: kategori satırları; zorunlu "her zaman
  açık", diğerleri **varsayılan kapalı** (s. 31) [Rehber: tavsiye]; s. 56'da
  "gerekmektedir" [Rehber: gerekli] — sonuç: gerekli; opt-in
  (s. 37–38) [Kurul kararı]; her kategoride amaç, taraf, süre; Hepsine İzin
  Ver / Hepsini Reddet / Ayarları Kaydet.
- Gömülü içerik (video, harita) ayrı "Gömülü içerik" kategorisidir: reklamdan
  ayrı rıza (EK-5 Örnek-2, s. 55) [Rehber: tavsiye]; her amaç için ayrı rıza
  (s. 40) [Kurul kararı]. Açıklaması: video ve harita sağlayıcıları içerik
  yüklendiğinde kendi çerezlerini kullanır; amaç ve sağlayıcılar çerez
  tablosuyla aynı. Varsayılan kapalı; iframe izin gelene kadar `src`'siz
  bekler (K-Gömülü, Seçenek A). Panelsiz sitede tıklayınca yükle kutusu
  (Seçenek B).
- Rıza sonradan geri alınabilir ve panele erişim sürekli olmalı (Rehber s. 29)
  [Rehber: gerekli]; biçim: sayfada küçük simge veya footer'da "Çerez Tercihleri"
  (s. 30) [Rehber: tavsiye]. Geri alınınca
  kategorinin yüklenmiş iframe'leri kaldırılır, sitenin koyduğu (birinci
  taraf) çerezleri silinir ve sayfa yenilenir; üçüncü taraf çerezleri site
  silemez, ziyaretçi tarayıcıdan siler (§4 bağlantıları) [skill yorumu].
- Rıza yorgunluğu: her girişte sorma; yeniden sorma süresi için bkz. Sürüm.

### Hiçbir durumda

- "Siteyi kullanarak / devam ederek kabul etmiş olursunuz" (EK-5 Örnek-4, s. 57,
  "hukuka uygun bir kullanım şekli değildir") [Rehber: gerekli]; Kurul 2020/173
  Gizlilik Bildirimi vakası (s. 38) [Kurul kararı].
- Tek "Kabul" düğmesi (Reddet yok); "daha fazla bilgi"nin aydınlatma mı panel mi
  olduğu belirsiz (EK-5 Örnek-1, 2; s. 54 "gerekmektedir", s. 55 "yer almalı")
  [Rehber: gerekli]; soluk/küçük "Reddet", Tercihler düğmesi yok (eşit
  büyüklük/renk, s. 55) [Rehber: tavsiye].
- Önceden açık kategori (EK-5 Örnek-3, s. 56 "gerekmektedir") [Rehber: gerekli]; opt-in (s. 37–38)
  [Kurul kararı].
- Farklı amaçlar tek rızada (EK-5 Örnek-2) [Rehber: tavsiye]; her amaç için
  ayrı rıza (s. 40) [Kurul kararı].
- Gömülü içeriği izin ya da tıklama olmadan yüklemek: rıza gerektiren çerez
  izinden önce gelir (s. 37–38) [Kurul kararı]; YURT_DISI'deki "içeriği
  açmanız hâlinde" ifadesi yanıltıcı olur (Tebliğ 5/1-j) [Tebliğ] (K-Gömülü).
- Rızayı kullanım koşullarına/gizlilik bildirimine gömmek: reklam çerezleri
  için s. 31 [Rehber: gerekli]; Gizlilik Bildirimi rıza alındığı anlamına
  gelmez, s. 38–39 [Kurul kararı].

### Çerez duvarı

Skill çerez duvarı önermez. Sitede varsa ya da site sahibi isterse raporda
Rehber'in diliyle risk notu yazılır: rıza hizmetin ön koşulu yapılırsa
irade sakatlanabilir; adil alternatif sunuluyorsa olay bazında
değerlendirilebilir (s. 31–32) [Rehber: tavsiye]. Adil alternatifi skill
tanımlamaz.

## Sürüm

Şerit kaydı `sürüm|zaman` tutar (bilgi şeridi) ya da `{choice, at, version}`
(rıza paneli). Yasal metin değişince sürüm değişir, şerit yeniden görünür.
Sürüm metnin tarihidir: şablonlarda `{{TARIH}}`, çerez aydınlatma metninin
"Son güncelleme" tarihiyle aynı. Sürüm tek yerden gelmeli (build sabiti /
data özniteliği); formlar da aynı sürümü kayda yazıyorsa ikisini birlikte
güncelle ve bunu kodda yorumla yaz.

Yeniden sorma süresi: bilgi şeridinde ve rıza panelinde tek yer tutucu,
`{{YENIDEN_SORMA_GUN}}`. Tercih kaydının (çerezin ya da depolamanın) ömrüyle
aynıdır ve site sahibiyle belirlenir. Karar: K-Yeniden sorma. Önce ölçülür: sitede şerit ya da panel varsa tercih kaydının ölçülen ömrü kullanılır (tarama bulgusu). Yeni kurulumda site sahibi bilmiyorsa varsayılan öneri 365 gün: Rehber gün vermez, tek sayısal dayanak EK-4 örneğindeki tercih çerezi süresi (s. 52) [Rehber: tavsiye — örnek]; Chrome'un 400 günlük çerez sınırının altında. "Sizden beklenenler"e not: süre kısaltılabilir, çerez ömrüyle aynı olmalı. Rehber gün vermez; hatırlatma çerez ömrüyle orantılı olmalı
(s. 30) ve ömür md. 4 ilkelerine göre belirlenir: s. 24 "tavsiye edilmektedir" [Rehber: tavsiye], s. 30 "…göz önünde bulundurulması gerekmektedir" [Rehber: gerekli].
EK-4 örneğinde tercih çerezi 365 gündür (s. 52); bu yalnız bir örnektir.

Bilgi şeridinde okudum beyanı alınmaz; **"Tamam" tıklaması sunucuya
kaydedilmez** [skill yorumu]: rıza yok; aydınlatmanın ispat yükü veri
sorumlusundadır (Tebliğ 5/1-e) [Tebliğ] ve ispat yöntemle (kod ve sürüm
geçmişi, deploy geçmişi, tarihli kopya) yapılır; kaydetmek yeni kişisel veri
işleme doğurur (md. 4 ölçülülük) [skill yorumu].
Rıza panelinde ise EK-1 "rıza kaydını uygun süre sakla" der (s. 45)
[Rehber: tavsiye]: tarayıcı kaydı + mümkünse sunucu kaydı, site sahibiyle
karar ver (K-Rıza kaydı).

## Onay kuralı (zorunlu)

Yasal metin kullanıcının beyanıdır. Her metin değişikliğini **tam hâliyle**
göster, seçenek varsa A/B/C olarak ver; onay gelmeden dosyaya dokunma.
Commit ve push ayrı onay ister. Kullanıcının "koru" dediği örnek metni
kendiliğinden kısaltma; kısaltma gerekçen varsa öner.

Yayın öncesi tutarlılık kontrolü:

- `node scripts/metin-kontrol.mjs site <yayınlanacak html dosyaları…>`:
  kalan `{{`, `[DOĞRULA]`, etiket sızıntısı ve yasak kalıp. Bulgu varsa yayın yok.
- Şerit, Çerez Aydınlatma Metni §1–§3, KVKK metni (§2 işlenen veriler, §4
  hukuki sebep, §6 aktarım) ve kullanım koşullarındaki çapraz atıflar aynı
  adı ve aynı gerçeği mi söylüyor? `grep -rn "çerez"` ile tara.
- Meta description gibi görünmeyen yerlerde eski iddia kaldı mı?
- Bağlantı etiketleri tutarlı mı (büyük harf kuralı sitenin footer'ına göre)?
