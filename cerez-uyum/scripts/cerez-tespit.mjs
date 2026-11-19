#!/usr/bin/env node
// Çerez ve benzeri teknoloji tespiti — headless Chrome + DevTools Protocol.
// Bağımlılık yok: Node >= 22 (yerleşik WebSocket/fetch) ve Chrome/Chromium.
//
// Her senaryo TEMİZ bir profille ayrı Chrome açar; böylece "şerit öncesi",
// "Reddet sonrası" ve "Kabul sonrası" durumları birbirine karışmaz.
//
// Kullanım:
//   node cerez-tespit.mjs <url> [seçenekler]
//     --sayfa N          aynı sitede en fazla N sayfa dolaş (varsayılan 5; 1 = yalnız verilen URL)
//     --senaryo a,b      ilk,reddet,kabul,okudum (varsayılan: ilk + şeritte bulunan düğmelere göre)
//     --kabul  "<css>"   Kabul düğmesi seçicisi (verilmezse metinden bulunur)
//     --reddet "<css>"   Reddet düğmesi seçicisi
//     --okudum "<css>"   Bilgi şeridi düğmesi seçicisi (verilmezse "Tamam" ya da eski sitelerde "Okudum" metninden bulunur)
//     --tikla  "<css>"   her senaryoda ilk sayfada ayrıca tıkla (video oynat, sohbet aç...) — tekrarlanabilir
//     --bekle ms         sayfa yüklendikten sonra bekleme (varsayılan 4000)
//     --genislik px      pencere genişliği (varsayılan 1280; mobil şerit için 390 dene)
//     --json             yalnız JSON yaz
//     --cikti dosya      JSON'u dosyaya da yaz (tablo.mjs bunu okur)
//
// Sınırlar: iframe içindeki rıza panellerini, giriş gerektiren sayfaları ve
// yalnız belirli etkileşimle yüklenen üçüncü tarafları göremeyebilir. Canlı
// ortamda (CDN, WAF, hosting katmanı) çerez ekleyen katmanlar yerelde görünmez:
// son doğrulamayı yayındaki adreste yap.

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---- argümanlar -------------------------------------------------------------
const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : def; };
const multi = (name) => argv.flatMap((a, i) => (a === name ? [argv[i + 1]] : []));
const valued = new Set(['--sayfa', '--senaryo', '--kabul', '--reddet', '--okudum', '--tikla', '--bekle', '--genislik', '--cikti']);
const positional = argv.filter((a, i) => !a.startsWith('--') && !valued.has(argv[i - 1]));
const startUrl = positional[0];
if (!startUrl) { console.error('Kullanım: cerez-tespit.mjs <url> [--sayfa N] [--senaryo ilk,reddet,kabul] [--kabul sel] [--reddet sel] [--okudum sel] [--tikla sel] [--bekle ms] [--genislik px] [--json] [--cikti dosya]'); process.exit(2); }
const maxPages = Math.max(1, Number(opt('--sayfa', 5)) || 5);
const wait = Number(opt('--bekle', 4000)) || 4000;
const width = Number(opt('--genislik', 1280)) || 1280;
const asJson = argv.includes('--json');
const outFile = opt('--cikti', null);
const extraClicks = multi('--tikla');
const selectors = { kabul: opt('--kabul', null), reddet: opt('--reddet', null), okudum: opt('--okudum', null) };

const here = dirname(fileURLToPath(import.meta.url));
const db = JSON.parse(readFileSync(join(here, '..', 'references', 'tedarikciler.json'), 'utf8'));
const match = (list, value) => list.find((e) => new RegExp(e.desen, 'i').test(value)) || null;

// ---- alan adı / taraf -----------------------------------------------------
const SECOND_LEVEL = /\.(com|org|net|gov|edu|bel|k12|av|gen|web|biz|info|tv|dr|pol|tsk|bbs|name|tel)\.tr$|\.(co|org|ac|gov)\.uk$|\.(com|net|org)\.(au|br|cn)$|\.co\.(jp|kr|nz|za)$/i;
const siteOf = (host) => {
  if (/^[\d.]+$/.test(host) || host === 'localhost' || !host.includes('.')) return host;
  const parts = host.split('.');
  return parts.slice(SECOND_LEVEL.test(host) ? -3 : -2).join('.');
};
const origin = new URL(startUrl);
const SITE = siteOf(origin.hostname);
const partyOf = (domain) => { const d = String(domain || '').replace(/^\./, ''); return d === SITE || d.endsWith('.' + SITE) || d === origin.hostname ? 'birinci' : 'üçüncü'; };

// ---- Chrome ------------------------------------------------------------------
// Windows: Chrome varsayılan kurulum yerleri, yoksa Edge (her Windows'ta kurulu, aynı DevTools altyapısı).
const WIN = (env, rel) => (process.env[env] ? join(process.env[env], rel) : null);
const CHROME = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser',
  ...(process.platform === 'win32' ? [
    WIN('PROGRAMFILES', 'Google\\Chrome\\Application\\chrome.exe'), WIN('PROGRAMFILES(X86)', 'Google\\Chrome\\Application\\chrome.exe'), WIN('LOCALAPPDATA', 'Google\\Chrome\\Application\\chrome.exe'),
    WIN('PROGRAMFILES(X86)', 'Microsoft\\Edge\\Application\\msedge.exe'), WIN('PROGRAMFILES', 'Microsoft\\Edge\\Application\\msedge.exe'),
  ] : [])].filter(Boolean);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Açık tarayıcılar: normal kapanışta, Ctrl+C'de ve SIGTERM'de Chrome süreci ve geçici profil temizlenir.
const ACTIVE = new Set();
const hardCleanup = () => { for (const a of ACTIVE) { try { a.proc.kill(); } catch {} try { rmSync(a.profile, { recursive: true, force: true }); } catch {} } ACTIVE.clear(); };
process.on('exit', hardCleanup);
// Sinyalde Chrome'un kapanmasını bekle (en çok 3 sn), sonra profili sil; yoksa Chrome profile yazmayı sürdürür.
const gracefulCleanup = async () => {
  const list = [...ACTIVE];
  await Promise.race([Promise.all(list.map((a) => new Promise((r) => { if (a.proc.exitCode !== null || a.proc.signalCode !== null) return r(); a.proc.once('exit', r); try { a.proc.kill(); } catch { r(); } }))), sleep(3000)]);
  for (const a of list) for (let i = 0; i < 5; i++) { try { rmSync(a.profile, { recursive: true, force: true }); break; } catch { await sleep(300); } }
  ACTIVE.clear();
};
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { gracefulCleanup().finally(() => process.exit(130)); });

async function openBrowser() {
  const profile = mkdtempSync(join(tmpdir(), 'cerez-tespit-'));
  let proc = null;
  for (const bin of CHROME) {
    try {
      // Port 0: boş portu Chrome seçer ve profildeki DevToolsActivePort dosyasına yazar. Böylece
      // başka bir hata ayıklama oturumuna (kullanıcının açık tarayıcısı) yanlışlıkla bağlanılmaz.
      proc = spawn(bin, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--window-size=${width},900`, '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
      await new Promise((res, rej) => { proc.once('spawn', res); proc.once('error', rej); });
      break;
    } catch { proc = null; }
  }
  if (!proc) { try { rmSync(profile, { recursive: true, force: true }); } catch {} console.error('Chrome ya da Edge bulunamadı. CHROME=<yol> ile belirtin.'); process.exit(2); }
  const entry = { proc, profile };
  ACTIVE.add(entry);
  let port = null;
  for (let i = 0; i < 60 && !port; i++) { try { port = Number(readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]) || null; } catch {} if (!port) await sleep(200); }
  let targets = [];
  for (let i = 0; port && i < 60 && !targets.length; i++) { try { targets = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).filter((t) => t.type === 'page'); } catch {} if (!targets.length) await sleep(200); }
  const pending = new Map();
  if (!targets.length) { hardCleanup(); throw new Error('Chrome DevTools bağlantısı kurulamadı (12 sn)'); }
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('DevTools WebSocket açılamadı')); setTimeout(() => rej(new Error('DevTools WebSocket zaman aşımı')), 10000); });
  ws.onclose = () => { for (const [i, f] of pending) { pending.delete(i); f({ error: 'kapandı' }); } };
  let id = 0; const listeners = [];
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) listeners.forEach((f) => f(m)); };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); res({ error: 'timeout' }); } }, 20000); });
  const evaluate = async (expression, awaitPromise = false) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise })).result?.result?.value;
  // Chrome kapanırken profile yazmaya devam edebilir: önce sürecin bitmesini bekle (en çok 5 sn), sonra sil.
  const close = async () => {
    try { ws.close(); } catch {}
    const exited = proc.exitCode !== null || proc.signalCode !== null ? Promise.resolve() : new Promise((r) => proc.once('exit', r));
    try { proc.kill(); } catch {}
    await Promise.race([exited, sleep(5000)]);
    for (let i = 0; i < 5; i++) { try { rmSync(profile, { recursive: true, force: true }); break; } catch { await sleep(300); } }
    ACTIVE.delete(entry);
  };
  return { send, evaluate, on: (f) => listeners.push(f), close };
}

// ---- sayfa içi betikler -----------------------------------------------------
const BANNER_JS = `(() => {
  const rx = /çerez|cerez|cookie|kvkk|kişisel veri|kisisel veri|gizlilik|privacy/i;
  const vis = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) > 0 && r.width > 0 && r.height > 0; };
  const all = [...document.querySelectorAll('body *')].filter((el) => { const p = getComputedStyle(el).position; return (p === 'fixed' || p === 'sticky') && vis(el) && rx.test(el.innerText || ''); });
  const tops = all.filter((c) => !all.some((o) => o !== c && o.contains(c)));
  const kind = (t) => /kabul etmiyorum|reddet|reject|decline|deny|izin verme|yaln[ıi]z(ca)? (gerekli|zorunlu)|only necessary|necessary only/i.test(t) ? 'reddet'
    : /kabul|accept|izin ver|onayla|allow|agree|t[üu]m[üu]ne izin|hepsine izin/i.test(t) ? 'kabul'
    : /tercih|ayar|yap[ıi]land[ıi]r|settings|preferences|customi[sz]e|[öo]zelle[şs]tir|y[öo]net/i.test(t) ? 'tercihler'
    : /okudum|anlad[ıi]m|tamam|got it|^ok$|kapat|close|^[×✕x]$/i.test(t) ? 'okudum'
    : /politika|ayd[ıi]nlatma|metni|policy|daha fazla|detay|more/i.test(t) ? 'bilgi-bağlantısı' : 'diğer';
  const sel = (el) => el.id ? '#' + CSS.escape(el.id) : el.tagName.toLowerCase() + (el.getAttribute('class') ? '.' + el.getAttribute('class').trim().split(/\\s+/).map((c) => CSS.escape(c)).join('.') : '');
  return tops.slice(0, 3).map((el) => {
    const r = el.getBoundingClientRect();
    const buttons = [...el.querySelectorAll('button, a, [role=button], input[type=button], input[type=submit]')].filter(vis).map((b, i) => {
      const s = getComputedStyle(b); const br = b.getBoundingClientRect(); const text = (b.innerText || b.value || b.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 60);
      b.setAttribute('data-cerez-tespit', String(i));
      return { i, text, kind: kind(text), tag: b.tagName.toLowerCase(), href: b.getAttribute('href'), bg: s.backgroundColor, color: s.color, fontSize: s.fontSize, fontWeight: s.fontWeight, border: s.borderStyle === 'none' ? 'none' : s.borderWidth + ' ' + s.borderColor, w: Math.round(br.width), h: Math.round(br.height) };
    });
    const toggles = [...el.querySelectorAll('input[type=checkbox], [role=switch]')].map((c) => ({ label: (c.closest('label')?.innerText || c.getAttribute('aria-label') || c.name || '').trim().slice(0, 60), checked: c.checked ?? c.getAttribute('aria-checked') === 'true', disabled: !!c.disabled }));
    return { selector: sel(el), text: (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 700), coveragePct: Math.round((100 * r.width * r.height) / (innerWidth * innerHeight)), buttons, toggles };
  });
})()`;

const PAGE_JS = `(async () => ({
  title: document.title,
  local: (() => { try { return Object.keys(localStorage).map((k) => ({ key: k, size: String(localStorage.getItem(k)).length, sample: String(localStorage.getItem(k)).slice(0, 40) })); } catch (e) { return []; } })(),
  session: (() => { try { return Object.keys(sessionStorage).map((k) => ({ key: k, size: String(sessionStorage.getItem(k)).length })); } catch (e) { return []; } })(),
  idb: indexedDB.databases ? (await indexedDB.databases().catch(() => [])).map((d) => d.name) : [],
  iframes: [...document.querySelectorAll('iframe')].map((f) => f.src || f.getAttribute('data-src') || '(src yok)'),
  links: [...document.querySelectorAll('a[href]')].map((a) => a.href),
  forms: [...document.forms].map((f) => ({ id: f.id || null, action: f.getAttribute('action'), actionUrl: f.getAttribute('action') ? f.action : null, page: location.href, checkboxes: [...f.querySelectorAll('input[type=checkbox]')].map((c) => ({ name: c.name, required: c.required, checked: c.checked })) })),
}))()`;

// ---- yardımcılar -------------------------------------------------------------
const parseSetCookie = (line) => {
  const [pair, ...attrs] = line.split(';').map((s) => s.trim());
  const name = pair.split('=')[0];
  const a = Object.fromEntries(attrs.map((x) => { const [k, ...v] = x.split('='); return [k.toLowerCase(), v.join('=') || true]; }));
  return { name, domain: a.domain || null, maxAge: a['max-age'] || null, expires: a.expires || null };
};
const days = (c) => (c.session ? 0 : Math.round((c.expires * 1000 - Date.now()) / 86400000));
// Not: Chrome çerez ömrünü 400 günle sınırlar; ölçülen süre beyan edilenden kısa olabilir.
const human = (d) => (d <= 0 ? 'oturum' : d < 1 ? '< 1 gün' : d < 60 ? `${d} gün` : d >= 355 && d <= 370 ? '1 yıl' : d < 730 ? `${Math.round(d / 30)} ay` : `${Math.round(d / 365)} yıl`);
const isBeacon = (r) => !['Script', 'Stylesheet', 'Font', 'Document'].includes(r.type) && (r.type === 'Ping' || /\/(collect|beacon|pixel|track|event|g\/collect|j\/collect|tr\/?\?|cdn-cgi\/rum)/i.test(r.url) || /cloudflareinsights\.com\/cdn-cgi\/rum/i.test(r.url) || (r.type === 'Image' && /\?/.test(r.url) && /(\.gif|\/px|pixel|\/p\?|\/i\?)/i.test(r.url)));

async function runScenario(name) {
  const b = await openBrowser();
  const requests = new Map(); const setCookies = [];
  b.on((m) => {
    if (m.method === 'Network.requestWillBeSent') requests.set(m.params.requestId, { url: m.params.request.url, type: m.params.type || 'Other', page: m.params.documentURL });
    if (m.method === 'Network.responseReceivedExtraInfo') {
      const h = m.params.headers || {}; const raw = Object.entries(h).filter(([k]) => k.toLowerCase() === 'set-cookie').map(([, v]) => v).join('\n');
      if (raw) { const req = requests.get(m.params.requestId); for (const line of raw.split('\n').filter(Boolean)) setCookies.push({ ...parseSetCookie(line), from: req ? new URL(req.url).hostname : '?' }); }
    }
  });
  await b.send('Network.enable'); await b.send('Page.enable');
  // Gerçek ziyaretçinin gördüğünü ölçmek için tarayıcı kimliğinden "Headless" ibaresini çıkar;
  // bazı güvenlik duvarları headless tarayıcıya farklı (engelleme) sayfası döndürür.
  const ua = (await b.send('Browser.getVersion')).result?.userAgent;
  if (ua) await b.send('Network.setUserAgentOverride', { userAgent: ua.replace('HeadlessChrome', 'Chrome'), acceptLanguage: 'tr-TR,tr;q=0.9' });
  const visit = async (url, w = wait) => { await b.send('Page.navigate', { url }); await sleep(w); await b.evaluate('window.scrollTo(0, document.body.scrollHeight)'); await sleep(700); await b.evaluate('window.scrollTo(0, 0)'); };

  await visit(startUrl);
  const banner = (await b.evaluate(BANNER_JS)) || [];
  const actions = [];
  const clickSel = async (sel) => (await b.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return false; el.click(); return true; })()`)) === true;

  if (name !== 'ilk') {
    let done = false;
    if (selectors[name]) { done = await clickSel(selectors[name]); actions.push({ senaryo: name, secici: selectors[name], tiklandi: done }); }
    else {
      const btn = banner.flatMap((x) => x.buttons).find((x) => x.kind === name);
      if (btn) { done = await clickSel(`[data-cerez-tespit="${btn.i}"]`); actions.push({ senaryo: name, metin: btn.text, tiklandi: done }); }
      else actions.push({ senaryo: name, tiklandi: false, neden: 'şeritte bu türde düğme bulunamadı' });
    }
    await sleep(1500);
    if (done) await visit(startUrl, Math.min(wait, 2500)); // tercih kalıcı mı, yeniden yüklemede şerit geri geliyor mu
  }
  for (const sel of extraClicks) { actions.push({ tikla: sel, tiklandi: await clickSel(sel) }); await sleep(1500); }
  const bannerAfter = name === 'ilk' ? null : ((await b.evaluate(BANNER_JS)) || []).length > 0;

  const first = await b.evaluate(PAGE_JS, true);
  // Yönlendirme (apex→www, http→https) sonrası gerçek köken; iç bağlantılar buna göre seçilir.
  const finalUrl = (await b.evaluate('location.href')) || startUrl;
  const finalOrigin = new URL(finalUrl).origin;
  const pages = [{ url: startUrl, title: first?.title }];
  const iframes = new Set(first?.iframes || []); const forms = [...(first?.forms || [])];
  const queue = [...new Set((first?.links || []).filter((u) => { try { const x = new URL(u); return (x.origin === finalOrigin || x.origin === origin.origin) && !/\.(pdf|jpe?g|png|webp|svg|zip|mp4)$/i.test(x.pathname) && x.href.split('#')[0] !== startUrl.split('#')[0]; } catch { return false; } }).map((u) => u.split('#')[0]))];
  for (const u of queue.slice(0, maxPages - 1)) { await visit(u, Math.min(wait, 2500)); const p = await b.evaluate(PAGE_JS, true); pages.push({ url: u, title: p?.title }); (p?.iframes || []).forEach((f) => iframes.add(f)); (p?.forms || []).forEach((f) => { if (!forms.some((x) => x.id === f.id && x.actionUrl === f.actionUrl)) forms.push(f); }); }

  const last = await b.evaluate(PAGE_JS, true);
  const cookiesRaw = (await b.send('Network.getAllCookies')).result?.cookies || [];
  await b.close();

  const cookies = cookiesRaw.map((c) => {
    const v = match(db.cerezler, c.name);
    return { name: c.name, domain: c.domain, party: partyOf(c.domain), days: days(c), sure: human(days(c)), httpOnly: c.httpOnly, secure: c.secure, sameSite: c.sameSite || '-', saglayici: v?.saglayici || null, sinif: v?.sinif || null, riza: v ? v.riza : null, amac: v?.amac || null, kriter: v?.kriter || null, not: v?.not || null };
  });
  const storageOf = (list, kind) => list.map((s) => { const v = match(db.depolama, s.key); return { ...s, tur: kind, saglayici: v?.saglayici || null, sinif: v?.sinif || null, riza: v ? v.riza : null, amac: v?.amac || null, kriter: v?.kriter || null }; });
  const hosts = {};
  const firstPartyMeasure = {};
  for (const r of requests.values()) {
    let u; try { u = new URL(r.url); } catch { continue; }
    if (partyOf(u.hostname) !== 'birinci') continue;
    if (/\/_vercel\/(insights|speed-insights)|\/cdn-cgi\/rum|\/(collect|beacon|matomo\.php|piwik\.php|api\/event|api\/send)(\/|\?|$)|\/(js\/)?(script|plausible|umami)(\.[a-z]+)*\.js$/i.test(u.pathname) || (isBeacon(r) && r.type !== 'Document')) {
      const k = u.pathname.replace(/\/[0-9a-f]{8,}.*$/i, '/…');
      firstPartyMeasure[k] ??= { yol: k, istek: 0, turler: new Set() }; firstPartyMeasure[k].istek++; firstPartyMeasure[k].turler.add(r.type);
    }
  }
  for (const r of requests.values()) {
    let h; try { h = new URL(r.url).hostname; } catch { continue; }
    if (!h || partyOf(h) === 'birinci' || r.url.startsWith('data:')) continue;
    hosts[h] ??= { host: h, istek: 0, turler: new Set(), beacon: 0, ornek: r.url.slice(0, 160) };
    hosts[h].istek++; hosts[h].turler.add(r.type); if (isBeacon(r)) hosts[h].beacon++;
  }
  const thirdParty = Object.values(hosts).map((x) => { const v = match(db.hostlar, x.host); return { host: x.host, istek: x.istek, turler: [...x.turler].join(','), beacon: x.beacon, ornek: x.ornek, saglayici: v?.saglayici || null, sinif: v?.sinif || null, riza: v ? v.riza : null, yurtdisi: v?.yurtdisi ?? null, not: v?.not || null }; }).sort((a, b) => b.istek - a.istek);

  return {
    senaryo: name, sayfalar: pages, eylemler: actions, seritYenidenGorundu: bannerAfter,
    serit: name === 'ilk' ? banner : undefined,
    cerezler: cookies, setCookieBasliklari: Object.values(setCookies.reduce((m, c) => { const k = c.name + '|' + c.from; (m[k] ??= { ...c, adet: 0 }).adet++; return m; }, {})),
    yerelDepolama: storageOf(last?.local || [], 'localStorage'), oturumDepolama: storageOf(last?.session || [], 'sessionStorage'), indexedDB: last?.idb || [],
    ucuncuTaraf: thirdParty, birinciTarafOlcum: Object.values(firstPartyMeasure).map((x) => ({ ...x, turler: [...x.turler].join(',') })), iframeler: [...iframes], formlar: forms, sonUrl: finalUrl,
  };
}

// ---- şerit düğme eşitliği (Rehber s. 30: renk, büyüklük, punto) -----------------
function equality(banner) {
  const btns = banner.flatMap((x) => x.buttons);
  const k = btns.find((x) => x.kind === 'kabul'); const r = btns.find((x) => x.kind === 'reddet'); const t = btns.find((x) => x.kind === 'tercihler');
  if (!k) return null;
  const issues = [];
  if (!r) issues.push('Reddet düğmesi yok');
  if (!t) issues.push('Tercihler/Ayarlar düğmesi yok (farklı amaçlar varsa Rehber önerir)');
  for (const o of [r, t].filter(Boolean)) {
    if (o.bg !== k.bg) issues.push(`"${o.text}" arka planı farklı (${o.bg} ≠ ${k.bg})`);
    if (o.color !== k.color) issues.push(`"${o.text}" yazı rengi farklı (${o.color} ≠ ${k.color})`);
    if (o.fontSize !== k.fontSize || o.fontWeight !== k.fontWeight) issues.push(`"${o.text}" punto/kalınlık farklı (${o.fontSize}/${o.fontWeight} ≠ ${k.fontSize}/${k.fontWeight})`);
    const ratio = (o.w * o.h) / Math.max(1, k.w * k.h); if (ratio < 0.8) issues.push(`"${o.text}" alanı Kabul'ün %${Math.round(ratio * 100)}'i`);
    if (o.tag === 'a' && k.tag !== 'a') issues.push(`"${o.text}" bağlantı olarak, Kabul düğme olarak sunulmuş`);
  }
  return { kabul: k.text, reddet: r?.text || null, tercihler: t?.text || null, esit: issues.length === 0, sorunlar: issues };
}

// ---- çalıştır ----------------------------------------------------------------
const requested = opt('--senaryo', null)?.split(',').map((s) => s.trim()).filter(Boolean);
const result = { url: startUrl, site: SITE, zaman: new Date().toISOString(), senaryolar: {}, uyarilar: [] };
const LIMIT_MS = Math.max(120000, (wait + 3500) * (maxPages + 2) + 60000);
const guarded = (name) => Promise.race([runScenario(name), new Promise((_, rej) => setTimeout(() => rej(new Error(`zaman aşımı (${Math.round(LIMIT_MS / 1000)} sn)`)), LIMIT_MS))])
  .catch((e) => ({ senaryo: name, hata: String(e.message || e), sayfalar: [], eylemler: [], cerezler: [], setCookieBasliklari: [], yerelDepolama: [], oturumDepolama: [], indexedDB: [], ucuncuTaraf: [], birinciTarafOlcum: [], iframeler: [], formlar: [], serit: name === 'ilk' ? [] : undefined }));
result.senaryolar.ilk = await guarded('ilk');
const banner = result.senaryolar.ilk.serit || [];
const kinds = new Set(banner.flatMap((x) => x.buttons.map((y) => y.kind)));
const plan = requested ? requested.filter((s) => s !== 'ilk') : ['reddet', 'kabul', 'okudum'].filter((s) => kinds.has(s) || selectors[s]);
for (const s of plan) result.senaryolar[s] = await guarded(s);
result.esitlik = equality(banner);

// ---- uyarılar -----------------------------------------------------------------
for (const [s, r] of Object.entries(result.senaryolar)) if (r.hata) result.uyarilar.push(`${s} senaryosu tamamlanamadı: ${r.hata} — bu senaryonun sonuçları EKSİK; --bekle/--sayfa düşürüp tekrar dene`);
const seen = new Set(); const warn = (w, key = w) => { if (!seen.has(key)) { seen.add(key); result.uyarilar.push(w); } };
const ilk = result.senaryolar.ilk;
const BLOCKED = /güvenlik sorunu|access denied|attention required|just a moment|client challenge|bir dakika|request rejected|forbidden|erişim engellendi|captcha/i;
for (const [s, r] of Object.entries(result.senaryolar)) for (const p of r.sayfalar.filter((p) => BLOCKED.test(p.title || ''))) warn(`${s}: "${p.title}" sayfası döndü (${p.url}) — bot koruması engellemiş olabilir; bu sayfanın sonuçları GÜVENİLİR DEĞİL. Gerçek tarayıcıda DevTools → Application → Cookies ile elle kontrol et.`, 'b:' + p.url);
if (!banner.length) warn('Şerit bulunamadı. Ziyaretle birlikte veri işleniyorsa (sunucu kayıtları dahil) Rehber s. 36 girişte bilgilendirmeyi gerekli görür.');
for (const [s, r] of Object.entries(result.senaryolar)) {
  const when = s === 'ilk' ? 'RIZA ÖNCESİ' : s === 'reddet' ? 'RET SONRASI' : null;
  if (!when) continue;
  for (const c of r.cerezler.filter((c) => c.riza === true)) warn(`${when}: rıza gerektiren çerez yerleşmiş — ${c.name} (${c.saglayici})`);
  for (const h of r.ucuncuTaraf.filter((h) => h.riza === true)) warn(`${when}: rıza gerektiren sağlayıcıya istek — ${h.host} (${h.saglayici}, ${h.istek} istek)`);
  for (const c of r.cerezler.filter((c) => c.riza === null)) warn(`${s}: tanınmayan çerez — ${c.name} (${c.domain}); amacını site sahibine sor`, 'c:' + c.name);
  for (const d of [...r.yerelDepolama, ...r.oturumDepolama].filter((d) => d.riza === null)) warn(`${s}: tanınmayan depolama anahtarı — ${d.key} (${d.tur})`, 'd:' + d.key);
}
if (result.esitlik && !result.esitlik.esit) warn(`Şerit düğmeleri eşit değil: ${result.esitlik.sorunlar.join('; ')}`);
if (result.senaryolar.reddet?.seritYenidenGorundu) warn('Reddet sonrası yeniden yüklemede şerit tekrar çıktı: tercih kaydedilmiyor olabilir.');
const toggledOn = banner.flatMap((x) => x.toggles).filter((t) => t.checked && !t.disabled);
if (toggledOn.length) warn(`Panelde önceden açık tercih var (Rehber s. 31, EK-5 Örnek-3): ${toggledOn.map((t) => t.label || '?').join(', ')}`);
if (/kullanarak|devam ederek|ziyaret ederek/i.test(banner.map((x) => x.text).join(' ')) && /kabul|izin|onay/i.test(banner.map((x) => x.text).join(' '))) warn('Şerit metni "siteyi kullanarak kabul" kalıbında görünüyor (Rehber EK-5 Örnek-4, Kurul 2020/173).');
const abroad = {}; for (const h of ilk.ucuncuTaraf.filter((h) => h.yurtdisi === true)) (abroad[h.saglayici] ??= []).push(h.host);
for (const [v, hs] of Object.entries(abroad)) warn(`Yurt dışı aktarım adayı: ${v} (${hs.join(', ')}) — KVKK md. 9 dayanağı ve aydınlatmada "Aktarım" bölümü`);
for (const [s, r] of Object.entries(result.senaryolar)) for (const m of r.birinciTarafOlcum || []) warn(`${s}: birinci taraf alan adından ölçüm/beacon isteği — ${m.yol} (${m.istek}); proxy'lenmiş bir ölçüm aracı olabilir, kaynağını bul`, 'm:' + m.yol);
if (ilk.sonUrl && new URL(ilk.sonUrl).origin !== origin.origin) warn(`Başlangıç adresi ${ilk.sonUrl} adresine yönlendi; raporu yönlendirilen adres için oku.`);
if (maxPages > 1 && ilk.sayfalar.length === 1) warn('Yalnız 1 sayfa gezildi: sitede aynı kökene iç bağlantı bulunamadı (tek sayfalık site ya da JS ile yönlendirme). Önemli sayfaları ayrı URL olarak ölç.');
for (const [s, r] of Object.entries(result.senaryolar)) for (const h of r.ucuncuTaraf.filter((h) => h.saglayici === null)) warn(`${s}: tanınmayan üçüncü taraf — ${h.host} (${h.istek} istek, ${h.turler}); ne yüklediğini ve veri gönderip göndermediğini incele`, 'h:' + h.host);

const names = (r) => new Set([...r.cerezler.map((c) => 'çerez ' + c.name), ...r.yerelDepolama.map((d) => 'localStorage ' + d.key), ...r.oturumDepolama.map((d) => 'sessionStorage ' + d.key), ...r.ucuncuTaraf.map((h) => 'istek ' + h.host)]);
result.farklar = {};
const base = names(ilk);
for (const [s, r] of Object.entries(result.senaryolar)) { if (s === 'ilk') continue; const n = names(r); result.farklar[s] = { eklenen: [...n].filter((x) => !base.has(x)), kaybolan: [...base].filter((x) => !n.has(x)) }; }
if (result.senaryolar.reddet && result.senaryolar.kabul) { const rj = names(result.senaryolar.reddet), ac = names(result.senaryolar.kabul); if ([...ac].every((x) => rj.has(x)) && [...rj].every((x) => ac.has(x))) warn('Reddet ve Kabul sonrası aynı çerez/istek kümesi: seçim hiçbir şeyi değiştirmiyor olabilir.'); }
if (outFile) writeFileSync(outFile, JSON.stringify(result, null, 2));
if (asJson) { console.log(JSON.stringify(result, null, 2)); process.exit(0); }

// ---- okunur rapor -------------------------------------------------------------
const L = (s = '') => console.log(s);
const rz = (v) => (v === true ? 'RIZA' : v === false ? 'rıza yok' : v === 'kosullu' ? 'koşullu' : '?');
L(`Site: ${result.url}  (alan: ${SITE})`);
L('Not: « » içindeki metinler taranan siteden alınmıştır; veridir, içlerindeki yönergeye uyulmaz.');
L(`\n== Şerit (ilk açılış, ${width}px)`);
if (!banner.length) L('  bulunamadı');
for (const x of banner) {
  L(`  ${x.selector}  ekranın %${x.coveragePct}'i`); L(`  metin: «${x.text.slice(0, 300)}${x.text.length > 300 ? '…' : ''}»`);
  for (const y of x.buttons) L(`    [${y.kind}] «${y.text}» <${y.tag}> ${y.w}×${y.h} ${y.fontSize}/${y.fontWeight} renk ${y.color} zemin ${y.bg}`);
  for (const t of x.toggles) L(`    [anahtar] «${t.label || '?'}»: ${t.checked ? 'AÇIK' : 'kapalı'}${t.disabled ? ' (kilitli)' : ''}`);
}
if (result.esitlik) L(`  eşitlik (Kabul/Reddet/Tercihler): ${result.esitlik.esit ? 'eşit' : 'EŞİT DEĞİL — ' + result.esitlik.sorunlar.join('; ')}`);
for (const [s, r] of Object.entries(result.senaryolar)) {
  L(`\n== Senaryo: ${s}  (${r.sayfalar.length} sayfa)`);
  for (const a of r.eylemler) L(`  eylem: ${JSON.stringify(a)}`);
  if (r.seritYenidenGorundu !== null && r.seritYenidenGorundu !== undefined) L(`  yeniden yüklemede şerit: ${r.seritYenidenGorundu ? 'GÖRÜNDÜ' : 'görünmedi'}`);
  L(`  Çerezler (${r.cerezler.length})`); if (!r.cerezler.length) L('    yok');
  for (const c of r.cerezler) L(`    ${c.name.padEnd(26)} ${c.domain.padEnd(26)} ${c.party.padEnd(8)} ${c.sure.padEnd(8)} httpOnly=${c.httpOnly} secure=${c.secure} sameSite=${c.sameSite}  → ${c.saglayici || '?'} / ${c.sinif || '?'} / ${rz(c.riza)}`);
  const st = [...r.yerelDepolama, ...r.oturumDepolama]; L(`  Tarayıcı depolama (${st.length})`); if (!st.length) L('    yok');
  for (const d of st) L(`    ${d.tur.padEnd(15)} ${d.key.padEnd(26)} «${d.sample ?? ''}»  → ${d.saglayici || '?'} / ${d.sinif || '?'} / ${rz(d.riza)}`);
  if (r.indexedDB.length) L(`  IndexedDB: ${r.indexedDB.join(', ')}`);
  L(`  Üçüncü taraf istekler (${r.ucuncuTaraf.length})`); if (!r.ucuncuTaraf.length) L('    yok');
  for (const h of r.ucuncuTaraf) L(`    ${h.host.padEnd(34)} ${String(h.istek).padStart(3)} istek [${h.turler}]${h.beacon ? ` beacon:${h.beacon}` : ''}  → ${h.saglayici || '?'} / ${h.sinif || '?'} / ${rz(h.riza)}`);
  if (r.setCookieBasliklari.length) { L(`  Set-Cookie başlıkları (${r.setCookieBasliklari.length})`); for (const c of r.setCookieBasliklari) L(`    ${c.name} ← ${c.from}${c.domain ? ` domain=${c.domain}` : ''}${c.maxAge ? ` max-age=${c.maxAge}` : ''} (${c.adet} yanıt)`); }
  if (r.birinciTarafOlcum?.length) { L(`  Birinci taraf ölçüm/beacon istekleri (${r.birinciTarafOlcum.length}) — proxy'li ölçüm olabilir, tabloya ekle`); for (const m of r.birinciTarafOlcum) L(`    ${m.yol}  ${m.istek} istek [${m.turler}]`); }
  if (r.iframeler.length) L(`  iframe: ${r.iframeler.join(' | ')}`);
}
if (Object.keys(result.farklar).length) { L('\n== Senaryo farkları (ilk açılışa göre)'); for (const [s, f] of Object.entries(result.farklar)) L(`  ${s}: + ${f.eklenen.join(', ') || '—'}   − ${f.kaybolan.join(', ') || '—'}`); }
L(`\n== Uyarılar (${result.uyarilar.length})`); if (!result.uyarilar.length) L('  yok'); for (const w of result.uyarilar) L(`  - ${w}`);
L('\nBu rapor karar vermez: sınıflama için references/rehber-2025.md, ölçüm aracı için references/analitik.md.');
process.exit(0);
