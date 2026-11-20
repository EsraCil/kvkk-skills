#!/usr/bin/env bash
# Kaynak taraması (cerez-uyum): izleyici ve ölçüm imzaları, rıza platformu, rızaya bağlama,
# depolama yazımları, gömülü içerik, dış alan adları. Çalışma zamanı tespitinin (cerez-tespit.mjs)
# göremediğini yakalar: koşullu yüklenen etiketler, yorum satırındaki eski kodlar, build öncesi kaynak.
# Kullanım: tarama.sh <site-kök-dizini>
# node_modules, .git ve build çıktısı olmayan dizinleri tarar; sonuç okunabilir rapordur, karar vermez.
set -u
ROOT="${1:-.}"
cd "$ROOT" || { echo "Dizin bulunamadı: $ROOT" >&2; exit 2; }
EX=(--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=.next --exclude-dir=.vercel)
INC=(--include='*.html' --include='*.htm' --include='*.js' --include='*.mjs' --include='*.ts' --include='*.jsx' --include='*.tsx' --include='*.vue' --include='*.svelte' --include='*.astro' --include='*.php' --include='*.css')

say() { printf '\n== %s\n' "$1"; }
hit() { # başlık, desen
  local n; n=$(grep -rIlE "${EX[@]}" "${INC[@]}" -- "$2" . 2>/dev/null | wc -l | tr -d ' ')
  if [ "$n" != "0" ]; then printf '  [%s dosya] %s\n' "$n" "$1"; grep -rInE "${EX[@]}" "${INC[@]}" -- "$2" . 2>/dev/null | head -3 | sed 's/^/      /' | cut -c1-160; fi
}

say "İzleyici / analitik imzaları"
hit "Google Tag Manager"        'googletagmanager\.com|GTM-[A-Z0-9]{4,}'
hit "Google Analytics (gtag/ga)" 'gtag\(|google-analytics\.com|analytics\.js|G-[A-Z0-9]{6,}|UA-[0-9]{4,}'
hit "Meta Pixel"                 'fbq\(|connect\.facebook\.net|facebook\.com/tr'
hit "Hotjar"                     'hotjar|_hj'
hit "Microsoft Clarity"          'clarity\.ms|clarity\('
hit "Yandex Metrica"             'mc\.yandex|ym\('
hit "LinkedIn Insight"           'snap\.licdn\.com|_linkedin_partner_id'
hit "TikTok Pixel"               'analytics\.tiktok\.com|ttq\.'
hit "HubSpot"                    'hs-scripts\.com|hsforms|hubspot'
hit "Intercom / Tawk / Crisp / Zendesk" 'intercom|tawk\.to|crisp\.chat|zdassets'
hit "Cloudflare Web Analytics (çerezsiz)" 'cloudflareinsights\.com'
hit "Plausible / Umami / Fathom (çerezsiz)" 'plausible\.io|umami|usefathom'
hit "Vercel Analytics / Speed Insights" '@vercel/analytics|@vercel/speed-insights|va\.vercel-scripts\.com|_vercel/insights'
hit "Matomo"                     'matomo|piwik|_paq\.push'

say "Rıza yönetimi"
hit "Rıza yönetim platformu (CMP)" 'cookielaw\.org|onetrust|cookiebot|cookieyes|usercentrics|iubenda|klaro|osano|cookieconsent|cookie-consent|complianz|borlabs|consentmanager'
hit "Google Consent Mode"        "gtag\(['\"]consent|analytics_storage|ad_storage|ad_user_data|ad_personalization"
hit "Rızaya bağlı betik (type=text/plain vb.)" 'type=["\x27]text/plain["\x27][^>]*(data-consent|data-category|data-cookiecategory|data-cookieconsent)|data-consent-script'
hit "Site kendi şeridi"          'data-consent|cookie-?banner|cookie-?bar|consent-?bar|cerez|çerez'

say "Gömülü içerik (çerez koyabilir)"
hit "YouTube gömme"              'youtube\.com/embed|youtube-nocookie\.com|youtu\.be'
hit "Vimeo gömme"                'player\.vimeo\.com'
hit "Google Maps gömme"          'google\.com/maps/embed|maps\.googleapis\.com'
hit "Sosyal eklenti"             'platform\.twitter\.com|platform\.linkedin\.com|instagram\.com/embed'

say "Güvenlik / doğrulama"
hit "reCAPTCHA"                  'google\.com/recaptcha|grecaptcha'
hit "Turnstile"                  'challenges\.cloudflare\.com|turnstile'

say "Üçüncü taraf font / CDN"
hit "Google Fonts"               'fonts\.googleapis\.com|fonts\.gstatic\.com'
hit "Diğer CDN"                  'cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|kit\.fontawesome\.com'

say "Tarayıcı depolama yazımları"
hit "document.cookie"            'document\.cookie'
hit "localStorage"               'localStorage\.(setItem|getItem)'
hit "sessionStorage"             'sessionStorage\.'
hit "indexedDB"                  'indexedDB'

say "Formlar ve gönderim hedefleri"
hit "<form action>"              '<form[^>]*action='
hit "Formspree / Netlify / Getform / Basin" 'formspree\.io|data-netlify|getform\.io|usebasin\.com'
hit "fetch/XHR"                  'fetch\(|XMLHttpRequest|axios\.'
hit "mailto:"                    'mailto:'
hit "WhatsApp bağlantısı"        'wa\.me/|api\.whatsapp\.com/'
hit "Onay kutusu (kvkk/terms)"   'name="(kvkk|terms|consent|onay)"'

say "Yasal sayfalar mevcut mu"
for f in kvkk aydinlatma cerez cookie gizlilik privacy kullanim-kosullari terms; do
  m=$(find . -path ./node_modules -prune -o -iname "*${f}*" -print 2>/dev/null | head -3 | tr '\n' ' ')
  [ -n "$m" ] && printf '  %-22s %s\n' "$f" "$m"
done

say "Dış alan adları (https://…) — sıklığa göre"
grep -rIhoE "${EX[@]}" "${INC[@]}" -- 'https?://[a-zA-Z0-9.-]+\.[a-z]{2,}' . 2>/dev/null \
  | sed -E 's#https?://##' | sort | uniq -c | sort -rn | head -25 | sed 's/^/  /'

say "CSP / güvenlik başlıkları"
# Bulunan başlık satırları yazılır; "(CSP yok)" ayrıca Content-Security-Policy satırına bakılarak yazılır
# (Referrer-Policy ya da X-Frame satırı CSP varmış gibi okunmasın).
for f in vercel.json netlify.toml _headers nginx.conf .htaccess; do
  if [ -f "$f" ]; then
    printf '  %s:\n' "$f"
    grep -nE 'Content-Security-Policy|X-Frame|Referrer-Policy' "$f" | cut -c1-200 | sed 's/^/    /'
    grep -qE 'Content-Security-Policy' "$f" || printf '    (CSP yok)\n'
  fi
done
printf '\nBitti. Bu rapor karar vermez: references/rehber-2025.md ile sınıfla, cerez-tespit.mjs ile gerçek davranışı doğrula.\n'
