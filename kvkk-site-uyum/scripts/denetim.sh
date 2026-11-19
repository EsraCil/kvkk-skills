#!/usr/bin/env bash
# Kaynak taraması: izleyici imzaları, depolama yazımları, form hedefleri, dış alan adları.
# Kullanım: denetim.sh <site-kök-dizini>
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
for f in vercel.json netlify.toml _headers nginx.conf .htaccess; do
  [ -f "$f" ] && { printf '  %s:\n' "$f"; grep -nE 'Content-Security-Policy|X-Frame|Referrer-Policy' "$f" | cut -c1-200 | sed 's/^/    /' || printf '    (CSP yok)\n'; }
done
printf '\nBitti. Çerez/analitik bulgularını cerez-uyum skill'\''i ile sınıfla ve cerez-tespit.mjs ile gerçek davranışı doğrula.\n'
