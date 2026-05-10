/* arc-ui.js — ARC shared UI: error cards, skeleton loading, demo guard, mobile responsive */
(function () {

  // ── STYLES ─────────────────────────────────────────────────────
  var CSS = `
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

/* ── MOBILE HAMBURGER NAV ── */
#arc-hamburger{display:none;background:none;border:1px solid #2a2d3a;border-radius:6px;color:#e8edf5;font-size:18px;line-height:1;padding:5px 10px;cursor:pointer;flex-shrink:0;align-items:center;justify-content:center;margin-left:auto}
#arc-nav-overlay{display:none;position:fixed;inset:0;background:#0a0c0f;z-index:500;flex-direction:column;padding:20px 20px 32px;overflow-y:auto}
#arc-nav-overlay.open{display:flex}
.arc-mob-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-shrink:0}
.arc-mob-wordmark{font-size:17px;font-weight:700;color:#e8edf5;letter-spacing:-.5px}
.arc-mob-close{background:none;border:none;color:#8a95a3;font-size:22px;cursor:pointer;line-height:1;padding:4px}
.arc-mob-section{font-size:10px;font-family:"DM Mono",monospace;letter-spacing:.7px;text-transform:uppercase;color:#4d5663;padding:16px 0 6px}
.arc-mob-link{display:block;padding:13px 0;font-size:15px;color:#e8edf5;border-bottom:1px solid #1e242d;cursor:pointer;text-decoration:none;transition:color .12s}
.arc-mob-link:hover,.arc-mob-link:active{color:#00d4aa;border-bottom-color:#1e242d}
.arc-mob-signout{margin-top:24px;background:none;border:1px solid #2a2d3a;border-radius:8px;color:#8a95a3;font-size:13px;padding:10px 16px;cursor:pointer;text-align:left;width:100%;font-family:inherit;transition:border-color .12s,color .12s}
.arc-mob-signout:hover{border-color:#8a95a3;color:#e8edf5}

/* ── MOBILE CMNDR FLOAT ── */
#arc-cmndr-float{display:none;position:fixed;bottom:20px;right:20px;background:#00d4aa;color:#0a0c0f;border:none;border-radius:24px;padding:10px 18px;font-size:13px;font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;font-weight:700;cursor:pointer;z-index:200;align-items:center;gap:6px;box-shadow:0 4px 16px rgba(0,212,170,0.3);transition:opacity .15s}
#arc-cmndr-float:hover{opacity:.88}

/* ── TABLE SCROLL WRAPPER ── */
.arc-table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.arc-table-scroll .data-table{min-width:560px}

/* ── RESPONSIVE ── */
@media(max-width:768px){
  /* Hide ADAPT/REACT/CONTROL dropdown buttons; keep avatar */
  .arc-dd-wrap:has(.arc-dd-btn){display:none!important}

  /* Show hamburger */
  #arc-hamburger{display:flex!important}

  /* Stack metric cards vertically */
  .metric-row{grid-template-columns:1fr!important}

  /* Two-column → single column */
  .two-col{grid-template-columns:1fr!important}

  /* Hide CMNDR panel and its toggle tab */
  #cmndr-col{display:none!important}
  #cmndr-col.arc-mob-cmndr-open{display:flex!important;position:fixed;inset:0;top:var(--nav-h,56px);z-index:300;width:100%!important;background:var(--surface,#111418);flex-direction:column}
  #cmndr-toggle{display:none!important}

  /* Show floating CMNDR pill */
  #arc-cmndr-float{display:flex!important}

  /* Reduce card padding */
  .metric-card,.col-card,.exc-card{padding:16px!important}

  /* Reduce header font sizes by 2px */
  .page-title{font-size:20px!important;letter-spacing:-.3px!important}
  .hc-value{font-size:26px!important}
  .section-hd{font-size:9px!important}
  .col-card-title{font-size:11px!important}

  /* Nav padding */
  #nav{padding:0 14px!important;gap:8px!important}

  /* Main content padding */
  #main-col{padding:14px!important}

  /* Health strip: horizontal scroll on very narrow screens */
  #health-strip{overflow-x:auto;-webkit-overflow-scrolling:touch}
  .hc{min-width:110px;padding:0 14px}
}
`;

  var s = document.createElement('style');
  s.textContent = CSS;
  document.head.appendChild(s);


  // ── SHARED HELPERS ─────────────────────────────────────────────

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

  // arcDemoGuard() — intercept write actions in demo mode
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


  // ── MOBILE INIT ────────────────────────────────────────────────

  function initMobile() {
    var nav = document.getElementById('nav');
    if (!nav) return; // not a dashboard page

    // ── Hamburger button ──────────────────────────────────────
    var hamBtn = document.createElement('button');
    hamBtn.id = 'arc-hamburger';
    hamBtn.setAttribute('aria-label', 'Open navigation');
    hamBtn.innerHTML = '&#9776;'; // ☰
    // Insert before the avatar wrap (last child of nav that is arc-dd-wrap)
    var avatarWrap = nav.querySelector('.arc-dd-wrap:last-of-type');
    if (avatarWrap) {
      nav.insertBefore(hamBtn, avatarWrap);
    } else {
      nav.appendChild(hamBtn);
    }

    // ── Full-screen nav overlay ───────────────────────────────
    var overlay = document.createElement('div');
    overlay.id = 'arc-nav-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML =
      '<div class="arc-mob-header">' +
        '<span class="arc-mob-wordmark">ARC Command Center</span>' +
        '<button class="arc-mob-close" aria-label="Close navigation">\u2715</button>' +
      '</div>' +
      '<div class="arc-mob-section">ADAPT — Visibility</div>' +
      '<a class="arc-mob-link" href="/operations">Operations</a>' +
      '<a class="arc-mob-link" href="/finance">Finance</a>' +
      '<a class="arc-mob-link" href="/marketing">Marketing</a>' +
      '<a class="arc-mob-link" href="/yield">Yield &amp; Efficiency</a>' +
      '<a class="arc-mob-link" href="/market-scan">Market Scan</a>' +
      '<a class="arc-mob-link" href="/audit">Audits</a>' +
      '<a class="arc-mob-link" href="/digital-authority">Digital Authority</a>' +
      '<div class="arc-mob-section">REACT</div>' +
      '<a class="arc-mob-link" href="/sprint">Sprint Planner</a>' +
      '<a class="arc-mob-link" href="/playbooks">Playbooks</a>' +
      '<a class="arc-mob-link" href="/wins">Win Board</a>' +
      '<div class="arc-mob-section">CONTROL</div>' +
      '<a class="arc-mob-link" href="/automations">Automations</a>' +
      '<a class="arc-mob-link" href="/connections">Connections</a>' +
      '<a class="arc-mob-link" href="/archive">Archive</a>' +
      '<button class="arc-mob-signout" onclick="if(typeof doSignOut===\'function\')doSignOut()">Sign Out</button>';
    document.body.appendChild(overlay);

    function openOverlay() { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function closeOverlay() { overlay.classList.remove('open'); document.body.style.overflow = ''; }

    hamBtn.addEventListener('click', openOverlay);
    overlay.querySelector('.arc-mob-close').addEventListener('click', closeOverlay);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeOverlay();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeOverlay();
    });

    // ── Wrap tables for horizontal scroll ────────────────────
    // Run after a tick so page scripts have rendered their tables
    setTimeout(function () {
      document.querySelectorAll('.data-table').forEach(function (t) {
        if (t.closest('.arc-table-scroll')) return;
        var wrap = document.createElement('div');
        wrap.className = 'arc-table-scroll';
        t.parentNode.insertBefore(wrap, t);
        wrap.appendChild(t);
      });
    }, 200);

    // ── Floating CMNDR pill ───────────────────────────────────
    var cmndrFloat = document.createElement('button');
    cmndrFloat.id = 'arc-cmndr-float';
    cmndrFloat.innerHTML = '&#128172; CMNDR';
    document.body.appendChild(cmndrFloat);

    cmndrFloat.addEventListener('click', function () {
      var col = document.getElementById('cmndr-col');
      if (!col) return;
      var isOpen = col.classList.contains('arc-mob-cmndr-open');
      if (isOpen) {
        col.classList.remove('arc-mob-cmndr-open');
        cmndrFloat.innerHTML = '&#128172; CMNDR';
      } else {
        col.classList.add('arc-mob-cmndr-open');
        cmndrFloat.innerHTML = '\u2715 Close';
        // Scroll CMNDR body to bottom
        var body = col.querySelector('#cmndr-body');
        if (body) body.scrollTop = body.scrollHeight;
      }
    });

    // Show/hide hamburger + float based on viewport
    var mq = window.matchMedia('(max-width: 768px)');
    function applyMq(m) {
      hamBtn.style.display = m.matches ? 'flex' : 'none';
      cmndrFloat.style.display = m.matches ? 'flex' : 'none';
      if (!m.matches) {
        closeOverlay();
        var col = document.getElementById('cmndr-col');
        if (col) col.classList.remove('arc-mob-cmndr-open');
        cmndrFloat.innerHTML = '&#128172; CMNDR';
      }
    }
    applyMq(mq);
    if (mq.addEventListener) {
      mq.addEventListener('change', applyMq);
    } else if (mq.addListener) {
      mq.addListener(applyMq); // Safari < 14 compat
    }
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobile);
  } else {
    initMobile();
  }

})();
