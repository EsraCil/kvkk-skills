# KVKK site uyum skill'leri

Claude Code için iki skill. Bir web sitesinin KVKK yasal katmanını, sitenin **gerçekte ne yaptığına** bakarak denetler ve metinleri buna göre hazırlar. Şablonu tahminle doldurmaz; önce ölçer, sonra yazar.

> **Önemli:** Bu araç hukuki görüş değildir. Ürettiği metinler ve sınıflamalar yayına alınmadan önce site sahibi tarafından gözden geçirilmelidir. Araç, sizin karar vermeniz ya da öğrenmeniz gereken noktaları raporun başında "Sizden beklenenler" listesinde toplar.

## İçindekiler

| Skill | Ne yapar |
|---|---|
| `kvkk-site-uyum` | KVKK aydınlatma metni, kullanım koşulları, form onay kutuları ve sunucu tarafı doğrulama, yurt dışı aktarım ve ticari ileti (6563) kararları. Çerez adımında işi `cerez-uyum`'a devreder. |
| `cerez-uyum` | Çerezleri ve benzeri teknolojileri (localStorage, ölçüm betiği, piksel, gömülü içerik) gerçek tarayıcıda ölçer: şerit gösterilmeden önce, Reddet'ten sonra ve Kabul'den sonra ayrı ayrı. Sonuçları Kurum'un Çerez Rehberi'ne göre sınıflar; Çerez Aydınlatma Metni, çerez tablosu ve şerit ya da rıza paneli metni önerir. |

İki skill birlikte çalışacak şekilde yazıldı. İkisini birlikte kurun.

## Kurulum

```bash
git clone https://github.com/EsraCil/kvkk-skills.git
mkdir -p ~/.claude/skills
cp -R kvkk-skills/kvkk-site-uyum kvkk-skills/cerez-uyum ~/.claude/skills/
```

Skill'ler `~/.claude/skills/` altında olmalıdır: `kvkk-site-uyum`, `cerez-uyum`'un betiklerini bu yoldan çağırır. Projenin kendi `.claude/skills/` klasörüne kurulursa bu çağrılar çalışmaz.

**Gereksinimler**

- Claude Code
- Node.js 22 veya üstü (yerleşik WebSocket ve fetch kullanılır; npm paketi gerekmez)
- Chrome ya da Chromium (çerez ölçümü headless tarayıcıyla yapılır; Windows'ta Chrome yoksa Edge kullanılır)
- bash ve grep (kaynak taraması için; Windows'ta Git Bash)

Chrome standart dışı bir yerdeyse yolunu `CHROME=<yol>` ortam değişkeniyle verin.

## Kullanım

Claude Code'da sitenin klasöründeyken sorun:

- "Bu siteyi KVKK'ya uygun hale getir" ya da `/kvkk-site-uyum`
- "Bu sitede hangi çerezler var?", "çerez şeridi doğru mu?" ya da `/cerez-uyum`

Akış her zaman aynı sırayla ilerler: kaynak taraması, tarayıcıda ölçüm, sınıflama, kararlar, metin önerisi, kontrol.

Üç ilke:

- **Her cümlenin bir kaynağı var.** Sitenize yazılan her cümle ya mevzuattan, ya sitenizin ölçülen davranışından, ya da sizin verdiğiniz bilgiden gelir. Hiçbirine dayanmayan cümle yazılmaz; raporda teyit bekleyen nokta olarak kalır.
- **Seçimi siz yaparsınız.** Birden çok hukuki yol olan yerde (ör. form verisinin hukuki sebebi, yurt dışı aktarımın nasıl anlatılacağı) Claude seçenekleri, şartlarını ve risklerini gösterir, bir öneri yapar; seçim sizindir ve raporda kayıtlı kalır.
- **Kaynağın türü görünür.** Raporda her kuralın yanında kanun mu, yönetmelik mi, Kurum Rehberi'nin tavsiyesi mi, yoksa aracın kendi yorumu mu olduğu yazar.

Claude hiçbir metni onayınız olmadan sitenize yazmaz; commit ve push için ayrıca onay ister.

## Ne elde edersiniz

- **Rapor:** Sohbette gösterilir ve Markdown dosyası olarak kaydedilir (`kvkk-rapor-<alan-adı>-<tarih>.md` ya da yalnız çerez incelemesinde `cerez-rapor-…`). En üstte düz dilde özet ve sizden beklenen kararlar. Bölümleri: Görev, Değişiklik, Kararlar (seçenekler, öneri, seçiminiz), Dayanak (sitedeki her cümlenin kaynağı), Kanıt, Riskler ve çerez bulguları (ölçülen çerezler tablosu, şerit değerlendirmesi, Rehber'in EK-1 kontrol listesi). Dosyanın nereye kaydedileceğini Claude size sorar. Site klasörünün dışını seçin: rapor sitenin yayınlanan klasörüne düşerse herkese açık olur.
- **Sitenizde güncellenen dosyalar:** onay verdiğiniz metinler sitenin kendi sayfa düzenine yazılır: KVKK aydınlatma metni, kullanım koşulları, çerez aydınlatma metni ve tablosu, bilgi şeridi ya da rıza paneli, form onay kutuları ve sunucu tarafı doğrulama.

## Kapsam ve sınırlar

- **Hukuk:** Türkiye. 6698 sayılı KVKK; Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ; Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ; yurt dışı aktarım yönetmeliği; 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik; kullanım koşulları için Türk Borçlar Kanunu ve Hukuk Muhakemeleri Kanunu; Kurum'un *Çerez Uygulamaları Hakkında Rehber*'i (Temmuz 2025). GDPR ya da CCPA için yazılmadı.
- **Kontrol betiği:** `cerez-uyum/scripts/metin-kontrol.mjs`, siteye yazılacak metinde kalan yer tutucuyu, teyit bekleyen işareti ve bilinen hatalı kalıpları ("siteyi kullanmanız kabul sayılır", "kısa süreli" gibi) yayından önce yakalar; raporda kararların ve dayanak tablosunun biçimini denetler. Betiğin bulgu vermemesi metnin hukuken doğru olduğu anlamına gelmez. Regresyon testi: `node cerez-uyum/scripts/metin-kontrol-test.mjs`.
- **Site türü:** Statik siteler ve küçük SSR siteler. Üyelik, ödeme ya da kullanıcı içeriği olan uygulamalarda temel katmanı kurar ama sözleşme maddelerini yazmaz.
- **Ölçüm:** Giriş gerektiren sayfaları, iframe içindeki rıza panellerini ve yalnız belirli bir etkileşimle yüklenen üçüncü tarafları göremeyebilir. CDN ya da hosting katmanının eklediği çerezler yerelde görünmez; son ölçümü yayındaki adreste yapın.
- **Rehber:** `cerez-uyum/references/rehber-2025.md` Rehber'in kendi çalışma özetimizdir, metnin kendisi değildir. Resmî metin için kvkk.gov.tr (Yayınlar / Rehberler).

## Güncellik

Bu sürüm Temmuz 2025 tarihli Çerez Rehberi'ne ve 11.11.2026 itibarıyla yürürlükteki mevzuata göre hazırlanmıştır. Mevzuat ya da Kurum kararlarında değişiklik görürseniz issue açın.

**İsteğe bağlı güncel kaynak:** Claude Code'unuza Türk mevzuatı ya da KVKK Kurul kararı getiren bir MCP sunucusu bağlıysa (`kurum_karari_ara`, `mevzuat_getir` gibi araçlar), skill'ler onu kullanarak Rehber'den sonra çıkmış kararları tarar ve atıf yaptıkları maddeleri resmî metinden kontrol eder. Bağlı değilse skill'ler içlerindeki dosyalarla tam çalışır. Her iki durumda da rapordaki "Kaynaklar" satırı neyin, ne zaman kontrol edildiğini söyler.

## Lisans

MIT. Ayrıntı için [LICENSE](LICENSE).
