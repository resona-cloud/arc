import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Public-safe anon key — protected by RLS, not by obscurity
const SB_URL = 'https://fklijhgqsjdlwvmwarwh.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrbGlqaGdxc2pkbHd2bXdhcndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2OTk0OTgsImV4cCI6MjA5MTI3NTQ5OH0.qeWgD2elcfiQt3Kth6Q5J9Jt1z_O-p-Gc2QtpFZXybA';

// Anti-flash: hide body until auth check completes
const _antiFlashStyle = document.createElement('style');
_antiFlashStyle.textContent = 'body{visibility:hidden}';
document.head.appendChild(_antiFlashStyle);

// Initialize client immediately — no async bootstrap needed
const supabase = createClient(SB_URL, SB_ANON, { auth: { persistSession: true }, realtime: { enabled: false } });
window.arcSupabase = supabase;

window.doSignOut = async function () {
  await supabase.auth.signOut();
  localStorage.removeItem('cmndr_session');
  sessionStorage.removeItem('arc_impersonate_client_id');
  sessionStorage.removeItem('arc_impersonate_client_name');
  location.href = '/arc-login';
};

async function init() {
  // Bypass mode
  if (new URLSearchParams(location.search).get('bypass') === 'true' || localStorage.getItem('arc_bypass') === 'true') {
    localStorage.setItem('arc_bypass', 'true');
    _antiFlashStyle.remove();
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { location.href = '/arc-login'; return; }

    // Backward compat for existing API calls using Bearer token
    localStorage.setItem('cmndr_session', session.access_token);

    const { data: userRow } = await supabase
      .from('arc_users')
      .select('role, client_id, business_name, full_name')
      .eq('id', session.user.id)
      .single();

    const role = userRow?.role || 'client';
    const clientId = role === 'demo' ? 'peak-flow' : (userRow?.client_id || null);

    window.ARC_USER = {
      id: session.user.id,
      email: session.user.email,
      role,
      client_id: clientId,
      business_name: userRow?.business_name || '',
      full_name: userRow?.full_name || session.user.email || ''
    };

    if (role === 'demo') window.ARC_DEMO_MODE = true;

    if (role === 'admin') {
      window.ARC_ADMIN_MODE = true;
      if (['/', '/index', '/index.html'].includes(location.pathname)) {
        location.href = '/scope'; return;
      }
    }

    // Non-admin on /scope → back to /
    if (location.pathname.startsWith('/scope') && role !== 'admin') {
      location.href = '/'; return;
    }

    // Update avatar initial
    const av = document.getElementById('nav-avatar');
    if (av) av.textContent = (window.ARC_USER.full_name || window.ARC_USER.email || 'A').charAt(0).toUpperCase();

    if (window.ARC_DEMO_MODE) injectDemoBanner();
    if (window.ARC_DEMO_MODE && typeof arcDemoGuard === 'function') arcDemoGuard();

    const impId = sessionStorage.getItem('arc_impersonate_client_id');
    const impName = sessionStorage.getItem('arc_impersonate_client_name');
    if (role === 'admin' && impId) injectImpersonationBanner(impName || impId);

  } catch (e) {
    console.error('[auth] init error:', e);
  } finally {
    _antiFlashStyle.remove();
  }
}

function injectDemoBanner() {
  const spacer = document.querySelector('#nav .spacer');
  if (!spacer) return;
  const pill = document.createElement('div');
  pill.style.cssText = 'background:#1a1a24;border:1px solid #2a2a3a;border-radius:10px;padding:2px 8px;font-family:"DM Mono",monospace;font-size:10px;color:#8888a0;white-space:nowrap;';
  pill.textContent = 'DEMO';
  spacer.insertAdjacentElement('afterend', pill);
}

function injectImpersonationBanner(clientName) {
  document.getElementById('arc-imp-banner')?.remove();
  const banner = document.createElement('div');
  banner.id = 'arc-imp-banner';
  banner.style.cssText = 'position:fixed;top:56px;left:0;right:0;background:#1a1a24;border-bottom:1px solid #2a2a3a;padding:8px 20px;display:flex;align-items:center;justify-content:space-between;font-family:"DM Mono",monospace;font-size:12px;color:#8a95a3;z-index:90;height:40px;box-sizing:border-box;';
  banner.innerHTML = `<span>ADMIN VIEW &mdash; Viewing as: <strong style="color:#e8edf5">${clientName}</strong></span><span style="color:#00d4aa;cursor:pointer;" onclick="clearImpersonation()">&larr; Back to Scope</span>`;
  document.body.appendChild(banner);
  const shell = document.getElementById('shell');
  if (shell) shell.style.paddingTop = 'calc(var(--nav-h,56px) + 40px)';
  window.clearImpersonation = function () {
    sessionStorage.removeItem('arc_impersonate_client_id');
    sessionStorage.removeItem('arc_impersonate_client_name');
    location.href = '/scope';
  };
}

init();
