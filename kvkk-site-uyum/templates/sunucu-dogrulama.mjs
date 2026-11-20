// Sunucu tarafı örneği (Vercel/Netlify fonksiyonu, Node). Kanıt sunucuda tutulur; çerez kanıt değildir.
// Yalnız form kendi sunucu fonksiyonuyla gidiyorsa kullanılır; üçüncü taraf form hizmetinde (Formspree vb.)
// bu kayıt yoktur ve aydınlatma metnindeki FORM_KAYIT_CUMLESI yazılmaz.
// Metin sürümü: yasal sayfalardaki "Son güncelleme" tarihi. Metin değişince BURAYI da güncelle.
const LEGAL_VERSION = '{{TARIH}}';
// Kullanım koşulları kabul kutusu yalnız kabul gerektiren hizmette vardır (form-onay.html → KABUL_KUTUSU).
const REQUIRE_TERMS = false;

// İşaretli kutu: form gövdesinde "1" (form-onay.html value="1"), JSON gövdesinde true. Başka her değer işaretsiz sayılır.
const isaret = (v) => v === true || String(v ?? '').trim() === '1';

// Kayda yazılan kullanıcı girdisi: satır sonu, sekme ve alan ayracı (·) temizlenir, uzunluk sınırlanır.
// Böylece girdiye satır eklenerek sahte bir onay satırı üretilemez.
export function temizle(v, max = 200) {
  return String(v ?? '')
    .replace(/[\r\n\t\u2028\u2029\u0085]+/g, ' ')
    .replace(/[·|]/g, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

const EPOSTA_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAcknowledgements(body) {
  if (!isaret(body.kvkk)) {
    return { error: 'Aydınlatma metnini okuduğunuzu işaretleyin.' }; // → HTTP 400
  }
  if (REQUIRE_TERMS && !isaret(body.terms)) {
    return { error: 'Kullanım koşullarını kabul ettiğinizi işaretleyin.' }; // → HTTP 400
  }
  return { ok: true };
}

// Form gönderim kaydı — talep kaydıyla birlikte saklanır. Süresi aydınlatma metni §7'deki
// "talebinize ilişkin veriler" süresidir (site sahibi belirler). IP'nin hukuki sebebi md. 5/2-e (§4).
export function acknowledgementLine(ip) {
  const satirlar = [
    `— {{SITE}}/{{FORM_YOLU}} · ${new Date().toISOString()} · ${temizle(ip, 64)}`,
    `Aydınlatma metni: okundu${REQUIRE_TERMS ? ' · Kullanım koşulları: kabul edildi' : ''} · metin sürümü ${LEGAL_VERSION}`,
  ];
  return satirlar.join('\n');
}

// Bülten onayı (YALNIZ bülten/kampanya e-postası gönderilecekse; form-onay.html → BULTEN_BLOGU).
// - Kutular isteğe bağlıdır; işaretsiz gelmeleri formu reddettirmez (onay ön şart yapılamaz).
// - Ticari ileti onayı ile KVKK açık rızası ayrı beyanlardır; ikisi de kaydedilir.
// - İki kutulu biçimde yalnız biri işaretliyse bülten kaydı yapılmaz, form yine gönderilir; dönen { not } ziyaretçiye
//   gösterilir ("Bülten için iki kutunun da işaretlenmesi gerekir.").
// Dönüş: null (bülten istenmedi), { not } (tek kutu işaretli; kayıt yok), { error } (ad soyad ya da e-posta eksik),
//   ya da kayda yazılacak satırlar (string). { not } ve { error } yalnız bülten kaydını durdurur: iletişim formu yine
//   gönderilir ve mesaj ziyaretçiye gösterilir; bunlar için HTTP 400 dönülmez (bülten isteğe bağlıdır, formun ön şartı
//   yapılamaz). HTTP 400 yalnız validateAcknowledgements hatasında döner.
// - Kayıtta onayı verenin ad soyadı ve adresi (e-posta) bulunur (Yönetmelik md. 7/1).
// - Elektronik ortamda alınan onayın bilgisi, reddetme imkânı da tanınarak 24 saat içinde alıcıya iletilir (teyit e-postası).
// - Onay 3 iş günü içinde İleti Yönetim Sistemi'ne (İYS) kaydedilir; kaydedilmeyen onay geçersizdir.
// - Onay kaydı, onayın sona ermesinden itibaren 3 yıl saklanır (talep kaydından ayrı süre).
// Dayanaklar: Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik md. 7 ve 13; KVKK md. 5/1.
export function newsletterConsent(body, ip, adSoyad, eposta) {
  const ileti = isaret(body.ileti) || isaret(body.bulten);
  const riza = isaret(body.riza) || isaret(body.bulten);
  if (!ileti && !riza) return null; // bülten istenmedi; form yine gönderilir
  if (ileti !== riza) return { not: 'Bülten için iki kutunun da işaretlenmesi gerekir.' }; // kayıt yok; form yine gönderilir
  const ad = temizle(adSoyad, 120);
  const adres = temizle(eposta, 254);
  if (!ad || !EPOSTA_RE.test(adres)) return { error: 'Bülten onayı için ad soyad ve geçerli bir e-posta adresi gerekir.' };
  return [
    'Ticari ileti onayı: evet · KVKK açık rızası: evet',
    `${ad} · ${adres} · ${new Date().toISOString()} · ${temizle(ip, 64)} · metin sürümü ${LEGAL_VERSION}`,
  ].join('\n');
}
