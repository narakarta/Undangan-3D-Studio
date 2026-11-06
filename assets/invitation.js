/* Undangan3D — runtime undangan (dipakai pratinjau, link publik, dan file ekspor) */
(function (g) {
  'use strict';

  var Q = new URLSearchParams(location.search);
  var PREVIEW = Q.get('preview') === '1';
  var ADMIN_MODE = Q.get('admin') === '1';
  var TO = (Q.get('to') || '').trim();
  var RAW_KEY = (Q.get('key') || '').trim();
  var GKEY = ADMIN_MODE ? '' : RAW_KEY;
  var ADMIN_KEY = ADMIN_MODE ? RAW_KEY : '';
  var CODE = ADMIN_MODE ? '' : (Q.get('code') || '').trim();
  var API_PARAM = (Q.get('api') || '').trim();
  var SLUG_PARAM = (Q.get('s') || '').trim();
  var ID_PARAM = (Q.get('id') || '').trim();
  var DEMO_KEY = 'u3d.demo.';
  var SESSION = (function () {
    try {
      var key = 'u3d.sid';
      var v = sessionStorage.getItem(key);
      if (!v) {
        v = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        sessionStorage.setItem(key, v);
      }
      return v;
    } catch (e) { return 's' + Math.random().toString(36).slice(2, 10); }
  })();
  var DEVICE = (function () {
    var w = window.innerWidth || 0;
    var ua = navigator.userAgent || '';
    if (/iPad|Tablet/i.test(ua) || (w >= 720 && w < 1024)) return 'tablet';
    if (/Mobi|Android|iPhone/i.test(ua) || w < 720) return 'mobile';
    return 'desktop';
  })();
  var REF = (function () {
    try {
      if (!document.referrer) return 'langsung';
      return new URL(document.referrer).hostname.replace(/^www\./, '');
    } catch (e) { return 'langsung'; }
  })();
  var trackQueue = [];
  var trackTimer = 0;

  var cfg = null;
  var theme = null;
  var plugins = {};
  var demo = false;
  var state = {
    opened: false, dark: false, three: false, admin: null, adminKey: '',
    data: { guests: [], rsvp: [], wishes: [], hadir: [] },
    notifs: [], notifMsg: '', notifLoading: false,
    adTab: 'overview', rsvpFilter: 'semua', wishes: [], ready: false,
    lastSync: 0, syncing: false
  };
  var music = { on: false, ac: null, master: null, timer: 0, stopTimer: 0 };
  var clockTimer = 0;
  var toastTimer = 0;
  var adminTimer = 0;

  /* ---------- Util ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function nowISO() { return new Date().toISOString(); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function attr(s) { return esc(s); }
  function safeUrl(u, allowData) {
    var s = String(u || '').trim();
    if (!s) return '';
    if (allowData && /^data:image\//i.test(s)) return s;
    if (/^https?:\/\//i.test(s)) return s;
    return '';
  }
  function slugify(s) {
    return String(s || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
  function initials(name) {
    var s = String(name || '').trim();
    if (!s) return '?';
    return s.split(/\s+/).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase();
  }
  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
  function cap(s, n) { s = String(s || '').trim(); return s.length > n ? s.slice(0, n) : s; }
  function normPhone(v) {
    var s = String(v || '').replace(/\D/g, '');
    if (!s) return '';
    if (s.indexOf('620') === 0) s = '62' + s.slice(3);
    else if (s.charAt(0) === '0') s = '62' + s.slice(1);
    else if (s.charAt(0) === '8') s = '62' + s;
    return s.length >= 9 && s.length <= 15 ? s : '';
  }

  /* ---------- Analitik ---------- */
  function track(event, detail) {
    if (!cfg || cfg.preview || ADMIN_MODE || !cfg.apiUrl) return;
    trackQueue.push({ event: event, detail: detail || '' });
    if (trackQueue.length >= 8) flushTrack();
    else if (!trackTimer) trackTimer = setTimeout(flushTrack, 6000);
  }
  function flushTrack() {
    clearTimeout(trackTimer);
    trackTimer = 0;
    if (!trackQueue.length || !cfg || !cfg.apiUrl) return;
    var events = trackQueue.splice(0, 25);
    var body = JSON.stringify({
      action: 'analytics.track', slug: cfg.slug, events: events,
      session: SESSION, device: DEVICE, ref: REF, to: TO
    });
    try {
      if (document.visibilityState === 'hidden' && navigator.sendBeacon) {
        navigator.sendBeacon(cfg.apiUrl, new Blob([body], { type: 'text/plain;charset=utf-8' }));
        return;
      }
    } catch (e) { /* fallback fetch */ }
    try {
      fetch(cfg.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: body,
        keepalive: true,
        redirect: 'follow'
      }).catch(function () { /* analitik tidak boleh mengganggu tamu */ });
    } catch (e) { /* noop */ }
  }

  var ICONS = {
    heart: '<path d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9Z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    music: '<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    users: '<circle cx="9" cy="8" r="3.4"/><path d="M3 20c0-3.4 2.7-5.2 6-5.2s6 1.8 6 5.2"/><path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 14.8c2.2.6 3.5 2.3 3.5 5.2"/>',
    chat: '<path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-5.6A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8Z"/>',
    gift: '<rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9M12 8v13M12 8c-2-4-6-4-6-1s4 3 6 1Zm0 0c2-4 6-4 6-1s-4 3-6 1Z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    wa: '<path d="M3 21l1.6-4.4A8.4 8.4 0 1 1 8 20.4L3 21Z"/><path d="M8.4 8.6c.3 1.8 1.4 3.7 3 5 1 .8 2 1.3 3 1.5l1-1.6-2-1-.8.8c-.8-.4-1.8-1.3-2.4-2.2l.8-.8-1-2-1.6 1Z"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="m4 12.5 5 5L20 6.5"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
    trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    play: '<path d="M8 5v14l11-7Z"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l2 2M14.5 8.5l2 2"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/>',
    send: '<path d="m4 12 16-8-6 16-3-6-7-2Z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    db: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>'
  };
  function icon(n, cls) {
    return '<svg viewBox="0 0 24 24"' + (cls ? ' class="' + cls + '"' : '') + ' aria-hidden="true">' + (ICONS[n] || '') + '</svg>';
  }

  function fmtDate(style) {
    var s = cfg && cfg.event ? cfg.event.date : '';
    if (!s) return '';
    var d = new Date(String(s).length <= 10 ? s + 'T09:00:00' : s);
    if (isNaN(d)) return String(s);
    try { return d.toLocaleDateString('id-ID', style || { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return String(s); }
  }
  function fmtTime(v) {
    if (!v) return '';
    var d = new Date(v);
    if (isNaN(d)) return '';
    try { return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; }
  }
  function projectTitle() {
    var gj = cfg.groom || {}, br = cfg.bride || {};
    return (gj.name || gj.short || 'Mempelai Pria') + ' & ' + (br.name || br.short || 'Mempelai Wanita');
  }
  function shortPair() {
    var gj = cfg.groom || {}, br = cfg.bride || {};
    return (gj.short || gj.name || 'Mempelai') + ' & ' + (br.short || br.name || 'Mempelai');
  }

  /* ---------- Ikon/atribut tema ---------- */
  var VAR_MAP = {
    bg: '--bg', bg2: '--bg-2', card: '--card', ink: '--ink', ink2: '--ink-2',
    line: '--line', accent: '--accent', accent2: '--accent-2', accentSoft: '--accent-soft',
    leaf: '--leaf', rose: '--rose', shadow: '--shadow'
  };
  function applyTheme() {
    theme = g.U3DTheme.get(cfg.theme);
    var v = Object.assign({}, theme.vars, state.dark ? theme.dark : {});
    var root = document.documentElement;
    Object.keys(VAR_MAP).forEach(function (k) {
      if (v[k]) root.style.setProperty(VAR_MAP[k], v[k]);
    });
    var custom = cfg && cfg.style ? String(cfg.style.accent || '') : '';
    if (/^#[0-9a-f]{6}$/i.test(custom)) {
      root.style.setProperty('--accent', custom);
      root.style.setProperty('--accent-2', custom);
    }
    root.setAttribute('data-theme', theme.id);
    root.style.colorScheme = state.dark ? 'dark' : 'light';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', v.bg);
    var sun = $('#darkBtn');
    if (sun) sun.innerHTML = icon(state.dark ? 'sun' : 'moon');
  }
  function setDark(on) {
    state.dark = !!on;
    try { localStorage.setItem('u3d.inv.dark.' + cfg.slug, state.dark ? '1' : '0'); } catch (e) { /* noop */ }
    applyTheme();
    toast(state.dark ? 'Mode gelap aktif' : 'Mode terang aktif');
  }

  /* ---------- Latar kustom (foto / gradien / warna / animasi) ---------- */
  var BG_POS = { center: 'center', top: 'center top', bottom: 'center bottom', left: 'left center', right: 'right center' };
  function bgImageOk(u) { return /^(https?:\/\/|data:image\/)/i.test(String(u || '')); }
  function bgIsCustom() {
    var b = cfg && cfg.background ? cfg.background : {};
    return !!b.type && b.type !== 'theme' && (b.type !== 'image' || bgImageOk(b.image));
  }
  function applyBackground() {
    var layer = $('#bgLayer');
    if (!layer || !cfg) return;
    var b = cfg.background || {};
    var type = ['theme', 'image', 'gradient', 'color', 'animation'].indexOf(b.type) >= 0 ? b.type : 'theme';
    var custom = type !== 'theme' && (type !== 'image' || bgImageOk(b.image));
    document.body.classList.toggle('has-custom-bg', custom);
    layer.className = 'bg-layer' + (custom ? ' is-' + type : '');
    layer.removeAttribute('style');
    layer.innerHTML = '';
    if (!custom) return;
    var dim = Math.max(0, Math.min(90, Number(b.dim) || 0));
    layer.style.setProperty('--bg-dim', String(dim / 100));
    if (type === 'image') {
      layer.style.backgroundImage = 'url("' + String(b.image).replace(/"/g, '%22') + '")';
      layer.style.backgroundSize = 'cover';
      layer.style.backgroundPosition = BG_POS[b.position] || 'center';
      if (b.blur) layer.style.filter = 'blur(' + Math.max(0, Math.min(20, Number(b.blur) || 0)) + 'px)';
    } else if (type === 'gradient') {
      var gr = b.gradient || {};
      var from = /^#[0-9a-f]{3,8}$/i.test(gr.from || '') ? gr.from : '#122033';
      var to = /^#[0-9a-f]{3,8}$/i.test(gr.to || '') ? gr.to : '#3a2b46';
      var angle = Math.max(0, Math.min(360, Number(gr.angle) || 160));
      layer.style.backgroundImage = 'linear-gradient(' + angle + 'deg,' + from + ',' + to + ')';
    } else if (type === 'color') {
      layer.style.backgroundColor = /^#[0-9a-f]{3,8}$/i.test(b.color || '') ? b.color : '#101720';
    } else if (type === 'animation') {
      var sc = theme && theme.scene ? theme.scene : { sky: '#1a2230', fog: '#26303c', ground: '#3a4030' };
      layer.style.backgroundImage = 'linear-gradient(180deg,' + sc.sky + ',' + sc.fog + ' 55%,' + sc.ground + ')';
      layer.innerHTML = animMarkup(b.animation);
    }
  }

  function animMarkup(id) {
    var out = '<div class="bg-fx bg-fx-' + id + '">';
    var i, x, size, dur, delay;
    if (id === 'bokeh') {
      for (i = 0; i < 20; i++) {
        x = (Math.random() * 100).toFixed(1);
        size = Math.round(3 + Math.random() * 11);
        dur = (10 + Math.random() * 14).toFixed(1);
        delay = (-Math.random() * dur).toFixed(1);
        out += '<i style="left:' + x + '%;bottom:-8%;width:' + size + 'px;height:' + size + 'px;animation-duration:' + dur + 's;animation-delay:' + delay + 's"></i>';
      }
    } else if (id === 'petals') {
      for (i = 0; i < 16; i++) {
        x = (Math.random() * 100).toFixed(1);
        size = Math.round(7 + Math.random() * 7);
        dur = (9 + Math.random() * 10).toFixed(1);
        delay = (-Math.random() * dur).toFixed(1);
        out += '<i style="left:' + x + '%;top:-12%;width:' + size + 'px;height:' + Math.round(size * 1.4) + 'px;--sway:' + (Math.random() * 12 - 4).toFixed(1) + 'vw;animation-duration:' + dur + 's;animation-delay:' + delay + 's"></i>';
      }
    } else if (id === 'snow') {
      for (i = 0; i < 32; i++) {
        x = (Math.random() * 100).toFixed(1);
        size = Math.round(2 + Math.random() * 5);
        dur = (12 + Math.random() * 16).toFixed(1);
        delay = (-Math.random() * dur).toFixed(1);
        out += '<i style="left:' + x + '%;top:-8%;width:' + size + 'px;height:' + size + 'px;--sway:' + (Math.random() * 8 - 2).toFixed(1) + 'vw;animation-duration:' + dur + 's;animation-delay:' + delay + 's"></i>';
      }
    } else if (id === 'stars') {
      for (i = 0; i < 46; i++) {
        x = (Math.random() * 100).toFixed(1);
        var y = (Math.random() * 70).toFixed(1);
        size = Math.round(1 + Math.random() * 3);
        dur = (2.4 + Math.random() * 4).toFixed(1);
        delay = (-Math.random() * dur).toFixed(1);
        out += '<i style="left:' + x + '%;top:' + y + '%;width:' + size + 'px;height:' + size + 'px;animation-duration:' + dur + 's;animation-delay:' + delay + 's"></i>';
      }
    } else if (id === 'aurora') {
      out += '<i class="band"></i><i class="band"></i><i class="band"></i>';
    } else if (id === 'waves') {
      out += '<i class="wave"></i><i class="wave"></i><i class="wave"></i>';
    } else if (id === 'rays') {
      for (i = 0; i < 6; i++) {
        delay = (-Math.random() * 8).toFixed(1);
        out += '<i class="ray" style="left:' + (8 + i * 17) + '%;animation-delay:' + delay + 's"></i>';
      }
    }
    return out + '</div>';
  }

  /* ---------- Data demo ---------- */
  function demoSeed() {
    return {
      guests: [
        { name: 'Bapak Andi Wijaya', key: 'andi-wijaya', code: '1234', wa: '081234567890', time: nowISO() },
        { name: 'Ibu Sari Puspita', key: 'sari-puspita', code: '5678', wa: '081298765432', time: nowISO() },
        { name: 'Rendra & Keluarga', key: 'rendra', code: '9012', wa: '', time: nowISO() }
      ],
      rsvp: [],
      wishes: [
        { time: nowISO(), name: 'Bapak Andi Wijaya', status: 'Hadir', count: 2, msg: 'Selamat menempuh hidup baru. Semoga sakinah, mawaddah, warahmah.', key: 'andi-wijaya', verified: true },
        { time: nowISO(), name: 'Ibu Sari Puspita', status: 'Hadir', count: 1, msg: 'Barakallahu lakuma wa baraka alaikuma. Sampai jumpa di hari bahagia!', key: 'sari-puspita', verified: true }
      ],
      hadir: [],
      notifs: [],
      admins: [{ name: 'Panitia Demo', key: 'admin123', role: 'admin', project: cfg.slug, active: true, time: nowISO() }]
    };
  }
  function demoRead() {
    var k = DEMO_KEY + cfg.slug, d = null;
    try { d = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { d = null; }
    if (!d || !Array.isArray(d.guests)) {
      d = demoSeed();
      demoSave(d);
    }
    d.guests = Array.isArray(d.guests) ? d.guests : [];
    d.rsvp = Array.isArray(d.rsvp) ? d.rsvp : [];
    d.wishes = Array.isArray(d.wishes) ? d.wishes : [];
    d.hadir = Array.isArray(d.hadir) ? d.hadir : [];
    d.notifs = Array.isArray(d.notifs) ? d.notifs : [];
    d.admins = Array.isArray(d.admins) ? d.admins : [];
    if (!d.admins.some(function (a) { return a.key === 'admin123'; })) {
      d.admins.unshift({ name: 'Panitia Demo', key: 'admin123', role: 'admin', project: cfg.slug, active: true, time: nowISO() });
    }
    return d;
  }
  function demoSave(d) {
    try { localStorage.setItem(DEMO_KEY + cfg.slug, JSON.stringify(d)); } catch (e) { /* kuota */ }
  }

  /* ---------- Konfigurasi ---------- */
  function loadPreviewConfig(id) {
    var db = null;
    try { db = JSON.parse(localStorage.getItem('u3d.studio.v1') || 'null'); } catch (e) { db = null; }
    if (!db || !Array.isArray(db.projects) || !db.projects.length) throw new Error('Workspace studio belum siap. Buka platform lalu pilih proyek.');
    var p = db.projects.find(function (x) { return x.id === id; }) || db.projects[0];
    if (!p) throw new Error('Proyek tidak ditemukan.');
    var out = clone(p);
    out.apiUrl = (db.settings && db.settings.apiUrl) || '';
    out.publicBase = (db.settings && db.settings.siteBase) || '';
    out.preview = true;
    return out;
  }

  function jsonp(params) {
    return new Promise(function (resolve, reject) {
      var cb = '__u3d_pub_' + Date.now() + Math.random().toString(36).slice(2, 5);
      var sep = API_PARAM.indexOf('?') >= 0 ? '&' : '?';
      var qs = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
      var s = document.createElement('script');
      var timer = setTimeout(function () { cleanup(); reject(new Error('Backend tidak merespons (timeout).')); }, 20000);
      function cleanup() {
        clearTimeout(timer);
        try { delete window[cb]; } catch (e) { window[cb] = undefined; }
        if (s.parentNode) s.parentNode.removeChild(s);
      }
      window[cb] = function (data) { cleanup(); resolve(data); };
      s.onerror = function () { cleanup(); reject(new Error('Gagal memuat data undangan dari backend.')); };
      s.src = API_PARAM + sep + qs + '&callback=' + cb + '&_=' + Date.now();
      document.head.appendChild(s);
    });
  }

  function normalize() {
    cfg.groom = Object.assign({ name: '', short: '', order: 'Putra', parents: '', ig: '', photo: '' }, cfg.groom);
    cfg.bride = Object.assign({ name: '', short: '', order: 'Putri', parents: '', ig: '', photo: '' }, cfg.bride);
    cfg.event = Object.assign({ date: '' }, cfg.event);
    cfg.event.akad = Object.assign({ time: '', label: 'Akad Nikah', place: '', address: '', maps: '' }, cfg.event.akad);
    cfg.event.resepsi = Object.assign({ time: '', label: 'Resepsi', place: '', address: '', maps: '' }, cfg.event.resepsi);
    cfg.quote = Object.assign({ text: '', source: '' }, cfg.quote);
    cfg.gift = Object.assign({ bank: '', number: '', holder: '', wallet: '', address: '' }, cfg.gift);
    cfg.style = Object.assign({ accent: '' }, cfg.style);
    cfg.story = Array.isArray(cfg.story) ? cfg.story : [];
    cfg.gallery = Array.isArray(cfg.gallery) ? cfg.gallery : [];
    cfg.scene = Object.assign({ density: 'sedang', motion: true, stage: 'auto' }, cfg.scene);
    cfg.background = Object.assign({
      type: 'theme', image: '', position: 'center', blur: 0, dim: 45,
      color: '#101720', gradient: { from: '#122033', to: '#3a2b46', angle: 160 },
      animation: 'bokeh'
    }, cfg.background);
    cfg.background.gradient = Object.assign({ from: '#122033', to: '#3a2b46', angle: 160 }, cfg.background.gradient);
    var bg = cfg.background;
    if (['theme', 'image', 'gradient', 'color', 'animation'].indexOf(bg.type) < 0) bg.type = 'theme';
    if (bg.type === 'image' && !bgImageOk(bg.image)) bg.type = 'theme';
    if (['center', 'top', 'bottom', 'left', 'right'].indexOf(bg.position) < 0) bg.position = 'center';
    bg.blur = Math.max(0, Math.min(20, Number(bg.blur) || 0));
    bg.dim = Math.max(0, Math.min(90, Number(bg.dim) || 0));
    cfg.plugins = g.U3DPlugins.normalize(cfg.plugins);
    cfg.slug = cfg.slug || slugify(projectTitle()) || 'undangan';
    plugins = cfg.plugins;
    if (!cfg.id) cfg.id = cfg.slug;
  }

  /* ---------- API ---------- */
  async function apiCall(action, payload, opts) {
    if (!cfg.apiUrl) throw new Error('Backend Apps Script belum terhubung.');
    var body = Object.assign({
      action: action, slug: cfg.slug,
      session: SESSION, device: DEVICE, ref: REF, to: TO
    }, payload || {});
    if (opts && opts.admin) body.adminKey = state.adminKey || ADMIN_KEY;
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 25000);
    var res;
    try {
      res = await fetch(cfg.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body),
        redirect: 'follow',
        signal: ctrl ? ctrl.signal : undefined
      });
    } catch (e) {
      clearTimeout(timer);
      if (e && e.name === 'AbortError') throw new Error('Backend tidak merespons. Periksa koneksi.');
      throw new Error('Tidak bisa menghubungi backend. Periksa URL /exec.');
    }
    clearTimeout(timer);
    var text = await res.text();
    var data;
    try { data = JSON.parse(text); }
    catch (e) {
      if (/^\s*</.test(text)) throw new Error('Backend mengembalikan HTML. Pastikan deployment Web App = Anyone.');
      throw new Error('Respons backend tidak valid.');
    }
    if (data && data.ok === false) throw new Error(data.error || 'Permintaan ditolak backend.');
    return data;
  }

  /* ---------- Render ---------- */
  function coverHtml() {
    var gj = cfg.groom, br = cfg.bride;
    var guestName = TO || 'Tamu Undangan';
    var kicker = TO ? 'Kepada Bapak/Ibu/Saudara' : 'Untuk Bapak/Ibu/Saudara';
    return '<section class="cover" id="cover">' +
      '<div class="cover-inner">' +
      '<span class="cover-kicker">The Wedding Of</span>' +
      '<div class="cover-mono">' + esc(initials(gj.short || gj.name)) + '<i>·</i>' + esc(initials(br.short || br.name)) + '</div>' +
      '<h1 class="cover-names">' + esc(gj.short || gj.name || 'Mempelai') + ' <em>&amp;</em> ' + esc(br.short || br.name || 'Mempelai') + '</h1>' +
      '<div class="ornament"><span>' + esc(theme.name) + '</span></div>' +
      '<div class="cover-date">' + esc(fmtDate() || 'Tanggal menyusul') + '</div>' +
      '<div class="cover-guest"><span>' + esc(kicker) + '</span><b>' + esc(guestName) + '</b></div>' +
      '<button class="open-btn" id="openBtn" type="button">' + icon('heart') + 'Buka Undangan</button>' +
      '<div class="cover-foot">Undangan 3D · ' + esc(shortPair()) + '</div>' +
      '</div>' +
      '<div class="cover-side">' + esc(theme.tag) + '</div>' +
      '</section>';
  }

  function headHtml(kicker, title, sub) {
    return '<header class="sect-head reveal">' +
      '<div class="sect-kicker">' + esc(kicker) + '</div>' +
      '<h2 class="sect-title">' + esc(title) + '</h2>' +
      (sub ? '<p class="sect-sub">' + esc(sub) + '</p>' : '') +
      '<div class="divider"><i></i></div>' +
      '</header>';
  }

  function personHtml(p, role) {
    var photo = safeUrl(p.photo, true);
    var ig = String(p.ig || '').replace(/^@/, '').replace(/[^a-zA-Z0-9._]/g, '');
    return '<div class="couple-card">' +
      '<div class="couple-photo">' +
      (photo ? '<img src="' + attr(photo) + '" alt="' + attr(p.name || role) + '" loading="lazy">' :
        '<div class="fallback">' + esc(initials(p.short || p.name)) + '</div>') +
      '</div>' +
      '<span class="couple-role">' + esc(role) + '</span>' +
      '<h3 class="couple-name">' + esc(p.name || p.short || '—') + '</h3>' +
      '<p class="couple-parents">' + (p.order ? esc(p.order) + ' dari ' : '') + esc(p.parents || '') + '</p>' +
      (ig ? '<a class="couple-ig" href="https://instagram.com/' + attr(ig) + '" target="_blank" rel="noopener">' + icon('instagram') + '@' + esc(ig) + '</a>' : '') +
      '</div>';
  }

  function heroHtml() {
    var gj = cfg.groom, br = cfg.bride;
    var q = cfg.quote.text ? '<blockquote class="hero-quote">“' + esc(cfg.quote.text) + '”' +
      (cfg.quote.source ? '<small>— ' + esc(cfg.quote.source) + '</small>' : '') + '</blockquote>' : '';
    return '<section class="hero" id="sec-hero">' +
      '<div class="hero-inner">' +
      '<div class="hero-kicker">The Wedding Of</div>' +
      '<h1 class="hero-names">' + esc(gj.short || gj.name || 'Mempelai') + ' <em>&amp;</em> ' + esc(br.short || br.name || 'Mempelai') + '</h1>' +
      '<div class="hero-date">' + esc(fmtDate() || 'Tanggal menyusul') + '</div>' +
      q +
      '<div class="scroll-cue">Gulir ke bawah<i></i></div>' +
      '</div></section>';
  }

  function coupleHtml() {
    return '<section class="sect alt" id="sec-couple"><div class="wrap">' +
      headHtml('Mempelai', 'Dua Hati, Satu Janji', 'Dengan memohon rahmat dan ridha Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.') +
      '<div class="couple-grid reveal">' +
      personHtml(cfg.groom, 'Mempelai Pria') +
      '<div class="couple-amp">&amp;</div>' +
      personHtml(cfg.bride, 'Mempelai Wanita') +
      '</div></div></section>';
  }

  function countdownHtml() {
    return '<section class="sect" id="sec-countdown"><div class="wrap">' +
      headHtml('Menghitung Hari', 'Menuju Hari Bahagia', '') +
      '<div class="countdown-card reveal">' +
      '<div class="countdown-grid">' +
      '<div class="cd-cell"><div class="cd-num" data-cd="days">00</div><div class="cd-label">Hari</div></div>' +
      '<div class="cd-cell"><div class="cd-num" data-cd="hours">00</div><div class="cd-label">Jam</div></div>' +
      '<div class="cd-cell"><div class="cd-num" data-cd="mins">00</div><div class="cd-label">Menit</div></div>' +
      '<div class="cd-cell"><div class="cd-num" data-cd="secs">00</div><div class="cd-label">Detik</div></div>' +
      '</div>' +
      '<p class="countdown-note" id="cdNote">' + esc(fmtDate() || 'Tanggal menyusul') + '</p>' +
      '</div></div></section>';
  }

  function eventCard(ev, kind) {
    if (!ev || (!ev.time && !ev.place && !ev.address)) return '';
    var maps = plugins.maps ? safeUrl(ev.maps) : '';
    return '<article class="event-card">' +
      '<div class="event-icon">' + icon(kind === 'akad' ? 'heart' : 'sparkles') + '</div>' +
      '<div class="event-label">' + esc(kind === 'akad' ? 'Akad Nikah' : 'Resepsi') + '</div>' +
      '<h3 class="event-title">' + esc(ev.label || (kind === 'akad' ? 'Akad Nikah' : 'Resepsi')) + '</h3>' +
      '<div class="event-time">' + esc(ev.time || 'Waktu menyusul') + '</div>' +
      (ev.place ? '<div class="event-place">' + esc(ev.place) + '</div>' : '') +
      (ev.address ? '<div class="event-address">' + esc(ev.address) + '</div>' : '') +
      (maps ? '<a class="event-map" href="' + attr(maps) + '" target="_blank" rel="noopener">' + icon('pin') + 'Buka peta</a>' : '') +
      '</article>';
  }

  function eventsHtml() {
    var akad = eventCard(cfg.event.akad, 'akad');
    var resepsi = eventCard(cfg.event.resepsi, 'resepsi');
    if (!akad && !resepsi && !cfg.event.date) return '';
    return '<section class="sect alt" id="sec-events"><div class="wrap">' +
      headHtml('Waktu & Tempat', 'Rangkaian Acara', 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara berkenan hadir.') +
      '<div class="event-date reveal"><b>' + esc(fmtDate() || 'Tanggal menyusul') + '</b></div>' +
      '<div class="event-grid reveal">' + akad + resepsi + '</div>' +
      '</div></section>';
  }

  function storyHtml() {
    if (!cfg.story.length) return '';
    var items = cfg.story.map(function (s) {
      return '<div class="story-item reveal">' +
        (s.year ? '<div class="story-year">' + esc(s.year) + '</div>' : '') +
        (s.title ? '<h3 class="story-title">' + esc(s.title) + '</h3>' : '') +
        (s.text ? '<p class="story-text">' + esc(s.text) + '</p>' : '') +
        '</div>';
    }).join('');
    return '<section class="sect" id="sec-story"><div class="wrap">' +
      headHtml('Perjalanan Kami', 'Love Story', 'Setiap pertemuan adalah awal dari sebuah cerita.') +
      '<div class="story-list">' + items + '</div>' +
      '</div></section>';
  }

  function galleryHtml() {
    var items = cfg.gallery.filter(function (x) { return safeUrl(x.src, true); });
    if (!items.length) return '';
    return '<section class="sect alt" id="sec-gallery"><div class="wrap">' +
      headHtml('Momen', 'Galeri Foto', 'Potongan kenangan yang kami simpan untuk dibagikan.') +
      '<div class="gallery-grid reveal">' +
      items.map(function (x, i) {
        var src = safeUrl(x.src, true);
        return '<button type="button" class="gallery-item" data-gallery="' + i + '" data-src="' + attr(src) + '" data-cap="' + attr(x.caption || '') + '" aria-label="Perbesar foto ' + (i + 1) + '">' +
          '<img src="' + attr(src) + '" alt="' + attr(x.caption || ('Foto ' + (i + 1))) + '" loading="lazy">' +
          (x.caption ? '<span class="gallery-cap">' + esc(x.caption) + '</span>' : '') +
          '</button>';
      }).join('') +
      '</div></div></section>';
  }

  function registeredPanel() {
    var rec = demo ? guestRecord() : null;
    var name = (rec && rec.name) || TO || 'Tamu Undangan';
    var key = (rec && rec.key) || GKEY;
    var code = (rec && rec.code) || CODE;
    var wa = rec ? normPhone(rec.wa) : '';
    var link = key ? guestLink({ name: name, key: key, code: code, wa: wa }) : '';
    return '<div class="form-card register-done reveal">' +
      '<div class="ok-ring">' + icon('check') + '</div>' +
      '<h4>Anda sudah terdaftar</h4>' +
      '<p>Undangan personal untuk <b>' + esc(name) + '</b> sudah siap. Gunakan tautan di bawah untuk membuka undangan lengkap.</p>' +
      (link ? '<div class="reg-link"><label>Link undangan personal</label><div class="reg-link-row">' +
        '<input class="input" readonly value="' + attr(link) + '">' +
        '<button class="btn-copy" type="button" data-copy="' + attr(link) + '">' + icon('copy') + 'Salin</button></div></div>' +
        (wa ? '<div class="reg-actions"><a class="btn-wa" href="' + attr(waPersonal({ name: name, wa: wa }, link)) + '" target="_blank" rel="noopener">' + icon('wa') + 'Simpan via WhatsApp</a></div>' : '') : '') +
      (code ? '<p class="reg-code">Kode check-in: <span class="ad-chip">' + esc(code) + '</span></p>' : '') +
      '</div>';
  }

  function registerHtml() {
    if (GKEY) {
      return '<section class="sect" id="sec-register"><div class="wrap">' +
        headHtml('Buku Tamu', 'Pendaftaran Tamu', 'Undangan ini terhubung dengan data tamu yang sudah terdaftar.') +
        registeredPanel() + '</div></section>';
    }
    return '<section class="sect" id="sec-register"><div class="wrap">' +
      headHtml('Buku Tamu', TO ? 'Lengkapi Pendaftaran' : 'Daftarkan Diri Anda', 'Daftarkan nama dan nomor WhatsApp agar kami dapat mengirim link undangan personal, kode check-in, dan pengingat acara.') +
      '<form class="form-card register-form reveal" id="registerForm" novalidate>' +
      '<div class="form-grid">' +
      '<div class="field"><label>Nama lengkap' + (TO ? ' <span class="person-lock">' + icon('lock') + 'terkunci</span>' : '') + '</label><input class="input" name="name" value="' + attr(TO) + '" placeholder="Nama Anda / keluarga" maxlength="80" required autocomplete="name"' + (TO ? ' readonly' : '') + '></div>' +
      '<div class="field"><label>Nomor WhatsApp</label><input class="input" name="wa" type="tel" inputmode="tel" placeholder="08xxxxxxxxxx" maxlength="24" required autocomplete="tel"><span class="hint">Dipakai untuk link personal &amp; notifikasi otomatis.</span></div>' +
      '</div>' +
      '<button class="btn-primary" type="submit" style="margin-top:14px">' + icon('user') + 'Daftar &amp; dapatkan link</button>' +
      '<p class="form-msg" id="registerMsg"></p>' +
      '<p class="form-note" style="margin-top:10px">Data hanya digunakan untuk keperluan undangan ini dan tersimpan di Google Sheets milik penyelenggara.</p>' +
      '</form></div></section>';
  }

  function waPersonal(g, link) {
    var msg = 'Halo ' + (g.name || 'Tamu') + ', ini link undangan personal Anda:\n' + link +
      (g.code ? '\n\nKode check-in: ' + g.code : '') + '\n\nTerima kasih.';
    return 'https://wa.me/' + normPhone(g.wa) + '?text=' + encodeURIComponent(msg);
  }

  function registerSuccessHtml(g, link, res) {
    var existed = !!(res && res.existed);
    var notified = !!(res && res.notified);
    var wa = normPhone(g.wa);
    var note = notified
      ? 'Notifikasi WhatsApp otomatis sudah dikirim ke nomor ' + esc(g.wa) + '.'
      : (demo ? 'Mode demo: notifikasi WhatsApp disimulasikan. Link tetap dapat disalin.' : 'Link personal juga ditampilkan di sini. Panitia dapat mengirim ulang notifikasi kapan saja.');
    return '<div class="rsvp-success register-success"><div class="ok-ring">' + icon('check') + '</div>' +
      '<h4>' + (existed ? 'Nomor sudah terdaftar' : 'Pendaftaran berhasil') + '</h4>' +
      '<p>' + (existed ? 'Nomor WhatsApp ini sudah terdaftar sebagai tamu. Gunakan link personal berikut.' : 'Terima kasih, <b>' + esc(g.name) + '</b>. Simpan link personal berikut agar dapat membuka undangan dan check-in.') + '</p>' +
      (link ? '<div class="reg-link"><label>Link undangan personal</label><div class="reg-link-row">' +
        '<input class="input" readonly value="' + attr(link) + '">' +
        '<button class="btn-copy" type="button" data-copy="' + attr(link) + '">' + icon('copy') + 'Salin</button></div></div>' +
        (wa ? '<div class="reg-actions"><a class="btn-wa" href="' + attr(waPersonal({ name: g.name, wa: wa, code: g.code }, link)) + '" target="_blank" rel="noopener">' + icon('wa') + 'Kirim ke WhatsApp saya</a></div>' : '') : '') +
      (g.code ? '<p class="reg-code">Kode check-in: <span class="ad-chip">' + esc(g.code) + '</span></p>' : '') +
      '<p class="form-note reg-note">' + note + '</p></div>';
  }

  function demoRegister(o) {
    var d = demoRead();
    var waNorm = normPhone(o.wa);
    if (!waNorm) throw new Error('Nomor WhatsApp tidak valid. Gunakan format 08xx atau 62xx.');
    var existing = d.guests.find(function (g) { return normPhone(g.wa) === waNorm; });
    if (existing) return { existed: true, guest: existing, link: guestLink(existing), notified: false, demo: true };
    if (d.guests.some(function (g) { return slugify(g.name) === slugify(o.name); })) {
      throw new Error('Nama sudah terdaftar dengan nomor lain. Hubungi panitia untuk memperbarui data.');
    }
    var code;
    do { code = String(Math.floor(1000 + Math.random() * 9000)); }
    while (d.guests.some(function (g) { return String(g.code) === code; }));
    var g = {
      name: o.name, wa: waNorm, code: code, time: nowISO(),
      key: (slugify(o.name) || 'tamu') + '-' + Math.random().toString(36).slice(2, 5)
    };
    d.guests.push(g);
    demoSave(d);
    return { existed: false, guest: g, link: guestLink(g), notified: false, demo: true };
  }

  async function submitRegister(form) {
    var fd = new FormData(form);
    var o = { name: cap(fd.get('name'), 80), wa: cap(fd.get('wa'), 24) };
    var msgEl = $('#registerMsg');
    if (!o.name) { if (msgEl) msgEl.textContent = 'Nama wajib diisi.'; return; }
    if (!normPhone(o.wa)) { if (msgEl) msgEl.textContent = 'Nomor WhatsApp tidak valid. Gunakan format 08xx atau 62xx.'; return; }
    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = icon('send') + 'Mendaftarkan…'; }
    try {
      var r;
      if (demo) r = demoRegister(o);
      else r = await apiCall('guest.register', { name: o.name, wa: o.wa });
      var g = Object.assign({ name: o.name, wa: normPhone(o.wa) }, r.guest || {});
      var link = r.link || (g.key ? guestLink(g) : '');
      var card = form.closest('.form-card');
      if (card) {
        card.classList.remove('register-form');
        card.innerHTML = registerSuccessHtml(g, link, r);
      }
      toast(r.existed ? 'Nomor sudah terdaftar' : 'Pendaftaran berhasil');
    } catch (e) {
      if (msgEl) msgEl.textContent = e.message || 'Gagal mendaftar. Coba lagi.';
      if (btn) { btn.disabled = false; btn.innerHTML = icon('user') + 'Daftar &amp; dapatkan link'; }
    }
  }

  function rsvpHtml() {
    var counts = [1, 2, 3, 4, 5, 6];
    return '<section class="sect" id="sec-rsvp"><div class="wrap">' +
      headHtml('Konfirmasi', 'Konfirmasi Kehadiran', 'Mohon konfirmasi kehadiran Anda agar kami dapat mempersiapkan dengan sebaik-baiknya.') +
      '<form class="form-card reveal" id="rsvpForm" novalidate>' +
      '<div class="form-grid">' +
      '<div class="field"><label>Nama lengkap' + (TO ? ' <span class="person-lock">' + icon('lock') + 'terkunci</span>' : '') + '</label>' +
      '<input class="input" name="name" value="' + attr(TO) + '" placeholder="Nama Anda" maxlength="80" required' + (TO ? ' readonly' : '') + '></div>' +
      '<div class="field"><label>Jumlah orang</label><select class="select" name="count">' +
      counts.map(function (n) { return '<option value="' + n + '">' + n + ' orang</option>'; }).join('') +
      '</select></div>' +
      '<div class="field full"><label>Kehadiran</label><div class="choice-row">' +
      '<label class="choice"><input type="radio" name="status" value="Hadir" checked>Hadir</label>' +
      '<label class="choice"><input type="radio" name="status" value="Tidak Hadir">Tidak hadir</label>' +
      '<label class="choice"><input type="radio" name="status" value="Belum Pasti">Belum pasti</label>' +
      '</div></div>' +
      '<div class="field full"><label>Pesan untuk mempelai (opsional)</label><textarea class="textarea" name="msg" maxlength="300" placeholder="Tulis doa atau pesan singkat…"></textarea></div>' +
      '</div>' +
      '<button class="btn-primary" type="submit" style="margin-top:14px">' + icon('send') + 'Kirim konfirmasi</button>' +
      '<p class="form-msg" id="rsvpMsg"></p>' +
      '<p class="form-note" style="margin-top:10px">Data konfirmasi tersimpan di buku tamu digital dan hanya dilihat oleh panitia.</p>' +
      '</form></div></section>';
  }

  function wishCard(w, admin) {
    var meta = w.status && w.status !== 'Ucapan' ? esc(w.status) : 'Tamu undangan';
    if (w.count) meta += ' · ' + num(w.count) + ' orang';
    if (w.time) { var t = fmtTime(w.time); if (t) meta += ' · ' + esc(t); }
    return '<article class="wish-card">' +
      '<div class="wish-head">' +
      '<span class="wish-avatar">' + esc(initials(w.name)) + '</span>' +
      '<div><div class="wish-name">' + esc(w.name || 'Tamu') + '</div><div class="wish-meta">' + meta + '</div></div>' +
      (w.verified ? '<span class="wish-badge">Terverifikasi</span>' : '') +
      (admin ? '<button class="ic" data-ad-del-wish="' + attr(w.key || '') + '" data-name="' + attr(w.name || '') + '" title="Hapus ucapan">' + icon('trash') + '</button>' : '') +
      '</div>' +
      '<p class="wish-msg">' + esc(w.msg || '') + '</p>' +
      '</article>';
  }

  function wishesHtml() {
    return '<section class="sect alt" id="sec-wishes"><div class="wrap">' +
      headHtml('Doa & Restu', 'Buku Ucapan', 'Kirimkan doa dan ucapan terbaik Anda untuk kedua mempelai.') +
      '<div class="wishes-layout">' +
      '<form class="wish-form reveal" id="wishForm" novalidate>' +
      '<div class="field"><label>Nama' + (TO ? ' <span class="person-lock">' + icon('lock') + 'terkunci</span>' : '') + '</label>' +
      '<input class="input" name="name" value="' + attr(TO) + '" placeholder="Nama Anda" maxlength="80" required' + (TO ? ' readonly' : '') + '></div>' +
      '<div class="field"><label>Ucapan & doa</label><textarea class="textarea" name="msg" placeholder="Tulis ucapan terbaik Anda…" maxlength="600" required></textarea></div>' +
      '<button class="btn-primary" type="submit">' + icon('send') + 'Kirim ucapan</button>' +
      '<p class="form-msg" id="wishMsg"></p>' +
      '</form>' +
      '<div class="wish-list reveal" id="wishList">' + wishListHtml() + '</div>' +
      '</div></div></section>';
  }
  function wishListHtml() {
    if (!state.wishes.length) return '<div class="wish-empty">Belum ada ucapan. Jadilah yang pertama mengirim doa.</div>';
    return state.wishes.slice(0, 60).map(function (w) { return wishCard(w, false); }).join('');
  }

  function giftHasData() {
    var x = cfg.gift;
    return !!(x.bank || x.number || x.holder || x.wallet || x.address);
  }
  function giftHtml() {
    if (!giftHasData()) return '';
    var x = cfg.gift;
    var cards = '';
    if (x.bank || x.number) {
      cards += '<div class="gift-card"><div class="gc-bank">' + esc(x.bank || 'Transfer bank') + '</div>' +
        '<div class="gc-number">' + esc(x.number || '—') + '</div>' +
        '<div class="gc-name">' + esc(x.holder || '') + '</div>' +
        (x.number ? '<button class="btn-copy" type="button" data-copy="' + attr(x.number) + '">' + icon('copy') + 'Salin nomor</button>' : '') + '</div>';
    }
    if (x.wallet) {
      cards += '<div class="gift-card"><div class="gc-bank">E-Wallet</div>' +
        '<div class="gc-number">' + esc(x.wallet) + '</div>' +
        '<div class="gc-name">' + esc(x.holder || '') + '</div>' +
        '<button class="btn-copy" type="button" data-copy="' + attr(x.wallet.replace(/[^0-9+]/g, '')) + '">' + icon('copy') + 'Salin nomor</button></div>';
    }
    return '<section class="sect" id="sec-gift"><div class="wrap">' +
      headHtml('Tanda Kasih', 'Amplop Digital', 'Kehadiran dan doa Anda adalah hadiah terindah. Bagi yang ingin memberi tanda kasih, tersedia melalui:') +
      '<div class="gift-grid reveal">' + cards + '</div>' +
      (x.address ? '<p class="gift-note">Kirim hadiah ke: ' + esc(x.address) + '</p>' : '') +
      '<p class="gift-note">Terima kasih atas perhatian dan kasih sayang Anda.</p>' +
      '</div></section>';
  }

  function shareUrl() {
    try {
      var u = new URL(location.origin + location.pathname);
      if (PREVIEW) { u.searchParams.set('preview', '1'); u.searchParams.set('id', cfg.id); }
      else if (cfg.apiUrl) { u.searchParams.set('s', cfg.slug); u.searchParams.set('api', cfg.apiUrl); }
      return u.toString();
    } catch (e) { return location.href; }
  }
  function shareHtml() {
    var msg = 'Assalamu’alaikum. Dengan hormat, kami mengundang Anda untuk hadir di pernikahan ' + projectTitle() +
      (cfg.event.date ? ' pada ' + fmtDate() : '') + '.\n\nUndangan digital: ' + shareUrl();
    return '<section class="sect alt" id="sec-share"><div class="wrap">' +
      headHtml('Bagikan', 'Sebarkan Kabar Bahagia', 'Bantu kami menyampaikan undangan kepada keluarga dan sahabat.') +
      '<div class="share-card reveal">' +
      '<p>Terima kasih telah menjadi bagian dari perjalanan kami. Silakan bagikan undangan ini kepada orang terdekat Anda.</p>' +
      '<div class="share-actions">' +
      '<a class="btn-wa" href="https://wa.me/?text=' + attr(encodeURIComponent(msg)) + '" target="_blank" rel="noopener" data-track-share="wa">' + icon('wa') + 'Bagikan WhatsApp</a>' +
      '<button class="btn-copy" type="button" data-copy-share="1">' + icon('copy') + 'Salin tautan</button>' +
      '</div></div></div></section>';
  }

  function footerHtml() {
    return '<footer class="site-foot">' +
      '<div class="foot-mono">' + esc(initials(cfg.groom.short || cfg.groom.name)) + ' · ' + esc(initials(cfg.bride.short || cfg.bride.name)) + '</div>' +
      '<div class="foot-names">' + esc(shortPair()) + '</div>' +
      '<div class="foot-date">' + esc(fmtDate() || '') + '</div>' +
      '<p class="foot-thanks">Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara berkenan hadir dan memberikan doa restu.</p>' +
      '<div class="foot-heart">' + icon('heart') + '</div>' +
      '<div class="foot-credit">Dibuat dengan <b>Undangan3D Studio</b></div>' +
      '</footer>';
  }

  function dockHtml(ids) {
    var items = [
      ['sec-hero', 'Awal'], ['sec-couple', 'Mempelai'], ['sec-countdown', 'Hitung Mundur'],
      ['sec-events', 'Acara'], ['sec-story', 'Cerita'], ['sec-gallery', 'Galeri'],
      ['sec-register', 'Daftar'], ['sec-rsvp', 'RSVP'], ['sec-wishes', 'Ucapan'], ['sec-gift', 'Hadiah'], ['sec-share', 'Bagikan']
    ].filter(function (x) { return ids.indexOf(x[0]) >= 0; });
    if (!items.length) return '';
    return '<nav class="dock" id="dock" aria-label="Navigasi undangan">' +
      items.map(function (x) {
        return '<button type="button" data-dock="' + x[0] + '"><span class="d-label">' + esc(x[1]) + '</span><span class="d-dot"></span></button>';
      }).join('') + '</nav>';
  }

  function floatsHtml() {
    var out = '<div class="float-stack">';
    if (plugins.music) out += '<button class="float-btn" id="musicBtn" type="button" title="Musik ambient" aria-label="Musik ambient"><span class="eq"><i></i><i></i><i></i><i></i></span></button>';
    if (plugins.dark) out += '<button class="float-btn" id="darkBtn" type="button" title="Mode gelap" aria-label="Mode gelap">' + icon('moon') + '</button>';
    if (ADMIN_MODE) out += '<button class="float-btn admin" id="adminBtn" type="button" title="Panel panitia" aria-label="Panel panitia">' + icon('lock') + '</button>';
    out += '</div>';
    return out;
  }

  function adminHtml() {
    return '<aside class="admin-drawer" id="adminDrawer" aria-label="Panel panitia">' +
      '<div class="ad-head"><div><b>Panel Panitia</b><small id="adSub">Kelola tamu & kehadiran</small></div>' +
      '<span class="ad-live" id="adLive" style="display:none"><i></i><span>LIVE</span></span>' +
      '<button class="ad-close" id="adClose" type="button" aria-label="Tutup panel">' + icon('close') + '</button></div>' +
      '<div class="ad-body" id="adBody"></div>' +
      '</aside>';
  }

  function renderAll() {
    var parts = [];
    var ids = ['sec-hero', 'sec-couple'];
    parts.push(heroHtml());
    parts.push(coupleHtml());
    if (plugins.countdown) { parts.push(countdownHtml()); ids.push('sec-countdown'); }
    var ev = eventsHtml();
    if (ev) { parts.push(ev); ids.push('sec-events'); }
    if (plugins.story && cfg.story.length) { parts.push(storyHtml()); ids.push('sec-story'); }
    if (plugins.gallery && cfg.gallery.length) { parts.push(galleryHtml()); ids.push('sec-gallery'); }
    if (plugins.register) { parts.push(registerHtml()); ids.push('sec-register'); }
    if (plugins.rsvp) { parts.push(rsvpHtml()); ids.push('sec-rsvp'); }
    if (plugins.wishes) { parts.push(wishesHtml()); ids.push('sec-wishes'); }
    if (plugins.gift) { var gift = giftHtml(); if (gift) { parts.push(gift); ids.push('sec-gift'); } }
    if (plugins.share) { parts.push(shareHtml()); ids.push('sec-share'); }
    parts.push(footerHtml());

    document.body.innerHTML =
      '<div class="bg-layer" id="bgLayer" aria-hidden="true"></div>' +
      '<canvas class="scene-canvas" id="sceneCanvas" aria-hidden="true"></canvas>' +
      '<div class="scene-vignette" aria-hidden="true"></div>' +
      (cfg.preview ? '<div class="preview-flag">PREVIEW · MODE DEMO</div>' : '') +
      coverHtml() +
      '<main class="site" id="site">' + parts.join('') + '</main>' +
      dockHtml(ids) +
      floatsHtml() +
      '<div class="lightbox" id="lightbox" role="dialog" aria-label="Foto">' +
      '<button class="lb-close" id="lbClose" type="button" aria-label="Tutup">' + icon('close') + '</button>' +
      '<img id="lbImg" src="" alt="">' +
      '<div class="lb-cap" id="lbCap"></div>' +
      '</div>' +
      (ADMIN_MODE ? adminHtml() : '') +
      '<div class="inv-toast" id="invToast" role="status"></div>';

    if (state.dark) applyTheme();
    renderAdminBody();
  }

  /* ---------- Jam & animasi ---------- */
  function startClock() {
    clearInterval(clockTimer);
    function tick() {
      var d = cfg && cfg.event ? cfg.event.date : '';
      var target = d ? new Date(String(d).length <= 10 ? d + 'T09:00:00' : d) : null;
      var nums = $$('[data-cd]');
      if (!nums.length) return;
      if (!target || isNaN(target)) { nums.forEach(function (n) { n.textContent = '00'; }); return; }
      var diff = target.getTime() - Date.now();
      if (diff <= 0) {
        nums.forEach(function (n) { n.textContent = '00'; });
        var note = $('#cdNote');
        if (note) note.textContent = 'Hari bahagia telah tiba. Terima kasih atas doa Anda.';
        return;
      }
      var sec = Math.floor(diff / 1000);
      var days = Math.floor(sec / 86400); sec -= days * 86400;
      var hours = Math.floor(sec / 3600); sec -= hours * 3600;
      var mins = Math.floor(sec / 60); sec -= mins * 60;
      var vals = { days: days, hours: hours, mins: mins, secs: sec };
      nums.forEach(function (n) {
        var k = n.getAttribute('data-cd');
        n.textContent = String(vals[k] == null ? 0 : vals[k]).padStart(2, '0');
      });
    }
    tick();
    clockTimer = setInterval(tick, 1000);
  }

  function observeReveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach(function (x) { x.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    items.forEach(function (x) { io.observe(x); });
  }

  function observeDock() {
    var dock = $('#dock');
    if (!dock || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        $$('[data-dock]', dock).forEach(function (b) {
          b.classList.toggle('active', b.getAttribute('data-dock') === e.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('[data-dock]', dock).forEach(function (b) {
      var sec = document.getElementById(b.getAttribute('data-dock'));
      if (sec) io.observe(sec);
    });
  }

  function observeSections() {
    if (!('IntersectionObserver' in window)) return;
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || seen[e.target.id]) return;
        seen[e.target.id] = true;
        track('section', e.target.id.replace(/^sec-/, ''));
        io.unobserve(e.target);
      });
    }, { rootMargin: '-35% 0px -45% 0px' });
    $$('main.site > section[id]').forEach(function (s) { io.observe(s); });
  }

  /* ---------- Musik ---------- */
  function updateMusicBtn() {
    var b = $('#musicBtn');
    if (!b) return;
    b.classList.toggle('playing', music.on);
    b.setAttribute('aria-pressed', music.on ? 'true' : 'false');
    b.title = music.on ? 'Matikan musik' : 'Nyalakan musik';
  }
  function note(freq, dur) {
    if (!music.ac || !music.master) return;
    var t = music.ac.currentTime;
    var o = music.ac.createOscillator();
    var gn = music.ac.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(0.1, t + 0.03);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 3.2));
    o.connect(gn); gn.connect(music.master);
    o.start(t); o.stop(t + (dur || 3.4) + 0.1);
  }
  function startMusic() {
    if (music.on) return;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    clearTimeout(music.stopTimer);
    try {
      music.ac = new Ctor();
      if (music.ac.state === 'suspended') music.ac.resume();
      var master = music.ac.createGain();
      master.gain.value = 0.0001;
      master.gain.exponentialRampToValueAtTime(0.055, music.ac.currentTime + 2.2);
      var filter = music.ac.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 1100;
      filter.connect(master); master.connect(music.ac.destination);
      music.master = master;
      [196, 247.5, 294].forEach(function (f) {
        var o = music.ac.createOscillator();
        var gn = music.ac.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        gn.gain.value = 0.07;
        o.connect(gn); gn.connect(filter); o.start();
      });
      var scale = [523.25, 587.33, 659.25, 783.99, 880];
      var tick = 0;
      music.timer = setInterval(function () {
        if (!music.on) return;
        note(scale[tick % scale.length] * (tick % 8 < 4 ? 1 : 0.5), 3.6);
        tick++;
      }, 4600);
      setTimeout(function () { if (music.on) note(659.25, 4); }, 900);
      music.on = true;
      updateMusicBtn();
    } catch (e) {
      music.on = false;
      updateMusicBtn();
    }
  }
  function stopMusic() {
    if (!music.on) return;
    music.on = false;
    clearInterval(music.timer);
    var oldAC = music.ac;
    try {
      if (music.master && oldAC) music.master.gain.exponentialRampToValueAtTime(0.0001, oldAC.currentTime + 0.4);
    } catch (e) { /* noop */ }
    music.master = null;
    music.ac = null;
    clearTimeout(music.stopTimer);
    music.stopTimer = setTimeout(function () {
      try { if (oldAC) oldAC.close(); } catch (e) { /* noop */ }
    }, 520);
    updateMusicBtn();
  }

  /* ---------- Buka undangan ---------- */
  function openInvitation(silent) {
    if (state.opened) return;
    state.opened = true;
    document.body.classList.remove('locked');
    document.body.classList.add('opened');
    if (g.U3DScene) { try { g.U3DScene.open(); } catch (e) { /* noop */ } }
    if (plugins.music) startMusic();
    track('open');
    if (!silent) toast('Selamat datang di undangan kami');
  }

  function toast(msg) {
    var el = $('#invToast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('on'); }, 2800);
  }

  /* ---------- Lightbox ---------- */
  function openLightbox(src, cap) {
    var lb = $('#lightbox');
    if (!lb) return;
    var img = $('#lbImg');
    if (img) img.src = src;
    var c = $('#lbCap');
    if (c) c.textContent = cap || '';
    lb.classList.add('on');
  }
  function closeLightbox() {
    var lb = $('#lightbox');
    if (lb) lb.classList.remove('on');
  }

  /* ---------- RSVP & ucapan ---------- */
  function guestRecord() {
    if (!GKEY) return null;
    var d = demoRead();
    return d.guests.find(function (x) { return x.key === GKEY; }) || null;
  }

  function demoRsvp(o) {
    var d = demoRead();
    var guest = guestRecord();
    if (GKEY) {
      if (!guest) throw new Error('Kunci tamu tidak dikenali. Minta ulang link kepada panitia.');
      if (CODE && String(guest.code) !== String(CODE)) throw new Error('Kode check-in tidak cocok.');
      o.name = guest.name;
    }
    if (!o.name) throw new Error('Nama wajib diisi.');
    var key = guest ? guest.key : '';
    var idx = d.rsvp.findIndex(function (x) {
      return key ? x.key === key : (!x.key && slugify(x.name) === slugify(o.name));
    });
    var rec = {
      time: nowISO(), name: o.name, status: o.status, count: o.count,
      msg: o.msg || '', key: key, verified: !!key
    };
    if (idx >= 0) d.rsvp[idx] = rec; else d.rsvp.push(rec);
    demoSave(d);
    return rec;
  }

  function demoWish(o) {
    var d = demoRead();
    var guest = guestRecord();
    if (GKEY) {
      if (!guest) throw new Error('Kunci tamu tidak dikenali. Minta ulang link kepada panitia.');
      if (CODE && String(guest.code) !== String(CODE)) throw new Error('Kode check-in tidak cocok.');
      o.name = guest.name;
    }
    if (!o.name) throw new Error('Nama wajib diisi.');
    if (!o.msg) throw new Error('Ucapan tidak boleh kosong.');
    var rec = {
      time: nowISO(), name: o.name, status: 'Ucapan', count: '',
      msg: o.msg, key: guest ? guest.key : '', verified: !!guest
    };
    d.wishes.push(rec);
    demoSave(d);
    return rec;
  }

  async function submitRsvp(form) {
    var fd = new FormData(form);
    var o = {
      name: cap(fd.get('name'), 80),
      status: String(fd.get('status') || 'Hadir'),
      count: Math.max(1, Math.min(20, num(fd.get('count')) || 1)),
      msg: cap(fd.get('msg'), 300)
    };
    var msgEl = $('#rsvpMsg');
    if (!o.name) { if (msgEl) msgEl.textContent = 'Nama wajib diisi.'; return; }
    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = icon('send') + 'Mengirim…'; }
    try {
      if (demo) demoRsvp(o);
      else await apiCall('rsvp.add', { name: o.name, status: o.status, count: o.count, msg: o.msg, key: GKEY, code: CODE });
      var card = form.closest('.form-card');
      if (card) {
        card.innerHTML = '<div class="rsvp-success"><div class="ok-ring">' + icon('check') + '</div>' +
          '<h4>Terima kasih, ' + esc(o.name) + '</h4>' +
          '<p>' + (o.status === 'Hadir' ? 'Konfirmasi kehadiran Anda telah kami terima. Sampai jumpa di hari bahagia!' : 'Konfirmasi Anda telah kami terima. Terima kasih atas doa dan perhatiannya.') + '</p></div>';
      }
      toast('Konfirmasi terkirim');
    } catch (e) {
      if (msgEl) msgEl.textContent = e.message || 'Gagal mengirim konfirmasi.';
      if (btn) { btn.disabled = false; btn.innerHTML = icon('send') + 'Kirim konfirmasi'; }
    }
  }

  async function submitWish(form) {
    var fd = new FormData(form);
    var o = { name: cap(fd.get('name'), 80), msg: cap(fd.get('msg'), 600) };
    var msgEl = $('#wishMsg');
    if (!o.name) { if (msgEl) msgEl.textContent = 'Nama wajib diisi.'; return; }
    if (!o.msg) { if (msgEl) msgEl.textContent = 'Ucapan tidak boleh kosong.'; return; }
    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = icon('send') + 'Mengirim…'; }
    try {
      var rec;
      if (demo) rec = demoWish(o);
      else {
        var r = await apiCall('wish.add', { name: o.name, msg: o.msg, key: GKEY, code: CODE });
        rec = r.wish || { time: nowISO(), name: o.name, msg: o.msg, status: 'Ucapan', verified: !!GKEY };
      }
      state.wishes.unshift(rec);
      var list = $('#wishList');
      if (list) list.innerHTML = wishListHtml();
      form.reset();
      if (TO) { var n = form.querySelector('input[name="name"]'); if (n) n.value = TO; }
      toast('Ucapan terkirim. Terima kasih!');
    } catch (e) {
      if (msgEl) msgEl.textContent = e.message || 'Gagal mengirim ucapan.';
    }
    if (btn) { btn.disabled = false; btn.innerHTML = icon('send') + 'Kirim ucapan'; }
  }

  /* ---------- Admin ---------- */
  function renderAdminBody() {
    var body = $('#adBody');
    if (!body) return;
    var sub = $('#adSub');
    if (sub) sub.textContent = state.admin ? (state.admin.name || 'Panitia') : 'Masuk untuk mengelola tamu';
    if (!state.admin) { body.innerHTML = adLoginHtml(); bindAdminBody(); updateLiveLabel(); return; }
    body.innerHTML = adPanelHtml();
    bindAdminBody();
    updateLiveLabel();
  }

  function adLoginHtml() {
    return '<div class="ad-login">' +
      '<div class="ad-lock">' + icon('lock') + '</div>' +
      '<h3>Akses Panitia</h3>' +
      '<p>Masukkan kunci admin untuk membuka daftar tamu, RSVP, ucapan, dan check-in.</p>' +
      '<div class="field"><label>Kunci admin</label><input class="input" id="adKey" type="password" autocomplete="current-password" placeholder="Kunci rahasia" spellcheck="false"></div>' +
      '<button class="btn-primary" id="adLoginBtn" type="button" style="margin-top:12px">' + icon('key') + 'Masuk</button>' +
      '<p class="ad-hint">' + (demo ? 'Mode demo · kunci bawaan <b>admin123</b>' : 'Kunci dibuat di menu Akses Admin platform.') + '</p>' +
      '<p class="form-msg" id="adMsg"></p>' +
      '</div>';
  }

  function stats() {
    var d = state.data;
    return {
      guests: (d.guests || []).length,
      rsvp: (d.rsvp || []).length,
      hadir: (d.hadir || []).length,
      wishes: (d.wishes || []).length
    };
  }

  function refreshAdminStats() {
    var box = $('#adBody .ad-stats');
    if (!box) return;
    var s = stats();
    var vals = [s.guests, s.rsvp, s.hadir, s.wishes];
    Array.prototype.forEach.call(box.querySelectorAll('b'), function (b, i) {
      if (typeof vals[i] === 'number') b.textContent = vals[i];
    });
  }

  /* ---------- Sinkronisasi panel (real-time) ---------- */
  function timeAgo(ts) {
    if (!ts) return 'menunggu';
    var s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 15) return 'baru saja';
    if (s < 60) return s + ' detik lalu';
    var m = Math.round(s / 60);
    if (m < 60) return m + ' menit lalu';
    return Math.round(m / 60) + ' jam lalu';
  }

  function dataCounts() {
    var d = state.data || {};
    return {
      guests: (d.guests || []).length, rsvp: (d.rsvp || []).length,
      wishes: (d.wishes || []).length, hadir: (d.hadir || []).length
    };
  }

  function updateLiveLabel(syncing, failed) {
    var el = $('#adLive');
    if (!el) return;
    el.style.display = state.admin && state.opened ? '' : 'none';
    el.classList.toggle('sync', !!syncing);
    el.classList.toggle('err', !!failed);
    var txt = el.querySelector('span');
    if (txt) txt.textContent = syncing ? 'Sinkron…' : (failed ? 'Terputus' : 'LIVE · ' + timeAgo(state.lastSync));
    el.title = failed ? 'Sinkronisasi gagal. Mencoba lagi otomatis.' : 'Data panitia tersinkron otomatis setiap 15 detik.';
  }

  function adminTyping() {
    var body = $('#adBody');
    var el = document.activeElement;
    return !!(body && el && body.contains(el) && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  }

  function softRenderAdmin() {
    if (adminTyping()) { refreshAdminStats(); return; }
    renderAdminBody();
  }

  function stopAdminLive() {
    clearInterval(adminTimer);
    adminTimer = 0;
  }

  function startAdminLive() {
    stopAdminLive();
    if (!state.admin) return;
    updateLiveLabel();
    adminTimer = setInterval(liveTick, 15000);
  }

  async function liveTick() {
    if (!state.admin || state.syncing || document.hidden) return;
    var before = dataCounts();
    state.syncing = true;
    updateLiveLabel(true);
    try {
      if (demo) {
        var d = demoRead();
        state.data = { guests: d.guests, rsvp: d.rsvp, wishes: d.wishes, hadir: d.hadir };
      } else {
        await loadAdminData();
      }
      state.lastSync = Date.now();
      var after = dataCounts();
      var news = [];
      if (after.rsvp > before.rsvp) news.push('RSVP baru');
      if (after.wishes > before.wishes) news.push('ucapan baru');
      if (after.hadir > before.hadir) news.push('check-in baru');
      if (after.guests > before.guests) news.push('tamu baru');
      if (news.length) {
        softRenderAdmin();
        toast(news.join(' · ') + ' masuk');
      } else if (after.rsvp !== before.rsvp || after.wishes !== before.wishes || after.hadir !== before.hadir || after.guests !== before.guests) {
        softRenderAdmin();
      }
      if (state.adTab === 'notifs') await loadAdminNotifs(true);
      updateLiveLabel(false, false);
    } catch (e) {
      updateLiveLabel(false, true);
    }
    state.syncing = false;
  }

  function adPanelHtml() {
    var s = stats();
    var tabs = [
      ['overview', 'Ringkasan'], ['guests', 'Tamu'], ['rsvp', 'RSVP'], ['wishes', 'Ucapan'], ['checkin', 'Check-in'], ['notifs', 'Notifikasi']
    ];
    return '<div class="ad-user"><span class="au-av">' + esc(initials(state.admin.name)) + '</span>' +
      '<div><b>' + esc(state.admin.name || 'Panitia') + '</b><small>' + esc((state.admin.role || 'admin') + ' · ' + (state.admin.project || cfg.slug)) + '</small></div>' +
      '<button type="button" data-ad="logout">Keluar</button></div>' +
      '<div class="ad-stats">' +
      '<div class="ad-stat"><b>' + s.guests + '</b><span>Tamu</span></div>' +
      '<div class="ad-stat"><b>' + s.rsvp + '</b><span>RSVP</span></div>' +
      '<div class="ad-stat"><b>' + s.hadir + '</b><span>Hadir</span></div>' +
      '<div class="ad-stat"><b>' + s.wishes + '</b><span>Ucapan</span></div>' +
      '</div>' +
      '<div class="ad-tabs">' + tabs.map(function (t) {
        return '<button type="button" class="ad-tab' + (state.adTab === t[0] ? ' active' : '') + '" data-ad-tab="' + t[0] + '">' + esc(t[1]) + '</button>';
      }).join('') + '</div>' +
      '<div class="ad-panel">' + adTabHtml() + '</div>';
  }

  function adTabHtml() {
    if (state.adTab === 'guests') return adGuestsHtml();
    if (state.adTab === 'rsvp') return adRsvpHtml();
    if (state.adTab === 'wishes') return adWishesHtml();
    if (state.adTab === 'checkin') return adCheckinHtml();
    if (state.adTab === 'notifs') return adNotifsHtml();
    return adOverviewHtml();
  }

  function adOverviewHtml() {
    var recent = (state.data.hadir || []).slice(-5).reverse();
    return '<p class="ad-note">' + icon('db') + ' ' + (demo ? 'Mode demo — data tersimpan di browser ini dan disegarkan tiap 15 detik.' : 'Terhubung ke Google Sheets. Statistik dan daftar RSVP disinkronkan otomatis setiap 15 detik.') + '</p>' +
      '<div class="ad-toolbar"><button class="btn-ghost" type="button" data-ad-action="checkin">' + icon('qr') + 'Buka check-in</button>' +
      '<span class="spacer"></span><button class="btn-ghost" type="button" data-ad-export="guests">' + icon('download') + 'CSV tamu</button>' +
      '<button class="btn-ghost" type="button" data-ad-export="hadir">' + icon('download') + 'CSV kehadiran</button></div>' +
      '<div class="ad-list">' + (recent.length ? recent.map(function (h) {
        return '<div class="ad-row"><div class="ad-row-main"><b>' + esc(h.name || 'Tamu') + '</b><small>Check-in ' + esc(fmtTime(h.time) || '—') + ' · ' + esc(h.mode || 'Kode') + '</small></div><span class="ad-chip">' + esc(h.code || '') + '</span></div>';
      }).join('') : '<div class="ad-empty">Belum ada tamu yang check-in.<br>Gunakan tab Check-in saat hari acara.</div>') + '</div>' +
      '<p class="ad-note">' + icon('info') + ' Bagikan link personal tamu dari tab Tamu agar nama dan kode check-in otomatis terisi.</p>';
  }

  function guestLink(g) {
    var u;
    try { u = new URL(location.origin + location.pathname); } catch (e) { return ''; }
    if (PREVIEW) { u.searchParams.set('preview', '1'); u.searchParams.set('id', cfg.id); }
    else if (cfg.apiUrl) { u.searchParams.set('s', cfg.slug); u.searchParams.set('api', cfg.apiUrl); }
    u.searchParams.set('to', g.name || '');
    u.searchParams.set('key', g.key || '');
    u.searchParams.set('code', g.code || '');
    return u.toString();
  }

  function adGuestsHtml() {
    var guests = state.data.guests || [];
    return '<form class="ad-form" id="adGuestForm">' +
      '<div class="row"><input class="input" name="name" placeholder="Nama tamu / keluarga" maxlength="80" required><input class="input" name="wa" placeholder="No. WhatsApp" maxlength="20"></div>' +
      '<label class="ad-check"><input type="checkbox" name="notify"> Kirim notifikasi WhatsApp otomatis</label>' +
      '<button class="btn-primary" type="submit">' + icon('user') + 'Tambah tamu</button>' +
      '</form>' +
      '<div class="ad-list">' + (guests.length ? guests.map(function (x) {
        var link = guestLink(x);
        return '<div class="ad-row"><div class="ad-row-main"><b>' + esc(x.name) + '</b><small><span class="ad-chip">' + esc(x.key || '') + '</span> · kode <span class="ad-chip">' + esc(x.code || '') + '</span>' + (x.wa ? ' · ' + esc(x.wa) : '') + '</small></div>' +
          (link ? '<button class="ic" type="button" data-ad-copy="' + attr(link) + '" title="Salin link undangan">' + icon('copy') + '</button>' : '') +
          '<button class="ic" type="button" data-ad-del="' + attr(x.key || '') + '" data-name="' + attr(x.name || '') + '" title="Hapus tamu">' + icon('trash') + '</button></div>';
      }).join('') : '<div class="ad-empty">Belum ada tamu. Tambahkan tamu untuk membuat link personal.</div>') + '</div>';
  }

  function adRsvpHtml() {
    var list = (state.data.rsvp || []).slice().reverse();
    var f = state.rsvpFilter;
    if (f !== 'semua') list = list.filter(function (x) { return String(x.status) === f; });
    return '<div class="ad-toolbar"><select class="ad-select" id="adRsvpFilter">' +
      ['semua', 'Hadir', 'Tidak Hadir', 'Belum Pasti'].map(function (v) {
        return '<option value="' + attr(v) + '"' + (f === v ? ' selected' : '') + '>' + (v === 'semua' ? 'Semua konfirmasi' : esc(v)) + '</option>';
      }).join('') + '</select><span class="spacer"></span><button class="btn-ghost" type="button" data-ad-export="rsvp">' + icon('download') + 'CSV</button></div>' +
      '<div class="ad-list">' + (list.length ? list.map(function (x) {
        return '<div class="ad-row"><div class="ad-row-main"><b>' + esc(x.name || 'Tamu') + '</b><small>' + esc(x.status || '—') + (x.count ? ' · ' + num(x.count) + ' orang' : '') + ' · ' + esc(fmtTime(x.time) || '—') + (x.msg ? '<br>' + esc(x.msg) : '') + '</small></div>' +
          '<button class="ic" type="button" data-ad-del-rsvp="' + attr(x.key || '') + '" data-name="' + attr(x.name || '') + '" data-time="' + attr(x.time || '') + '" title="Hapus RSVP">' + icon('trash') + '</button></div>';
      }).join('') : '<div class="ad-empty">Belum ada konfirmasi kehadiran.</div>') + '</div>';
  }

  function adWishesHtml() {
    var list = (state.data.wishes || []).slice().reverse();
    return '<div class="ad-toolbar"><span class="ad-note">' + list.length + ' ucapan masuk</span><span class="spacer"></span><button class="btn-ghost" type="button" data-ad-export="wishes">' + icon('download') + 'CSV</button></div>' +
      '<div class="ad-list">' + (list.length ? list.map(function (x) {
        return '<div class="ad-row"><div class="ad-row-main"><b>' + esc(x.name || 'Tamu') + '</b><small>' + esc(fmtTime(x.time) || '—') + (x.verified ? ' · terverifikasi' : '') + '<br>' + esc(x.msg || '') + '</small></div>' +
          '<button class="ic" type="button" data-ad-del-wish="' + attr(x.key || '') + '" data-name="' + attr(x.name || '') + '" data-time="' + attr(x.time || '') + '" title="Hapus ucapan">' + icon('trash') + '</button></div>';
      }).join('') : '<div class="ad-empty">Belum ada ucapan.</div>') + '</div>';
  }

  function adCheckinHtml() {
    var recent = (state.data.hadir || []).slice().reverse().slice(0, 12);
    return '<div class="ad-scan"><div class="row">' +
      '<input class="input" id="adCode" inputmode="numeric" maxlength="4" placeholder="Kode 4 digit" autocomplete="off">' +
      '<button class="btn-primary" id="adCheckinBtn" type="button">' + icon('check') + 'Check-in</button></div>' +
      '<div class="ad-result" id="adResult"></div></div>' +
      '<div class="ad-toolbar"><span class="ad-note">' + recent.length + ' check-in terakhir</span><span class="spacer"></span>' +
      '<button class="btn-ghost" type="button" data-ad-export="guests">' + icon('download') + 'CSV tamu</button>' +
      '<button class="btn-ghost" type="button" data-ad-export="hadir">' + icon('download') + 'CSV hadir</button></div>' +
      '<div class="ad-list">' + (recent.length ? recent.map(function (h) {
        return '<div class="ad-row"><div class="ad-row-main"><b>' + esc(h.name || 'Tamu') + '</b><small>' + esc(fmtTime(h.time) || '—') + ' · ' + esc(h.mode || 'Kode') + '</small></div><span class="ad-chip">' + esc(h.code || '') + '</span></div>';
      }).join('') : '<div class="ad-empty">Belum ada yang check-in.</div>') + '</div>' +
      '<p class="ad-note">Minta kode 4 digit dari tamu, lalu tekan Check-in. Satu tamu hanya dapat check-in sekali.</p>';
  }

  function adNotifsHtml() {
    var list = state.notifs || [];
    var labels = { sent: 'Terkirim', failed: 'Gagal', 'dry-run': 'Dry run', skip: 'Dilewati' };
    var body;
    if (state.notifLoading) body = '<div class="ad-empty">Memuat notifikasi…</div>';
    else if (state.notifMsg) body = '<div class="ad-empty">' + esc(state.notifMsg) + '</div>';
    else if (!list.length) body = '<div class="ad-empty">Belum ada notifikasi untuk proyek ini.</div>';
    else body = list.map(function (n) {
      var st = String(n.status || '');
      var cls = st === 'sent' ? 'ok' : st === 'failed' ? 'err' : st === 'dry-run' ? 'dry' : 'skip';
      var isAdmin = String(n.type || 'tamu') === 'admin';
      return '<div class="ad-row"><div class="ad-row-main"><b>' + esc(n.name || (isAdmin ? 'Panitia' : 'Tamu')) + '</b><small>' +
        (isAdmin ? 'Panitia' : 'Tamu') + ' · ' + esc(n.to || '—') + ' · ' + esc(fmtTime(n.time) || '—') +
        (n.detail ? '<br>' + esc(String(n.detail).slice(0, 180)) : '') + '</small></div>' +
        '<span class="ad-chip n-' + cls + '">' + esc(labels[st] || 'Dilewati') + '</span>' +
        (!isAdmin && n.key ? '<button class="ic" type="button" data-ad-notif-resend="' + attr(n.key) + '" data-name="' + attr(n.name || '') + '" title="Kirim ulang">' + icon('refresh') + '</button>' : '') + '</div>';
    }).join('');
    return '<div class="ad-toolbar"><span class="ad-note">' + list.length + ' notifikasi · khusus ' + esc(cfg.slug) + '</span><span class="spacer"></span>' +
      '<button class="btn-ghost" type="button" data-ad-refresh-notifs>' + icon('refresh') + 'Muat ulang</button>' +
      '<button class="btn-ghost" type="button" data-ad-export="notifs">' + icon('download') + 'CSV</button></div>' +
      '<div class="ad-list">' + body + '</div>' +
      '<p class="ad-note">' + icon('db') + ' Database notifikasi terpisah per website. Semua admin proyek ini melihat data yang sama; admin proyek lain tidak dapat mengaksesnya.</p>';
  }

  async function loadAdminNotifs(silent) {
    if (!state.admin) return;
    if (!silent) state.notifLoading = true;
    state.notifMsg = '';
    if (!silent && state.adTab === 'notifs') {
      var p0 = $('.ad-panel');
      if (p0) p0.innerHTML = adNotifsHtml();
    }
    if (demo) {
      var d = demoRead();
      state.notifs = (d.notifs || []).slice().reverse();
    } else {
      try {
        var r = await apiCall('notif.list', {}, { admin: true });
        state.notifs = (r.notifications || []).slice();
      } catch (e) {
        state.notifs = [];
        state.notifMsg = e.message || 'Gagal memuat notifikasi.';
      }
    }
    state.notifLoading = false;
    if (state.adTab === 'notifs') {
      var panel = $('.ad-panel');
      if (panel) panel.innerHTML = adNotifsHtml();
    }
  }

  async function resendNotif(key) {
    if (!key) { toast('Kunci tamu tidak tersedia'); return; }
    try {
      if (demo) {
        var d = demoRead();
        var hit = (d.notifs || []).find(function (x) { return x.key === key; });
        if (!hit) throw new Error('Notifikasi tamu tidak ditemukan.');
        hit.time = nowISO();
        hit.status = 'dry-run';
        hit.detail = 'Mode demo: notifikasi disimulasikan ulang.';
        demoSave(d);
        state.notifs = d.notifs.slice().reverse();
        renderAdminBody();
        toast('Notifikasi disimulasikan ulang');
      } else {
        var r = await apiCall('notif.resend', { key: key }, { admin: true });
        var sent = !!(r.result && r.result.sent);
        toast(sent ? 'Notifikasi dikirim ulang' : ('Belum terkirim: ' + ((r.result && r.result.reason) || 'periksa gateway')));
        await loadAdminNotifs();
      }
    } catch (e) { toast(e.message || 'Gagal mengirim ulang notifikasi'); }
  }

  function bindAdminBody() {
    var body = $('#adBody');
    if (!body) return;
    var login = $('#adLoginBtn');
    if (login) {
      login.onclick = function () { doLogin(); };
      var inp = $('#adKey');
      if (inp) inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); doLogin(); } };
    }
    var gf = $('#adGuestForm');
    if (gf) gf.onsubmit = function (e) { e.preventDefault(); addGuestAdmin(gf); };
    var cb = $('#adCheckinBtn');
    if (cb) cb.onclick = function () { checkin(); };
    var ci = $('#adCode');
    if (ci) {
      ci.oninput = function () { ci.value = ci.value.replace(/[^0-9]/g, '').slice(0, 4); };
      ci.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); checkin(); } };
    }
    var rf = $('#adRsvpFilter');
    if (rf) rf.onchange = function () { state.rsvpFilter = rf.value; renderAdminBody(); };
  }

  async function doLogin(keyArg) {
    var inp = $('#adKey');
    var key = String(keyArg || (inp ? inp.value : '') || '').trim();
    var msg = $('#adMsg');
    if (!key) { if (msg) msg.textContent = 'Kunci admin wajib diisi.'; return; }
    var btn = $('#adLoginBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = icon('key') + 'Memeriksa…'; }
    try {
      if (demo) {
        var d = demoRead();
        var a = d.admins.find(function (x) { return x.key === key && x.active !== false && (x.project === cfg.slug || x.project === '*'); });
        if (!a) throw new Error('Kunci admin tidak dikenali.');
        state.admin = a;
        state.adminKey = key;
        state.data = { guests: d.guests, rsvp: d.rsvp, wishes: d.wishes, hadir: d.hadir };
      } else {
        var r = await apiCall('admin.login', { key: key });
        state.admin = r.admin || { name: 'Panitia', role: 'admin', project: cfg.slug };
        state.adminKey = key;
        await loadAdminData();
      }
      state.adTab = 'overview';
      state.lastSync = Date.now();
      renderAdminBody();
      startAdminLive();
      loadAdminNotifs();
      toast('Selamat datang, ' + (state.admin.name || 'Panitia'));
    } catch (e) {
      if (msg) msg.textContent = e.message || 'Gagal masuk.';
      if (btn) { btn.disabled = false; btn.innerHTML = icon('key') + 'Masuk'; }
    }
  }

  async function loadAdminData() {
    var r = await apiCall('admin.data', {}, { admin: true });
    state.data = {
      guests: r.guests || [], rsvp: r.rsvp || [],
      wishes: r.wishes || [], hadir: r.hadir || []
    };
    state.lastSync = Date.now();
  }

  async function addGuestAdmin(form) {
    var fd = new FormData(form);
    var name = cap(fd.get('name'), 80);
    var wa = cap(fd.get('wa'), 20);
    var notify = !!fd.get('notify');
    if (!name) { toast('Nama tamu wajib diisi'); return; }
    if (notify && !wa) {
      toast('Nomor WhatsApp wajib diisi untuk notifikasi');
      var waInput = form.querySelector('[name="wa"]');
      if (waInput) waInput.focus();
      return;
    }
    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = icon('user') + 'Menyimpan…'; }
    try {
      var note = '';
      if (demo) {
        var d = demoRead();
        if (d.guests.some(function (x) { return slugify(x.name) === slugify(name); })) throw new Error('Nama tamu sudah ada.');
        var code;
        do { code = String(Math.floor(1000 + Math.random() * 9000)); }
        while (d.guests.some(function (x) { return String(x.code) === code; }));
        var g = { name: name, key: slugify(name) + '-' + Math.random().toString(36).slice(2, 5), code: code, wa: wa, time: nowISO() };
        d.guests.push(g);
        if (notify) {
          d.notifs = d.notifs || [];
          d.notifs.push({ time: nowISO(), name: name, to: wa, status: 'dry-run', detail: 'Mode demo: notifikasi WhatsApp disimulasikan.', type: 'tamu', key: g.key });
          state.notifs = d.notifs.slice().reverse();
          note = ' · notifikasi disimulasikan';
        }
        demoSave(d);
        state.data.guests = d.guests;
      } else {
        var r = await apiCall('guest.add', { name: name, wa: wa, notify: notify }, { admin: true });
        await loadAdminData();
        if (notify) {
          note = r.notified ? ' · notifikasi terkirim' : ' · notifikasi belum terkirim';
          await loadAdminNotifs();
        }
      }
      form.reset();
      renderAdminBody();
      toast('Tamu ditambahkan: ' + name + note);
    } catch (e) {
      toast(e.message || 'Gagal menambah tamu');
      if (btn) { btn.disabled = false; btn.innerHTML = icon('user') + 'Tambah tamu'; }
    }
  }

  async function deleteGuestAdmin(key, name) {
    if (!key) { toast('Kunci tamu tidak tersedia'); return; }
    if (!confirm('Hapus tamu "' + name + '"? Link dan kode check-in tidak akan berlaku lagi.')) return;
    try {
      if (demo) {
        var d = demoRead();
        d.guests = d.guests.filter(function (x) { return x.key !== key; });
        demoSave(d);
        state.data.guests = d.guests;
      } else {
        await apiCall('guest.delete', { key: key }, { admin: true });
        await loadAdminData();
      }
      renderAdminBody();
      toast('Tamu dihapus: ' + name);
    } catch (e) { toast(e.message || 'Gagal menghapus tamu'); }
  }

  async function deleteRsvpAdmin(key, name, time) {
    if (!confirm('Hapus konfirmasi dari "' + name + '"?')) return;
    try {
      if (demo) {
        var d = demoRead();
        d.rsvp = d.rsvp.filter(function (x) { return key ? x.key !== key : !(x.name === name && String(x.time) === String(time)); });
        demoSave(d);
        state.data.rsvp = d.rsvp;
      } else {
        await apiCall('rsvp.delete', { key: key, name: name, time: time }, { admin: true });
        await loadAdminData();
      }
      renderAdminBody();
      toast('RSVP dihapus');
    } catch (e) { toast(e.message || 'Gagal menghapus RSVP'); }
  }

  async function deleteWishAdmin(key, name, time) {
    if (!confirm('Hapus ucapan dari "' + name + '"?')) return;
    try {
      if (demo) {
        var d = demoRead();
        d.wishes = d.wishes.filter(function (x) { return key ? x.key !== key : !(x.name === name && String(x.time) === String(time)); });
        demoSave(d);
        state.data.wishes = d.wishes;
        state.wishes = d.wishes.slice().reverse();
      } else {
        await apiCall('wish.delete', { key: key, name: name, time: time }, { admin: true });
        await loadAdminData();
      }
      var list = $('#wishList');
      if (list) list.innerHTML = wishListHtml();
      renderAdminBody();
      toast('Ucapan dihapus');
    } catch (e) { toast(e.message || 'Gagal menghapus ucapan'); }
  }

  function showAdResult(text, good) {
    var el = $('#adResult');
    if (!el) return;
    el.className = 'ad-result on ' + (good ? 'ok' : 'err');
    el.textContent = text;
  }

  async function checkin() {
    var inp = $('#adCode');
    var code = String(inp ? inp.value : '').replace(/[^0-9]/g, '').slice(0, 4);
    if (code.length !== 4) { showAdResult('Masukkan kode 4 digit.', false); return; }
    var btn = $('#adCheckinBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = icon('qr') + 'Memeriksa…'; }
    try {
      if (demo) {
        var d = demoRead();
        var guest = d.guests.find(function (x) { return String(x.code) === code; });
        if (!guest) throw new Error('Kode tidak dikenali. Periksa kembali.');
        if (d.hadir.some(function (x) { return x.key === guest.key; })) throw new Error(guest.name + ' sudah check-in.');
        d.hadir.push({ name: guest.name, key: guest.key, code: code, time: nowISO(), mode: 'Kode' });
        demoSave(d);
        state.data.hadir = d.hadir;
        showAdResult('Check-in berhasil · ' + guest.name, true);
      } else {
        var r = await apiCall('checkin', { code: code }, { admin: true });
        var gname = r.guest && r.guest.name ? r.guest.name : 'Tamu';
        showAdResult('Check-in berhasil · ' + gname, true);
        await loadAdminData();
      }
      if (inp) inp.value = '';
      var recent = (state.data.hadir || []).slice().reverse().slice(0, 12);
      var panel = $('.ad-panel');
      if (panel) panel.innerHTML = adCheckinHtml();
      bindAdminBody();
      refreshAdminStats();
      var res = $('#adResult');
      if (res) {
        res.className = 'ad-result on ok';
        res.textContent = 'Check-in berhasil · ' + ((state.data.hadir || []).slice(-1)[0] || {}).name;
      }
      var sub = $('#adSub');
      if (sub) sub.textContent = state.admin.name || 'Panitia';
    } catch (e) {
      showAdResult(e.message || 'Gagal check-in.', false);
      if (btn) { btn.disabled = false; btn.innerHTML = icon('check') + 'Check-in'; }
      return;
    }
  }

  function csv(rows) {
    return '\uFEFF' + rows.map(function (r) {
      return r.map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\r\n');
  }
  function download(name, text) {
    try {
      var blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
    } catch (e) { toast('Gagal mengunduh'); }
  }
  function exportAdmin(kind) {
    var d = state.data;
    if (kind === 'guests') {
      download('tamu-' + cfg.slug + '.csv', csv([['Nama', 'WhatsApp', 'Kunci', 'Kode', 'Link']].concat((d.guests || []).map(function (g) {
        return [g.name, g.wa || '', g.key || '', g.code || '', guestLink(g)];
      }))));
    } else if (kind === 'hadir') {
      download('kehadiran-' + cfg.slug + '.csv', csv([['Nama', 'Kunci', 'Kode', 'Waktu', 'Metode']].concat((d.hadir || []).map(function (h) {
        return [h.name, h.key || '', h.code || '', h.time || '', h.mode || 'Kode'];
      }))));
    } else if (kind === 'rsvp') {
      download('rsvp-' + cfg.slug + '.csv', csv([['Nama', 'Status', 'Jumlah', 'Pesan', 'Waktu']].concat((d.rsvp || []).map(function (r) {
        return [r.name, r.status || '', r.count || '', r.msg || '', r.time || ''];
      }))));
    } else if (kind === 'notifs') {
      download('notifikasi-' + cfg.slug + '.csv', csv([['Waktu', 'Jenis', 'Nama', 'Tujuan', 'Status', 'Detail']].concat((state.notifs || []).map(function (n) {
        return [n.time || '', n.type === 'admin' ? 'Panitia' : 'Tamu', n.name || '', n.to || '', n.status || '', n.detail || ''];
      }))));
    } else {
      download('ucapan-' + cfg.slug + '.csv', csv([['Nama', 'Ucapan', 'Waktu']].concat((d.wishes || []).map(function (w) {
        return [w.name, w.msg || '', w.time || ''];
      }))));
    }
    toast('CSV diunduh');
  }

  function openAdmin(fromPlayground) {
    var drawer = $('#adminDrawer');
    if (!drawer) return;
    drawer.classList.add('open');
    state.adTab = state.adTab || 'overview';
    if (fromPlayground && !state.admin && demo) {
      doLogin('admin123').then(function () { /* render already */ });
      return;
    }
    renderAdminBody();
    startAdminLive();
    setTimeout(function () {
      var key = $('#adKey');
      if (key) key.focus();
    }, 120);
  }
  function closeAdmin() {
    var drawer = $('#adminDrawer');
    if (drawer) drawer.classList.remove('open');
    stopAdminLive();
  }

  /* ---------- Fokus plugin (playground) ---------- */
  function focusPlugin(id) {
    var wasOpen = state.opened;
    if (!wasOpen) openInvitation(true);
    if (!id) return;
    if (id === 'music') {
      if (!plugins.music) { toast('Plugin musik nonaktif'); return; }
      if (!wasOpen) { if (!music.on) startMusic(); toast('Musik dinyalakan'); return; }
      if (music.on) { stopMusic(); toast('Musik dimatikan'); }
      else { startMusic(); toast('Musik dinyalakan'); }
      return;
    }
    if (id === 'dark') {
      if (!plugins.dark) { toast('Plugin mode gelap nonaktif'); return; }
      setDark(!state.dark);
      return;
    }
    if (id === 'admin' || id === 'checkin') { openAdmin(true); return; }
    var map = {
      hero: 'sec-hero', countdown: 'sec-countdown', story: 'sec-story', gallery: 'sec-gallery',
      register: 'sec-register', rsvp: 'sec-rsvp', wishes: 'sec-wishes', maps: 'sec-events', gift: 'sec-gift', share: 'sec-share'
    };
    var sec = document.getElementById(map[id] || '');
    if (!sec) {
      var pl = g.U3DPlugins.get(id);
      toast('Plugin "' + (pl ? pl.name : id) + '" sedang nonaktif. Nyalakan dulu di playground.');
      return;
    }
    setTimeout(function () {
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      sec.classList.remove('flash');
      void sec.offsetWidth;
      sec.classList.add('flash');
      setTimeout(function () { sec.classList.remove('flash'); }, 1300);
    }, 260);
  }

  /* ---------- Copy ---------- */
  function copyText(text, msg) {
    var done = function () { toast(msg || 'Disalin'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('Gagal menyalin'); }
    ta.remove();
  }

  /* ---------- Bind ---------- */
  function bindAll() {
    var open = $('#openBtn');
    if (open) open.onclick = function () { openInvitation(false); };

    var mb = $('#musicBtn');
    if (mb) mb.onclick = function () { if (music.on) stopMusic(); else startMusic(); };
    var db = $('#darkBtn');
    if (db) db.onclick = function () { setDark(!state.dark); };
    var ab = $('#adminBtn');
    if (ab) ab.onclick = function () { openAdmin(false); };
    var ac = $('#adClose');
    if (ac) ac.onclick = closeAdmin;

    document.addEventListener('click', function (e) {
      var t = e.target;
      var dockBtn = t.closest ? t.closest('[data-dock]') : null;
      if (dockBtn) {
        var sec = document.getElementById(dockBtn.getAttribute('data-dock'));
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      var gal = t.closest ? t.closest('[data-gallery]') : null;
      if (gal) {
        track('gallery', gal.getAttribute('data-cap') || ('foto-' + (Number(gal.getAttribute('data-gallery')) + 1)));
        openLightbox(gal.getAttribute('data-src'), gal.getAttribute('data-cap'));
        return;
      }
      if (t.id === 'lightbox') { closeLightbox(); return; }
      if (t.closest && t.closest('#lbClose')) { closeLightbox(); return; }

      var cp = t.closest ? t.closest('[data-copy]') : null;
      if (cp) { copyText(cp.getAttribute('data-copy'), 'Disalin'); return; }
      if (t.closest && t.closest('[data-copy-share]')) { track('share', 'salin'); copyText(shareUrl(), 'Tautan disalin'); return; }
      var sh = t.closest ? t.closest('[data-track-share]') : null;
      if (sh) { track('share', sh.getAttribute('data-track-share') || 'lain'); return; }

      var tab = t.closest ? t.closest('[data-ad-tab]') : null;
      if (tab) {
        state.adTab = tab.getAttribute('data-ad-tab');
        renderAdminBody();
        if (state.adTab === 'notifs') loadAdminNotifs();
        return;
      }
      var act = t.closest ? t.closest('[data-ad-action]') : null;
      if (act) {
        if (act.getAttribute('data-ad-action') === 'checkin') { state.adTab = 'checkin'; renderAdminBody(); }
        return;
      }
      if (t.closest && t.closest('[data-ad-refresh-notifs]')) { loadAdminNotifs(); return; }
      var rs = t.closest ? t.closest('[data-ad-notif-resend]') : null;
      if (rs) { resendNotif(rs.getAttribute('data-ad-notif-resend')); return; }
      if (t.closest && t.closest('[data-ad="logout"]')) {
        stopAdminLive();
        state.admin = null; state.adminKey = ''; state.data = { guests: [], rsvp: [], wishes: [], hadir: [] };
        state.notifs = []; state.notifMsg = '';
        state.lastSync = 0;
        renderAdminBody();
        toast('Keluar dari panel panitia');
        return;
      }
      var del = t.closest ? t.closest('[data-ad-del]') : null;
      if (del) { deleteGuestAdmin(del.getAttribute('data-ad-del'), del.getAttribute('data-name') || 'Tamu'); return; }
      var delR = t.closest ? t.closest('[data-ad-del-rsvp]') : null;
      if (delR) { deleteRsvpAdmin(delR.getAttribute('data-ad-del-rsvp'), delR.getAttribute('data-name') || 'Tamu', delR.getAttribute('data-time') || ''); return; }
      var delW = t.closest ? t.closest('[data-ad-del-wish]') : null;
      if (delW) { deleteWishAdmin(delW.getAttribute('data-ad-del-wish'), delW.getAttribute('data-name') || 'Tamu', delW.getAttribute('data-time') || ''); return; }
      var ex = t.closest ? t.closest('[data-ad-export]') : null;
      if (ex) { exportAdmin(ex.getAttribute('data-ad-export')); return; }
      var acp = t.closest ? t.closest('[data-ad-copy]') : null;
      if (acp) { copyText(acp.getAttribute('data-ad-copy'), 'Link undangan disalin'); return; }
    });

    var rsvp = $('#rsvpForm');
    if (rsvp) rsvp.onsubmit = function (e) { e.preventDefault(); submitRsvp(rsvp); };
    var wish = $('#wishForm');
    if (wish) wish.onsubmit = function (e) { e.preventDefault(); submitWish(wish); };
    var reg = $('#registerForm');
    if (reg) reg.onsubmit = function (e) { e.preventDefault(); submitRegister(reg); };

    window.addEventListener('pagehide', flushTrack);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') flushTrack();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeLightbox(); closeAdmin(); }
    });

    var lastY = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY || window.pageYOffset || 0;
      if (Math.abs(y - lastY) < 30) return;
      lastY = y;
      if (g.U3DScene) { try { g.U3DScene.setScroll(y); } catch (err) { /* noop */ } }
    }, { passive: true });

    window.addEventListener('message', function (e) {
      var d = e.data;
      if (!d || d.source !== 'u3d-studio') return;
      if (d.type === 'focus') focusPlugin(d.plugin);
      else if (d.type === 'admin') openAdmin(true);
    });
  }

  /* ---------- Scene & boot ---------- */
  function initScene() {
    if (!g.U3DScene) { postReady(); return; }
    var done = false;
    var timer = setTimeout(function () { finish(false); }, 4500);
    function finish(ok) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      state.three = !!ok;
      postReady();
    }
    Promise.resolve(g.U3DScene.mount($('#sceneCanvas'), cfg.theme, {
      density: cfg.scene.density,
      motion: cfg.scene.motion !== false,
      stage: cfg.scene.stage || 'auto',
      transparent: bgIsCustom()
    })).then(function (ok) { finish(!!ok); }).catch(function () { finish(false); });
  }

  function postReady() {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          source: 'u3d-invitation', type: 'ready', theme: cfg ? cfg.theme : '',
          three: !!state.three, slug: cfg ? cfg.slug : ''
        }, '*');
      }
    } catch (e) { /* noop */ }
  }

  function setMeta() {
    var title = projectTitle() + ' — Undangan Pernikahan';
    document.title = title;
    var desc = 'Undangan pernikahan ' + projectTitle() + (cfg.event.date ? ', ' + fmtDate() : '') + '. Dengan hormat kami mengundang Anda untuk hadir.';
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', desc);
    var ogt = document.querySelector('meta[property="og:title"]');
    if (ogt) ogt.setAttribute('content', title);
    var ogd = document.querySelector('meta[property="og:description"]');
    if (ogd) ogd.setAttribute('content', desc);
    var tw = document.querySelector('meta[name="twitter:card"]');
    if (tw) tw.setAttribute('content', 'summary');
  }

  function renderLoading() {
    document.body.innerHTML = '<div class="missing"><div class="missing-inner"><h1>Menyiapkan undangan…</h1><p>Memuat tema dan panggung 3D.</p></div></div>';
  }

  function renderError(err) {
    document.body.classList.remove('locked');
    document.body.innerHTML = '<div class="missing"><div class="missing-inner">' +
      '<h1>Undangan tidak dapat dibuka</h1>' +
      '<p>' + esc(err && err.message ? err.message : 'Konfigurasi undangan tidak ditemukan.') + '</p>' +
      '<a href="index.html">Kembali ke Undangan3D Studio</a>' +
      '</div></div>';
    postReady(true);
  }

  async function boot() {
    renderLoading();
    try {
      if (g.__U3D_CONFIG__) {
        cfg = clone(g.__U3D_CONFIG__);
        cfg.preview = false;
      } else if (PREVIEW) {
        cfg = loadPreviewConfig(ID_PARAM);
        demo = true;
      } else if (SLUG_PARAM && API_PARAM) {
        var data = await jsonp({ action: 'public', slug: SLUG_PARAM });
        if (!data || data.ok === false) throw new Error((data && data.error) || 'Undangan tidak ditemukan.');
        cfg = data.project || {};
        cfg.apiUrl = API_PARAM;
        cfg.preview = false;
        cfg.wishes = data.wishes || [];
        cfg.counts = data.counts || {};
      } else {
        throw new Error('Tautan undangan tidak lengkap. Buka dari platform Undangan3D Studio.');
      }

      normalize();
      theme = g.U3DTheme.get(cfg.theme);
      try { state.dark = localStorage.getItem('u3d.inv.dark.' + cfg.slug) === '1'; } catch (e) { state.dark = false; }

      if (demo) {
        state.wishes = demoRead().wishes.slice().reverse();
      } else {
        state.wishes = (cfg.wishes || []).slice();
        if (!state.wishes.length && cfg.apiUrl) {
          try {
            var pub = await jsonp({ action: 'public', slug: cfg.slug });
            if (pub && pub.wishes) state.wishes = pub.wishes.slice();
            if (pub && pub.counts) cfg.counts = pub.counts;
          } catch (e) { /* tetap tampil tanpa ucapan */ }
        }
      }

      applyTheme();
      setMeta();
      renderAll();
      applyBackground();
      bindAll();
      initScene();
      startClock();
      observeReveal();
      observeDock();
      observeSections();
      track('view', TO ? 'personal' : 'umum');

      if (ADMIN_MODE) {
        openInvitation(true);
        if (ADMIN_KEY) {
          await doLogin(ADMIN_KEY);
          openAdmin(false);
        } else {
          openAdmin(false);
        }
      }
    } catch (e) {
      renderError(e);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
