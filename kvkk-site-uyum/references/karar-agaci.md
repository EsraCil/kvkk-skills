# Kararlar — çerez dışı yasal katman

Çerez, şerit / rıza paneli, Çerez Aydınlatma Metni ve ölçüm kararları bu dosyada
DEĞİL: **`cerez-uyum` skill'i** (`~/.claude/skills/cerez-uyum/`). Bu dosya KVKK
aydınlatma metni, form ve kullanım koşulları için verilecek kararları tutar.

## Karar nasıl sunulur

Birden çok meşru yol olan yerde skill seçimi kendisi yapmaz:

1. Tarama ve kurallarla mümkün olmayan seçenekleri gerekçesi ve dayanağıyla eler.
2. Tek yol kaldıysa seçim sunmaz; o yolu dayanağıyla yazar.
3. Birden çok yol varsa her seçeneği şartı, sitede ne gerektirdiği, riski ve
   kaynağıyla verir.
4. Gerekçeli bir öneri yapar.
5. Seçimi site sahibi yapar; rapora "seçen: site sahibi, tarih" diye girer.
   Site sahibi bilmiyor ya da seçmiyorsa varsayılan öneri uygulanır; raporda
   "varsayılan öneri" diye yazılır ve "sizden beklenenler" listesine girer
   (aşağıda "Bilmiyorum" cevabı).

Rapordaki biçim (`~/.claude/skills/cerez-uyum/scripts/metin-kontrol.mjs rapor` bu biçimi denetler):

```
### K-<Konu> — <başlık>
- Elenen: <seçenek> — <gerekçe> [etiket]
- Seçenek A: <ne> — şart: … — sitede gerektirdiği: … — risk: … — kaynak: … [etiket]
- Seçenek B: …
- Öneri: <A/B>, çünkü …
- Seçim: <A/B> — seçen: site sahibi, <GG.AA.YYYY>
```

Seçim satırının üç biçimi vardır: "seçen: site sahibi, GG.AA.YYYY" (seçim yapıldı);
"varsayılan öneri — site sahibi bilmiyor, GG.AA.YYYY" ("Bilmiyorum" cevabı); `[DOĞRULA]` (henüz
sorulmadı; yalnız ara raporda). Tek yol kalan kararda Seçenek satırları yerine
`- Tek yol: <ne> — <dayanak> [etiket]` yazılır; Öneri ve Seçim satırı gerekmez.
Seçenek satırlarında harfler yalnız o karar içinde anlamlıdır. Bir kararda ikinci
bir seçim varsa (K-Bülten: bilgilendirme biçimi) o seçimin satırı kendi adıyla
yazılır: `- Seçim (bilgilendirme biçimi): <K/L> — seçen: site sahibi, <GG.AA.YYYY>`;
`metin-kontrol.mjs rapor` her seçim satırını ayrı denetler. "Tek yol" ile birlikte
Seçenek satırı da olan kararda Öneri ve Seçim satırı gerekir.

## "Bilmiyorum" cevabı

Site sahibine sorulan her olgu sorusunda "bilmiyorum" geçerli bir cevaptır.
Uydurulan bir cevap "site sahibi beyanı" olarak kaynağa dönüşeceği için skill
cevap vermeye zorlamaz. Üç tür:

1. **Metinde karşılığı olması gereken bilgi:** iddiasız cümle yazılır.
   - Sunucu kaydı süresi: "barındırma sağlayıcısının belirlediği süre boyunca".
   - Talep kaydının saklanması: "talebinizin gerektirdiği süre boyunca ve mevzuatta
     öngörülen saklama süreleri saklı kalmak kaydıyla" (KVKK md. 4/2-d; saklama
     süresi Aydınlatma Tebliği md. 4'ün saydığı unsurlar arasında değil). [Kanun] + [skill yorumu]
   - Mevzuattan gelen süreler (onay kaydı 3 yıl) bilinmezlikten etkilenmez, aynen yazılır.
2. **Ek iddia taşıyan bilgi:** bilinmiyorsa cümle yazılmaz (sağlayıcının yalnız
   site sahibi adına işlediği; e‑postanın "yalnızca" belirli bir hesaba gittiği).
   TEDARIKCI_ROL grup bazında yazılır: yalnız site sahibinin, sağlayıcının
   koşullarından teyit ettiği alıcı grubu için, marka adı olmadan ("Barındırma
   hizmeti sağlayıcısı verileri … adına ve talimatları doğrultusunda işler.");
   teyit edilmeyen grup "sizden beklenenler"de kalır (`kvkk-yansima` §6 grupları verir). [site sahibi beyanı]
   Ölçülebilen olgu sorulmaz, ölçülür (HTTPS yönlendirmesi).
3. **Seçim gerektiren soru:** varsayılan öneri uygulanır (yer sağlayıcı bilinmiyor
   → 5/2‑f; ölçüm sağlayıcısının rolü bilinmiyor → rıza paneli).

Her "bilmiyorum" raporun başındaki **sizden beklenenler** listesine girer:
neyi, nereden öğrenecekleri (sağlayıcının hangi belgesi, hangi ayar) ve
öğrenince metnin nasıl değişeceği. Dayanak tablosunda etiketi
`[site sahibi beyanı: bilinmiyor]`; yayını durdurmaz.

Aşağıdaki "Öneri" satırları skill'in varsayılan önerisidir, karar değildir.

## K-Form — Form verisinin hukuki sebebi

Önce sor: form ne için? (teklif ya da hizmet talebi / genel soru, öneri, şikâyet)
Formu kişiler kendi adına mı, bir şirket adına mı dolduruyor?

- Seçenek A: md. 5/2‑c (FORM_SEBEP_C) — teklif ya da hizmet talebi; sözleşmenin kurulmasıyla doğrudan doğruya ilgili, taraflarına ait, gerekli veri. Yalnız işletmelere hizmet veren sitede formu kendi adına dolduran esnaf ya da şahıs işletmesi sahibi sözleşmenin tarafıdır; ona da A uyar. [Kanun] + [skill yorumu]
- Seçenek B: md. 5/2‑f (FORM_SEBEP_F) — genel iletişim (soru, öneri, şikâyet). Gerekçe yazılır: mesaja cevap verebilmek için gerekli, kişinin kendi gönderdiği bilgiyle sınırlı. [Kanun] + [skill yorumu]
- Seçenek C: md. 5/2‑f (FORM_SEBEP_F_SIRKET) — formu şirket adına dolduran çalışan (sözleşmenin tarafı şirkettir, kişi değil; 5/2‑c zayıflar). Gerekçe B'deki gibi yazılır. [Kanun] + [skill yorumu]
- Elenen: açık rıza — başka hukuki sebep varken rıza istemek dürüstlük kuralına aykırılık şeklinde yorumlanır (Çerez Rehberi s. 38, Kurul 2020/173 özeti) [Kurul kararı]; Çerez Rehberi'nin kendi metni de aynı yönde (s. 16–17, s. 54) [Rehber: gerekli]. Ayrıca rıza geri alınırsa talep cevaplanamaz [skill yorumu].
- Öneri: kişinin kendi adına doldurduğu teklif formunda A, genel iletişimde B, şirket adına doldurulan formda C. İki amaç varsa iki satır.
- Bilmiyorum: site sahibi formun amacını bilmiyorsa varsayılan öneri B (FORM_SEBEP_F); §3'te "Talebinizin değerlendirilmesi ve cevaplandırılması". 5/2-c'nin şartları amaç bilinmeden doğrulanamaz. "Sizden beklenenler"e not: form ağırlıklı teklif ya da sipariş içinse 5/2-c daha güçlü dayanaktır. [skill yorumu]

## K-Sunucu — Sunucu erişim kayıtları

Önce sor: site sahibi sunucuyu kendisi mi işletiyor (5651 anlamında yer sağlayıcı),
yoksa bir barındırma hizmeti mi kullanıyor? Kayıtlar ne kadar tutuluyor?

- Seçenek A: md. 5/2‑f (SUNUCU_SEBEP ilk metin), güvenlik ve hata ayıklama. [Kanun]
- Seçenek B: md. 5/2‑ç (SUNUCU_SEBEP ikinci metin), yalnız site sahibi yer sağlayıcıysa; süre 1–2 yıl (5651 md. 5/3). [Kanun]
- Süre: gerçek süre yazılır; bilinmiyorsa "barındırma sağlayıcısının belirlediği süre boyunca" ("Bilmiyorum" cevabı, tür 1). "Kısa süreli" yazılmaz. [skill yorumu]
- Form gönderim kaydındaki IP (zaman ve metin sürümüyle): ayrı satır, md. 5/2‑e (ispat). [Kanun] + [skill yorumu]
- Öneri: A; B yalnız yer sağlayıcıda.

## K-Üçüncü taraf kaynak — Google Fonts ve benzeri

Yazı tipi ya da başka bir kaynak üçüncü taraf sunucudan yükleniyorsa sayfa her açıldığında ziyaretçinin IP adresi ve tarayıcı bilgisi o sağlayıcıya (Google Fonts'ta ABD) gider.

- Seçenek A: kaynağı sitenin kendi sunucusundan sunmak — veri sağlayıcıya gitmez; aydınlatmada satır ve yurt dışı aktarım gerekmez.
- Seçenek B: sürdürmek — §2'ye FONT_CUMLESI, §4'e FONT_SEBEP (md. 5/2‑f, sayfanın doğru görüntülenmesi için zorunlu), yurt dışı teknik cümlesiyle (K-Yurt dışı). [Kanun]
- Elenen: rızaya bağlamak — yazı tipi izin gelene kadar yüklenmez, tasarım bozulur; yaygın uygulama değil. [skill yorumu]
- Öneri: A. Risk notu (B seçilirse raporda): Almanya'da LG München I'in 20.01.2022 tarihli, 3 O 17493/20 sayılı kararı Google Fonts'un rızasız yüklenmesini GDPR'a aykırı buldu (künye Bavyera'nın resmî karar portalında, gesetze-bayern.de; Türk hukukunda bağlayıcı değil, 5/2‑f denge testinde aleyhe işaret). Kendi sunucudan sunmak mümkün olduğundan 5/2-f'deki 'zorunluluk' şartı tartışmalıdır. [skill yorumu]

## K-Yurt dışı — Barındırma ve araçlarla sürekli aktarım

1. **Raporda:** yurt dışındaki her sağlayıcıyı (barındırma dahil) adı, ülkesi ve amacıyla site sahibine göster (cerez-uyum `kvkk-yansima` §6 ve `denetim.sh`).
2. Önce aktarımı azaltmayı öner: fontları ve CDN kaynaklarını kendi sunucudan sunmak, gereksiz aracı kaldırmak.
3. Kalan her sağlayıcı için yolları düz dille anlat ve sor: standart sözleşme imzalandı mı, imzaların tamamlanmasından itibaren 5 iş günü içinde Kurum'a bildirildi mi? [Kanun] + [Yönetmelik]
4. **Metinde** varsayılan genel cümle (şablon → YURT_DISI). Aydınlatma Tebliği 5/1‑ı alıcı grubunu ve aktarım amacını ister, marka adını değil; Kanun md. 10/1‑c "aktarılabileceği" der. [Tebliğ] + [Kanun]
   - Teknik sağlayıcılar: "Kişisel verileriniz, <amaçlar> amacıyla yurt dışında bulunan bulut hizmeti ve yazılım sağlayıcılarına, KVKK'nın 9. maddesi kapsamında aktarılabilir." Amaçlar taramada yurt dışında görülen hizmetlerden kurulur, sağlayıcı adı geçmez: "sitenin barındırılması" yalnız barındırma yurt dışındaysa; "sitenin güvenli ve hızlı sunulması" (Cloudflare: vekil sunucu, CDN, güvenlik duvarı); "form gönderimlerinin iletilmesi" (form hizmeti ya da form işlevinin e‑posta gönderim servisi; iletişim ve bülten formları); "formun kötüye kullanıma karşı korunması" (reCAPTCHA, K-Form güvenliği; Cloudflare Turnstile); "yazı tiplerinin sunulması"; "site bileşenlerinin sunulması" (açık CDN); "e‑posta yazışmalarının yürütülmesi"; "canlı destek hizmetinin sunulması" (K-Sohbet); "çerez tercihlerinizin yönetilmesi" (rıza yönetim platformu); "ziyaretlerin ölçülmesi" (rızasız ölçüm yurt dışındaysa, K-Ölçüm). Etiket yöneticisi için onaylı amaç ifadesi yoktur, `[DOĞRULA: amaç]` kalır. `kvkk-yansima` §6 cümleyi hazır verir. [skill yorumu]
   - Aktarım yolu site sahibince teyit edildiyse (cümlenin kapsadığı her sağlayıcı için imzalı ve Kurum'a bildirilmiş standart sözleşme) cümle "KVKK'nın 9. maddesine uygun olarak aktarılabilir" der; teyit yoksa "KVKK'nın 9. maddesi kapsamında aktarılabilir". [site sahibi beyanı] + [skill yorumu]
   - Rızaya dayanan ortak ya da gömülü içerik varsa ikinci cümle; amaç ve ortak türü taramaya göre: "İzin vermeniz ya da içeriği açmanız hâlinde, ziyaret istatistikleri ve reklam amacıyla, ayrıca video gibi gömülü içeriklerin gösterilmesi için yurt dışında bulunan ölçüm, reklam ve içerik ortaklarına da aktarılabilir." (Gömülü içerikte yalnız görülen tür: "video gibi", "harita gibi" ya da "harita ya da video gibi"; gömülü içerik yoksa "ya da içeriği açmanız" ve "ayrıca … için" kısmı düşer; yalnız ölçüm varsa "ziyaret istatistikleri amacıyla … ölçüm ortaklarına".) Rızaya bağlanan reCAPTCHA (K-Form güvenliği B) ve canlı destek aracı (K-Sohbet A ya da B) teknik cümleden çıkar, bu cümleye kendi amacıyla ("formun kötüye kullanıma karşı korunması", "canlı destek hizmetinin sunulması") ve ortak türüyle ("güvenlik hizmeti", "destek hizmeti") aynı sıralamada girer; ör. "İzin vermeniz hâlinde, ziyaret istatistikleri ve canlı destek hizmetinin sunulması amacıyla yurt dışında bulunan ölçüm ve destek hizmeti ortaklarına da aktarılabilir." Gömülü içerik kısmı yine ayrı kalır ("…, ayrıca … için"). Teknik cümle yoksa "da" eki düşer. Ölçüm, reklam ve gömülü içerik sağlayıcıları teknik sağlayıcı grubuna konmaz: veriyi kendi amaçlarıyla da işlerler. [skill yorumu]
   - Sağlayıcı adlı liste metne yalnız site sahibi isterse girer.
5. Yol teyit edilmezse metin yine genel cümleyle ("kapsamında" biçimi) yazılır; raporun Riskler bölümüne **uyum engeli** girer: "Bu aktarımların KVKK md. 9'a göre dayanağı belirlenmedi." [skill yorumu]
- Elenen: arızi hâller, açık rıza dahil — yalnız süreklilik arz etmeyen ve olağan faaliyet akışı içinde bulunmayan aktarım için (Yönetmelik md. 16/1); sürekli barındırma ve araç kullanımına uymaz. [Kanun] + [Yönetmelik]
- Elenen: çerez rızasını aktarım rızası saymak — aktarım rızası muhtemel riskler hakkında bilgilendirme ister ve zaten arızi aktarımla sınırlı. [Kanun] + [skill yorumu]
- Elenen: yeterlilik kararı — 19.11.2026 itibarıyla Kurul'un ilan ettiği bir yeterlilik kararı bulunmuyor (hazırlayanın bilgisi). Yeterlilik kararları Resmî Gazete'de yayımlandığından (KVKK md. 9/2) rapordan önce Resmî Gazete'den kontrol edilmesi önerilir; güncel kaynak aracı varsa onunla da bakılır. [Kanun] + [skill yorumu]
- Öneri: önce azaltma; kalan sağlayıcılar için standart sözleşme ve bildirim. Metin genel cümle.

## K-Ticari ileti — İstenen teklif, rapor ya da destek e‑postası

Önce sor: site kime hizmet veriyor? (yalnız işletmelere — tacir ya da esnaf / tüketicilere de)
Bu soru K-Koşullar'daki yetki şartında da kullanılır.

- "Talep edilen yazışma ticari ileti değildir" diye kesin hüküm yazılmaz; böyle bir hüküm kaynakta yok, tanım geniş (6563 md. 2/1‑c). Yönetmelik md. 6/1'deki istisna yalnız temin edilmiş mal ya da hizmetin değişiklik, kullanım ve bakım iletileri içindir. [Kanun] + [Yönetmelik]
- Yalnız işletmelere: kutu önerilmez. Not: ileti ticari sayılsa bile tacir ve esnafa onaysız gönderim istisnası kapsamında (Kanun md. 6/2, Yönetmelik md. 6/3); ret hakkı saklı. Bu istisnayla göndermeden önce alıcının adresi İYS'ye kaydedilir ve ret kontrol edilir (Yönetmelik md. 6/6) — teklif e‑postası için de. Şirket adına yazan çalışanın kurumsal adresi gri alandır: alıcının şirket mi kişi mi sayılacağı kaynakta açık değil. [Kanun] + [Yönetmelik] + [skill yorumu]
- Tüketicilere de: yanıt yalnız talep edilen içerikle sınırlı kalır ve kampanya ya da tanıtım eklenmezse risk düşük. Hatırlatma, indirim, başka ürün tanıtımı onay ister. [skill yorumu]
- Seçenek (daha sıkı): her kitle için isteğe bağlı ticari ileti kutusu. Bedeli: kutu işaretlenmezse teklifin gönderilip gönderilemeyeceği belirsizleşir.
- Öneri: kitleye göre yukarıdaki iki not; kutu yok. Formdaki bilgi cümlesi (`form-onay.html` → TICARI_ILETI_CUMLESI): tüketicilere de hizmet veren ya da bülteni olan sitede "onayınız olmadan ticari elektronik ileti gönderilmez"; yalnız işletmelere hizmet veren ve onaysız ileti göndermeyecek sitede de aynı taahhüt yazılır, raporda not: tacir istisnası kullanılacaksa metin güncellenir; yalnız işletmelere hizmet veren ve tacir istisnasıyla onaysız ileti gönderecek sitede bu taahhüt yazılmaz.

## K-Bülten — Bülten ya da kampanya e‑postası

Yalnız bülten varsa. Yoksa kutu konmaz.

- 6563 onayı tartışmasız gereklidir: isteğe bağlı, işaretsiz kutu; İYS kaydı; her iletide ret bağlantısı; Yönetmelik md. 7 ve 13 kayıt kuralları (`sunucu-dogrulama.mjs`). [Kanun] + [Yönetmelik]
- KVKK sebebi:
  - Tek yol: açık rıza (md. 5/1), 6563 onayının yanında ayrı beyan (iki kutu ya da iki cümleli tek kutu). [Kanun]
  - Elenen: tek onay (6563), KVKK sebebi 5/2‑c (abonelik kişinin talebiyle kurulan hizmet ilişkisi) — öneri açık rıza; Kurul pazarlamayı sözleşmenin ifası saymayabilir; şablonlar bu yolu desteklemez [skill yorumu]
  - Elenen: md. 5/2‑a — 6563 işlemeyi emretmez, onaya bağlar. [skill yorumu]
  - Not: pazarlama amaçlı işlemede Kurul uygulamasının açık rıza beklediği bilgisi bu pakette karar metninden doğrulanmadı.
  - Kutu biçimi (iki kutu ya da iki cümleli tek kutu; `form-onay.html` → BULTEN_BLOGU) için risk notu: Tek kutu biçiminde ayrı kutu beklentisi olabilir; daha temkinli yol iki kutudur. [skill yorumu]
  - İki kutulu biçimde yalnız biri işaretliyse bülten kaydı yapılmaz, form normal gönderilir ve ziyaretçiye "Bülten için iki kutunun da işaretlenmesi gerekir." notu gösterilir (`sunucu-dogrulama.mjs` → newsletterConsent). [skill yorumu]
  - Metinde: KVKK metni §2'ye BULTEN_VERISI, §3'e BULTEN_AMACI, §4'e BULTEN_SATIRI, §6'ya BULTEN_ALICI (bülten gönderim hizmeti sağlayıcısı ve İYS), §7'ye BULTEN_VERI_SURESI ve BULTEN_SURESI. [skill yorumu]
  - Abone verisinin (ad soyad, e‑posta) saklama süresi (BULTEN_VERI_SURESI) site sahibinin beyanıdır: "Bülten aboneliğine ilişkin ad soyadınız ve e‑posta adresiniz, abonelikten çıkana kadar saklanır." [site sahibi beyanı]; site sahibi bilmiyorsa bu metin varsayılan öneri olarak yazılır ve "sizden beklenenler"e girer.
- Aydınlatma, rıza beyanına gömülmez (Aydınlatma Tebliği md. 5/1‑f). Bilgilendirme biçimi: [Tebliğ]
  - Seçenek K (kilit): aydınlatma metni açılmadan rıza kutusu etkinleşmez; ispat kod ve sürüm geçmişiyle, "okudum" için kayıt tutulmaz.
  - Seçenek L (katmanlı): kutunun yanında kısa aydınlatma ve tam metne bağlantı (katmanlı yaklaşım: Çerez Rehberi EK-2). [Rehber: tavsiye]
  - İki biçimde de rızanın kendisi sürümüyle kaydedilir.
  - Öneri: bülten metni kısaysa L (ek tıklama yok); site sahibi aydınlatmanın açıldığını göstermek isterse K. [skill yorumu]
  - Raporda bu seçimin satırı kendi adıyla yazılır: `- Seçim (bilgilendirme biçimi): <K/L> — seçen: site sahibi, <GG.AA.YYYY>`.

## K-Koşullar — Kullanım koşullarının bağlayıcılık cümleleri

- Elenen: "Siteyi kullanmanız bu koşulları kabul ettiğiniz anlamına gelir" — göz atan ziyaretçide TBK md. 21 şartları oluşmaz. Yerine: "Bu koşullar sitenin kullanımına ilişkin kuralları açıklar." Üyelik ya da kabul gerektiren araç varsa açık kabul (tıklayarak onay) ayrı iş, raporda. [Kanun] + [skill yorumu]
- Elenen: "Kullanmaya devam etmeniz güncel koşulları kabul sayılır" — TBK md. 24. Yerine: "güncel metin ve tarihi bu sayfada yayımlanır." [Kanun]
- Yetki şartı (HMK md. 17 ve 18/2): [Kanun]
  - Varsayılan: yazılmaz; genel yetki kuralları uygulanır.
  - Seçenek: site yalnız işletmelere hizmet veriyorsa "tacirler arasındaki uyuşmazlıklarda {{MAHKEME_ILI}} mahkemeleri ve icra daireleri yetkilidir." Risk: yetki sözleşmesi yazılı olmalı, hukuki ilişki belirli ya da belirlenebilir olmalı ve mahkeme gösterilmeli (md. 18/2); tıklamayla kabulün bunu karşılayıp karşılamadığı tartışmalı.
- Formdaki kabul kutusu: [skill yorumu]
  - Varsayılan: iletişim formunda yalnız aydınlatma "okudum" kutusu; kullanım koşulları footer bağlantısıyla durur. Kabul kutusu basit bir mesajı genel işlem koşullu sözleşmeye çevirir; sorumluluk sınırı ve yetki şartı ziyaretçinin kabul ettiği koşullara dönüşür.
  - Seçenek: site kabul gerektiren bir hizmet sunuyorsa (üyelik, ücretli ya da kişiye özel araç, sipariş) zorunlu kabul kutusu (`form-onay.html` → KABUL_KUTUSU; `sunucu-dogrulama.mjs` → REQUIRE_TERMS).
- Tüketicilere hitap eden sitede sorumluluk sınırı haksız şart denetimine tabi olabilir (6502 sayılı Kanun md. 5: müzakere edilmeden konan ve tüketici aleyhine dengesizlik yaratan şart haksızdır ve kesin olarak hükümsüzdür): raporda risk. [Kanun]

## K-Form kaydı — Üçüncü taraf form hizmetinde kanıt (Formspree vb.)

Kendi sunucu fonksiyonu yoksa gönderim kaydını form hizmeti tutar.

- Formda gizli metin sürümü alanı (`form-onay.html` → FORM_SURUM_ALANI). Aydınlatma §2: "Formu gönderdiğinizde gönderim zamanı ve okuduğunuz metnin sürümü talebinizle birlikte form hizmetinde kaydedilir." IP yalnız hizmetin kaydettiği teyit edilirse ("Bilmiyorum", tür 2). [skill yorumu]
- Raporda site sahibine kontrol listesi: hizmetteki kayıtları saklama süresi boyunca dışa aktarıp saklayın; bülten varsa bülten formunda ad soyad alanı bulunsun (onayda alıcının adı ve soyadı yer alır, Yönetmelik md. 7/1), onayı 3 iş günü içinde İYS'ye kaydedin, onay bilgisini reddetme imkânıyla birlikte 24 saat içinde alıcıya iletin (bülten aracının çift onay e‑postası), onay kaydını onayın sona ermesinden itibaren 3 yıl saklayın. [Yönetmelik]
- Sınır: gizli alan tarayıcıda değiştirilebilir; kanıt değeri sunucu kaydından zayıftır. Daha güçlü kanıt için kendi form fonksiyonu (K-Form iletimi, cerez-uyum). [skill yorumu]

## K-Saklama — Saklama süreleri

- Mevzuattan gelen süreler dayanağıyla sabit yazılır: ticari ileti onay kaydı, onayın sona ermesinden itibaren 3 yıl (Yönetmelik md. 13/2); yer sağlayıcı trafik kaydı 1–2 yıl (5651 md. 5/3). [Yönetmelik] + [Kanun]
- Bülten abone verisi (ad soyad, e‑posta; BULTEN_VERI_SURESI): site sahibinin beyanı; bilmiyorsa varsayılan öneri "Bülten aboneliğine ilişkin ad soyadınız ve e‑posta adresiniz, abonelikten çıkana kadar saklanır." (K-Bülten). [site sahibi beyanı]
- Mevzuatın süre vermediği yerlerde (talep kaydı, form gönderim kaydı, sunucu kaydı) şablonda sayı yoktur. Skill site sahibine sorar ve ölçütleri verir: verinin talepten sonra ne kadar gerçekten gerektiği, olası uyuşmazlıkta ispat ihtiyacı, md. 4 ölçülülük. Site sahibi bilmiyorsa iddiasız cümle ("Bilmiyorum" cevabı, tür 1). [Kanun] + [skill yorumu]
- Çerez tercihini yeniden sorma süresi: `cerez-uyum` (K-Yeniden sorma).
