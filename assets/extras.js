/* Flow Cycle Index — display-only extras: share, copy link, theme toggle, SW, analytics.
   Reads the DOM only; never changes data, ids, fetches or existing logic. */
(function () {
  'use strict';
  var SITE = 'https://theflowcycle.com';
  var T = function (s) { return (window.t ? window.t(s) : s); };
  var THEME_KEY = 'fci_theme';

  // ---- theme (default dark; light only when chosen) ----
  var css = document.createElement('style');
  css.textContent =
    'html.fci-light{filter:invert(1) hue-rotate(180deg);background:#080b10}' +
    'html.fci-light img,html.fci-light video,html.fci-light picture{filter:invert(1) hue-rotate(180deg)}' +
    '.fci-btn{margin-left:8px;background:transparent;color:inherit;border:1px solid rgba(148,163,184,.35);border-radius:6px;padding:2px 7px;font:inherit;font-size:12px;cursor:pointer;line-height:1.5;white-space:nowrap}' +
    '.fci-btn:hover{border-color:rgba(148,163,184,.7)}' +
    '.fci-tools{display:inline-flex;align-items:center;flex-wrap:wrap;gap:6px 0}' +
    '.fci-footer{position:relative;z-index:1;text-align:center;padding:28px 16px 40px;font-size:12px;color:#64748b}' +
    '.fci-footer a{color:#4f9eff;text-decoration:none;margin:0 8px}';
  document.head.appendChild(css);
  function getTheme() { try { return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'; } catch (e) { return 'dark'; } }
  function applyTheme(th) { document.documentElement.classList.toggle('fci-light', th === 'light'); }
  applyTheme(getTheme());

  function btn(label, title, fn) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'fci-btn';
    b.textContent = label; b.title = title; b.setAttribute('aria-label', title); b.addEventListener('click', fn); return b;
  }
  function txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : ''; }
  function shareText() {
    var parts = [];
    var score = txt('cycleIndex'), phase = txt('cyclePhase'), rate = txt('trackRecordRate');
    if (phase && !/^Loading/.test(phase)) parts.push(phase + (score && score !== '--' ? ' (' + score + '/100)' : ''));
    if (rate && rate !== '--') parts.push('Track record: ' + rate);
    return 'Flow Cycle Index' + (parts.length ? ': ' + parts.join(' · ') : ' — live crypto cycle read');
  }
  // ---- tweet built from the newest Jordan headline (data/jordan_headline.json, read fresh) ----
  var URL_LEN = 23, LIMIT = 280;
  function xlen(str) { // X weighting: URLs = 23, CJK/emoji count double
    var n = 0, a = Array.from(str.replace(/https?:\/\/\S+/g, function () { n += URL_LEN; return ''; }));
    a.forEach(function (c) { var cp = c.codePointAt(0); n += (cp <= 0x10FF || (cp >= 0x2000 && cp <= 0x200D) || (cp >= 0x2010 && cp <= 0x201F) || (cp >= 0x2032 && cp <= 0x2037)) ? 1 : 2; });
    return n;
  }
  function trimTo(text, budget) {
    if (xlen(text) <= budget) return text;
    var room = budget - 1, cut = '';
    var sents = text.split(/(?<=[a-z0-9%)]{2}[.!?])\s+(?=[A-Z"“])/).map(function (x) { return x + ' '; });
    for (var i = 0; i < sents.length; i++) { if (xlen(cut + sents[i]) > room) break; cut += sents[i]; }
    cut = cut.trim();
    if (cut.length >= 60) return cut + (cut.length < text.trim().length ? ' …' : '');
    var words = text.split(/\s+/), out = '';
    for (var j = 0; j < words.length; j++) { var nx = out ? out + ' ' + words[j] : words[j]; if (xlen(nx) > room) break; out = nx; }
    return out.replace(/[,;:\-–—]+$/, '') + '…';
  }
  function composeHeadline(h, para) {
    var tail = '\n\n' + SITE, via = ' via @BadmonLano';
    h = String(h).trim(); para = String(para || '').replace(/\s+/g, ' ').trim();
    if (xlen(h + tail) > LIMIT) return trimTo(h, LIMIT - xlen(tail)) + tail;
    var full = h + (para ? '\n\n' + para : '');
    if (xlen(full + tail + via) <= LIMIT) return full + tail + via;
    if (xlen(full + tail) <= LIMIT) return full + tail;
    var budget = LIMIT - xlen(h + '\n\n' + tail);
    if (budget < 25 || !para) return h + tail;
    return h + '\n\n' + trimTo(para, budget) + tail;
  }
  function buildTweet() {
    var fallback = function () { return shareText() + '\n\n' + SITE; };
    return fetch('/data/jordan_headline.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.headline) return fallback();
        if (window.isInternalNotPublic && (window.isInternalNotPublic(j.headline) || window.isInternalNotPublic(j.narrative))) return fallback();
        return composeHeadline(j.headline, j.narrative);
      })
      .catch(fallback);
  }
  window.__fciTweet = { buildTweet: buildTweet, xlen: xlen };
  function flash(b, msg) { var o = b.textContent; b.textContent = msg; setTimeout(function () { b.textContent = o; }, 1500); }

  function addTools() {
    var host = document.querySelector('.header-right'); if (!host || document.getElementById('fciTools')) return;
    var wrap = document.createElement('span'); wrap.id = 'fciTools'; wrap.className = 'fci-tools';
    wrap.appendChild(btn('𝕏 ' + T('Share'), T('Share on X'), function () {
      // open synchronously (avoids popup blockers), then fill in once the fresh headline is read
      var w = window.open('about:blank', '_blank', 'width=600,height=520');
      if (w) { try { w.opener = null; } catch (e) {} }
      buildTweet().then(function (text) {
        var u = 'https://x.com/intent/tweet?text=' + encodeURIComponent(text);
        window.__fciLastIntent = u;
        if (w) w.location.href = u; else location.href = u;
      });
    }));
    var copy = btn('🔗', T('Copy link'), function () {
      var done = function () { flash(copy, '✓'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(SITE + '/').then(done, done);
      else { var i = document.createElement('input'); i.value = SITE + '/'; document.body.appendChild(i); i.select(); try { document.execCommand('copy'); } catch (e) {} i.remove(); done(); }
    });
    wrap.appendChild(copy);
    var th = btn(getTheme() === 'light' ? '☾' : '☀', T(getTheme() === 'light' ? 'Dark mode' : 'Light mode'), function () {
      var next = getTheme() === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      applyTheme(next); th.textContent = next === 'light' ? '☾' : '☀';
      th.title = T(next === 'light' ? 'Dark mode' : 'Light mode');
    });
    wrap.appendChild(th);
    host.appendChild(wrap);
  }

  // ---- service worker (network-first shell; never caches data) ----
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }

  // ---- Cloudflare Web Analytics (inactive until token set in assets/analytics-config.js) ----
  function analytics() {
    var tok = window.FCI_CF_BEACON_TOKEN;
    if (!tok || !/theflowcycle\.com$/.test(location.hostname)) return;
    var s = document.createElement('script'); s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: tok }));
    document.body.appendChild(s);
  }

  function start() { addTools(); analytics(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
