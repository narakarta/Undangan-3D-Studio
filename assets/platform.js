/* Undangan3D Studio — logika platform */
(function () {
  'use strict';

  const Store = window.U3DStore;
  const Theme = window.U3DTheme;
  const Plugins = window.U3DPlugins;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = Store.esc;

  /* ---------- Ikon ---------- */
  const ICONS = {
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    wand: '<path d="M5 19L19 5M15 5h4v4M4 20l3.5-1 11-11-2.5-2.5-11 11z"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/>',
    database: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v6c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8v-6M4.5 11.5v6c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8v-6"/>',
    shield: '<path d="M12 3l7.5 2.8v5.7c0 4.6-3.2 7.5-7.5 8.5-4.3-1-7.5-3.9-7.5-8.5V5.8z"/><path d="M9 12l2 2 4-4.5"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2z"/><path d="M4 19h15M8 7h7M8 10.5h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    trash: '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    download: '<path d="M12 3v12M7 11l5 5 5-5M5 21h14"/>',
    upload: '<path d="M12 21V9M7 13l5-5 5 5M5 3h14"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.3M20 5v6h-6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 5.2a3 3 0 0 1 0 5.6M18 20c0-2.4-.9-4.2-2.5-5.2"/>',
    heart: '<path d="M12 20s-7-4.4-9-8.5C1.5 8 3.4 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.6 0 5.5 3.5 4 7-2 4.1-9 8.5-9 8.5z"/>',
    sparkles: '<path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 3v18M4 7.5l8 4.5 8-4.5"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5-9 9"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    chat: '<path d="M21 12a8 8 0 0 1-8 8H4l2.2-4A8 8 0 1 1 21 12z"/><path d="M8.5 11h7M8.5 14h4"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    gift: '<rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M3 13h18M12 9v12M12 9C10 9 6.5 8 6.5 5.5A2.5 2.5 0 0 1 11 4c1 1.4 1 3.5 1 5zM12 9c2 0 5.5-1 5.5-3.5A2.5 2.5 0 0 0 13 4c-1 1.4-1 3.5-1 5z"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14h1M14 20h1M18 18h3v3h-3z"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12L21 2M17 6l3 3M15 8l2 2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.1 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 8.9a1.7 1.7 0 0 0-.3-1.9L4.2 6.9A2 2 0 1 1 7 4.1l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevronRight: '<path d="M9 5l7 7-7 7"/>',
    phone: '<path d="M6 3h3l1.5 5-2.5 1.5a12 12 0 0 0 6.5 6.5L16 13.5l5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z"/>',
    code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13 4l-2 16"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    alert: '<path d="M12 3l9.5 17H2.5z"/><path d="M12 9v5M12 17.5h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    save: '<path d="M4 4h13l3 3v13H4z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>',
    file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3z"/>'
  };
  function icon(name, cls) {
    const p = ICONS[name] || ICONS.info;
    return '<svg viewBox="0 0 24 24" class="' + (cls || '') + '" aria-hidden="true">' + p + '</svg>';
  }
  function attr(v) { return esc(v == null ? '' : v); }
  function cssUrl(u) { return String(u || '').replace(/["\\)]/g, function (c) { return '\\' + c; }); }

  const META = {
    dashboard: { a: 'Workspace', b: 'Dasbor', title: 'Dasbor' },
    projects: { a: 'Workspace', b: 'Proyek', title: 'Proyek Undangan' },
    studio: { a: 'Studio', b: 'Editor', title: 'Studio Undangan' },
    playground: { a: 'Tools', b: 'Plugin Playground', title: 'Plugin Playground' },
    connector: { a: 'Tools', b: 'Koneksi Backend', title: 'Koneksi Backend' },
    admins: { a: 'Tools', b: 'Akses Admin', title: 'Akses Admin' },
    guide: { a: 'Dokumentasi', b: 'Panduan', title: 'Panduan Deploy' }
  };
  const VIEWS = Object.keys(META);

  const S = {
    view: 'dashboard',
    studioId: null,
    device: 'desktop',
    pgId: null,
    pgLog: [],
    connId: null,
    connGuests: [],
    connMode: 'demo',
    connMsg: '',
    connLog: [],
    connLoadedFor: null,
    connLoading: false,
    adminId: null,
    adminList: [],
    adminMode: 'demo',
    adminMsg: '',
    adminReveal: {},
    search: '',
    filter: 'all',
    exportData: null
  };
  let saveTimer = null;

  /* ---------- Util ---------- */
  function toast(title, sub, kind) {
    const root = $('#toastRoot');
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || 'success');
    const ic = kind === 'error' ? 'alert' : kind === 'info' ? 'info' : 'checkCircle';
    el.innerHTML = '<span class="ti">' + icon(ic) + '</span><div><b>' + esc(title) + '</b><span>' + esc(sub || '') + '</span></div>';
    root.appendChild(el);
    while (root.children.length > 3) root.removeChild(root.firstChild);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 220);
    }, 4200);
  }

  async function copyText(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      toast(label || 'Disalin', 'Siap ditempel.');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast(label || 'Disalin', 'Siap ditempel.'); }
      catch (err) { toast('Gagal menyalin', 'Salin manual dari kolom teks.', 'error'); }
      ta.remove();
    }
  }

  function download(name, text, type) {
    const blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
  }

  function go(path) {
    closeDrawer();
    const hash = path.indexOf('#') === 0 ? path : '#/' + path.replace(/^\/+/, '');
    if (location.hash === hash) route(); else location.hash = hash;
  }

  function timeNow() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function openDrawer() { document.body.classList.add('drawer-open'); }
  function closeDrawer() { document.body.classList.remove('drawer-open'); }

  function setPath(obj, path, val) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = val;
  }
  function getPath(obj, path) {
    return path.split('.').reduce(function (o, k) { return o && o[k] != null ? o[k] : ''; }, obj);
  }

  function setSaveState(text, state) {
    const el = $('#saveState');
    if (!el) return;
    el.className = 'save-state ' + (state || '');
    el.innerHTML = '<span class="dot"></span>' + esc(text);
  }

  function scheduleSave(id) {
    clearTimeout(saveTimer);
    setSaveState('Menyimpan…');
    saveTimer = setTimeout(function () {
      Store.touch(id);
      setSaveState('Tersimpan · ' + timeNow(), 'saved');
      const chip = $('#staleChip');
      if (chip) chip.style.display = '';
    }, 420);
  }

  function previewUrl(p) { return 'undangan.html?preview=1&id=' + encodeURIComponent(p.id); }
  function projectLabel(p) { return (p.groom.short || p.groom.name || 'Mempelai Pria') + ' & ' + (p.bride.short || p.bride.name || 'Mempelai Wanita'); }
  function projectTitle(p) { return (p.groom.name || p.groom.short || '—') + ' & ' + (p.bride.name || p.bride.short || '—'); }
  function statusBadge(p) { return p.status === 'published' ? '<span class="badge live">PUBLISHED</span>' : '<span class="badge draft">DRAFT</span>'; }

  function publicLink(p) {
    const s = Store.settings();
    const base = Store.publicBase();
    if (s.apiUrl && base) return base + 'undangan.html?s=' + encodeURIComponent(p.slug) + '&api=' + encodeURIComponent(s.apiUrl);
    return base + previewUrl(p);
  }

  function adminLoginLink(p, key, includeKey) {
    const s = Store.settings();
    const base = Store.publicBase();
    let url;
    if (s.apiUrl) url = base + 'undangan.html?s=' + encodeURIComponent(p.slug) + '&api=' + encodeURIComponent(s.apiUrl) + '&admin=1';
    else url = base + previewUrl(p) + '&admin=1';
    if (includeKey && key) url += '&key=' + encodeURIComponent(key);
    return url;
  }

  function guestLink(p, g) {
    const s = Store.settings();
    const base = Store.publicBase();
    const q = 'to=' + encodeURIComponent(g.name) + '&key=' + encodeURIComponent(g.key) + '&code=' + encodeURIComponent(g.code);
    if (s.apiUrl && base) return base + 'undangan.html?s=' + encodeURIComponent(p.slug) + '&api=' + encodeURIComponent(s.apiUrl) + '&' + q;
    return base + previewUrl(p) + '&' + q;
  }

  function waGuest(p, g) {
    const msg = 'Halo ' + g.name + ',\n\nDengan hormat, kami mengundang Anda untuk hadir di pernikahan ' + projectTitle(p) + '.\n\nUndangan digital (3D):\n' + guestLink(p, g) + '\n\nKode check-in: ' + g.code + '\nTerima kasih.';
    return 'https://wa.me/?text=' + encodeURIComponent(msg);
  }

  /* ---------- Modal ---------- */
  function openModal(opts) {
    const root = $('#modalRoot');
    root.innerHTML =
      '<div class="modal-overlay" data-act="close-modal"></div>' +
      '<div class="modal ' + (opts.wide ? 'wide' : '') + '" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><div><h3>' + esc(opts.title || '') + '</h3>' + (opts.sub ? '<p>' + esc(opts.sub) + '</p>' : '') + '</div>' +
      '<button class="icon-btn" data-act="close-modal" aria-label="Tutup">' + icon('close') + '</button></div>' +
      (opts.body || '') + '</div>';
    root.classList.add('open');
    if (opts.onOpen) setTimeout(function () { opts.onOpen(root); }, 0);
  }
  function closeModal() {
    const root = $('#modalRoot');
    root.classList.remove('open');
    root.innerHTML = '';
  }
  function confirmDialog(title, text, label, fn) {
    openModal({
      title: title,
      sub: text,
      body: '<div class="modal-foot"><button class="btn btn-ghost" data-act="close-modal">Batal</button><button class="btn btn-danger" id="confirmYes">' + esc(label) + '</button></div>'
    });
    const b = $('#confirmYes');
    if (b) b.onclick = function () { closeModal(); fn(); };
  }

  /* ---------- API client ---------- */
  const API = {
    configured: function () { return !!Store.settings().apiUrl; },
    async post(payload, timeout) {
      const s = Store.settings();
      if (!s.apiUrl) throw new Error('URL Apps Script belum diisi di Koneksi Backend.');
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, timeout || 25000);
      try {
        const res = await fetch(s.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(Object.assign({ adminKey: s.adminKey || '' }, payload)),
          signal: ctrl ? ctrl.signal : undefined,
          redirect: 'follow'
        });
        const text = await res.text();
        let j;
        try { j = JSON.parse(text); }
        catch (e) {
          if (/^\s*</.test(text)) throw new Error('Backend mengembalikan halaman HTML. Pastikan deployment Web App = Anyone.');
          throw new Error('Respons backend bukan JSON.');
        }
        if (j && j.ok === false) throw new Error(j.error || 'Permintaan ditolak backend.');
        return j;
      } finally { clearTimeout(timer); }
    },
    jsonp(params) {
      const s = Store.settings();
      if (!s.apiUrl) return Promise.reject(new Error('URL Apps Script belum diisi.'));
      return new Promise(function (resolve, reject) {
        const cb = '__u3d_cb_' + Date.now() + Math.random().toString(36).slice(2, 5);
        const sep = s.apiUrl.indexOf('?') >= 0 ? '&' : '?';
        const q = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
        const script = document.createElement('script');
        const timer = setTimeout(function () { cleanup(); reject(new Error('Koneksi backend timeout.')); }, 15000);
        function cleanup() {
          clearTimeout(timer);
          try { delete window[cb]; } catch (e) { window[cb] = undefined; }
          if (script.parentNode) script.parentNode.removeChild(script);
        }
        window[cb] = function (data) { cleanup(); resolve(data); };
        script.onerror = function () { cleanup(); reject(new Error('Tidak bisa memuat backend (JSONP).')); };
        script.src = s.apiUrl + sep + q + '&callback=' + cb + '&_=' + Date.now();
        document.body.appendChild(script);
      });
    },
    async call(payload) {
      try { return await this.post(payload); }
      catch (e) {
        if (e && e.name === 'AbortError') throw new Error('Backend tidak merespons (timeout).');
        throw e;
      }
    }
  };

  /* ---------- Router ---------- */
  function parseHash() {
    const raw = (location.hash || '#/dashboard').replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean);
    const view = VIEWS.indexOf(parts[0]) >= 0 ? parts[0] : 'dashboard';
    return { view: view, id: parts[1] || null };
  }

  function route() {
    const r = parseHash();
    S.view = r.view;
    if (r.view === 'studio') {
      if (r.id && Store.get(r.id)) S.studioId = r.id;
      else if (!S.studioId || !Store.get(S.studioId)) S.studioId = (Store.all()[0] || {}).id || null;
    }
    if (r.view === 'playground') {
      if (r.id && Store.get(r.id)) S.pgId = r.id;
      else if (!S.pgId || !Store.get(S.pgId)) S.pgId = (Store.all()[0] || {}).id || null;
    }
    if (r.view === 'connector') {
      if (r.id && Store.get(r.id)) S.connId = r.id;
      else if (!S.connId || !Store.get(S.connId)) S.connId = (Store.all()[0] || {}).id || null;
    }
    if (r.view === 'admins') {
      if (r.id && Store.get(r.id)) S.adminId = r.id;
      else if (!S.adminId || !Store.get(S.adminId)) S.adminId = (Store.all()[0] || {}).id || null;
    }
    renderView();
    requestAnimationFrame(function () { window.scrollTo(0, 0); });
  }

  function renderView() {
    const meta = META[S.view] || META.dashboard;
    let html = '';
    try {
      if (S.view === 'dashboard') html = viewDashboard();
      else if (S.view === 'projects') html = viewProjects();
      else if (S.view === 'studio') html = viewStudio();
      else if (S.view === 'playground') html = viewPlayground();
      else if (S.view === 'connector') html = viewConnector();
      else if (S.view === 'admins') html = viewAdmins();
      else if (S.view === 'guide') html = viewGuide();
    } catch (e) {
      html = '<div class="empty-state"><div class="es-icon">' + icon('alert') + '</div><h3>Terjadi kesalahan</h3><p>' + esc(e.message) + '</p><button class="btn" data-act="reload-app">Muat ulang</button></div>';
    }
    $('#view').innerHTML = html;

    const crumbA = $('#crumb');
    const crumbB = $('#crumb2');
    const title = $('#pageTitle');
    if (crumbA) crumbA.textContent = meta.a;
    if (crumbB) crumbB.textContent = meta.b;
    if (title) title.textContent = meta.title;
    if (S.view === 'studio') {
      const p = Store.get(S.studioId);
      if (p && title) title.textContent = projectLabel(p);
    }
    if (S.view === 'playground') {
      const p = Store.get(S.pgId);
      if (p && title) title.textContent = 'Playground · ' + projectLabel(p);
    }
    document.title = meta.title + ' · Undangan3D Studio';
    document.body.classList.remove('drawer-open');
    syncNav();
    syncBackend();
    afterRender();
  }

  function syncNav() {
    $$('.nav-link').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-nav') === S.view);
    });
  }

  function syncBackend() {
    const s = Store.settings();
    const on = !!s.apiUrl;
    const dot = $('#backendDot');
    const miniT = $('#backendMiniTitle');
    const miniS = $('#backendMiniSub');
    const chip = $('#backendChip');
    const chipT = $('#backendChipText');
    if (dot) dot.classList.toggle('on', on);
    if (miniT) miniT.textContent = on ? 'Backend terhubung' : 'Mode lokal';
    if (miniS) {
      let host = 'Belum terhubung';
      if (on) { try { host = new URL(s.apiUrl).hostname; } catch (e) { host = 'Apps Script'; } }
      miniS.textContent = host;
    }
    if (chip) chip.classList.toggle('on', on);
    if (chipT) chipT.textContent = on ? 'Backend aktif' : 'Backend belum aktif';
  }

  function afterRender() {
    syncBackend();
    if (S.view === 'connector') {
      ensureConnector();
    }
    if (S.view === 'admins') {
      loadAdmins();
    }
  }

  /* ---------- Dashboard ---------- */
  function viewDashboard() {
    const st = Store.stats();
    const projects = Store.all().slice(0, 4);
    const acts = Store.activity();
    const s = Store.settings();
    return '<div class="dash">' +
      '<section class="hero">' +
      '<div class="hero-copy">' +
      '<div class="hero-kicker"><span class="dot"></span>Platform developer undangan 3D</div>' +
      '<h2>Undangan 3D,<br><em>tanpa ribet.</em></h2>' +
      '<p>Kelola semua website undangan dari satu tempat: studio visual, plugin playground, backend Google Sheets, dan akses admin siap pakai.</p>' +
      '<div class="hero-actions">' +
      '<button class="btn btn-primary" data-act="new-project">' + icon('plus') + 'Proyek Baru</button>' +
      '<a class="btn btn-ghost" href="#/playground">' + icon('play') + 'Coba Playground</a>' +
      '</div>' +
      '<div class="hero-stats">' +
      '<div class="hero-stat"><b>' + st.projects + '</b><span>Proyek</span></div>' +
      '<div class="hero-stat"><b>' + st.published + '</b><span>Terbit</span></div>' +
      '<div class="hero-stat"><b>' + st.guests + '</b><span>Tamu</span></div>' +
      '<div class="hero-stat"><b>' + st.rsvp + '</b><span>RSVP</span></div>' +
      '</div></div>' +
      '<div class="hero-art" aria-hidden="true"><div class="hero-glow"></div><span class="hero-ring"></span><span class="hero-ring r2"></span><div class="hero-card"><span class="hc-leaf">✦</span><span class="hc-mono">R<i>&amp;</i>A</span><span class="hc-names">Rizky &amp; Anisa</span><span class="hc-date">20 · 12 · 2026</span></div><div class="hero-dots"></div></div>' +
      '</section>' +

      '<section class="stat-grid">' +
      statCard('folder', 'Proyek aktif', st.projects, (st.published + ' sudah terbit'), '') +
      statCard('users', 'Total tamu', st.guests, (st.rsvp + ' RSVP masuk'), 'green') +
      statCard('checkCircle', 'Kehadiran', st.hadir, (st.rsvp ? Math.round(st.hadir / Math.max(st.rsvp, 1) * 100) + '% dari RSVP' : 'Belum ada check-in'), 'blue') +
      statCard('layers', 'Plugin aktif', st.plugins, ('di ' + st.projects + ' proyek'), 'rose') +
      '</section>' +

      '<div class="dash-grid">' +
      '<div class="dash-col">' +
      '<div class="card"><div class="panel-head"><div><h3>Proyek terbaru</h3><p>Lanjutkan pengembangan undangan</p></div><a class="btn btn-sm btn-ghost" href="#/projects">Lihat semua ' + icon('arrowRight') + '</a></div><div class="panel-body recent-list">' +
      (projects.length ? projects.map(recentRow).join('') : '<div class="empty-state" style="padding:26px"><p>Belum ada proyek.</p></div>') +
      '</div></div>' +
      '<div class="card"><div class="panel-head"><div><h3>Aktivitas</h3><p>Jejak terakhir di workspace</p></div></div><div class="panel-body activity">' +
      (acts.length ? acts.map(function (a) {
        return '<div class="act-row"><span class="act-dot"></span><div><p>' + esc(actLabel(a)) + '</p><time>' + Store.formatShort(a.t) + ' · ' + new Date(a.t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + '</time></div></div>';
      }).join('') : '<p class="tiny muted">Belum ada aktivitas.</p>') +
      '</div></div>' +
      '</div>' +

      '<div class="dash-col">' +
      '<div class="card"><div class="panel-head"><div><h3>Tool cepat</h3><p>Alur kerja developer</p></div></div><div class="panel-body tool-list">' +
      '<a class="tool-item" href="#/studio"><span class="tool-icon">' + icon('wand') + '</span><div><b>Studio Editor</b><small>Atur konten &amp; tema 3D</small></div>' + icon('chevronRight') + '</a>' +
      '<a class="tool-item" href="#/playground"><span class="tool-icon">' + icon('play') + '</span><div><b>Plugin Playground</b><small>Uji plugin secara live</small></div>' + icon('chevronRight') + '</a>' +
      '<a class="tool-item" href="#/connector"><span class="tool-icon">' + icon('database') + '</span><div><b>Koneksi Backend</b><small>Sheets + Apps Script</small></div>' + icon('chevronRight') + '</a>' +
      '<a class="tool-item" href="#/admins"><span class="tool-icon">' + icon('shield') + '</span><div><b>Akses Admin</b><small>Buat kunci panitia</small></div>' + icon('chevronRight') + '</a>' +
      '</div></div>' +
      '<div class="card card-pad">' +
      '<div class="sec-title" style="margin-bottom:8px"><div><h2 style="font-size:12px">Status backend</h2><p>' + (s.apiUrl ? 'Tersambung ke Apps Script' : 'Data tersimpan di browser ini') + '</p></div><span class="dot ' + (s.apiUrl ? 'on' : '') + '"></span></div>' +
      '<p class="tiny muted" style="margin:0 0 12px">' + (s.apiUrl ? 'Sinkronkan proyek, tamu, RSVP, dan kehadiran ke Google Sheets.' : 'Hubungkan Google Sheets + Apps Script agar data undangan online dan bisa diakses panitia.') + '</p>' +
      '<a class="btn btn-soft btn-sm" href="#/connector">' + icon('database') + (s.apiUrl ? 'Buka konektor' : 'Hubungkan sekarang') + '</a>' +
      '</div>' +
      '</div></div></div>';
  }

  function statCard(ic, label, value, sub, tone) {
    return '<div class="card stat-card"><div class="stat-icon ' + tone + '">' + icon(ic) + '</div><div class="stat-value">' + value + '</div><div class="stat-label">' + esc(label) + '</div><div class="stat-sub">' + esc(sub) + '</div></div>';
  }

  function recentRow(p) {
    const t = Theme.get(p.theme);
    const thumb = p.groom.photo || Theme.art(p.slug, p.theme, { w: 300, h: 300 });
    return '<a class="recent-row" href="#/studio/' + attr(p.id) + '">' +
      '<span class="recent-thumb"><img src="' + attr(thumb) + '" alt=""></span>' +
      '<span class="recent-main"><b>' + esc(projectLabel(p)) + '</b><small>' + Store.formatDate(p.event.date, { day: 'numeric', month: 'long', year: 'numeric' }) + ' · ' + esc(t.name) + '</small></span>' +
      '<span class="recent-meta">' + statusBadge(p) + '</span></a>';
  }

  function actLabel(a) {
    const map = {
      'project.create': 'Proyek baru dibuat', 'project.delete': 'Proyek dihapus',
      'project.duplicate': 'Proyek diduplikasi', 'project.import': 'Proyek diimpor',
      'admin.add': 'Akses admin ditambahkan', 'init': 'Workspace disiapkan'
    };
    return (map[a.action] || a.action) + (a.detail ? ' — ' + a.detail : '');
  }

  /* ---------- Projects ---------- */
  function viewProjects() {
    const projects = Store.all();
    const filtered = projects.filter(function (p) {
      if (S.filter === 'published' && p.status !== 'published') return false;
      if (S.filter === 'draft' && p.status !== 'draft') return false;
      return true;
    });
    return '<div class="projects-head">' +
      '<div><h2>Proyek Undangan</h2><p>' + projects.length + ' proyek · ' + projects.filter(function (p) { return p.status === 'published'; }).length + ' terbit</p></div>' +
      '<div class="projects-tools">' +
      '<div class="search">' + icon('search') + '<input class="input" id="projectSearch" placeholder="Cari nama atau slug…" value="' + attr(S.search) + '"></div>' +
      '<div class="seg" id="projectFilter"><button data-filter="all" class="' + (S.filter === 'all' ? 'active' : '') + '">Semua</button><button data-filter="published" class="' + (S.filter === 'published' ? 'active' : '') + '">Terbit</button><button data-filter="draft" class="' + (S.filter === 'draft' ? 'active' : '') + '">Draft</button></div>' +
      '<button class="btn btn-ghost btn-sm" data-act="export-workspace" title="Ekspor workspace JSON">' + icon('download') + 'JSON</button>' +
      '<button class="btn btn-ghost btn-sm" data-act="import-workspace" title="Impor workspace JSON">' + icon('upload') + '</button>' +
      '<button class="btn btn-primary btn-sm" data-act="new-project">' + icon('plus') + 'Proyek Baru</button>' +
      '</div></div>' +
      (filtered.length ?
        '<div class="projects-grid" id="projectsGrid">' + filtered.map(projectCard).join('') + '</div>' :
        '<div class="empty-state"><div class="es-icon">' + icon('folder') + '</div><h3>Belum ada proyek yang cocok</h3><p>Ubah filter atau buat proyek baru untuk mulai membangun undangan 3D.</p><button class="btn btn-primary" data-act="new-project">' + icon('plus') + 'Proyek Baru</button></div>');
  }

  function projectCard(p) {
    const t = Theme.get(p.theme);
    const sum = Store.summary(p.slug) || p.demoStats || {};
    const photo = p.groom.photo || Theme.art(p.slug + '-cover', p.theme, { w: 900, h: 500 });
    const enabled = Plugins.list.filter(function (pl) { return Plugins.isOn(p, pl.id); });
    return '<article class="project-card card" data-name="' + attr((projectLabel(p) + ' ' + p.slug).toLowerCase()) + '" data-status="' + attr(p.status) + '" style="--p-bg:' + t.vars.bg + '">' +
      '<div class="pc-visual">' +
      '<img src="' + attr(photo) + '" alt="Pratinjau ' + attr(projectLabel(p)) + '" loading="lazy">' +
      '<span class="pc-status">' + statusBadge(p) + '</span>' +
      '<span class="pc-theme"><span style="background:' + t.vars.accent + '"></span><span style="background:' + t.scene.gold + '"></span><span style="background:' + t.vars.bg + '"></span></span>' +
      '<div class="pc-mono">' + esc(Theme.initials(p.groom.short || p.groom.name || 'R')) + ' <em>&amp;</em> ' + esc(Theme.initials(p.bride.short || p.bride.name || 'A')) + '</div>' +
      '<div class="pc-date">' + esc(Store.formatDate(p.event.date, { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' · ')) + '</div>' +
      '</div>' +
      '<div class="pc-body">' +
      '<div><h3 class="pc-title">' + esc(projectTitle(p)) + '</h3><span class="pc-slug">/undangan/' + esc(p.slug) + '</span></div>' +
      '<div class="pc-stats">' +
      '<div class="pc-stat"><b>' + Number(sum.guests || 0) + '</b><span>Tamu</span></div>' +
      '<div class="pc-stat"><b>' + Number(sum.rsvp || 0) + '</b><span>RSVP</span></div>' +
      '<div class="pc-stat"><b>' + Number(sum.hadir || 0) + '</b><span>Hadir</span></div>' +
      '<div class="pc-stat"><b>' + enabled.length + '</b><span>Plugin</span></div>' +
      '</div>' +
      '<div class="pc-plugins">' + enabled.slice(0, 3).map(function (pl) { return '<span class="chip on">' + icon('check') + esc(pl.name) + '</span>'; }).join('') + (enabled.length > 3 ? '<span class="chip">+' + (enabled.length - 3) + '</span>' : '') + '</div>' +
      '<div class="pc-actions">' +
      '<button class="btn btn-primary btn-sm" data-act="open-studio" data-id="' + attr(p.id) + '">' + icon('wand') + 'Studio</button>' +
      '<button class="icon-btn" data-act="preview-project" data-id="' + attr(p.id) + '" title="Pratinjau">' + icon('eye') + '</button>' +
      '<button class="icon-btn" data-act="duplicate-project" data-id="' + attr(p.id) + '" title="Duplikat">' + icon('copy') + '</button>' +
      '<button class="icon-btn danger" data-act="delete-project" data-id="' + attr(p.id) + '" title="Hapus">' + icon('trash') + '</button>' +
      '</div></div></article>';
  }

  /* ---------- Studio ---------- */
  function viewStudio() {
    const p = Store.get(S.studioId);
    if (!p) {
      return '<div class="empty-state"><div class="es-icon">' + icon('folder') + '</div><h3>Belum ada proyek</h3><p>Buat proyek pertama untuk membuka studio editor.</p><button class="btn btn-primary" data-act="new-project">' + icon('plus') + 'Proyek Baru</button></div>';
    }
    const t = Theme.get(p.theme);
    return '<div class="studio-head">' +
      '<a class="icon-btn" href="#/projects" title="Kembali">' + icon('arrowLeft') + '</a>' +
      '<div class="sh-main"><h2>' + esc(projectLabel(p)) + '</h2><p>' + statusBadge(p) + ' &nbsp;<span class="mono">/undangan/' + esc(p.slug) + '</span></p></div>' +
      '<span class="save-state saved" id="saveState"><span class="dot"></span>Tersimpan</span>' +
      '<div class="btn-group">' +
      '<button class="btn btn-ghost" data-act="studio-preview-reload">' + icon('refresh') + 'Pratinjau</button>' +
      '<button class="btn btn-primary" data-act="export-project" data-id="' + attr(p.id) + '">' + icon('download') + 'Ekspor HTML</button>' +
      '</div></div>' +

      '<div class="studio-grid">' +
      '<div class="studio-form">' +
      formCard(1, 'Identitas Mempelai', 'Nama, orang tua, dan foto', coupleEditor(p)) +
      formCard(2, 'Acara & Lokasi', 'Tanggal, akad, resepsi, dan peta', eventEditor(p)) +
      formCard(3, 'Tema & Panggung 3D', 'Palet warna dan kepadatan partikel', '<div class="theme-grid">' +
        Theme.list().map(function (th) {
          return '<button class="theme-card ' + (th.id === p.theme ? 'active' : '') + '" data-act="pick-theme" data-theme="' + attr(th.id) + '" style="--x:0">' +
            '<span class="theme-swatch" style="background:linear-gradient(145deg,' + th.vars.bg + ' 0%,' + th.vars.accentSoft + ' 48%,' + th.scene.gold + ' 100%)"></span>' +
            '<b>' + esc(th.name) + '</b><small>' + esc(th.tag) + '</small></button>';
        }).join('') + '</div>' +
        '<div class="fgrid">' +
        '<div class="field"><label>Kepadatan partikel 3D</label><select class="select" data-bind="scene.density"><option value="rendah"' + (p.scene.density === 'rendah' ? ' selected' : '') + '>Rendah — hemat baterai</option><option value="sedang"' + (p.scene.density === 'sedang' ? ' selected' : '') + '>Sedang — seimbang</option><option value="tinggi"' + (p.scene.density === 'tinggi' ? ' selected' : '') + '>Tinggi — paling dramatis</option></select></div>' +
        '<div class="field"><label>Animasi kamera</label><div class="plugin-row" style="height:35px"><div><b>Parallax &amp; partikel bergerak</b><small>Matikan untuk perangkat lambat</small></div><label class="switch"><input type="checkbox" data-bind="scene.motion"' + (p.scene.motion ? ' checked' : '') + '><span></span></label></div></div>' +
        '</div>') +
      formCard(4, 'Plugin Undangan', 'Aktifkan fitur yang tampil untuk tamu', '<div class="plugin-list">' +
        Plugins.list.map(function (pl) {
          return '<div class="plugin-row"><span class="pi-icon">' + icon(pl.icon) + '</span><div><b>' + esc(pl.name) + '</b><small>' + esc(pl.desc) + '</small></div><label class="switch"><input type="checkbox" data-plugin-toggle="' + pl.id + '"' + (Plugins.isOn(p, pl.id) ? ' checked' : '') + '><span></span></label></div>';
        }).join('') + '</div>') +
      formCard(5, 'Love Story', 'Timeline perjalanan hubungan', '<div id="storyList">' + storyEditor(p) + '</div><button class="btn btn-ghost btn-sm list-add" data-act="story-add">' + icon('plus') + 'Tambah cerita</button>') +
      formCard(6, 'Galeri Foto', 'Foto akan tampil di grid undangan', '<div class="gallery-grid" id="galleryGrid">' + galleryEditor(p) + '</div><div class="mini-actions"><button class="btn btn-ghost btn-sm" data-act="gallery-add">' + icon('plus') + 'Tambah foto</button><button class="btn btn-ghost btn-sm" data-act="gallery-preset">' + icon('sparkles') + 'Isi 3 foto contoh</button></div>') +
      formCard(7, 'Kutipan & Hadiah', 'Ayat/quote dan amplop digital', quoteEditor(p)) +
      '</div>' +

      '<aside class="studio-side">' +
      previewPanel(p) +
      publishPanel(p, t) +
      '</aside></div>';
  }

  function formCard(num, title, sub, body) {
    return '<section class="card form-card"><div class="fc-head"><span class="fc-num">' + String(num).padStart(2, '0') + '</span><div><h3>' + esc(title) + '</h3><p>' + esc(sub) + '</p></div></div><div class="fc-body">' + body + '</div></section>';
  }

  function inputF(label, path, value, opts) {
    opts = opts || {};
    const type = opts.type || 'text';
    return '<div class="field ' + (opts.full ? 'full' : '') + '"><label>' + esc(label) + (opts.required ? ' <b>WAJIB</b>' : '') + '</label>' +
      '<input class="input" type="' + type + '" data-bind="' + attr(path) + '" value="' + attr(value) + '" placeholder="' + attr(opts.ph || '') + '"' + (opts.step ? ' step="' + opts.step + '"' : '') + '>' +
      (opts.hint ? '<span class="hint">' + esc(opts.hint) + '</span>' : '') + '</div>';
  }
  function textareaF(label, path, value, opts) {
    opts = opts || {};
    return '<div class="field ' + (opts.full ? 'full' : '') + '"><label>' + esc(label) + '</label><textarea class="textarea" data-bind="' + attr(path) + '" placeholder="' + attr(opts.ph || '') + '">' + esc(value) + '</textarea>' + (opts.hint ? '<span class="hint">' + esc(opts.hint) + '</span>' : '') + '</div>';
  }

  function personEditor(p, key, title, badge) {
    const person = p[key];
    const gh = Theme.initials(person.short || person.name || '?');
    return '<div class="person" data-person="' + key + '">' +
      '<div class="person-head"><div class="person-avatar" data-avatar="' + key + '">' + (person.photo ? '<img src="' + attr(person.photo) + '" alt="">' : gh) + '</div><div><b>' + esc(title) + '</b><small>' + esc(person.name || 'Belum diisi') + '</small></div><span class="badge ' + (badge === 'GROOM' ? 'draft' : 'rose') + '">' + badge + '</span></div>' +
      '<div class="fgrid">' +
      inputF('Nama panggilan', key + '.short', person.short, { ph: 'Rizky' }) +
      inputF('Nama lengkap', key + '.name', person.name, { ph: 'Rizky Maulana' }) +
      inputF('Putra/Putri dari', key + '.parents', person.parents, { ph: 'Bapak ... & Ibu ...', full: true }) +
      inputF('Instagram', key + '.ig', person.ig, { ph: '@rizky' }) +
      inputF('Foto (URL)', key + '.photo', person.photo, { ph: 'https://... atau data:image', hint: 'Kosongkan untuk memakai artwork tema.' }) +
      '</div></div>';
  }

  function coupleEditor(p) {
    return personEditor(p, 'groom', 'Mempelai Pria', 'GROOM') + personEditor(p, 'bride', 'Mempelai Wanita', 'BRIDE');
  }

  function eventEditor(p) {
    return '<div class="fgrid">' +
      inputF('Tanggal acara', 'event.date', p.event.date, { type: 'date' }) +
      '<div class="field"><label>Zona waktu</label><input class="input" value="WIB (Asia/Jakarta)" disabled><span class="hint">Tanggal dihitung otomatis untuk hitung mundur.</span></div>' +
      '</div>' +
      '<div class="person"><div class="person-head"><span class="pi-icon" style="width:28px;height:28px;border-radius:8px;display:grid;place-items:center;color:var(--gold);background:rgba(217,179,106,.07);border:1px solid rgba(217,179,106,.12)">' + icon('heart') + '</span><div><b>Akad Nikah</b><small>Prosesi utama</small></div></div><div class="fgrid three">' +
      inputF('Waktu', 'event.akad.time', p.event.akad.time, { ph: '08.00' }) +
      inputF('Label', 'event.akad.label', p.event.akad.label, { ph: 'Akad Nikah' }) +
      inputF('Tempat', 'event.akad.place', p.event.akad.place, { ph: 'Masjid ...' }) +
      inputF('Alamat lengkap', 'event.akad.address', p.event.akad.address, { full: true, ph: 'Jl. ...' }) +
      inputF('Link Google Maps', 'event.akad.maps', p.event.akad.maps, { full: true, ph: 'https://maps.google.com/...' }) +
      '</div></div>' +
      '<div class="person"><div class="person-head"><span class="pi-icon" style="width:28px;height:28px;border-radius:8px;display:grid;place-items:center;color:var(--gold);background:rgba(217,179,106,.07);border:1px solid rgba(217,179,106,.12)">' + icon('sparkles') + '</span><div><b>Resepsi</b><small>Perayaan bersama tamu</small></div></div><div class="fgrid three">' +
      inputF('Waktu', 'event.resepsi.time', p.event.resepsi.time, { ph: '11.00 – 15.00' }) +
      inputF('Label', 'event.resepsi.label', p.event.resepsi.label, { ph: 'Resepsi' }) +
      inputF('Tempat', 'event.resepsi.place', p.event.resepsi.place, { ph: 'Gedung ...' }) +
      inputF('Alamat lengkap', 'event.resepsi.address', p.event.resepsi.address, { full: true, ph: 'Jl. ...' }) +
      inputF('Link Google Maps', 'event.resepsi.maps', p.event.resepsi.maps, { full: true, ph: 'https://maps.google.com/...' }) +
      '</div></div>';
  }

  function storyEditor(p) {
    if (!p.story.length) return '<p class="tiny muted" style="margin:0">Belum ada cerita. Tambahkan momen penting perjalanan Anda.</p>';
    return p.story.map(function (s, i) {
      return '<div class="list-row" style="margin-bottom:8px"><div class="lr-main">' +
        '<input class="input" data-array="story" data-index="' + i + '" data-field="year" value="' + attr(s.year) + '" placeholder="2020">' +
        '<input class="input" data-array="story" data-index="' + i + '" data-field="title" value="' + attr(s.title) + '" placeholder="Judul momen">' +
        '<textarea class="textarea full" data-array="story" data-index="' + i + '" data-field="text" placeholder="Ceritakan momen ini…" style="min-height:52px">' + esc(s.text) + '</textarea>' +
        '</div><button class="icon-btn danger" data-act="story-del" data-index="' + i + '" title="Hapus">' + icon('trash') + '</button></div>';
    }).join('');
  }

  function galleryEditor(p) {
    if (!p.gallery.length) return '<p class="tiny muted" style="margin:0;grid-column:1/-1">Belum ada foto. Tambahkan URL foto atau pakai contoh artwork.</p>';
    return p.gallery.map(function (g, i) {
      return '<div class="gallery-item"><div class="gallery-thumb">' +
        (g.src ? '<img src="' + attr(g.src) + '" alt="" style="width:100%;height:100%;object-fit:cover">' : '') +
        '<button data-act="gallery-del" data-index="' + i + '" title="Hapus">' + icon('close') + '</button></div>' +
        '<div class="gallery-fields"><input class="input" data-array="gallery" data-index="' + i + '" data-field="src" value="' + attr(g.src) + '" placeholder="URL foto"><input class="input" data-array="gallery" data-index="' + i + '" data-field="caption" value="' + attr(g.caption) + '" placeholder="Caption"></div></div>';
    }).join('');
  }

  function quoteEditor(p) {
    return '<div class="fgrid">' +
      textareaF('Kutipan / ayat', 'quote.text', p.quote.text, { full: true, ph: 'Tulis kutipan yang bermakna…' }) +
      inputF('Sumber kutipan', 'quote.source', p.quote.source, { full: true, ph: 'QS. Ar-Rum: 21' }) +
      '</div><div class="person"><div class="person-head"><div><b>Amplop Digital</b><small>Plugin hadiah: ' + (Plugins.isOn(p, 'gift') ? 'aktif' : 'nonaktif') + '</small></div><label class="switch" style="margin-left:auto"><input type="checkbox" data-plugin-toggle="gift"' + (Plugins.isOn(p, 'gift') ? ' checked' : '') + '><span></span></label></div><div class="fgrid">' +
      inputF('Bank / e-wallet', 'gift.bank', p.gift.bank, { ph: 'BCA' }) +
      inputF('Nomor rekening', 'gift.number', p.gift.number, { ph: '1234567890' }) +
      inputF('Atas nama', 'gift.holder', p.gift.holder, { ph: 'Nama pemilik rekening' }) +
      inputF('No. e-wallet', 'gift.wallet', p.gift.wallet, { ph: '0812...' }) +
      inputF('Alamat kirim hadiah', 'gift.address', p.gift.address, { full: true, ph: 'Alamat lengkap' }) +
      '</div></div>' +
      textareaF('Catatan internal', 'notes', p.notes, { ph: 'Catatan untuk tim developer (tidak tampil di undangan).' });
  }

  function previewPanel(p) {
    return '<div class="card preview-card">' +
      '<div class="preview-top"><div class="pt-title"><b>Pratinjau langsung</b><small>Mode demo · data uji coba</small></div>' +
      '<div class="seg"><button data-act="device" data-device="desktop" class="' + (S.device === 'desktop' ? 'active' : '') + '">Desktop</button><button data-act="device" data-device="mobile" class="' + (S.device === 'mobile' ? 'active' : '') + '">HP</button></div>' +
      '<button class="icon-btn" data-act="studio-preview-reload" title="Muat ulang">' + icon('refresh') + '</button>' +
      '<button class="icon-btn" data-act="preview-project" data-id="' + attr(p.id) + '" title="Buka tab baru">' + icon('external') + '</button></div>' +
      '<div class="preview-stage ' + (S.device === 'mobile' ? 'mobile' : '') + '" id="previewStage"><iframe id="studioFrame" title="Pratinjau undangan" src="' + attr(previewUrl(p)) + '"></iframe></div>' +
      '<div class="preview-foot">' + icon('info') + '<span class="mono">' + esc(previewUrl(p)) + '</span></div></div>';
  }

  function publishPanel(p, t) {
    const link = publicLink(p);
    const linkLabel = (Store.settings().apiUrl ? 'Link publik' : 'Link demo (lokal)');
    return '<div class="card publish-card">' +
      '<div class="publish-row"><div><b>' + (p.status === 'published' ? 'Terbit' : 'Draft') + '</b><small>' + (p.status === 'published' ? 'Tamu dapat membuka undangan' : 'Hanya pratinjau lokal') + '</small></div>' +
      '<button class="btn btn-sm ' + (p.status === 'published' ? 'btn-soft' : 'btn-primary') + '" data-act="toggle-publish">' + icon('eye') + (p.status === 'published' ? 'Jadikan draft' : 'Terbitkan') + '</button></div>' +
      '<div class="field"><label>Slug URL</label><div class="link-box"><input class="input" data-slug="' + attr(p.id) + '" value="' + attr(p.slug) + '"><button class="icon-btn" data-act="copy" data-copy="' + attr(p.slug) + '" title="Salin slug">' + icon('copy') + '</button></div></div>' +
      '<div class="field"><label>' + linkLabel + '</label><div class="link-box"><input class="input" readonly value="' + attr(link) + '"><button class="icon-btn" data-act="copy" data-copy="' + attr(link) + '" title="Salin link">' + icon('copy') + '</button></div></div>' +
      '<div class="mini-actions">' +
      '<button class="btn btn-sm btn-ghost" data-act="studio-preview-reload">' + icon('refresh') + 'Pratinjau</button>' +
      '<button class="btn btn-sm btn-ghost" data-act="export-project" data-id="' + attr(p.id) + '">' + icon('download') + 'Ekspor</button>' +
      '<a class="btn btn-sm btn-ghost" href="apps-script.gs" download>' + icon('code') + 'Backend .gs</a>' +
      '</div>' +
      '<p class="tiny muted" style="margin:0">Tema: ' + esc(t.name) + ' · ' + Plugins.count(p) + ' plugin aktif · diperbarui ' + Store.formatShort(p.updatedAt) + '</p>' +
      '<div class="callout" style="padding:10px">' + icon('info') + '<span>' + (Store.settings().apiUrl ? 'Backend aktif. Data RSVP & tamu akan masuk ke Google Sheets.' : 'Belum terhubung ke Google Sheets. Hubungkan backend sebelum membagikan link ke tamu.') + '</span></div>' +
      '<button class="btn btn-sm btn-danger" data-act="delete-project" data-id="' + attr(p.id) + '">' + icon('trash') + 'Hapus proyek</button>' +
      '</div>';
  }

  /* ---------- Playground ---------- */
  function viewPlayground() {
    const p = Store.get(S.pgId) || Store.all()[0];
    if (!p) {
      return '<div class="empty-state"><div class="es-icon">' + icon('play') + '</div><h3>Belum ada proyek untuk diuji</h3><p>Buat proyek terlebih dahulu, lalu mainkan plugin di playground.</p><button class="btn btn-primary" data-act="new-project">' + icon('plus') + 'Proyek Baru</button></div>';
    }
    if (S.pgId !== p.id) S.pgId = p.id;
    const enabled = Plugins.count(p);
    const log = S.pgLog.length ? S.pgLog : [
      { t: Date.now(), type: 'ok', msg: 'Playground siap. Memuat runtime undangan…' },
      { t: Date.now(), type: '', msg: 'Klik "Putar" pada plugin untuk menyorot section-nya.' }
    ];
    return '<div class="pg-head"><div><h2>Plugin Playground</h2><p>Nyalakan, matikan, dan putar plugin secara langsung pada pratinjau.</p></div>' +
      '<div class="pg-actions"><button class="btn btn-ghost btn-sm" data-act="pg-all">' + icon('sparkles') + 'Mainkan semua</button><button class="btn btn-ghost btn-sm" data-act="pg-reset">' + icon('refresh') + 'Reset default</button><button class="btn btn-soft btn-sm" data-act="pg-open">' + icon('external') + 'Buka penuh</button></div></div>' +
      '<div class="pg-grid"><div class="pg-left">' +
      '<div class="card pg-project"><label>Proyek yang diuji</label><select class="select" data-pg-project>' + Store.all().map(function (x) { return '<option value="' + attr(x.id) + '"' + (x.id === p.id ? ' selected' : '') + '>' + esc(projectLabel(x)) + '</option>'; }).join('') + '</select><div style="display:flex;gap:6px;align-items:center;margin-top:2px"><span class="mode-pill demo">' + icon('code') + 'MODE DEMO</span><span class="tiny muted" style="margin-left:auto">' + enabled + '/' + Plugins.list.length + ' aktif</span></div></div>' +
      '<div class="card pg-list" id="pgList">' + Plugins.list.map(function (pl) {
        const on = Plugins.isOn(p, pl.id);
        return '<div class="pg-item ' + (on ? '' : 'off') + '" data-pg-item="' + pl.id + '"><span class="pi-icon">' + icon(pl.icon) + '</span><div class="pg-item-main"><b>' + esc(pl.name) + '</b><small>' + esc(pl.desc) + '</small></div><div class="pg-item-actions"><button class="pg-play" data-act="pg-focus" data-plugin="' + pl.id + '" title="Putar / sorot">' + icon('play') + '</button><label class="switch"><input type="checkbox" data-pg-toggle="' + pl.id + '"' + (on ? ' checked' : '') + '><span></span></label></div></div>';
      }).join('') + '</div>' +
      '<div class="pg-console"><div class="pg-console-head"><span class="dot"></span>Event log</div><div class="pg-log" id="pgLog">' + log.map(pgLogRow).join('') + '</div></div>' +
      '</div>' +
      '<div class="card pg-preview"><div class="pg-preview-top"><b>Live preview</b><span class="badge demo">PREVIEW</span><span class="tiny muted">' + esc(projectLabel(p)) + '</span><span class="spacer"></span><button class="icon-btn" data-act="pg-reload" title="Muat ulang">' + icon('refresh') + '</button><button class="icon-btn" data-act="pg-open" title="Buka penuh">' + icon('external') + '</button></div><div class="pg-frame-stage"><iframe id="pgFrame" title="Playground undangan" src="' + attr(previewUrl(p)) + '"></iframe></div></div>' +
      '</div>';
  }

  function pgLogRow(l) {
    const d = new Date(l.t);
    const time = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
    return '<div class="' + (l.type || '') + '"><time>' + time + '</time>' + esc(l.msg) + '</div>';
  }
  function pgLog(type, msg) {
    S.pgLog.push({ t: Date.now(), type: type || '', msg: msg });
    if (S.pgLog.length > 30) S.pgLog.shift();
    const el = $('#pgLog');
    if (el) {
      el.innerHTML = S.pgLog.map(pgLogRow).join('');
      el.scrollTop = el.scrollHeight;
    }
  }
  function pgReload() {
    const p = Store.get(S.pgId);
    const f = $('#pgFrame');
    if (p && f) f.src = previewUrl(p) + '&_=' + Date.now();
  }
  function pgFocus(id) {
    const p = Store.get(S.pgId);
    const f = $('#pgFrame');
    const pl = Plugins.get(id);
    if (f && f.contentWindow) {
      f.contentWindow.postMessage({ source: 'u3d-studio', type: 'focus', plugin: id }, '*');
      pgLog('ok', 'Putar plugin "' + (pl ? pl.name : id) + '" → section ' + (pl ? pl.section : '?'));
      if (id === 'checkin' || id === 'admin') {
        f.contentWindow.postMessage({ source: 'u3d-studio', type: 'admin' }, '*');
        pgLog('warn', 'Membuka panel admin demo (kunci: admin123).');
      }
    } else {
      pgLog('err', 'Preview belum siap. Muat ulang lalu coba lagi.');
    }
  }

  /* ---------- Connector ---------- */
  function viewConnector() {
    const p = Store.get(S.connId) || Store.all()[0];
    if (p && S.connId !== p.id && !Store.get(S.connId)) S.connId = p.id;
    const s = Store.settings();
    const mode = s.apiUrl ? 'live' : 'demo';
    const modePill = mode === 'live' ? '<span class="mode-pill live"><span class="dot on"></span>LIVE · Apps Script</span>' : '<span class="mode-pill demo">' + icon('code') + 'DEMO · browser</span>';
    return '<div class="conn-head"><div><h2>Koneksi Backend</h2><p>Hubungkan undangan ke Google Sheets + Apps Script untuk RSVP online, daftar tamu, check-in, dan akses admin.</p></div><div class="conn-actions">' + modePill + '</div></div>' +
      '<div class="conn-grid">' +
      '<div class="card conn-card"><h3>' + icon('database') + 'Apps Script Web App</h3><p>Tempel URL deployment (/exec) dan kunci admin yang sama dengan konstanta <span class="code-chip">ADMIN</span> di apps-script.gs.</p>' +
      '<div class="field"><label>URL Web App Apps Script</label><input class="input" data-setting="apiUrl" value="' + attr(s.apiUrl) + '" placeholder="https://script.google.com/macros/s/AKfycb.../exec" spellcheck="false"></div>' +
      '<div class="fgrid">' +
      '<div class="field"><label>Kunci admin (ADMIN)</label><input class="input" data-setting="adminKey" type="password" value="' + attr(s.adminKey) + '" placeholder="ganti-kunci-ini"></div>' +
      '<div class="field"><label>URL publik platform</label><input class="input" data-setting="siteBase" value="' + attr(s.siteBase) + '" placeholder="https://username.github.io/undangan3d/" spellcheck="false"><span class="hint">Dipakai untuk link tamu &amp; admin.</span></div>' +
      '</div>' +
      '<div class="conn-actions"><button class="btn btn-primary" data-act="conn-test">' + icon('refresh') + 'Tes koneksi</button><button class="btn btn-soft" data-act="conn-init">' + icon('database') + 'Inisialisasi sheet</button><a class="btn btn-ghost" href="apps-script.gs" download>' + icon('download') + 'Unduh .gs</a></div>' +
      '<div class="callout blue">' + icon('info') + '<span>Deploy sebagai <b>Web app</b>, Execute as <b>Me</b>, Who has access <b>Anyone</b>. Tanpa kunci admin, platform tetap berfungsi dalam mode demo.</span></div>' +
      '<div id="connTestMsg" class="sync-log">' + (S.connMsg ? esc(S.connMsg) : 'Belum ada pengujian.') + '</div>' +
      '</div>' +
      '<div class="card conn-card"><h3>' + icon('server') + 'Sinkronisasi Proyek</h3><p>Kirim konfigurasi undangan ke Sheets, tarik perubahan, atau hapus proyek dari backend.</p>' +
      '<div class="sync-row"><select class="select" data-conn-project>' + (Store.all().map(function (x) { return '<option value="' + attr(x.id) + '"' + (x.id === p?.id ? ' selected' : '') + '>' + esc(projectLabel(x)) + '</option>'; }).join('') || '<option>Tidak ada proyek</option>') + '</select></div>' +
      '<div class="conn-actions"><button class="btn btn-soft" data-act="conn-push">' + icon('upload') + 'Kirim ke Sheets</button><button class="btn btn-ghost" data-act="conn-pull">' + icon('download') + 'Tarik dari Sheets</button><button class="btn btn-ghost" data-act="conn-summary">' + icon('refresh') + 'Sinkron statistik</button><button class="btn btn-danger" data-act="conn-delete">' + icon('trash') + '</button></div>' +
      '<div class="sync-log" id="connLog">' + (S.connLog.length ? S.connLog.map(function (l) { return '<div class="' + (l.type || '') + '">' + esc(l.msg) + '</div>'; }).join('') : 'Log sinkronisasi akan tampil di sini.') + '</div>' +
      '<div class="callout">' + icon('alert') + '<span>Proyek yang dikirim bisa dibuka lewat link publik: <span class="mono">undangan.html?s=slug&amp;api=URL</span>. Kunci tamu tetap diverifikasi backend.</span></div>' +
      '</div></div>' +

      '<div class="card guest-card guest-section">' +
      '<div class="guest-toolbar"><div><h3 style="margin:0;font-size:13px">Daftar Tamu &amp; Link Undangan</h3><p style="margin:2px 0 0;color:var(--muted-2);font-size:9.5px">' + (mode === 'live' ? 'Tersimpan di Google Sheets.' : 'Mode demo: tamu disimpan di browser ini.') + '</p></div><span class="spacer"></span>' + modePill +
      '<button class="btn btn-ghost btn-sm" data-act="guest-export">' + icon('download') + 'CSV</button><button class="btn btn-ghost btn-sm" data-act="guest-reload">' + icon('refresh') + 'Muat ulang</button></div>' +
      '<div class="guest-forms">' +
      '<form class="guest-form" data-form="guest-add"><h4>' + icon('plus') + 'Tambah satu tamu</h4><input class="input" name="name" placeholder="Nama tamu / keluarga" required><div class="row"><input class="input" name="wa" placeholder="No. WhatsApp (opsional)"><button class="btn btn-primary btn-sm" type="submit">' + icon('plus') + 'Tambah</button></div><span class="guest-note">Kunci &amp; kode 4 digit dibuat otomatis. Link bisa langsung dibagikan.</span></form>' +
      '<form class="guest-form" data-form="guest-bulk"><h4>' + icon('users') + 'Impor massal</h4><textarea class="textarea" name="bulk" placeholder="Bapak Andi | 08123456789&#10;Ibu Sari | 08129876543&#10;Rendra & Keluarga"></textarea><button class="btn btn-soft btn-sm" type="submit">' + icon('upload') + 'Impor tamu</button><span class="guest-note">Satu tamu per baris. Format: <b>Nama | WhatsApp</b>.</span></form>' +
      '</div>' +
      '<div id="guestTableWrap">' + guestTable(p, mode) + '</div></div>';
  }

  function guestTable(p, mode) {
    if (!p) return '<div class="empty-state" style="padding:24px"><p>Belum ada proyek.</p></div>';
    if (S.connLoading) return '<div class="table-wrap" style="padding:18px"><div class="skeleton" style="height:30px;margin-bottom:8px"></div><div class="skeleton" style="height:30px;margin-bottom:8px"></div><div class="skeleton" style="height:30px"></div></div>';
    if (S.connMode === 'error') return '<div class="callout danger">' + icon('alert') + '<span>' + esc(S.connMsg || 'Gagal memuat tamu dari backend.') + '</span></div>';
    if (!S.connGuests.length) return '<div class="empty-state" style="padding:26px"><div class="es-icon">' + icon('users') + '</div><h3>Belum ada tamu</h3><p>Tambahkan tamu untuk membuat link undangan personal dan kode check-in.</p></div>';
    return '<div class="table-wrap"><table class="data"><thead><tr><th>Nama</th><th>WhatsApp</th><th>Kunci</th><th>Kode</th><th>Link</th><th style="text-align:right">Aksi</th></tr></thead><tbody>' +
      S.connGuests.map(function (g) {
        const link = guestLink(p, g);
        return '<tr><td><b>' + esc(g.name) + '</b></td><td>' + (g.wa ? esc(g.wa) : '<span class="muted">—</span>') + '</td><td><span class="code-chip">' + esc(g.key) + '</span></td><td><span class="code-chip">' + esc(g.code) + '</span></td><td><button class="btn btn-sm btn-ghost" data-act="copy" data-copy="' + attr(link) + '">' + icon('link') + 'Salin</button></td><td><div class="actions" style="justify-content:flex-end"><a class="icon-btn" href="' + attr(waGuest(p, g)) + '" target="_blank" rel="noopener" title="Kirim WhatsApp">' + icon('phone') + '</a><button class="icon-btn danger" data-act="guest-del" data-key="' + attr(g.key) + '" data-name="' + attr(g.name) + '" title="Hapus">' + icon('trash') + '</button></div></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function ensureConnector() {
    const p = Store.get(S.connId) || Store.all()[0];
    if (!p) return;
    if (S.connId !== p.id) { S.connId = p.id; S.connGuests = []; S.connLoadedFor = null; }
    if (S.connLoadedFor !== p.id) loadGuests();
  }

  async function loadGuests() {
    const p = Store.get(S.connId);
    if (!p) return;
    S.connLoading = true;
    S.connMsg = '';
    const wrap = $('#guestTableWrap');
    if (wrap) wrap.innerHTML = guestTable(p, '');
    try {
      if (Store.settings().apiUrl) {
        const r = await API.call({ action: 'guest.list', slug: p.slug });
        S.connGuests = (r.guests || []).slice();
        S.connMode = 'live';
      } else {
        S.connGuests = Store.demoGuests(p.slug).slice();
        S.connMode = 'demo';
      }
      S.connLoadedFor = p.id;
    } catch (e) {
      S.connMode = 'error';
      S.connMsg = e.message;
      S.connGuests = [];
    } finally {
      S.connLoading = false;
      const w = $('#guestTableWrap');
      if (w) w.innerHTML = guestTable(p, '');
      const logEl = $('#connLog');
      if (S.connLog.length && logEl) logEl.innerHTML = S.connLog.map(function (l) { return '<div class="' + (l.type || '') + '">' + esc(l.msg) + '</div>'; }).join('');
    }
  }

  function connLog(type, msg) {
    S.connLog.unshift({ type: type, msg: msg });
    if (S.connLog.length > 20) S.connLog.length = 20;
    const el = $('#connLog');
    if (el) el.innerHTML = S.connLog.map(function (l) { return '<div class="' + (l.type || '') + '">' + esc(l.msg) + '</div>'; }).join('');
  }

  async function withBusy(btn, fn) {
    const old = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = icon('refresh', 'spin') + 'Memproses…';
    }
    try { return await fn(); }
    catch (e) { toast('Gagal', e.message || String(e), 'error'); return null; }
    finally {
      if (btn) { btn.disabled = false; btn.innerHTML = old; }
    }
  }

  /* ---------- Guests ---------- */
  async function addGuest(name, wa) {
    const p = Store.get(S.connId);
    if (!p) throw new Error('Pilih proyek terlebih dahulu.');
    if (Store.settings().apiUrl) {
      const r = await API.call({ action: 'guest.add', slug: p.slug, name: name, wa: wa });
      connLog('ok', 'Tamu ditambahkan ke Sheets: ' + name);
      return r.guest;
    }
    const g = Store.demoAddGuest(p.slug, name, wa);
    connLog('ok', 'Tamu ditambahkan (demo): ' + name);
    return g;
  }

  async function addBulkGuests(text) {
    const p = Store.get(S.connId);
    if (!p) throw new Error('Pilih proyek terlebih dahulu.');
    const list = String(text || '').split(/\r?\n/).map(function (line) {
      const parts = line.split(/[|,;\t]/).map(function (x) { return x.trim(); }).filter(Boolean);
      return parts.length ? { name: parts[0], wa: parts[1] || '' } : null;
    }).filter(Boolean);
    if (!list.length) throw new Error('Tidak ada nama tamu yang terbaca.');
    if (Store.settings().apiUrl) {
      const r = await API.call({ action: 'guest.bulk', slug: p.slug, list: list });
      connLog('ok', 'Impor massal: ' + (r.added || 0) + ' ditambahkan, ' + ((r.dup || []).length) + ' duplikat.');
      return r;
    }
    const added = [], dup = [];
    list.forEach(function (g) {
      try { added.push(Store.demoAddGuest(p.slug, g.name, g.wa)); }
      catch (e) { dup.push(g.name); }
    });
    connLog('ok', 'Impor demo: ' + added.length + ' ditambahkan, ' + dup.length + ' duplikat.');
    return { added: added.length, dup: dup };
  }

  async function deleteGuest(key, name) {
    const p = Store.get(S.connId);
    if (!p) return;
    if (Store.settings().apiUrl) await API.call({ action: 'guest.delete', slug: p.slug, key: key });
    else Store.demoDeleteGuest(p.slug, key);
    connLog('warn', 'Tamu dihapus: ' + name);
    toast('Tamu dihapus', name);
    await loadGuests();
  }

  function parseGuestsDemo(p) { return Store.demoGuests(p.slug); }

  /* ---------- Admins ---------- */
  function viewAdmins() {
    const p = Store.get(S.adminId) || Store.all()[0];
    const s = Store.settings();
    const mode = s.apiUrl ? 'live' : 'demo';
    const selectedProject = p ? p.id : '';
    return '<div class="admins-head"><h2>Akses Admin</h2><p>Buat kunci panitia per proyek, lalu bagikan link panel admin. Setiap admin bisa check-in tamu dan mengelola RSVP.</p></div>' +
      '<div class="admins-grid">' +
      '<div class="card admin-card"><h3>Buat akses baru</h3>' +
      '<div class="callout blue">' + icon('info') + '<span>' + (mode === 'live' ? 'Akses disimpan di tab <b>Admin</b> pada Google Sheets.' : 'Mode demo: kunci berlaku untuk pratinjau di browser ini (kunci bawaan: <b>admin123</b>).') + '</span></div>' +
      '<form class="admin-form" data-form="admin-add"><div class="field"><label>Nama admin / panitia</label><input class="input" name="name" placeholder="Contoh: Siti (Panitia)" required></div>' +
      '<div class="field"><label>Proyek</label><select class="select" name="project">' + Store.all().map(function (x) { return '<option value="' + attr(x.slug) + '"' + (x.id === selectedProject ? ' selected' : '') + '>' + esc(projectLabel(x)) + '</option>'; }).join('') + (mode === 'live' ? '<option value="*">Semua proyek</option>' : '') + '</select></div>' +
      '<div class="field"><label>Kunci admin (opsional)</label><input class="input" name="key" placeholder="Kosongkan untuk dibuat otomatis" spellcheck="false"></div>' +
      '<button class="btn btn-primary" type="submit">' + icon('key') + 'Buat akses admin</button></form>' +
      '<div class="callout">' + icon('alert') + '<span>Jangan bagikan link yang memuat kunci ke grup publik. Gunakan link tanpa kunci, lalu kirim kunci terpisah.</span></div>' +
      '</div>' +
      '<div class="card admin-card"><div style="display:flex;align-items:center;gap:8px"><h3 style="flex:1">Daftar admin</h3><span class="mode-pill ' + (mode === 'live' ? 'live' : 'demo') + '">' + (mode === 'live' ? 'LIVE' : 'DEMO') + '</span><button class="icon-btn" data-act="admin-reload" title="Muat ulang">' + icon('refresh') + '</button></div>' +
      '<div id="adminList">' + adminListHtml(p) + '</div>' +
      '<div class="guest-note" style="border-top:1px solid var(--line);padding-top:12px">' + icon('info') + '<span>Admin membuka: <span class="mono">undangan.html?...&amp;admin=1</span>, lalu memasukkan kunci. Panel berisi Ringkasan, Tamu, RSVP, Ucapan, dan Check-in.</span></div>' +
      '</div></div>';
  }

  function adminListHtml(p) {
    if (S.adminMsg) return '<div class="callout danger">' + icon('alert') + '<span>' + esc(S.adminMsg) + '</span></div>';
    if (!S.adminList.length) return '<div class="empty-state" style="padding:26px"><div class="es-icon">' + icon('shield') + '</div><h3>Belum ada admin</h3><p>Buat akses admin agar panitia bisa check-in tamu di hari acara.</p></div>';
    return '<div class="admin-list">' + S.adminList.map(function (a) {
      const key = a.key || '';
      const shown = S.adminReveal[key] ? key : key.replace(/./g, '•').slice(0, 14);
      const proj = a.project === '*' ? 'Semua proyek' : a.project;
      const projP = Store.bySlug(proj) || p;
      const link = projP ? adminLoginLink(projP, key, false) : '';
      return '<div class="admin-row"><span class="admin-avatar">' + esc(Theme.initials(a.name || 'A')) + '</span><div class="admin-row-main"><b>' + esc(a.name || 'Admin') + '</b><small>' + esc(a.role || 'admin') + ' · ' + esc(proj) + '</small></div>' +
        '<span class="code-chip key-reveal" title="Kunci admin">' + esc(shown) + '</span>' +
        '<button class="icon-btn" data-act="admin-reveal" data-key="' + attr(key) + '" title="Tampilkan kunci">' + icon('key') + '</button>' +
        '<button class="icon-btn" data-act="copy" data-copy="' + attr(key) + '" title="Salin kunci">' + icon('copy') + '</button>' +
        (link ? '<a class="icon-btn" href="' + attr(link) + '" target="_blank" rel="noopener" title="Buka panel admin">' + icon('external') + '</a>' : '') +
        '<button class="icon-btn danger" data-act="admin-revoke" data-key="' + attr(key) + '" data-name="' + attr(a.name || '') + '" title="Cabut akses">' + icon('trash') + '</button></div>';
    }).join('') + '</div>';
  }

  async function loadAdmins() {
    const p = Store.get(S.adminId) || Store.all()[0];
    if (!p) return;
    S.adminMsg = '';
    try {
      if (Store.settings().apiUrl) {
        const r = await API.call({ action: 'admin.list' });
        S.adminList = (r.admins || []).filter(function (a) { return a.project === '*' || a.project === p.slug; });
      } else {
        S.adminList = Store.demoData(p.slug).admins.slice();
      }
    } catch (e) {
      S.adminMsg = e.message;
      S.adminList = [];
    }
    const el = $('#adminList');
    if (el) el.innerHTML = adminListHtml(p);
  }

  async function createAdmin(name, key, projectSlug) {
    if (Store.settings().apiUrl) {
      const r = await API.call({ action: 'admin.add', name: name, key: key, project: projectSlug, role: 'admin' });
      return { admin: r.admin || { name: name, key: r.key, project: projectSlug, role: 'admin' }, key: r.key };
    }
    const p = Store.all().find(function (x) { return x.slug === projectSlug; }) || Store.get(S.adminId);
    if (!p) throw new Error('Pilih proyek terlebih dahulu.');
    const a = Store.demoAddAdmin(p.slug, name, key);
    return { admin: a, key: a.key };
  }

  /* ---------- Guide ---------- */
  function viewGuide() {
    return '<div class="conn-head"><div><h2>Panduan Deploy</h2><p>Dari Google Sheet kosong menjadi platform undangan 3D yang online — kurang dari 15 menit.</p></div><div class="conn-actions"><a class="btn btn-soft" href="apps-script.gs" download>' + icon('download') + 'Unduh apps-script.gs</a></div></div>' +
      '<div class="guide-grid"><div class="steps">' +
      '<div class="step"><span class="step-num">1</span><div class="step-body"><h4>Siapkan Google Sheet</h4><p>Buat spreadsheet baru bernama misalnya <b>Backend Undangan3D</b>. Tidak perlu membuat tab — backend akan membuat semua tab otomatis.</p><p>Buka <b>Extensions → Apps Script</b>, hapus isi Code.gs, lalu tempel seluruh isi <b>apps-script.gs</b>.</p><div class="code">const ADMIN = \'kunci-rahasia-anda\';<span class="copy-mini"><button class="icon-btn" data-act="copy" data-copy="const ADMIN = \'kunci-rahasia-anda\';" title="Salin"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button></span></div></div></div>' +
      '<div class="step"><span class="step-num">2</span><div class="step-body"><h4>Deploy sebagai Web App</h4><p>Ganti nilai <b>ADMIN</b> dengan kunci rahasia Anda. Lalu <b>Deploy → New deployment → Web app</b>.</p><p>Setel <b>Execute as: Me</b> dan <b>Who has access: Anyone</b>. Salin URL yang berakhiran <b>/exec</b>.</p><div class="callout">' + icon('alert') + '<span>Setiap kali mengubah kode Apps Script, buat <b>New version</b> agar URL /exec memakai kode terbaru.</span></div></div></div>' +
      '<div class="step"><span class="step-num">3</span><div class="step-body"><h4>Hubungkan platform</h4><p>Buka <a href="#/connector" style="color:var(--gold)">Koneksi Backend</a>, tempel URL /exec dan kunci admin, lalu klik <b>Tes koneksi</b> → <b>Inisialisasi sheet</b>.</p><p>Isi juga <b>URL publik platform</b> (mis. GitHub Pages Anda) agar link tamu dan admin mengarah ke alamat yang benar. Setelah itu klik <b>Kirim ke Sheets</b>.</p></div></div>' +
      '<div class="step"><span class="step-num">4</span><div class="step-body"><h4>Bangun undangan di Studio</h4><p>Buat proyek, isi mempelai, acara, galeri, dan kutipan. Pilih tema 3D lalu uji plugin di <a href="#/playground" style="color:var(--gold)">Plugin Playground</a>.</p><p>Status <b>Terbit</b> membuat undangan siap dibagikan. Gunakan tombol <b>Ekspor HTML</b> untuk menghasilkan satu file mandiri.</p></div></div>' +
      '<div class="step"><span class="step-num">5</span><div class="step-body"><h4>Publikasikan undangan</h4><p><b>Opsi A — GitHub Pages:</b> unggah file hasil ekspor sebagai <span class="mono">index.html</span> ke repository, aktifkan Pages, lalu set URL publik.</p><p><b>Opsi B — langsung dari platform:</b> gunakan link publik <span class="mono">undangan.html?s=slug&amp;api=URL</span>. Pastikan halaman platform ikut di-hosting.</p><p>Untuk WhatsApp, gunakan URL absolut (og:image) agar preview tampil.</p></div></div>' +
      '<div class="step"><span class="step-num">6</span><div class="step-body"><h4>Tambah tamu &amp; panitia</h4><p>Di <a href="#/connector" style="color:var(--gold)">Koneksi Backend → Daftar Tamu</a>, tambah satu per satu atau impor massal. Setiap tamu mendapat kunci + kode check-in dan link personal.</p><p>Buat akses panitia di <a href="#/admins" style="color:var(--gold)">Akses Admin</a>. Panitia membuka link, memasukkan kunci, lalu dapat check-in lewat kode tamu.</p></div></div>' +
      '</div>' +
      '<div class="card conn-card"><h3>' + icon('database') + 'Struktur Sheet otomatis</h3><p>Tidak perlu membuat tab manual. Klik <b>Inisialisasi sheet</b> di konektor.</p><div class="schema-list">' +
      schema('Proyek', 'ID · Slug · Nama · Status · Data (JSON) · Diperbarui') +
      schema('Admin', 'Waktu · Nama · Peran · Proyek · Kunci · Aktif') +
      schema('Tamu', 'Waktu · Proyek · Nama · Kunci · Kode · WA') +
      schema('RSVP', 'Waktu · Proyek · Nama · Status · Jumlah · Ucapan · Kunci · Verifikasi') +
      schema('Ucapan', 'Waktu · Proyek · Nama · Status · Jumlah · Ucapan · Kunci · Verifikasi') +
      schema('Kehadiran', 'Waktu · Proyek · Nama · Kunci · Kode · Metode') +
      schema('Log', 'Waktu · Aksi · Proyek · Detail') +
      '</div><div class="callout blue">' + icon('info') + '<span>Backend memakai LockService agar dua tamu yang mengisi bersamaan tidak saling menimpa data.</span></div>' +
      '<div class="callout">' + icon('shield') + '<span><b>Keamanan:</b> kunci admin adalah akses penuh. Simpan di tempat aman, jangan commit ke repo, dan ganti dengan menempel versi baru Apps Script.</span></div>' +
      '<a class="btn btn-ghost" href="#/connector">' + icon('database') + 'Buka Koneksi Backend</a>' +
      '</div></div>';
  }
  function schema(name, cols) {
    return '<div class="schema-row"><b>' + esc(name) + '</b><span>' + esc(cols) + '</span></div>';
  }

  /* ---------- New project ---------- */
  function openNewProject() {
    const sel = 'fairy-forest';
    openModal({
      title: 'Proyek undangan baru',
      sub: 'Mulai dari kanvas kosong. Konten dapat diubah kapan saja di Studio.',
      wide: false,
      body: '<form data-form="new-project"><div class="modal-body" style="padding-top:0">' +
        '<div class="fgrid"><div class="field"><label>Nama panggilan mempelai pria</label><input class="input" name="groom" placeholder="Rizky" required maxlength="24"></div>' +
        '<div class="field"><label>Nama panggilan mempelai wanita</label><input class="input" name="bride" placeholder="Anisa" required maxlength="24"></div></div>' +
        '<div class="field"><label>Tanggal acara</label><input class="input" type="date" name="date" required></div>' +
        '<div class="field"><label>Tema 3D</label><div class="theme-grid" id="npThemes">' +
        Theme.list().map(function (th) {
          return '<button type="button" class="theme-card ' + (th.id === sel ? 'active' : '') + '" data-np-theme="' + attr(th.id) + '"><span class="theme-swatch" style="background:linear-gradient(145deg,' + th.vars.bg + ',' + th.vars.accentSoft + ' 48%,' + th.scene.gold + ')"></span><b>' + esc(th.name) + '</b><small>' + esc(th.tag) + '</small></button>';
        }).join('') + '</div><input type="hidden" name="theme" id="npTheme" value="' + sel + '"></div>' +
        '<label style="display:flex;align-items:center;gap:9px;font-size:11px;color:var(--muted)"><input type="checkbox" name="sample" checked style="accent-color:#d9b36a;width:14px;height:14px">Isi contoh konten (foto, cerita, quote) agar pratinjau langsung terlihat</label>' +
        '<div class="form-msg" id="npMsg"></div>' +
        '</div><div class="modal-foot"><button type="button" class="btn btn-ghost" data-act="close-modal">Batal</button><button class="btn btn-primary" type="submit">' + icon('plus') + 'Buat &amp; buka studio</button></div></form>'
    });
    $$('#npThemes [data-np-theme]').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#npThemes .theme-card').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        $('#npTheme').value = b.getAttribute('data-np-theme');
      });
    });
  }

  function createProjectFromForm(form) {
    const fd = new FormData(form);
    const groom = String(fd.get('groom') || '').trim();
    const bride = String(fd.get('bride') || '').trim();
    const date = String(fd.get('date') || '');
    const theme = String(fd.get('theme') || 'fairy-forest');
    const sample = !!fd.get('sample');
    if (!groom || !bride) throw new Error('Nama panggilan kedua mempelai wajib diisi.');
    if (!date) throw new Error('Tanggal acara wajib diisi.');
    const count = Store.all().length;
    const p = Store.create({
      slug: groom + '-' + bride,
      theme: theme,
      status: 'draft',
      groom: {
        short: groom, name: groom, order: 'Putra',
        parents: 'Bapak ... & Ibu ...', ig: '',
        photo: Theme.art(groom + '-' + Date.now(), theme, { w: 800, h: 1000 })
      },
      bride: {
        short: bride, name: bride, order: 'Putri',
        parents: 'Bapak ... & Ibu ...', ig: '',
        photo: Theme.art(bride + '-' + Date.now(), theme, { w: 800, h: 1000 })
      },
      event: {
        date: date,
        akad: { time: '08.00', label: 'Akad Nikah', place: 'Lokasi Akad', address: 'Alamat lengkap akad', maps: '' },
        resepsi: { time: '11.00 – 15.00', label: 'Resepsi', place: 'Lokasi Resepsi', address: 'Alamat lengkap resepsi', maps: '' }
      },
      quote: { text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu dapat ketenangan hati dan menjadikan kasih sayang di antara kamu.', source: 'QS. Ar-Rum: 21' },
      story: sample ? [
        { year: '2020', title: 'Pertama Bertemu', text: 'Kami dipertemukan di sebuah acara dan mulai sering berbincang.' },
        { year: '2024', title: 'Memutuskan Bersama', text: 'Dengan restu keluarga, kami memilih untuk melangkah bersama.' },
        { year: String(new Date(date).getFullYear()), title: 'Hari Bahagia', text: 'Kami mengundang Anda untuk merayakan awal perjalanan baru kami.' }
      ] : [],
      gallery: sample ? [1, 2, 3].map(function (i) {
        return { src: Theme.art(groom + bride + i + Date.now(), theme, { w: 900, h: 1200 }), caption: 'Momen ' + i };
      }) : [],
      plugins: Object.assign({}, Plugins.defaults(), { gift: false }),
      demoStats: { guests: 0, rsvp: 0, hadir: 0, wishes: 0 }
    });
    closeModal();
    toast('Proyek dibuat', projectLabel(p) + ' siap diedit.');
    go('studio/' + p.id);
  }

  /* ---------- Export ---------- */
  let assetCache = null;
  async function loadExportAssets() {
    if (assetCache) return assetCache;
    const files = ['assets/export-template.html', 'assets/invitation.css', 'assets/themes.js', 'assets/plugins.js', 'assets/scene3d.js', 'assets/invitation.js'];
    const out = {};
    for (let i = 0; i < files.length; i++) {
      const res = await fetch(files[i], { cache: 'no-store' });
      if (!res.ok) throw new Error('Gagal memuat ' + files[i] + ' (HTTP ' + res.status + ').');
      out[files[i]] = await res.text();
    }
    assetCache = out;
    return out;
  }

  function fill(tpl, token, value) { return tpl.split(token).join(value); }

  async function buildStandalone(p) {
    const assets = await loadExportAssets();
    const cfg = Store.publicConfig(p);
    const title = projectTitle(p) + ' — Undangan';
    const desc = 'Undangan pernikahan ' + projectTitle(p) + '. ' + Store.formatDate(p.event.date) + '. Dengan hormat kami mengundang Anda.';
    const json = JSON.stringify(cfg)
      .replace(/</g, '\\u003c')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
    let html = assets['assets/export-template.html'];
    html = fill(html, '{{TITLE}}', esc(title));
    html = fill(html, '{{DESC}}', esc(desc));
    html = fill(html, '{{THEME}}', esc(p.theme));
    html = fill(html, '{{CSS}}', assets['assets/invitation.css']);
    html = fill(html, '{{CONFIG}}', json);
    html = fill(html, '{{THEMES_JS}}', assets['assets/themes.js']);
    html = fill(html, '{{PLUGINS_JS}}', assets['assets/plugins.js']);
    html = fill(html, '{{SCENE_JS}}', assets['assets/scene3d.js']);
    html = fill(html, '{{INVITATION_JS}}', assets['assets/invitation.js']);
    return html;
  }

  async function exportProject(p, btn) {
    openModal({
      title: 'Menyiapkan ekspor',
      sub: 'Menggabungkan tema, runtime 3D, plugin, dan konfigurasi proyek menjadi satu file HTML.',
      body: '<div class="modal-body"><div class="loading-bar"><i></i></div><p class="tiny muted" style="margin:0">File ini bisa langsung diunggah ke GitHub Pages, Netlify, atau hosting statis lainnya.</p></div>'
    });
    try {
      const html = await buildStandalone(p);
      S.exportData = { html: html, filename: 'undangan-' + p.slug + '.html' };
      const kb = Math.round(html.length / 1024);
      const s = Store.settings();
      openModal({
        title: 'Undangan siap diekspor',
        sub: 'Satu file mandiri — backend tetap terhubung ke Apps Script.',
        wide: true,
        body: '<div class="modal-body">' +
          '<div class="export-summary"><div class="export-stat"><b>' + kb + ' KB</b><span>Ukuran file</span></div><div class="export-stat"><b>' + esc(Theme.get(p.theme).name) + '</b><span>Tema 3D</span></div><div class="export-stat"><b>' + Plugins.count(p) + '</b><span>Plugin aktif</span></div></div>' +
          (s.apiUrl ? '<div class="callout blue">' + icon('checkCircle') + '<span>Backend terhubung. RSVP, ucapan, dan check-in akan tersimpan ke Google Sheets.</span></div>' : '<div class="callout danger">' + icon('alert') + '<span>Backend belum terhubung. Undangan tetap tampil, tetapi RSVP hanya tersimpan di browser tamu. Hubungkan backend sebelum dibagikan.</span></div>') +
          '<div class="field"><label>Pratinjau file ekspor</label><iframe id="exportPreview" title="Pratinjau ekspor" style="width:100%;height:380px;border:1px solid var(--line);border-radius:12px;background:#fff"></iframe></div>' +
          '<div class="callout">' + icon('info') + '<span>Setelah diunggah, buka link tamu dari <b>Koneksi Backend</b> atau ganti URL publik platform. Untuk preview WhatsApp, gunakan URL absolut.</span></div>' +
          '</div><div class="modal-foot"><button class="btn btn-ghost" data-act="open-export">' + icon('external') + 'Buka tab</button><button class="btn btn-ghost" data-act="copy-export">' + icon('copy') + 'Salin HTML</button><button class="btn btn-primary" data-act="download-export">' + icon('download') + 'Unduh HTML</button></div>',
        onOpen: function (root) {
          const f = root.querySelector('#exportPreview');
          if (f) f.srcdoc = html;
        }
      });
      toast('Ekspor siap', 'File ' + kb + ' KB berhasil dibuat.');
    } catch (e) {
      openModal({
        title: 'Ekspor gagal',
        body: '<div class="modal-body"><div class="callout danger">' + icon('alert') + '<span>' + esc(e.message) + '</span></div><p class="tiny muted" style="margin:0">Ekspor membutuhkan akses ke file aset platform. Buka platform melalui http:// (GitHub Pages atau local web server), bukan lewat file://.</p><div class="code">python -m http.server 8080\n# lalu buka http://localhost:8080</div></div><div class="modal-foot"><button class="btn btn-primary" data-act="close-modal">Tutup</button></div>'
      });
    }
  }

  /* ---------- Actions ---------- */
  function findProject(btn) {
    const id = btn.getAttribute('data-id');
    return Store.get(id) || Store.get(S.studioId);
  }

  async function handleAction(act, el) {
    switch (act) {
      case 'close-modal': closeModal(); break;
      case 'go-guide': go('guide'); break;
      case 'reload-app': location.reload(); break;
      case 'new-project': openNewProject(); break;
      case 'open-studio': go('studio/' + el.getAttribute('data-id')); break;
      case 'preview-project': {
        const p = findProject(el);
        if (p) window.open(previewUrl(p), '_blank', 'noopener');
        break;
      }
      case 'duplicate-project': {
        const p = findProject(el);
        if (!p) break;
        const c = Store.duplicate(p.id);
        toast('Proyek diduplikasi', projectLabel(c) + ' dibuat sebagai draft.');
        renderView();
        break;
      }
      case 'delete-project': {
        const p = findProject(el);
        if (!p) break;
        confirmDialog('Hapus proyek?', 'Proyek "' + projectLabel(p) + '" akan dihapus dari workspace lokal. Data di Google Sheets tidak terhapus.', 'Hapus proyek', function () {
          Store.remove(p.id);
          if (S.studioId === p.id) S.studioId = null;
          if (S.connId === p.id) S.connId = null;
          if (S.adminId === p.id) S.adminId = null;
          toast('Proyek dihapus', projectLabel(p));
          renderView();
        });
        break;
      }
      case 'toggle-publish': {
        const p = findProject(el);
        if (!p) break;
        p.status = p.status === 'published' ? 'draft' : 'published';
        Store.touch(p.id);
        toast(p.status === 'published' ? 'Undangan diterbitkan' : 'Undangan dijadikan draft', p.status === 'published' ? 'Link publik siap dibagikan.' : 'Tamu hanya melihat pratinjau.');
        renderView();
        break;
      }
      case 'pick-theme': {
        const p = Store.get(S.studioId);
        if (!p) break;
        p.theme = el.getAttribute('data-theme');
        Store.touch(p.id);
        renderView();
        break;
      }
      case 'story-add': {
        const p = Store.get(S.studioId);
        if (!p) break;
        p.story.push({ year: String(new Date().getFullYear()), title: '', text: '' });
        Store.touch(p.id);
        renderView();
        break;
      }
      case 'story-del': {
        const p = Store.get(S.studioId);
        if (!p) break;
        p.story.splice(Number(el.getAttribute('data-index')), 1);
        Store.touch(p.id);
        renderView();
        break;
      }
      case 'gallery-add': {
        const p = Store.get(S.studioId);
        if (!p) break;
        p.gallery.push({ src: '', caption: '' });
        Store.touch(p.id);
        renderView();
        break;
      }
      case 'gallery-preset': {
        const p = Store.get(S.studioId);
        if (!p) break;
        for (let i = 1; i <= 3; i++) {
          p.gallery.push({ src: Theme.art(p.slug + '-galeri-' + Date.now() + i, p.theme, { w: 900, h: 1200 }), caption: 'Momen ' + i });
        }
        Store.touch(p.id);
        toast('3 foto contoh ditambahkan', 'Ganti URL-nya dengan foto asli kapan saja.');
        renderView();
        break;
      }
      case 'gallery-del': {
        const p = Store.get(S.studioId);
        if (!p) break;
        p.gallery.splice(Number(el.getAttribute('data-index')), 1);
        Store.touch(p.id);
        renderView();
        break;
      }
      case 'save-now': {
        const p = Store.get(S.studioId);
        if (p) {
          Store.touch(p.id);
          setSaveState('Tersimpan · ' + timeNow(), 'saved');
          toast('Tersimpan', 'Perubahan disimpan di workspace.');
        }
        break;
      }
      case 'studio-preview-reload': {
        const p = Store.get(S.studioId);
        const f = $('#studioFrame');
        if (p && f) {
          f.src = previewUrl(p) + '&_=' + Date.now();
          const chip = $('#staleChip');
          if (chip) chip.style.display = 'none';
          setSaveState('Tersimpan · ' + timeNow(), 'saved');
        }
        break;
      }
      case 'device': {
        S.device = el.getAttribute('data-device');
        const stage = $('#previewStage');
        if (stage) stage.classList.toggle('mobile', S.device === 'mobile');
        $$('[data-act="device"]').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-device') === S.device); });
        break;
      }
      case 'export-project': {
        const p = findProject(el);
        if (p) exportProject(p, el);
        break;
      }
      case 'download-export': {
        if (S.exportData) download(S.exportData.filename, S.exportData.html, 'text/html;charset=utf-8');
        break;
      }
      case 'copy-export': {
        if (S.exportData) copyText(S.exportData.html, 'HTML disalin');
        break;
      }
      case 'open-export': {
        if (!S.exportData) break;
        const url = URL.createObjectURL(new Blob([S.exportData.html], { type: 'text/html;charset=utf-8' }));
        window.open(url, '_blank', 'noopener');
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
        break;
      }
      case 'copy': {
        copyText(el.getAttribute('data-copy') || '', 'Disalin');
        break;
      }
      case 'export-workspace': {
        download('undangan3d-workspace.json', Store.exportJSON(), 'application/json');
        toast('Workspace diekspor', 'Berkas JSON diunduh.');
        break;
      }
      case 'import-workspace': {
        const f = $('#importFile');
        if (f) f.click();
        break;
      }
      case 'pg-reload': pgReload(); pgLog('', 'Preview dimuat ulang.'); break;
      case 'pg-all': {
        const p = Store.get(S.pgId);
        if (!p) break;
        Object.keys(p.plugins).forEach(function (k) { p.plugins[k] = true; });
        Store.touch(p.id);
        pgReload(); pgLog('ok', 'Semua plugin diaktifkan.');
        renderView();
        break;
      }
      case 'pg-reset': {
        const p = Store.get(S.pgId);
        if (!p) break;
        p.plugins = Plugins.defaults();
        Store.touch(p.id);
        pgReload(); pgLog('warn', 'Plugin direset ke pengaturan default.');
        renderView();
        break;
      }
      case 'pg-focus': pgFocus(el.getAttribute('data-plugin')); break;
      case 'pg-open': {
        const p = Store.get(S.pgId);
        if (p) window.open(previewUrl(p), '_blank', 'noopener');
        break;
      }
      case 'conn-test': {
        await withBusy(el, async function () {
          try {
            let r;
            try { r = await API.post({ action: 'ping' }); }
            catch (e) { r = await API.jsonp({ action: 'ping' }); }
            const msg = 'TERHUBUNG · versi ' + (r.version || '?') + ' · sheet ' + (r.sheetsReady ? 'siap' : 'belum diinisialisasi') + (r.adminKeySet === false ? ' · PERINGATAN: ADMIN masih default' : '');
            S.connMsg = msg;
            const box = $('#connTestMsg');
            if (box) box.textContent = msg;
            toast('Koneksi berhasil', 'Backend Apps Script merespons.');
          } catch (e) {
            S.connMsg = 'GAGAL · ' + e.message;
            const box = $('#connTestMsg');
            if (box) box.textContent = S.connMsg;
            toast('Koneksi gagal', e.message, 'error');
          }
        });
        break;
      }
      case 'conn-init': {
        await withBusy(el, async function () {
          try {
            const r = await API.call({ action: 'init' });
            S.connMsg = 'INISIALISASI BERHASIL · ' + (r.message || 'Tab backend dibuat.');
            const box = $('#connTestMsg');
            if (box) box.textContent = S.connMsg;
            toast('Sheet siap', r.message || 'Semua tab dibuat.');
          } catch (e) { toast('Inisialisasi gagal', e.message, 'error'); }
        });
        break;
      }
      case 'conn-push': {
        const p = Store.get(S.connId);
        if (!p) break;
        await withBusy(el, async function () {
          try {
            await API.call({ action: 'project.save', project: p });
            connLog('ok', 'Proyek "' + p.slug + '" dikirim ke Sheets.');
            Store.log('backend.push', p.slug);
            toast('Terkirim ke Sheets', projectLabel(p));
          } catch (e) { connLog('err', 'Gagal kirim: ' + e.message); toast('Gagal mengirim', e.message, 'error'); }
        });
        break;
      }
      case 'conn-pull': {
        await withBusy(el, async function () {
          try {
            const r = await API.call({ action: 'project.list' });
            const remotes = r.projects || [];
            let n = 0;
            const summaries = {};
            remotes.forEach(function (rp) {
              const prog = rp.project || rp;
              if (!prog || !prog.slug) return;
              const existing = Store.bySlug(prog.slug) || (prog.id && Store.get(prog.id));
              if (existing) Store.set(existing.id, prog);
              else Store.create(prog);
              n++;
              if (rp.counts) summaries[prog.slug] = rp.counts;
            });
            Store.setSummaries(summaries);
            connLog('ok', 'Menarik ' + n + ' proyek dari Sheets.');
            toast('Sinkron selesai', n + ' proyek diperbarui.');
            renderView();
          } catch (e) { connLog('err', 'Gagal tarik: ' + e.message); toast('Gagal menarik data', e.message, 'error'); }
        });
        break;
      }
      case 'conn-summary': {
        await withBusy(el, async function () {
          try {
            const r = await API.call({ action: 'data.summary' });
            const sums = {};
            (r.projects || []).forEach(function (x) { if (x.slug) sums[x.slug] = x.counts || x; });
            Store.setSummaries(sums);
            connLog('ok', 'Statistik disinkronkan dari Sheets.');
            toast('Statistik diperbarui', (r.projects || []).length + ' proyek.');
            renderView();
          } catch (e) { connLog('err', 'Gagal sinkron statistik: ' + e.message); toast('Gagal', e.message, 'error'); }
        });
        break;
      }
      case 'conn-delete': {
        const p = Store.get(S.connId);
        if (!p) break;
        confirmDialog('Hapus dari Sheets?', 'Proyek "' + projectLabel(p) + '" akan dihapus dari tab Proyek. Tamu & RSVP tetap tersimpan.', 'Hapus dari backend', async function () {
          try {
            await API.call({ action: 'project.delete', slug: p.slug });
            connLog('warn', 'Proyek dihapus dari Sheets: ' + p.slug);
            toast('Dihapus dari Sheets', projectLabel(p));
          } catch (e) { toast('Gagal', e.message, 'error'); }
        });
        break;
      }
      case 'guest-reload': loadGuests(); toast('Memuat tamu', 'Menyegarkan daftar.'); break;
      case 'guest-export': {
        const p = Store.get(S.connId);
        if (!p) break;
        const rows = [['Nama', 'WhatsApp', 'Kunci', 'Kode', 'Link']];
        S.connGuests.forEach(function (g) { rows.push([g.name, g.wa || '', g.key, g.code, guestLink(p, g)]); });
        const csv = '\uFEFF' + rows.map(function (r) { return r.map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
        download('tamu-' + p.slug + '.csv', csv, 'text/csv;charset=utf-8');
        toast('CSV diunduh', S.connGuests.length + ' tamu.');
        break;
      }
      case 'guest-del': {
        const key = el.getAttribute('data-key');
        const name = el.getAttribute('data-name');
        confirmDialog('Hapus tamu?', 'Link dan kode check-in milik "' + name + '" tidak akan berlaku lagi.', 'Hapus tamu', function () {
          withBusy(el, function () { return deleteGuest(key, name); });
        });
        break;
      }
      case 'admin-reload': loadAdmins(); toast('Memuat admin', 'Menyegarkan daftar akses.'); break;
      case 'admin-reveal': {
        const k = el.getAttribute('data-key');
        S.adminReveal[k] = !S.adminReveal[k];
        const p = Store.get(S.adminId) || Store.all()[0];
        if (p) { const box = $('#adminList'); if (box) box.innerHTML = adminListHtml(p); }
        break;
      }
      case 'admin-revoke': {
        const key = el.getAttribute('data-key');
        const name = el.getAttribute('data-name');
        const p = Store.get(S.adminId) || Store.all()[0];
        confirmDialog('Cabut akses admin?', 'Akses "' + name + '" akan dinonaktifkan dan kunci tidak bisa dipakai lagi.', 'Cabut akses', async function () {
          try {
            if (Store.settings().apiUrl) await API.call({ action: 'admin.revoke', key: key });
            else if (p) Store.demoRemoveAdmin(p.slug, key);
            toast('Akses dicabut', name);
            loadAdmins();
          } catch (e) { toast('Gagal mencabut', e.message, 'error'); }
        });
        break;
      }
      default: break;
    }
  }

  /* ---------- Async forms ---------- */
  async function handleForm(form) {
    const type = form.getAttribute('data-form');
    if (type === 'new-project') {
      const msg = $('#npMsg');
      try { createProjectFromForm(form); }
      catch (e) { if (msg) msg.textContent = e.message; }
      return;
    }
    if (type === 'guest-add') {
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const wa = String(fd.get('wa') || '').trim();
      const btn = form.querySelector('button[type="submit"]');
      if (!name) return;
      await withBusy(btn, async function () {
        try {
          const g = await addGuest(name, wa);
          form.reset();
          toast('Tamu ditambahkan', g && g.name ? g.name : name);
          await loadGuests();
        } catch (e) { toast('Gagal menambah tamu', e.message, 'error'); }
      });
      return;
    }
    if (type === 'guest-bulk') {
      const fd = new FormData(form);
      const text = String(fd.get('bulk') || '');
      const btn = form.querySelector('button[type="submit"]');
      await withBusy(btn, async function () {
        try {
          const r = await addBulkGuests(text);
          form.reset();
          toast('Impor selesai', (r.added || 0) + ' tamu ditambahkan.');
          await loadGuests();
        } catch (e) { toast('Impor gagal', e.message, 'error'); }
      });
      return;
    }
    if (type === 'admin-add') {
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const key = String(fd.get('key') || '').trim();
      const projectSlug = String(fd.get('project') || '');
      if (!name) return;
      const btn = form.querySelector('button[type="submit"]');
      await withBusy(btn, async function () {
        try {
          const r = await createAdmin(name, key, projectSlug);
          const p = Store.bySlug(projectSlug) || Store.get(S.adminId) || Store.all()[0];
          const link = p ? adminLoginLink(p, r.key, false) : '';
          form.reset();
          toast('Akses admin dibuat', name + ' · kunci ' + r.key);
          openModal({
            title: 'Akses admin berhasil dibuat',
            sub: 'Kirim kunci secara terpisah dari link. Jangan bagikan ke grup publik.',
            body: '<div class="modal-body"><div class="field"><label>Kunci admin</label><div class="link-box"><input class="input mono" readonly value="' + attr(r.key) + '"><button class="icon-btn" data-act="copy" data-copy="' + attr(r.key) + '">' + icon('copy') + '</button></div></div>' +
              '<div class="field"><label>Link panel admin (tanpa kunci)</label><div class="link-box"><input class="input mono" readonly value="' + attr(link) + '"><button class="icon-btn" data-act="copy" data-copy="' + attr(link) + '">' + icon('copy') + '</button></div></div>' +
              '<div class="callout">' + icon('shield') + '<span>Admin membuka link, lalu memasukkan kunci di panel. Untuk demo lokal, gunakan kunci bawaan <b>admin123</b>.</span></div></div>' +
              '<div class="modal-foot"><button class="btn btn-primary" data-act="close-modal">Selesai</button></div>'
          });
          loadAdmins();
        } catch (e) { toast('Gagal membuat admin', e.message, 'error'); }
      });
      return;
    }
  }

  /* ---------- Event bindings ---------- */
  function bindEvents() {
    document.addEventListener('click', function (e) {
      const nav = e.target.closest('.nav-link, .brand');
      if (nav) closeDrawer();

      const filterBtn = e.target.closest('[data-filter]');
      if (filterBtn) {
        S.filter = filterBtn.getAttribute('data-filter');
        $$('#projectFilter button').forEach(function (b) { b.classList.toggle('active', b === filterBtn); });
        const grid = $('#projectsGrid');
        if (grid) {
          Store.all().filter(function (p) {
            if (S.filter === 'published' && p.status !== 'published') return false;
            if (S.filter === 'draft' && p.status !== 'draft') return false;
            return true;
          }).forEach(function () {});
        }
        renderView();
        return;
      }

      const actEl = e.target.closest('[data-act]');
      if (actEl) {
        const act = actEl.getAttribute('data-act');
        if (actEl.tagName === 'A' && actEl.getAttribute('href') && actEl.getAttribute('href').indexOf('#') === 0) closeDrawer();
        handleAction(act, actEl);
        return;
      }

      if (e.target.closest('#menuBtn')) { openDrawer(); return; }
      if (e.target.id === 'scrim') { closeDrawer(); return; }
    });

    document.addEventListener('submit', function (e) {
      const form = e.target.closest('[data-form]');
      if (!form) return;
      e.preventDefault();
      handleForm(form);
    });

    document.addEventListener('input', onFieldInput);
    document.addEventListener('change', function (e) {
      const el = e.target;
      if (el.matches('[data-plugin-toggle]') || el.matches('[data-pg-toggle]') || el.matches('[data-setting]') || el.matches('[data-pg-project]') || el.matches('[data-conn-project]') || el.matches('[data-slug]') || el.matches('[data-bind]')) {
        onFieldInput(e);
      }
      if (el.id === 'projectSearch') {
        S.search = el.value;
        filterCards();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeModal(); closeDrawer(); }
    });

    const importInput = $('#importFile');
    if (importInput) {
      importInput.addEventListener('change', function () {
        const f = importInput.files && importInput.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = function () {
          try {
            const n = Store.importJSON(String(reader.result || ''), 'merge');
            toast('Impor berhasil', n + ' proyek ditambahkan.');
            renderView();
          } catch (err) { toast('Impor gagal', err.message, 'error'); }
        };
        reader.readAsText(f);
        importInput.value = '';
      });
    }

    window.addEventListener('message', function (e) {
      const d = e.data;
      if (!d || d.source !== 'u3d-invitation') return;
      if (d.type === 'ready') pgLog('ok', 'Runtime undangan siap · tema ' + (d.theme || '—') + ' · 3D ' + (d.three ? 'aktif' : 'fallback'));
      if (d.type === 'plugin') pgLog(d.on ? 'ok' : 'warn', 'Plugin ' + d.id + ' → ' + (d.on ? 'AKTIF' : 'NONAKTIF'));
      if (d.type === 'focus') pgLog('', 'Section ' + d.plugin + ' disorot.');
    });
  }

  function onFieldInput(e) {
    const el = e.target;
    if (!el || !el.matches) return;

    if (el.matches('[data-setting]')) {
      const k = el.getAttribute('data-setting');
      const patch = {};
      patch[k] = el.value.trim();
      Store.setSettings(patch);
      syncBackend();
      return;
    }

    if (el.matches('[data-pg-project]')) {
      S.pgId = el.value;
      renderView();
      return;
    }
    if (el.matches('[data-conn-project]')) {
      S.connId = el.value;
      S.connLoadedFor = null;
      S.connGuests = [];
      renderView();
      return;
    }
    if (el.matches('[data-pg-toggle]')) {
      const p = Store.get(S.pgId);
      if (!p) return;
      const id = el.getAttribute('data-pg-toggle');
      p.plugins[id] = el.checked;
      Store.touch(p.id);
      const item = el.closest('.pg-item');
      if (item) item.classList.toggle('off', !el.checked);
      pgLog(el.checked ? 'ok' : 'warn', 'Plugin "' + (Plugins.get(id) || {}).name + '" ' + (el.checked ? 'diaktifkan' : 'dimatikan') + '.');
      setTimeout(function () { pgReload(); }, 120);
      return;
    }
    if (el.matches('[data-plugin-toggle]')) {
      const p = Store.get(S.studioId);
      if (!p) return;
      const id = el.getAttribute('data-plugin-toggle');
      p.plugins[id] = el.checked;
      Store.touch(p.id);
      const chip = $('#staleChip');
      if (chip) chip.style.display = '';
      toast((Plugins.get(id) || {}).name + (el.checked ? ' aktif' : ' nonaktif'), 'Muat ulang pratinjau untuk melihat perubahan.', 'info');
      return;
    }
    if (el.matches('[data-slug]')) {
      const p = Store.get(S.studioId);
      if (!p) return;
      p.slug = Store.uniqueSlug(el.value, p.id);
      el.value = p.slug;
      Store.touch(p.id);
      toast('Slug diperbarui', '/' + p.slug, 'info');
      return;
    }
    if (el.matches('[data-bind]')) {
      const p = Store.get(S.studioId);
      if (!p) return;
      const path = el.getAttribute('data-bind');
      const val = el.type === 'checkbox' ? el.checked : el.value;
      setPath(p, path, val);
      scheduleSave(p.id);
      if (path.indexOf('.photo') > 0) {
        const key = path.split('.')[0];
        const av = $('[data-avatar="' + key + '"]');
        if (av) av.innerHTML = val ? '<img src="' + attr(val) + '" alt="">' : esc(Theme.initials(getPath(p, key + '.short') || getPath(p, key + '.name') || '?'));
        const head = av ? av.closest('.person').querySelector('.person-head small') : null;
        if (head) head.textContent = getPath(p, key + '.name') || 'Belum diisi';
      }
      return;
    }
    if (el.matches('[data-array]')) {
      const p = Store.get(S.studioId);
      if (!p) return;
      const arr = el.getAttribute('data-array');
      const i = Number(el.getAttribute('data-index'));
      const f = el.getAttribute('data-field');
      if (!p[arr] || !p[arr][i]) return;
      p[arr][i][f] = el.value;
      scheduleSave(p.id);
      return;
    }
    if (el.id === 'projectSearch') {
      S.search = el.value;
      filterCards();
    }
  }

  function filterCards() {
    const q = S.search.toLowerCase().trim();
    $$('#projectsGrid .project-card').forEach(function (card) {
      const name = card.getAttribute('data-name') || '';
      card.style.display = !q || name.indexOf(q) >= 0 ? '' : 'none';
    });
  }

  function bindChrome() {
    const menu = $('#menuBtn');
    const scrim = $('#scrim');
    if (menu) menu.addEventListener('click', openDrawer);
    if (scrim) scrim.addEventListener('click', closeDrawer);
  }

  function boot() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    Store.init();
    bindChrome();
    bindEvents();
    window.addEventListener('hashchange', route);
    if (!location.hash) location.hash = '#/dashboard';
    else route();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
