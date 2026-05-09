// ARC Global Report Builder — loaded on every page with ADAPT/REACT nav
// Guard: skip if this page already defines openReportBuilder (e.g., index.html)
if (typeof window.openReportBuilder === 'undefined') {
(function() {

var REPORT_SECTIONS = [
  { id:'summary',          emoji:'⬡', name:'Command Center Summary',    desc:'Entropy score, exceptions overview, key metrics',                     locked:true, selected:true  },
  { id:'ops',              emoji:'⚙', name:'Operations Overview',       desc:'Job pipeline, tech performance, team utilization',                    locked:false, selected:true  },
  { id:'marketing',        emoji:'📈', name:'Marketing Intelligence',    desc:'Lead pipeline, conversion rates, channel performance',                locked:false, selected:false },
  { id:'finance',          emoji:'💰', name:'Finance & Collections',     desc:'Revenue, AR aging, cash flow projection',                            locked:false, selected:false },
  { id:'yield',            emoji:'⚡', name:'Yield & Efficiency',        desc:'Automation ROI, labor savings, efficiency score',                    locked:false, selected:false },
  { id:'market-scan',      emoji:'🔍', name:'Market Scan Summary',       desc:'Keyword insights, competition analysis, local demand',               locked:false, selected:false },
  { id:'digital-authority',emoji:'📡', name:'Digital Authority Summary', desc:'Online presence score, search visibility, authority metrics',        locked:false, selected:false },
  { id:'cmndr',            emoji:'✦', name:'CMNDR Executive Summary',   desc:'AI-generated narrative and strategic recommendations',                locked:false, selected:false },
];

var _rptSections = {};
var _rptFmt = 'pdf';

var CSS = `
<style id="arc-rb-styles">
#arc-rb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);z-index:700;align-items:center;justify-content:center}
#arc-rb-overlay.open{display:flex}
.arc-rb-modal{background:var(--surface,#111418);border:1px solid var(--border2,#2a2f3a);border-radius:12px;padding:28px;width:560px;max-width:94vw;max-height:85vh;overflow-y:auto;display:flex;flex-direction:column;gap:20px}
.arc-rb-label{font-size:10px;font-family:'DM Mono',monospace;letter-spacing:.6px;text-transform:uppercase;color:var(--text3,#6b7280);margin-bottom:6px}
.arc-rb-input{width:100%;background:var(--surface2,#181c22);border:1px solid var(--border2,#2a2f3a);border-radius:6px;color:var(--text,#f0f0f0);font-size:13px;padding:8px 12px;outline:none;font-family:inherit}
.arc-rb-input:focus{border-color:var(--accent,#00d4aa)}
.arc-rb-sections{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.arc-rb-card{background:var(--surface2,#181c22);border:1px solid var(--border2,#2a2f3a);border-radius:8px;padding:12px;cursor:pointer;position:relative;transition:border-color .15s;user-select:none}
.arc-rb-card.selected{border-color:var(--accent,#00d4aa);background:rgba(0,212,170,.07)}
.arc-rb-card.locked{opacity:.7;cursor:default}
.arc-rb-cb{position:absolute;top:10px;right:10px;width:16px;height:16px;border-radius:3px;border:1.5px solid var(--border2,#2a2f3a);background:transparent}
.arc-rb-card.selected .arc-rb-cb{background:var(--accent,#00d4aa);border-color:var(--accent,#00d4aa)}
.arc-rb-card.selected .arc-rb-cb::after{content:'✓';position:absolute;top:-1px;left:1px;font-size:11px;color:#fff;font-weight:700}
.arc-rb-fmt-btns{display:flex;gap:6px}
.arc-rb-fmt-btn{background:var(--surface2,#181c22);border:1px solid var(--border2,#2a2f3a);border-radius:6px;color:var(--text2,#a0a8b8);padding:6px 14px;font-size:12px;cursor:pointer;transition:all .12s;font-family:'DM Mono',monospace}
.arc-rb-fmt-btn.active{background:rgba(0,212,170,.12);border-color:var(--accent,#00d4aa);color:var(--accent,#00d4aa)}
.arc-rb-gen-btn{background:var(--accent,#00d4aa);border:none;border-radius:8px;color:#000;font-size:14px;font-weight:700;padding:12px;cursor:pointer;width:100%;transition:opacity .15s;font-family:'DM Mono',monospace}
.arc-rb-gen-btn:disabled{opacity:.5;cursor:default}
#arc-rb-preview{display:none;position:fixed;inset:0;background:#f8f8fa;z-index:800;flex-direction:column}
</style>`;

var HTML = `
<div id="arc-rb-overlay" onclick="if(event.target===this)closeReportBuilder()">
  <div class="arc-rb-modal">
    <div style="display:flex;align-items:flex-start;justify-content:space-between">
      <div>
        <div style="font-size:18px;font-weight:700;font-family:'Syne',system-ui,sans-serif;letter-spacing:-.3px;color:var(--text,#f0f0f0)">↓ Build Report</div>
        <div style="font-size:12px;color:var(--text3,#6b7280);margin-top:4px">Generate a formatted client report from your ARC data</div>
      </div>
      <button onclick="closeReportBuilder()" style="background:none;border:none;color:var(--text3,#6b7280);cursor:pointer;font-size:20px;line-height:1;padding:2px">×</button>
    </div>
    <div>
      <div class="arc-rb-label">Report Name</div>
      <input id="arc-rb-name" class="arc-rb-input" type="text"/>
    </div>
    <div>
      <div class="arc-rb-label">Date Range</div>
      <div style="display:flex;gap:10px;align-items:center">
        <input id="arc-rb-from" class="arc-rb-input" type="date" style="flex:1"/>
        <span style="color:var(--text3,#6b7280);font-size:12px">to</span>
        <input id="arc-rb-to" class="arc-rb-input" type="date" style="flex:1"/>
      </div>
    </div>
    <div>
      <div class="arc-rb-label">Report Sections</div>
      <div class="arc-rb-sections" id="arc-rb-sections-grid"></div>
    </div>
    <div>
      <div class="arc-rb-label">Export Format</div>
      <div class="arc-rb-fmt-btns" id="arc-rb-fmt-btns">
        <button class="arc-rb-fmt-btn active" data-fmt="pdf" onclick="_arcRbSelectFmt(this)">PDF</button>
        <button class="arc-rb-fmt-btn" data-fmt="print" onclick="_arcRbSelectFmt(this)">Print</button>
        <button class="arc-rb-fmt-btn" data-fmt="share" onclick="_arcRbSelectFmt(this)">Share Link</button>
      </div>
    </div>
    <button id="arc-rb-gen-btn" class="arc-rb-gen-btn" onclick="_arcRbGenerate()">Generate Report →</button>
  </div>
</div>
<div id="arc-rb-preview">
  <div style="background:#111418;border-bottom:1px solid #1e242d;padding:12px 24px;display:flex;align-items:center;gap:16px;flex-shrink:0">
    <span style="font-size:15px;font-weight:700;color:#fff;letter-spacing:-.3px"><span style="background:#3b82f6;color:#fff;font-size:11px;font-weight:700;padding:2px 6px;border-radius:4px;letter-spacing:1.5px;margin-right:8px">ARC</span>Report Preview</span>
    <div style="flex:1"></div>
    <button onclick="window.print()" style="background:none;border:1px solid #2a3040;border-radius:6px;color:#8a95a3;padding:6px 14px;font-size:12px;cursor:pointer">Print</button>
    <button onclick="_arcRbDownload()" style="background:#3b82f6;border:none;border-radius:6px;color:#fff;padding:6px 14px;font-size:12px;cursor:pointer;font-weight:600">↓ Download PDF</button>
    <button onclick="_arcRbClosePreview()" style="background:none;border:none;color:#4d5663;cursor:pointer;font-size:20px;line-height:1;padding:2px">×</button>
  </div>
  <div style="flex:1;overflow-y:auto;padding:40px 20px">
    <div id="arc-rb-content" style="max-width:800px;margin:0 auto;background:#fff;border-radius:8px;padding:48px 56px;box-shadow:0 2px 16px rgba(0,0,0,.08);color:#1a1a2e;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif"></div>
  </div>
</div>`;

function _arcRbInject() {
  if (document.getElementById('arc-rb-overlay')) return;
  document.head.insertAdjacentHTML('beforeend', CSS);
  document.body.insertAdjacentHTML('beforeend', HTML);
}

function _arcRbRenderSections() {
  var grid = document.getElementById('arc-rb-sections-grid');
  if (!grid) return;
  grid.innerHTML = REPORT_SECTIONS.map(function(s) {
    var sel = _rptSections[s.id];
    return '<div class="arc-rb-card' + (sel ? ' selected' : '') + (s.locked ? ' locked' : '') + '" onclick="_arcRbToggleSection(\'' + s.id + '\')">' +
      '<div class="arc-rb-cb"></div>' +
      '<div style="font-size:17px;margin-bottom:5px">' + s.emoji + '</div>' +
      '<div style="font-size:12px;font-weight:600;color:var(--text,#f0f0f0);margin-bottom:3px;padding-right:20px">' + s.name + '</div>' +
      '<div style="font-size:11px;color:var(--text3,#6b7280);line-height:1.4">' + s.desc + '</div>' +
      '</div>';
  }).join('');
}

window._arcRbToggleSection = function(id) {
  var sec = REPORT_SECTIONS.find(function(s) { return s.id === id; });
  if (sec && sec.locked) return;
  _rptSections[id] = !_rptSections[id];
  _arcRbRenderSections();
};

window._arcRbSelectFmt = function(btn) {
  document.querySelectorAll('.arc-rb-fmt-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  _rptFmt = btn.dataset.fmt;
};

window._arcRbGenerate = async function() {
  var btn = document.getElementById('arc-rb-gen-btn');
  btn.textContent = 'Generating…';
  btn.disabled = true;
  var execSummary = '';
  if (_rptSections['cmndr']) {
    try {
      var token = window.SESSION_TOKEN || '';
      var r = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ client_id: window.ARC_CLIENT_ID || 'peak-flow', page: 'overview', question: 'Write a concise 3-paragraph executive summary covering current business health, top risks, and strategic recommendations. Plain text only, no markdown.' })
      });
      var d = await r.json();
      execSummary = d.answer || '';
    } catch(e) { execSummary = 'Executive summary unavailable.'; }
  }
  btn.textContent = 'Generate Report →';
  btn.disabled = false;
  closeReportBuilder();
  _arcRbRenderPreview(execSummary);
};

function _arcRbRenderPreview(execSummary) {
  var name = document.getElementById('arc-rb-name').value;
  var from = document.getElementById('arc-rb-from').value;
  var to   = document.getElementById('arc-rb-to').value;
  var now  = new Date();
  var selectedSections = REPORT_SECTIONS.filter(function(s) { return _rptSections[s.id]; });
  var sectionBlocks = selectedSections.map(function(s) {
    return '<div style="margin-bottom:32px"><h2 style="font-size:14px;font-weight:700;color:#1a1a2e;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #f0f0f0">' + s.emoji + ' ' + s.name + '</h2>' +
      (s.id === 'cmndr' && execSummary
        ? '<p style="font-size:14px;line-height:1.75;color:#374151">' + execSummary + '</p>'
        : '<p style="font-size:13px;color:#9ca3af;font-style:italic">Section data loaded from ARC — see live dashboard for full detail.</p>') +
      '</div>';
  }).join('');
  document.getElementById('arc-rb-content').innerHTML =
    '<div style="margin-bottom:36px;padding-bottom:24px;border-bottom:3px solid #1a1a2e">' +
      '<div style="font-size:11px;font-weight:700;color:#3b82f6;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">ARC — COMMAND CENTER</div>' +
      '<h1 style="font-size:26px;font-weight:800;color:#1a1a2e;margin-bottom:6px;letter-spacing:-.5px">' + (name || 'ARC Report') + '</h1>' +
      '<div style="font-size:13px;color:#6b7280">Period: ' + (from||'—') + ' → ' + (to||'—') + ' &nbsp;·&nbsp; Generated ' + now.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) + '</div>' +
    '</div>' + sectionBlocks +
    '<div style="margin-top:40px;padding-top:16px;border-top:1px solid #f0f0f0;font-size:11px;color:#9ca3af;display:flex;justify-content:space-between">' +
      '<span>Generated by ARC Command Center</span><span>Confidential — Internal Use Only</span>' +
    '</div>';
  var preview = document.getElementById('arc-rb-preview');
  preview.style.display = 'flex';
}

window._arcRbDownload = function() {
  window.print();
};

window._arcRbClosePreview = function() {
  document.getElementById('arc-rb-preview').style.display = 'none';
};

window.openReportBuilder = function() {
  _arcRbInject();
  var overlay = document.getElementById('arc-rb-overlay');
  overlay.classList.add('open');
  var now = new Date();
  var firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  document.getElementById('arc-rb-from').value = firstOfMonth.toISOString().slice(0,10);
  document.getElementById('arc-rb-to').value = now.toISOString().slice(0,10);
  var monthName = now.toLocaleString('default', { month:'long' });
  document.getElementById('arc-rb-name').value = 'ARC Report — ' + monthName + ' ' + now.getFullYear();
  REPORT_SECTIONS.forEach(function(s) { _rptSections[s.id] = s.selected; });
  _arcRbRenderSections();
};

window.closeReportBuilder = function() {
  var overlay = document.getElementById('arc-rb-overlay');
  if (overlay) overlay.classList.remove('open');
};

})();
}
