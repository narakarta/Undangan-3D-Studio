/* Penyimpanan lokal platform Undangan3D Studio */
(function (g) {
  'use strict';

  const KEY = 'u3d.studio.v1';
  const DEMO = 'u3d.demo.';
  const VERSION = 1;
  let db = null;

  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function nowISO() { return new Date().toISOString(); }
  function uid() { return 'prj-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function slugify(s) {
    return String(s || '').toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeUrl(u, allowData) {
    const s = String(u || '').trim();
    if (!s) return '';
    if (allowData && /^data:image\//i.test(s)) return s;
    if (/^https?:\/\//i.test(s)) return s;
    return '';
  }
  function autoBase() {
    if (typeof location === 'undefined' || !/^https?:/.test(location.protocol)) return '';
    const path = location.pathname.replace(/[^/]*$/, '');
    return location.origin + path;
  }

  function defaults() {
    const t = g.U3DTheme.get('fairy-forest');
    return {
      id: '', slug: '', status: 'draft', theme: 'fairy-forest',
      groom: { name: '', short: '', order: 'Putra', parents: '', ig: '', photo: '' },
      bride: { name: '', short: '', order: 'Putri', parents: '', ig: '', photo: '' },
      event: {
        date: '', akad: { time: '', label: 'Akad Nikah', place: '', address: '', maps: '' },
        resepsi: { time: '', label: 'Resepsi', place: '', address: '', maps: '' }
      },
      quote: { text: t.mood, source: '' },
      story: [],
      gallery: [],
      gift: { bank: '', number: '', holder: '', wallet: '', address: '' },
      style: { accent: '' },
      plugins: g.U3DPlugins.defaults(),
      scene: { density: 'sedang', motion: true, stage: 'auto' },
      background: {
        type: 'theme', image: '', position: 'center', blur: 0, dim: 45,
        color: '#101720', gradient: { from: '#122033', to: '#3a2b46', angle: 160 },
        animation: 'bokeh'
      },
      demoStats: { guests: 0, rsvp: 0, hadir: 0, wishes: 0 },
      notes: '',
      createdAt: nowISO(), updatedAt: nowISO()
    };
  }

  function merge(base, over) {
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    if (!over || typeof over !== 'object') return out;
    Object.keys(over).forEach(function (k) {
      const v = over[k];
      if (v === undefined) return;
      if (v && typeof v === 'object' && !Array.isArray(v) && base && typeof base[k] === 'object' && !Array.isArray(base[k])) {
        out[k] = merge(base[k], v);
      } else {
        out[k] = v;
      }
    });
    return out;
  }

  function normProject(p) {
    const base = defaults();
    const out = merge(base, p || {});
    out.id = out.id || uid();
    out.slug = slugify(out.slug || (out.groom.short || '') + '-' + (out.bride.short || '')) || out.id;
    out.theme = g.U3DTheme.get(out.theme).id;
    out.plugins = g.U3DPlugins.normalize(out.plugins);
    out.story = Array.isArray(out.story) ? out.story.map(function (s) {
      return { year: String(s.year || ''), title: String(s.title || ''), text: String(s.text || '') };
    }) : [];
    out.gallery = Array.isArray(out.gallery) ? out.gallery.map(function (x, i) {
      if (typeof x === 'string') return { src: x, caption: 'Foto ' + (i + 1) };
      return { src: String(x.src || ''), caption: String(x.caption || '') };
    }).filter(function (x) { return x.src; }) : [];
    out.gift = merge(base.gift, out.gift);
    out.scene = merge(base.scene, out.scene);
    out.scene.stage = g.U3DTheme.stage(out.scene.stage).id;
    out.background = merge(base.background, out.background);
    const bg = out.background;
    if (['theme', 'image', 'gradient', 'color', 'animation'].indexOf(bg.type) < 0) bg.type = 'theme';
    bg.image = safeUrl(bg.image, true);
    if (bg.type === 'image' && !bg.image) bg.type = 'theme';
    if (['center', 'top', 'bottom', 'left', 'right'].indexOf(bg.position) < 0) bg.position = 'center';
    bg.blur = Math.max(0, Math.min(20, Number(bg.blur) || 0));
    bg.dim = Math.max(0, Math.min(90, Number(bg.dim) || 0));
    bg.animation = g.U3DTheme.animation(bg.animation).id;
    out.demoStats = merge(base.demoStats, out.demoStats);
    return out;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.projects)) return null;
      return parsed;
    } catch (e) { return null; }
  }

  function init() {
    const saved = load();
    if (saved) {
      db = saved;
    } else {
      db = {
        version: VERSION,
        projects: clone(g.U3D_SEED.projects),
        settings: { apiUrl: '', adminKey: '', siteBase: autoBase(), owner: '', waGateway: '', waSender: '', waTemplate: '' },
        admins: [],
        summaries: {},
        activity: [{ t: nowISO(), action: 'init', detail: 'Workspace contoh dimuat' }],
        meta: { createdAt: nowISO() }
      };
    }
    db.projects = (db.projects || []).map(normProject);
    db.settings = merge({ apiUrl: '', adminKey: '', siteBase: autoBase(), owner: '', waGateway: '', waSender: '', waTemplate: '' }, db.settings || {});
    if (!db.settings.siteBase) db.settings.siteBase = autoBase();
    db.admins = Array.isArray(db.admins) ? db.admins : [];
    db.summaries = db.summaries && typeof db.summaries === 'object' ? db.summaries : {};
    db.activity = Array.isArray(db.activity) ? db.activity : [];
    persist();
    return db;
  }

  let writeFailed = false;
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); writeFailed = false; }
    catch (e) { writeFailed = true; }
  }
  function saveOk() { return !writeFailed; }

  function all() { return db.projects.slice(); }
  function get(id) { return db.projects.find(function (p) { return p.id === id; }) || null; }
  function bySlug(slug) { return db.projects.find(function (p) { return p.slug === slug; }) || null; }

  function uniqueSlug(base, exceptId) {
    let s = slugify(base) || 'undangan';
    let i = 2;
    while (db.projects.some(function (p) { return p.slug === s && p.id !== exceptId; })) {
      s = slugify(base) + '-' + i++;
    }
    return s;
  }

  function create(data) {
    const p = normProject(Object.assign({}, data || {}, { id: uid(), createdAt: nowISO(), updatedAt: nowISO() }));
    p.slug = uniqueSlug(p.slug);
    db.projects.unshift(p);
    log('project.create', p.groom.short + ' & ' + p.bride.short);
    persist();
    return p;
  }

  function update(id, mutator) {
    const p = get(id);
    if (!p) return null;
    if (typeof mutator === 'function') mutator(p);
    else Object.assign(p, mutator);
    p.updatedAt = nowISO();
    if (!p.slug) p.slug = uniqueSlug((p.groom.short || 'undangan') + '-' + (p.bride.short || ''), p.id);
    persist();
    return p;
  }

  function touch(id) {
    const p = get(id);
    if (!p) return null;
    p.updatedAt = nowISO();
    persist();
    return p;
  }

  function set(id, project) {
    const i = db.projects.findIndex(function (p) { return p.id === id; });
    if (i < 0) return null;
    const p = normProject(Object.assign({}, project, { id: id }));
    p.slug = uniqueSlug(p.slug, id);
    p.updatedAt = nowISO();
    db.projects[i] = p;
    persist();
    return p;
  }

  function upsert(project) {
    const incoming = normProject(Object.assign({}, project || {}));
    if (!incoming.slug) return null;
    const i = db.projects.findIndex(function (p) {
      return (incoming.id && p.id === incoming.id) || p.slug === incoming.slug;
    });
    if (i >= 0) {
      incoming.id = db.projects[i].id;
      incoming.slug = uniqueSlug(incoming.slug, incoming.id);
      if (!incoming.updatedAt) incoming.updatedAt = db.projects[i].updatedAt;
      db.projects[i] = incoming;
      persist();
      return incoming;
    }
    if (!incoming.id) incoming.id = uid();
    incoming.slug = uniqueSlug(incoming.slug);
    if (!incoming.createdAt) incoming.createdAt = nowISO();
    if (!incoming.updatedAt) incoming.updatedAt = nowISO();
    db.projects.unshift(incoming);
    persist();
    return incoming;
  }

  function remove(id) {
    const p = get(id);
    if (!p) return false;
    db.projects = db.projects.filter(function (x) { return x.id !== id; });
    log('project.delete', p.groom.short + ' & ' + p.bride.short);
    persist();
    return true;
  }

  function duplicate(id) {
    const p = get(id);
    if (!p) return null;
    const c = clone(p);
    c.id = uid();
    c.slug = uniqueSlug((c.groom.short || 'salinan') + '-' + (c.bride.short || ''));
    c.status = 'draft';
    c.createdAt = nowISO();
    c.updatedAt = nowISO();
    c.demoStats = { guests: 0, rsvp: 0, hadir: 0, wishes: 0 };
    db.projects.unshift(c);
    log('project.duplicate', c.slug);
    persist();
    return c;
  }

  function settings() { return db.settings; }
  function setSettings(patch) {
    db.settings = merge(db.settings, patch);
    if (!db.settings.siteBase) db.settings.siteBase = autoBase();
    persist();
    return db.settings;
  }

  function summary(slug) { return db.summaries[slug] || null; }
  function setSummary(slug, s) { db.summaries[slug] = s; persist(); }
  function setSummaries(obj) { db.summaries = Object.assign({}, db.summaries, obj); persist(); }

  function stats() {
    const ps = all();
    const published = ps.filter(function (p) { return p.status === 'published'; }).length;
    let guests = 0, rsvp = 0, hadir = 0, wishes = 0, plugins = 0;
    ps.forEach(function (p) {
      const s = db.summaries[p.slug] || p.demoStats || {};
      guests += Number(s.guests || 0);
      rsvp += Number(s.rsvp || 0);
      hadir += Number(s.hadir || 0);
      wishes += Number(s.wishes || 0);
      plugins += g.U3DPlugins.count(p);
    });
    return { projects: ps.length, published: published, guests: guests, rsvp: rsvp, hadir: hadir, wishes: wishes, plugins: plugins };
  }

  function log(action, detail) {
    db.activity.unshift({ t: nowISO(), action: action, detail: detail || '' });
    if (db.activity.length > 60) db.activity.length = 60;
    persist();
  }
  function activity() { return db.activity.slice(0, 12); }

  function exportJSON() {
    return JSON.stringify({ app: 'Undangan3D Studio', version: VERSION, exportedAt: nowISO(), projects: db.projects, settings: { siteBase: db.settings.siteBase, owner: db.settings.owner } }, null, 2);
  }

  function importJSON(text, mode) {
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.projects)) throw new Error('Berkas tidak berisi daftar proyek.');
    const incoming = parsed.projects.map(function (p) { return normProject(p); });
    if (mode === 'replace') {
      db.projects = incoming;
    } else {
      const bySlugMap = {};
      db.projects.forEach(function (p) { bySlugMap[p.slug] = true; });
      incoming.forEach(function (p) {
        if (bySlugMap[p.slug]) { p.slug = uniqueSlug(p.slug + '-impor'); }
        db.projects.push(p);
      });
    }
    log('project.import', incoming.length + ' proyek');
    persist();
    return incoming.length;
  }

  function publicBase() {
    return String(db.settings.siteBase || autoBase() || '').replace(/\/?$/, '/');
  }

  function publicConfig(p) {
    const c = clone(p);
    delete c.demoStats;
    delete c.notes;
    c.apiUrl = db.settings.apiUrl || '';
    c.publicBase = publicBase();
    c.preview = false;
    c.exportedAt = nowISO();
    c.app = 'undangan3d-studio';
    return c;
  }

  /* ---------- Mode demo (tanpa backend) ---------- */
  function demoData(slug) {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(DEMO + slug) || 'null'); } catch (e) { d = null; }
    if (!d || !Array.isArray(d.guests)) {
      d = {
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
        admins: [{ name: 'Panitia Demo', key: 'admin123', role: 'admin', project: slug, active: true, time: nowISO() }]
      };
      localStorage.setItem(DEMO + slug, JSON.stringify(d));
    }
    d.guests = Array.isArray(d.guests) ? d.guests : [];
    d.rsvp = Array.isArray(d.rsvp) ? d.rsvp : [];
    d.wishes = Array.isArray(d.wishes) ? d.wishes : [];
    d.hadir = Array.isArray(d.hadir) ? d.hadir : [];
    d.admins = Array.isArray(d.admins) ? d.admins : [];
    if (!d.admins.some(function (a) { return a.key === 'admin123'; })) {
      d.admins.unshift({ name: 'Panitia Demo', key: 'admin123', role: 'admin', project: slug, active: true, time: nowISO() });
    }
    return d;
  }

  function demoSave(slug, d) { localStorage.setItem(DEMO + slug, JSON.stringify(d)); }

  function guestCode() { return String(Math.floor(1000 + Math.random() * 9000)); }
  function guestKey(name) {
    const base = slugify(name) || 'tamu';
    return base + '-' + Math.random().toString(36).slice(2, 5);
  }

  function demoAddGuest(slug, name, wa) {
    const d = demoData(slug);
    const clean = String(name || '').trim();
    if (!clean) throw new Error('Nama tamu wajib diisi.');
    if (d.guests.some(function (x) { return slugify(x.name) === slugify(clean); })) throw new Error('Nama tamu sudah ada.');
    const g = { name: clean, key: guestKey(clean), code: guestCode(), wa: String(wa || '').trim(), time: nowISO() };
    d.guests.push(g);
    demoSave(slug, d);
    return g;
  }

  function demoDeleteGuest(slug, key) {
    const d = demoData(slug);
    d.guests = d.guests.filter(function (x) { return x.key !== key; });
    demoSave(slug, d);
    return d.guests;
  }

  function demoAddAdmin(slug, name, key, wa) {
    const d = demoData(slug);
    const k = key || ('adm-' + Math.random().toString(36).slice(2, 8));
    const a = { name: String(name || 'Admin').trim(), key: k, role: 'admin', project: slug, active: true, wa: String(wa || '').trim(), time: nowISO() };
    d.admins.push(a);
    demoSave(slug, d);
    db.admins.push(a);
    log('admin.add', a.name + ' → ' + slug);
    persist();
    return a;
  }

  function demoRemoveAdmin(slug, key) {
    const d = demoData(slug);
    d.admins = d.admins.filter(function (x) { return x.key !== key; });
    demoSave(slug, d);
    db.admins = db.admins.filter(function (x) { return !(x.key === key && x.project === slug); });
    persist();
  }

  function demoGuests(slug) { return demoData(slug).guests; }

  function formatDate(dateStr, style) {
    if (!dateStr) return '';
    const d = new Date(dateStr + (String(dateStr).length <= 10 ? 'T12:00:00' : ''));
    if (isNaN(d)) return dateStr;
    try {
      return d.toLocaleDateString('id-ID', style || { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return dateStr; }
  }

  function formatShort(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    try { return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return '—'; }
  }

  g.U3DStore = {
    init: init, all: all, get: get, bySlug: bySlug, create: create, update: update, touch: touch, set: set,
    upsert: upsert,
    remove: remove, duplicate: duplicate, settings: settings, setSettings: setSettings,
    summary: summary, setSummary: setSummary, setSummaries: setSummaries, stats: stats,
    log: log, activity: activity, exportJSON: exportJSON, importJSON: importJSON,
    publicBase: publicBase, publicConfig: publicConfig, uniqueSlug: uniqueSlug,
    demoData: demoData, demoAddGuest: demoAddGuest, demoDeleteGuest: demoDeleteGuest,
    demoGuests: demoGuests, demoAddAdmin: demoAddAdmin, demoRemoveAdmin: demoRemoveAdmin,
    guestKey: guestKey, guestCode: guestCode, formatDate: formatDate, formatShort: formatShort,
    esc: esc, safeUrl: safeUrl, slugify: slugify, autoBase: autoBase, nowISO: nowISO, clone: clone,
    saveOk: saveOk
  };
})(window);
