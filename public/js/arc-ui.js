/* arc-ui.js — ARC shared UI: error cards, skeleton loading, demo guard */
(function () {
  const CSS = `
.arc-err{background:#13131a;border:1px solid #1e242d;border-left:3px solid #ef4444;border-radius:8px;padding:16px 18px;display:flex;align-items:flex-start;gap:14px;margin-bottom:8px}
.arc-err-icon{font-size:18px;line-height:1;flex-shrink:0;padding-top:1px}
.arc-err-body{flex:1;min-width:0}
.arc-err-title{font-size:13px;font-weight:600;color:#e8edf5;margin-bottom:4px}
.arc-err-sub{font-size:12px;color:#8a95a3;line-height:1.5}
.arc-err-retry{display:inline-flex;align-items:center;gap:6px;margin-top:10px;background:none;border:1px solid #00d4aa;border-radius:6px;color:#00d4aa;font-size:12px;font-family:"DM Mono",monospace;padding:5px 12px;cursor:pointer;transition:background .15s}
.arc-err-retry:hover{background:rgba(0,212,170,0.12)}
.arc-skel{background:#1e242d;border-radius:8px;animation:arc-skel-pulse 1.5s ease-in-out infinite}
@keyframes arc-skel-pulse{0%,100%{opacity:1}50%{opacity:.35}}
#arc-demo-tip{position:fixed;z-index:9999;background:#13131a;border:1px solid #2a2a3a;border-radius:8px;padding:8px 13px;font-size:12px;font-family:"DM Mono",monospace;color:#8a95a3;pointer-events:none;box-shadow:0 8px 24px rgba(0,0,0,.5);max-width:210px;line-height:1.45;opacity:0;transition:opacity .18s}
`;
  var s = document.createElement('style');
  s.textContent = CSS;
  document.head.appendChild(s);

  // arcError(idOrEl, sectionName, retryFn?) — shows error card in container
  window.arcError = function (idOrEl, section, retryFn) {
    var c = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (!c) return;
    var wrap = document.createElement('div');
    wrap.className = 'arc-err';
    wrap.innerHTML = '<div class="arc-err-icon">\u26A0</div><div class="arc-err-body"><div class="arc-err-title">Unable to load ' + section + '</div><div class="arc-err-sub">Check your connection and try again</div></div>';
    if (typeof retryFn === 'function') {
      var btn = document.createElement('button');
      btn.className = 'arc-err-retry';
      btn.textContent = 'Retry \u2192';
      btn.addEventListener('click', retryFn);
      wrap.querySelector('.arc-err-body').appendChild(btn);
    }
    c.innerHTML = '';
    c.appendChild(wrap);
  };

  // arcSkeleton(idOrEl, rows?, heightPx?) — shimmer placeholder
  window.arcSkeleton = function (idOrEl, rows, h) {
    var c = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (!c) return;
    h = h || 72;
    var html = '';
    for (var i = 0; i < (rows || 1); i++) {
      html += '<div class="arc-skel" style="height:' + h + 'px' + (i < (rows || 1) - 1 ? ';margin-bottom:8px' : '') + '"></div>';
    }
    c.innerHTML = html;
  };

  // arcDemoGuard() — intercept write actions in demo mode, show upgrade tooltip
  window.arcDemoGuard = function () {
    if (!window.ARC_DEMO_MODE) return;
    var tip = null;
    function showTip(btn) {
      if (!tip) {
        tip = document.createElement('div');
        tip.id = 'arc-demo-tip';
        tip.textContent = 'Upgrade to make changes';
        document.body.appendChild(tip);
      }
      var r = btn.getBoundingClientRect();
      tip.style.left = Math.max(8, r.left + r.width / 2 - 105) + 'px';
      tip.style.top = (r.top - 46 + window.scrollY) + 'px';
      tip.style.opacity = '1';
      clearTimeout(tip._t);
      tip._t = setTimeout(function () { if (tip) tip.style.opacity = '0'; }, 2200);
    }
    document.addEventListener('click', function (e) {
      if (!window.ARC_DEMO_MODE) return;
      var btn = e.target.closest(
        'button[type=submit],.fin-btn-primary,.fin-btn-danger,.exc-btn.primary,[data-write]'
      );
      if (!btn || btn.classList.contains('arc-err-retry')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      showTip(btn);
    }, true);
  };
})();
