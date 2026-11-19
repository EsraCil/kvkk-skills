# Ölçüm (analitik) değerlendirmesi

Amaç: sitenin ölçüm kurulumunu Rehber'e göre değerlendirmek ve gerekiyorsa
rıza gerektirmeyen bir kurulum önermek. Buradaki tedarikçi bilgileri
**tedarikçi beyanıdır**; sürüm ve ayar değiştikçe değişir. Site sahibi
sağlayıcının güncel koşullarından teyit edene kadar raporda `[DOĞRULA]`
kalır. Karar vermeden önce `cerez-tespit.mjs` ile gerçek davranışı ölç ve
tedarikçinin güncel dokümanına bak.

Değerlendirme iki kurala ayrılır. Birinci taraf analitik **çerezleri** için
Rehber 5.9 doğrudan uygulanır (Kural 1); skill rızasız yolu burada yalnız
kendi sunucusunda çalışan araca tanır [skill yorumu]. Rehber'in yönlendirme yapmadığı
teknolojilerde (çerezsiz ölçüm, beacon, localStorage; s. 9) skill'in kendi
kuralı uygulanır (Kural 2). Sonuç raporda K-Ölçüm kararı olur
(SKILL.md → Kararlar).

## Kural 1 — Birinci taraf analitik çerezleri (Rehber 5.9, s. 24–26)

Rehber 5.9'un koşulları aynı ağırlıkta değildir:

| Koşul | Rehber | Etiket |
|---|---|---|
| a. Amaç yalnız sitenin kendi kitlesini ve performansını ölçmek (reklam, yeniden hedefleme, profil çıkarma, kitle paylaşımı yok [skill yorumu]) | s. 25 | [Rehber: tavsiye] — senaryonun kapsam şartı (s. 25 "…ölçmekle sınırlı olan çerezler … değerlendirilebileceği düşünülmektedir"); karşılanmazsa 5.9 uygulanmaz |
| b. Yalnız anonim istatistik (birey düzeyinde oturum kaydı, ısı haritası, kullanıcı kimliği yok) | s. 25, "gerekmektedir" | [Rehber: gerekli] |
| c. Siteler ve uygulamalar arası çapraz takip yok | s. 25, "gerekmektedir" | [Rehber: gerekli] |
| d. Gereksiz veri anonimleştirilir (ör. IP maskeleme) | s. 25, "tavsiye edilmektedir" | [Rehber: tavsiye] |
| e. Makul ömür: çerez süresi amaçla orantılı | s. 26, "tedbirler arasında sayılabilir" | [Rehber: tavsiye] |
| f. Toplanan veri üçüncü taraflara iletilmez | s. 26, "tedbirler arasında sayılabilir" | [Rehber: tavsiye] |

Sonuç (a kapsam şartı olduğu için tavsiye diliyle yazılsa da hâlâ aranır: karşılamayan çerez 5.9 senaryosuna girmez):

- **a, b ve c'nin hepsi evet ve araç kendi sunucunuzda çalışıyor** (veri bir
  sağlayıcıya gitmiyor) → 5.9 kapsamında; rıza gerekmez, bilgi şeridi yeter
  (s. 24–26) [Rehber: tavsiye] + [skill yorumu].
- **a, b ya da c'den biri hayır** → 5.9 dışında; başka işleme şartı yoksa
  açık rıza (md. 5/1) [Kanun], rıza paneli.
- **Veri bir sağlayıcıya gidiyor** (bulutta çalışan çerezli araç) → rıza
  paneli; sağlayıcının rolü ne olursa olsun [skill yorumu]. Rehber üçüncü
  tarafa iletmemeyi tedbir sayar (s. 26); skill bunu şart olarak uygular,
  yani Rehber'den sıkıdır. Sağlayıcı veriyi kendi amacıyla da kullanıyorsa
  ayrıca a bozulur (s. 25, kapsam şartı) [Rehber: tavsiye]. Sağlayıcı yurt dışındaysa
  ayrıca K-Yurt dışı.
- **Aracın nerede çalıştığı bilinmiyorsa** rıza paneli (SKILL.md →
  "Bilmiyorum" cevabı, tür 3) [skill yorumu].
- **d ve e** raporda ayrı ayrı yazılır. Eksik olan tedbir öneri olarak gider;
  Rehber'in ağırlığına göre tek başına rıza sebebi yapılmaz [skill yorumu].
  f'yi skill yukarıdaki gibi şart olarak uygular.
- **"Birinci taraf"**: Rehber tarafı çerezi koyan alan adıyla tanımlar
  (s. 13); 5.9 başka tanım vermez. GA4'ün `_ga` çerezi birinci taraf alan
  adında durur; verinin kimde işlendiği a ve f için ayrıca sorulur [skill yorumu].

## Kural 2 — Rehber'in yönlendirme yapmadığı teknolojiler

Çerezsiz ölçüm, beacon, localStorage gibi teknolojiler için Rehber yönlendirme
yapmaz (s. 9). Skill, rıza istemeden ölçümü (md. 5/2-f + bilgi şeridi) ancak
şu üç şartın **hepsi** varsa önerir [skill yorumu: Rehber 5.9'a benzetme]:

1. **Ölçüm çerezsiz.**
2. **Birey düzeyinde kayıt yok:** oturum kaydı, ısı haritası, kullanıcı kimliği yok.
3. **Sağlayıcı veriyi yalnız site sahibi adına işliyor, kendi amacıyla
   kullanmıyor.** Site sahibi bunu sağlayıcının koşullarından doğrular;
   doğrulanmazsa rıza paneli.

- Kendi sunucusunda çalışan ölçümde 3. şart kendiliğinden sağlanır.
- Bulut sağlayıcıda ayrıca yurt dışı aktarım gelir: K-Yurt dışı
  (`kvkk-yansima` §6).
- md. 5/2-f'ye dayanılınca Rehber denge testini tavsiye eder (s. 17) [Rehber: tavsiye].
- Raporda site sahibine bunun bir benzetme olduğu söylenir: Rehber bu
  teknolojiler için yönlendirme yapmaz; Kurul farklı değerlendirebilir [skill yorumu].

## Araç bazında (tedarikçi beyanına göre, 2026 itibarıyla)

"Kural" sütunu satırın hangi kurala bağlandığını, "Değerlendirme" sütunu
hangi koşulun tutup tutmadığını gösterir. Tedarikçi davranışına dayanan her
hüküm, site sahibi teyit edene kadar `[DOĞRULA]`.

| Araç | Çerez / depolama | Veri nereye | Kural | Değerlendirme | Varsayılan sonuç |
|---|---|---|---|---|---|
| Google Analytics 4 (gtag/GTM) | `_ga`, `_ga_<ID>` (birinci taraf alan adı) | Google (ABD) | 1 | Veri Google'a gider: skill kuralı gereği rızasız yol yok [skill yorumu]; ayrıca a karşılanmaz: Google veriyi kendi amacıyla da kullanabilir (tedarikçi beyanı) [DOĞRULA]; reklam entegrasyonları a ve c'yi de bozar | **Rıza gerekir.** Rıza öncesi etiket yüklenmemeli; K-Ölçüm'de rızasız seçenek elenir |
| GA4 + Consent Mode v2 "advanced" | Rıza öncesi çerez yok ama çerezsiz sinyal gönderir (tedarikçi beyanı) [DOĞRULA] | Google | 2 | 3. şart karşılanmaz (Google'ın kendi amacı) | **Rıza öncesi sinyal de sorunlu**; "basic" mod (rıza yoksa hiç yükleme) öner |
| Google Tag Manager | Kendisi çerez koymaz | Google | Yüklediği etiketlere göre | Yüklendiği anda IP Google'a gider | GTM'i de rızaya bağla ya da yalnız rıza sonrası yükle; ayrıca K-Yurt dışı |
| Meta Pixel, TikTok, LinkedIn Insight, Google Ads | Reklam çerezleri | Tedarikçi | 1 | a ve c karşılanmaz; davranışsal reklam (Rehber 6.2, s. 28) | **Rıza gerekir** — tek yol |
| Microsoft Clarity, Hotjar | Oturum kaydı, ısı haritası | Tedarikçi | 1 | b karşılanmaz (birey düzeyinde kayıt) | **Rıza gerekir** |
| Yandex Metrica | Çerez + oturum kaydı (Webvisor) | Yandex (yurt dışı) | 1 | b karşılanmaz; f de karşılanmaz | **Rıza gerekir** |
| Matomo — kendi sunucunda, IP maskeli, veri paylaşımı kapalı | `_pk_*` | Kendi sunucun | 1 | a–c karşılanabilir; d (IP maskeleme) ve e ayarda doğrulanır; f kendiliğinden | **5.9'a en yakın aday**; ayarları belgeyle |
| Bulutta çalışan çerezli araç (ör. Matomo Cloud) | `_pk_*` vb. | Sağlayıcı | 1 | Veri bir sağlayıcıya gider: skill kuralı gereği rızasız yol yok [skill yorumu] | **Rıza gerekir**; ayrıca K-Yurt dışı |
| Matomo — kendi sunucunda, çerezsiz | Yok | Kendi sunucun | 2 | 1 ve 3 kendiliğinden; 2 (kullanıcı kimliği kapalı mı) ayarda doğrulanır | Rızasız ölçüm önerilebilir (benzetme) |
| Umami / Plausible — kendi sunucunda | Yok | Kendi sunucun | 2 | 1 ve 3 kendiliğinden; 2 ayarda doğrulanır | Rızasız ölçüm önerilebilir (benzetme) |
| Plausible / Umami / Fathom — bulut | Yok | Tedarikçi (bölge tedarikçiye göre) | 2 | 1 ve 2 tedarikçi beyanına göre; 3'ü site sahibi sağlayıcının koşullarından doğrular | Doğrulanırsa rızasız + K-Yurt dışı; doğrulanmazsa rıza paneli |
| Cloudflare Web Analytics (snippet) | Yok | Cloudflare (küresel ağ) | 2 | Aynı | Aynı |
| Vercel Web Analytics | Yok (günlük değişen hash; tedarikçi beyanı) | Vercel | 2 | Aynı | Aynı |
| Sunucu logu analizi (GoAccess vb.) | Yok | Kendi sunucun / barındırma | 2 | 5.10'a benzetme (güvenlik kısmı); analitik kısmı 5.9'a benzetme; Rehber yönlendirmesi yok (s. 9) [skill yorumu] | Kural 2'nin şartları tutuyorsa rıza istenmez; log süresini aydınlatmada yaz (LOG_SURESI, K-Sunucu) |

## Öneri sırası (site sahibine sunarken)

1. **Ölçüm gerçekten gerekli mi?** Gerekmiyorsa kaldır — en temiz çözüm
   (K-Ölçüm, seçenek A).
2. **Kendi sunucunda, çerezsiz, birey düzeyinde kayıt yok** (Umami/Plausible
   self-host, Matomo çerezsiz) → Kural 2; 3. şart kendiliğinden; bilgi şeridi
   yeter. Raporda bunun benzetme olduğunu söyle (K-Ölçüm, seçenek B).
   Kendi sunucunda çerezli araç (Matomo, IP maskeli, paylaşım kapalı) → Kural 1;
   çerezli analitikte rızasız yol yalnız budur [skill yorumu].
3. **Bulut çerezsiz** (Cloudflare, Vercel, Plausible bulut) → Kural 2; 3. şartı
   site sahibi doğrular, ayrıca K-Yurt dışı. Doğrulanmazsa rıza paneli
   (K-Ölçüm, seçenek B ya da C).
4. **GA4 / reklam / oturum kaydı / bulutta çerezli araç** gerekiyorsa → iki katmanlı rıza paneli,
   etiketler rızaya bağlı (`templates/riza-paneli.html`), Reddet sonrası
   `cerez-tespit.mjs` ile sıfır istek doğrulaması (K-Ölçüm, seçenek C).
   Yurt dışına giden araçta ayrıca K-Yurt dışı: çerez rızası aktarım rızası
   yerine geçmez [Kanun] + [skill yorumu].

Kullanıcı ölçüm aracını pazarlama gerekçesiyle seçmişse (ör. "site çerezsiz
analitik satıyor"), araç değişikliği iş kararıdır: seçenekleri maliyet ve
risk ile sun, kararı kullanıcı versin.

## Rıza öncesi davranışın ölçümü

Rıza gerektiren çerez ya da betik, rıza alınmadan yüklenmez: opt-in, opt-out
değil (s. 37–38) [Kurul kararı]. `cerez-tespit.mjs` çıktısında bak:

- `ilk` senaryosunda `riza: true` bir çerez ya da host varsa → rıza öncesi
  yükleme; en yaygın ihlal.
- `reddet` senaryosunda aynısı varsa → ret çalışmıyor.
- `reddet` ile `kabul` aynı kümeyse → seçim hiçbir şeyi değiştirmiyor.
- Çerez yok ama `beacon` sayısı > 0 olan host → çerezsiz ölçüm/piksel;
  aydınlatmada ayrı satır.
