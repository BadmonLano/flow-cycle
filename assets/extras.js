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
  function flash(b, msg) { var o = b.textContent; b.textContent = msg; setTimeout(function () { b.textContent = o; }, 1500); }

  function addTools() {
    var host = document.querySelector('.header-right'); if (!host || document.getElementById('fciTools')) return;
    var wrap = document.createElement('span'); wrap.id = 'fciTools'; wrap.className = 'fci-tools';
    wrap.appendChild(btn('𝕏 ' + T('Share'), T('Share on X'), function () {
      var u = 'https://x.com/intent/tweet?text=' + encodeURIComponent(shareText()) + '&url=' + encodeURIComponent(SITE + '/') + '&via=BadmonLano';
      window.open(u, '_blank', 'noopener,width=600,height=520');
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
