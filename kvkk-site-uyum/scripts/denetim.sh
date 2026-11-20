#!/usr/bin/env bash
# Kaynak taraması (kvkk-site-uyum): izleyici ve ölçüm imzaları, rıza yönetimi (rıza platformu, Google Consent Mode,
# rızaya bağlı bekletilen betikler, sitenin kendi şeridi), gömülü içerik, güvenlik doğrulaması, üçüncü taraf font ve
# CDN, depolama yazımları, form hedefleri, mailto ve WhatsApp bağlantıları, dış alan adları, CSP ve güvenlik başlıkları.
# İmza listesi tek kaynaktır: cerez-uyum/scripts/tarama.sh. Bu betik onu çağırır; iki skill aynı imzaları arar ve
# ayrışmaz. Bu yüzden iki skill aynı klasöre kurulur (~/.claude/skills/; README → Kurulum).
# Kullanım: denetim.sh <site-kök-dizini>
# node_modules, .git ve build çıktısı olmayan dizinleri tarar; sonuç okunabilir rapordur, karar vermez.
set -u
TARAMA="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../cerez-uyum/scripts/tarama.sh"
if [ ! -f "$TARAMA" ]; then
  echo "cerez-uyum/scripts/tarama.sh bulunamadı ($TARAMA): iki skill aynı klasöre kurulmalı (README → Kurulum)." >&2
  exit 2
fi
bash "$TARAMA" "${1:-.}"
