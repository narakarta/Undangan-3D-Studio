/**
 * Undangan3D Studio — backend Google Apps Script
 * Database: Google Sheets (semua tab dibuat otomatis lewat tombol "Inisialisasi sheet").
 *
 * Cara pakai:
 *   1. Buat Google Sheet baru → Extensions → Apps Script.
 *   2. Tempel seluruh file ini, ganti ADMIN dengan kunci rahasia Anda.
 *   3. Deploy → New deployment → Web app.
 *      Execute as: Me · Who has access: Anyone.
 *   4. Salin URL yang berakhiran /exec ke menu Koneksi Backend platform.
 *
 * Setiap kali kode ini diubah: Deploy → Manage deployments → Edit → New version.
 */

var ADMIN = 'ganti-kunci-ini';
var VERSION = '1.1.0';

var SHEETS = {
  'Proyek':     ['ID', 'Slug', 'Nama', 'Status', 'Data', 'Diperbarui'],
  'Admin':      ['Waktu', 'Nama', 'Peran', 'Proyek', 'Kunci', 'Aktif'],
  'Tamu':       ['Waktu', 'Proyek', 'Nama', 'Kunci', 'Kode', 'WA'],
  'RSVP':       ['Waktu', 'Proyek', 'Nama', 'Status', 'Jumlah', 'Ucapan', 'Kunci', 'Verifikasi'],
  'Ucapan':     ['Waktu', 'Proyek', 'Nama', 'Status', 'Jumlah', 'Ucapan', 'Kunci', 'Verifikasi'],
  'Kehadiran':  ['Waktu', 'Proyek', 'Nama', 'Kunci', 'Kode', 'Metode'],
  'Notifikasi': ['Waktu', 'Proyek', 'Nama', 'Tujuan', 'Status', 'Detail', 'Kunci'],
  'Analitik':   ['Waktu', 'Proyek', 'Event', 'Sesi', 'Perangkat', 'Referrer', 'Detail', 'Tamu'],
  'Log':        ['Waktu', 'Aksi', 'Proyek', 'Detail']
};

var ANALYTICS_EVENTS = {
  view: true, open: true, section: true, gallery: true, share: true,
  rsvp: true, wish: true, register: true, admin: true
};

/* ---------- Utilitas ---------- */
function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseBody(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return {};
    return JSON.parse(e.postData.contents);
  } catch (err) {
    throw new Error('Isi permintaan bukan JSON yang valid.');
  }
}

function clean(v, max) {
  var s = String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  return max ? s.slice(0, max) : s;
}
function personName(v) { return clean(v, 80).replace(/\s+/g, ' '); }
function slugify(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}
function adminKeySet() {
  return ADMIN !== 'ganti-kunci-ini' && String(ADMIN).length >= 6;
}
function isMaster(key) {
  return adminKeySet() && String(key || '') === String(ADMIN);
}

function book() { return SpreadsheetApp.getActiveSpreadsheet(); }

function sheet(name) {
  var sh = book().getSheetByName(name);
  if (!sh) throw new Error('Tab "' + name + '" belum ada. Buka platform lalu klik "Inisialisasi sheet".');
  return sh;
}

function rows(name) {
  var sh = sheet(name);
  if (sh.getLastRow() < 2) return [];
  return sh.getDataRange().getValues().slice(1);
}

function ensureSheets() {
  var bk = book();
  var created = [];
  Object.keys(SHEETS).forEach(function (name) {
    var sh = bk.getSheetByName(name);
    if (!sh) {
      sh = bk.insertSheet(name);
      created.push(name);
    }
    var head = SHEETS[name];
    var empty = sh.getLastRow() === 0;
    if (!empty) {
      var first = sh.getRange(1, 1, 1, head.length).getValues()[0];
      empty = first.every(function (x) { return String(x == null ? '' : x).trim() === ''; });
    }
    if (empty) sh.getRange(1, 1, 1, head.length).setValues([head]);
    try { sh.setFrozenRows(1); } catch (err) { /* noop */ }
  });
  return created;
}

function sheetsReady() {
  var bk = book();
  return Object.keys(SHEETS).every(function (name) { return !!bk.getSheetByName(name); });
}

function logAction(action, slug, detail) {
  try {
    sheet('Log').appendRow([new Date(), action, slug || '', clean(detail, 300)]);
  } catch (err) { /* log tidak boleh menggagalkan permintaan */ }
}

/* ---------- Konfigurasi & integrasi ---------- */
function prop(key) {
  try { return String(PropertiesService.getScriptProperties().getProperty(key) || ''); }
  catch (err) { return ''; }
}
function setProp(key, value) {
  var ps = PropertiesService.getScriptProperties();
  if (value === null || value === undefined || value === '') ps.deleteProperty(key);
  else ps.setProperty(key, String(value));
}
function publicBase_() {
  var base = prop('SITE_BASE');
  if (base) return base.replace(/\/*$/, '/');
  return '';
}
function serviceUrl_() {
  try { return ScriptApp.getService().getUrl() || ''; } catch (err) { return ''; }
}
function waPhone(value) {
  var s = String(value || '').replace(/\D/g, '');
  if (!s) return '';
  if (s.indexOf('620') === 0) s = '62' + s.slice(3);
  else if (s.indexOf('0') === 0) s = '62' + s.slice(1);
  else if (s.indexOf('8') === 0) s = '62' + s;
  if (s.length < 9 || s.length > 15) return '';
  return s;
}
function waPhoneDisplay(value) {
  var s = waPhone(value);
  if (!s) return '';
  return '+' + s;
}
function guestLink_(slug, g) {
  var base = publicBase_();
  if (!base) {
    var project = findProject(slug);
    base = String((project && project.publicBase) || '').replace(/\/*$/, '/');
  }
  var api = serviceUrl_();
  if (!base || !api) return '';
  return base + 'undangan.html?s=' + encodeURIComponent(slug) +
    '&api=' + encodeURIComponent(api) +
    '&to=' + encodeURIComponent(g.name || '') +
    '&key=' + encodeURIComponent(g.key || '') +
    '&code=' + encodeURIComponent(g.code || '');
}
function analyticsAppend_(slug, events, meta) {
  if (!events || !events.length) return 0;
  try {
    var sh = sheet('Analitik');
    var rowsOut = [];
    var session = clean(meta && meta.session, 40);
    var device = clean(meta && meta.device, 20) || 'lainnya';
    var ref = clean(meta && meta.ref, 120) || 'langsung';
    var guest = clean(meta && meta.to, 80);
    events.slice(0, 25).forEach(function (item) {
      var name = clean(item && (item.event || item.e), 30);
      if (!ANALYTICS_EVENTS[name]) return;
      rowsOut.push([new Date(), slug, name, session, device, ref, clean(item && item.detail, 200), guest]);
    });
    if (rowsOut.length) {
      sh.getRange(sh.getLastRow() + 1, 1, rowsOut.length, 8).setValues(rowsOut);
      try {
        var cache = CacheService.getScriptCache();
        cache.remove('an:' + slug + ':v1');
        cache.remove('an:all:v1');
      } catch (err) { /* noop */ }
    }
    return rowsOut.length;
  } catch (err) { return 0; }
}

function pad2_(n) { return (n < 10 ? '0' : '') + n; }
function dayKey_(value) {
  var d = value instanceof Date ? value : new Date(value);
  if (isNaN(d)) return '';
  try { return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
  catch (err) { return d.getFullYear() + '-' + pad2_(d.getMonth() + 1) + '-' + pad2_(d.getDate()); }
}
function dayLabel_(date) {
  return date.getDate() + '/' + (date.getMonth() + 1);
}

/* ---------- Data proyek & hitungan ---------- */
function findProjectRow(slug) {
  var v = rows('Proyek');
  for (var i = 0; i < v.length; i++) {
    if (String(v[i][1]) === String(slug)) return { row: i + 2, data: v[i] };
  }
  return null;
}

function findProject(slug) {
  var hit = findProjectRow(slug);
  if (!hit) return null;
  try { return JSON.parse(hit.data[4]); } catch (err) { return null; }
}

function projectTitle(p) {
  var g = p && p.groom ? (p.groom.name || p.groom.short || '') : '';
  var b = p && p.bride ? (p.bride.name || p.bride.short || '') : '';
  return (g || 'Mempelai') + ' & ' + (b || 'Mempelai');
}

function emptyCounts() { return { guests: 0, rsvp: 0, hadir: 0, wishes: 0 }; }

function countsMap() {
  var map = {};
  function row(slug) {
    if (!map[slug]) map[slug] = emptyCounts();
    return map[slug];
  }
  rows('Tamu').forEach(function (r) { if (r[1]) row(String(r[1])).guests++; });
  rows('RSVP').forEach(function (r) { if (r[1]) row(String(r[1])).rsvp++; });
  rows('Kehadiran').forEach(function (r) { if (r[1]) row(String(r[1])).hadir++; });
  rows('Ucapan').forEach(function (r) { if (r[1]) row(String(r[1])).wishes++; });
  return map;
}

function counts(slug) {
  var map = countsMap();
  return map[String(slug)] || emptyCounts();
}

/* ---------- Tamu ---------- */
function guestFromRow(r) {
  return { time: r[0], name: String(r[2] || ''), key: String(r[3] || ''), code: String(r[4] || ''), wa: String(r[5] || '') };
}
function findGuest(slug, key) {
  var v = rows('Tamu');
  for (var i = 0; i < v.length; i++) {
    if (String(v[i][1]) === String(slug) && String(v[i][3]) === String(key)) return guestFromRow(v[i]);
  }
  return null;
}
function findGuestByCode(slug, code) {
  var v = rows('Tamu');
  for (var i = 0; i < v.length; i++) {
    if (String(v[i][1]) === String(slug) && String(v[i][4]) === String(code)) return guestFromRow(v[i]);
  }
  return null;
}
function guestList(slug) {
  return rows('Tamu').filter(function (r) { return String(r[1]) === String(slug); }).map(guestFromRow);
}
function newGuestKey(name, slug) {
  var base = slugify(name) || 'tamu';
  var key = base;
  var n = 2;
  var v = rows('Tamu');
  function used(k) {
    return v.some(function (r) { return String(r[1]) === String(slug) && String(r[3]) === k; });
  }
  while (used(key)) { key = base + '-' + (n++); }
  return key;
}
function newGuestCode(slug) {
  var v = rows('Tamu');
  for (var t = 0; t < 200; t++) {
    var code = String(Math.floor(1000 + Math.random() * 9000));
    var used = v.some(function (r) { return String(r[1]) === String(slug) && String(r[4]) === code; });
    if (!used) return code;
  }
  return String(Math.floor(1000 + Math.random() * 9000));
}
function newAdminKey() {
  var chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  var out = '';
  for (var i = 0; i < 8; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return 'adm-' + out;
}

/* ---------- Notifikasi WhatsApp ---------- */
var WA_TEMPLATE_DEFAULT = 'Halo {nama},\n\nNomor WhatsApp Anda terdaftar sebagai tamu undangan pernikahan {pasangan} pada {tanggal}.\n\nLink undangan digital Anda:\n{link}\n\nKode check-in: {kode}\n\nTerima kasih.';

var MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function eventDate_(project) {
  var raw = project && project.event ? String(project.event.date || '') : '';
  if (!raw) return 'tanggal yang akan diumumkan';
  var d = new Date(raw.length <= 10 ? raw + 'T09:00:00' : raw);
  if (isNaN(d)) return raw;
  return d.getDate() + ' ' + MONTHS_ID[d.getMonth()] + ' ' + d.getFullYear();
}

function waStatus_() {
  var token = prop('WA_TOKEN');
  return {
    configured: !!(prop('WA_GATEWAY_URL') && token),
    gateway: prop('WA_GATEWAY_URL'),
    sender: prop('WA_SENDER'),
    template: prop('WA_TEMPLATE') || WA_TEMPLATE_DEFAULT,
    enabled: prop('WA_ENABLED') !== '0',
    autosend: prop('WA_AUTOSEND') !== '0',
    dryRun: prop('WA_DRYRUN') === '1',
    siteBase: publicBase_(),
    tokenSet: !!token,
    tokenMask: token ? '••••' + token.slice(-4) : '',
    serviceUrl: serviceUrl_()
  };
}

function logNotif_(slug, guest, status, detail) {
  try {
    sheet('Notifikasi').appendRow([new Date(), slug, guest.name || '', waPhoneDisplay(guest.wa), status, clean(detail, 300), guest.key || '']);
  } catch (err) { /* noop */ }
}

function notifMessage_(slug, guest) {
  var template = prop('WA_TEMPLATE') || WA_TEMPLATE_DEFAULT;
  var project = findProject(slug) || {};
  var link = guestLink_(slug, guest);
  var map = {
    '{nama}': guest.name || 'Tamu',
    '{pasangan}': projectTitle(project),
    '{tanggal}': eventDate_(project),
    '{link}': link || '(link menyusul dari panitia)',
    '{kode}': guest.code || '—',
    '{proyek}': projectTitle(project)
  };
  return Object.keys(map).reduce(function (out, key) { return out.split(key).join(map[key]); }, template);
}

function notifyGuest_(slug, guest, source) {
  var cfg = waStatus_();
  if (!cfg.enabled) {
    logNotif_(slug, guest, 'skip', 'Notifikasi dinonaktifkan (WA_ENABLED=0)');
    return { sent: false, reason: 'Notifikasi WhatsApp dinonaktifkan.' };
  }
  if (!prop('WA_GATEWAY_URL') || !prop('WA_TOKEN')) {
    logNotif_(slug, guest, 'skip', 'Gateway/token belum diatur');
    return { sent: false, reason: 'Gateway WhatsApp belum diatur di Koneksi Backend.' };
  }
  var to = waPhone(guest.wa);
  if (!to) {
    logNotif_(slug, guest, 'skip', 'Nomor WhatsApp tidak valid');
    return { sent: false, reason: 'Nomor WhatsApp tamu tidak valid.' };
  }
  var message = notifMessage_(slug, guest);
  if (prop('WA_DRYRUN') === '1') {
    logNotif_(slug, guest, 'dry-run', 'DRY RUN · ' + message);
    return { sent: false, dryRun: true, reason: 'Mode uji (dry run) aktif. Pesan tidak dikirim.' };
  }
  var payload = {
    target: to,
    phone: to,
    message: message,
    token: prop('WA_TOKEN'),
    sender: prop('WA_SENDER') || '',
    source: source || 'undangan3d'
  };
  try {
    var res = UrlFetchApp.fetch(prop('WA_GATEWAY_URL'), {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: prop('WA_TOKEN') },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
      followRedirects: true
    });
    var code = res.getResponseCode();
    var body = String(res.getContentText() || '');
    var ok = code >= 200 && code < 300;
    if (ok) {
      try {
        var parsed = JSON.parse(body);
        if (parsed && (parsed.status === false || parsed.success === false || parsed.ok === false)) ok = false;
      } catch (err) { /* respons teks dianggap sukses bila HTTP 2xx */ }
    }
    logNotif_(slug, guest, ok ? 'sent' : 'failed', 'HTTP ' + code + ' · ' + body.slice(0, 220));
    return { sent: ok, reason: ok ? '' : ('Gateway menolak (HTTP ' + code + ').') };
  } catch (err) {
    logNotif_(slug, guest, 'failed', String(err && err.message ? err.message : err));
    return { sent: false, reason: 'Gagal menghubungi gateway WhatsApp.' };
  }
}

/* ---------- Admin ---------- */
function adminFromRow(r) {
  return {
    time: r[0], name: String(r[1] || ''), role: String(r[2] || 'admin'),
    project: String(r[3] || '*'), key: String(r[4] || ''),
    active: r[5] === true || String(r[5]).toLowerCase() === 'true' || String(r[5]).trim() === ''
  };
}
function findAdmin(key, slug) {
  if (!key) return null;
  if (isMaster(key)) return { name: 'Master', role: 'owner', project: '*', key: ADMIN };
  var v = rows('Admin');
  for (var i = 0; i < v.length; i++) {
    var a = adminFromRow(v[i]);
    if (a.active && a.key === String(key) && (a.project === String(slug) || a.project === '*')) return a;
  }
  return null;
}
function canManage(key, slug) {
  return isMaster(key) || !!findAdmin(key, slug);
}

/* ---------- Data publik ---------- */
function publicWishes(slug) {
  return rows('Ucapan')
    .filter(function (r) { return String(r[1]) === String(slug); })
    .slice(-100)
    .reverse()
    .map(function (r) {
      return {
        time: r[0], name: String(r[2] || ''), status: String(r[3] || 'Ucapan'),
        count: r[4] || '', msg: String(r[5] || ''),
        verified: String(r[7] || '') === 'terverifikasi'
      };
    });
}

function publicProject(slug) {
  var p = findProject(slug);
  if (!p) throw new Error('Undangan dengan slug "' + slug + '" tidak ditemukan. Kirim proyek ke Sheets dari platform.');
  return p;
}

/* ---------- GET ---------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  var callback = String(p.callback || '');
  var result;
  try {
    var action = String(p.action || '');
    if (action === 'public') {
      var slug = String(p.slug || '');
      result = { ok: true, project: publicProject(slug), wishes: publicWishes(slug), counts: counts(slug) };
    } else if (action === 'ping' || (e && !e.parameter)) {
      result = { ok: true, service: 'undangan3d', version: VERSION, sheetsReady: sheetsReady(), adminKeySet: adminKeySet(), waConfigured: waStatus_().configured };
    } else {
      result = { ok: true, service: 'undangan3d', version: VERSION, adminKeySet: adminKeySet(), waConfigured: waStatus_().configured };
    }
  } catch (err) {
    result = { ok: false, error: String(err && err.message ? err.message : err) };
  }
  if (callback && /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return response(result);
}

/* ---------- POST ---------- */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return response({ ok: false, error: 'Server sedang sibuk. Coba lagi sebentar.' });
  }
  try {
    var d = parseBody(e);
    var action = String(d.action || '');
    var slug = clean(d.slug, 60);

    if (action === 'ping') {
      return response({ ok: true, service: 'undangan3d', version: VERSION, sheetsReady: sheetsReady(), adminKeySet: adminKeySet() });
    }

    if (action === 'init') {
      if (!isMaster(d.adminKey)) throw new Error('Kunci admin salah. Samakan dengan konstanta ADMIN di Apps Script.');
      var created = ensureSheets();
      logAction('init', '', created.length ? 'Tab baru: ' + created.join(', ') : 'Tab sudah lengkap');
      return response({ ok: true, message: created.length ? ('Tab dibuat: ' + created.join(', ') + '.') : 'Semua tab sudah siap.' });
    }

    if (action === 'notif.status') {
      if (!canManage(d.adminKey, slug)) throw new Error('Akses admin diperlukan.');
      return response({ ok: true, config: waStatus_() });
    }

    if (action === 'notif.config') {
      if (!isMaster(d.adminKey)) throw new Error('Kunci admin salah.');
      if (d.gateway !== undefined) setProp('WA_GATEWAY_URL', clean(d.gateway, 300));
      if (d.token !== undefined && String(d.token).trim() !== '') setProp('WA_TOKEN', clean(d.token, 300));
      if (d.clearToken) setProp('WA_TOKEN', '');
      if (d.sender !== undefined) setProp('WA_SENDER', clean(d.sender, 40));
      if (d.template !== undefined) setProp('WA_TEMPLATE', clean(d.template, 2000));
      if (d.siteBase !== undefined) setProp('SITE_BASE', clean(d.siteBase, 300));
      if (d.enabled !== undefined) setProp('WA_ENABLED', d.enabled ? '1' : '0');
      if (d.autosend !== undefined) setProp('WA_AUTOSEND', d.autosend ? '1' : '0');
      if (d.dryRun !== undefined) setProp('WA_DRYRUN', d.dryRun ? '1' : '0');
      logAction('notif.config', '', 'Gateway WhatsApp diperbarui');
      return response({ ok: true, config: waStatus_() });
    }

    if (action === 'notif.test') {
      if (!isMaster(d.adminKey)) throw new Error('Kunci admin salah.');
      var testPhone = waPhone(d.phone);
      if (!testPhone) throw new Error('Nomor uji tidak valid. Gunakan format 08xx atau 62xx.');
      var testGuest = { name: personName(d.name) || 'Tes Undangan3D', wa: testPhone, code: '0000', key: 'test-' + Date.now() };
      var tested = notifyGuest_(slug, testGuest, 'test');
      return response({ ok: true, result: tested, config: waStatus_() });
    }

    if (action === 'notif.list') {
      if (!canManage(d.adminKey, slug)) throw new Error('Akses admin diperlukan.');
      var notifs = rows('Notifikasi').filter(function (r) {
        return !slug || String(r[1]) === String(slug);
      }).slice(-25).reverse().map(function (r) {
        return { time: r[0], name: String(r[2] || ''), to: String(r[3] || ''), status: String(r[4] || ''), detail: String(r[5] || ''), key: String(r[6] || '') };
      });
      return response({ ok: true, notifications: notifs });
    }

    if (action === 'notif.resend') {
      if (!canManage(d.adminKey, slug)) throw new Error('Akses admin diperlukan.');
      var targetGuest = null;
      var gkey = clean(d.key, 60);
      var allGuests = guestList(slug);
      for (var gi = 0; gi < allGuests.length; gi++) {
        if (allGuests[gi].key === gkey) { targetGuest = allGuests[gi]; break; }
      }
      if (!targetGuest) throw new Error('Tamu tidak ditemukan.');
      var resend = notifyGuest_(slug, targetGuest, 'resend');
      return response({ ok: true, result: resend });
    }

    if (action === 'project.save') {
      if (!isMaster(d.adminKey)) throw new Error('Kunci admin salah.');
      var p = d.project;
      if (!p || !p.slug) throw new Error('Data proyek tidak lengkap.');
      var sh = sheet('Proyek');
      var hit = findProjectRow(p.slug);
      var row = [String(p.id || ''), String(p.slug), projectTitle(p), String(p.status || 'draft'), JSON.stringify(p), new Date()];
      if (hit) sh.getRange(hit.row, 1, 1, 6).setValues([row]);
      else sh.appendRow(row);
      logAction('project.save', p.slug, projectTitle(p));
      return response({ ok: true, slug: p.slug, counts: counts(p.slug) });
    }

    if (action === 'project.list') {
      if (!isMaster(d.adminKey)) throw new Error('Kunci admin salah.');
      var cmap = countsMap();
      var projects = rows('Proyek').map(function (r) {
        var project = null;
        try { project = JSON.parse(r[4]); } catch (err) { project = null; }
        if (!project || !project.slug) return null;
        return { project: project, counts: cmap[String(project.slug)] || emptyCounts() };
      }).filter(function (x) { return !!x; });
      return response({ ok: true, projects: projects });
    }

    if (action === 'project.delete') {
      if (!isMaster(d.adminKey)) throw new Error('Kunci admin salah.');
      var pr = findProjectRow(slug);
      if (!pr) throw new Error('Proyek tidak ditemukan.');
      sheet('Proyek').deleteRow(pr.row);
      logAction('project.delete', slug, '');
      return response({ ok: true });
    }

    if (action === 'admin.add') {
      if (!isMaster(d.adminKey)) throw new Error('Kunci admin salah.');
      var an = personName(d.name) || 'Panitia';
      var ak = clean(d.key, 60) || newAdminKey();
      var proj = clean(d.project, 60) || '*';
      var av = rows('Admin');
      for (var ai = 0; ai < av.length; ai++) {
        if (String(av[ai][4]) === ak) throw new Error('Kunci admin sudah dipakai.');
      }
      sheet('Admin').appendRow([new Date(), an, clean(d.role, 20) || 'admin', proj, ak, true]);
      logAction('admin.add', proj, an);
      return response({ ok: true, key: ak, admin: { name: an, role: clean(d.role, 20) || 'admin', project: proj, active: true } });
    }

    if (action === 'admin.list') {
      if (!isMaster(d.adminKey)) throw new Error('Kunci admin salah.');
      var admins = rows('Admin').map(adminFromRow).filter(function (a) { return a.active; })
        .map(function (a) { return { time: a.time, name: a.name, role: a.role, project: a.project, key: a.key, active: a.active }; });
      return response({ ok: true, admins: admins });
    }

    if (action === 'admin.revoke') {
      if (!isMaster(d.adminKey)) throw new Error('Kunci admin salah.');
      var key = clean(d.key, 60);
      var ash = sheet('Admin');
      var av2 = ash.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < av2.length; i++) {
        if (String(av2[i][4]) === key) { ash.getRange(i + 1, 6).setValue(false); found = true; }
      }
      if (!found) throw new Error('Admin tidak ditemukan.');
      logAction('admin.revoke', '', key);
      return response({ ok: true });
    }

    if (action === 'admin.login') {
      var admin = findAdmin(d.key, slug);
      if (!admin) throw new Error('Kunci admin tidak dikenali untuk undangan ini.');
      return response({ ok: true, admin: { name: admin.name, role: admin.role, project: admin.project } });
    }

    if (action === 'guest.add') {
      if (!canManage(d.adminKey, slug)) throw new Error('Akses admin diperlukan.');
      var name = personName(d.name);
      if (!name) throw new Error('Nama tamu wajib diisi.');
      var existing = guestList(slug);
      if (existing.some(function (g) { return slugify(g.name) === slugify(name); })) {
        throw new Error('Nama tamu sudah ada: ' + name + '.');
      }
      var g = { time: new Date(), name: name, key: newGuestKey(name, slug), code: newGuestCode(slug), wa: clean(d.wa, 20) };
      sheet('Tamu').appendRow([g.time, slug, g.name, g.key, g.code, g.wa]);
      logAction('guest.add', slug, g.name);
      var addNotify = d.notify ? notifyGuest_(slug, g, 'admin') : null;
      return response({ ok: true, guest: g, link: guestLink_(slug, g), notified: !!(addNotify && addNotify.sent) });
    }

    if (action === 'guest.register') {
      var regName = personName(d.name);
      var regWa = waPhone(d.wa);
      if (!regName) throw new Error('Nama wajib diisi.');
      if (!regWa) throw new Error('Nomor WhatsApp tidak valid. Gunakan format 08xx atau 62xx.');
      var regCache = null;
      try { regCache = CacheService.getScriptCache(); } catch (err) { regCache = null; }
      var throttleKey = 'reg:' + slug + ':' + regWa;
      if (regCache && regCache.get(throttleKey)) {
        throw new Error('Pendaftaran nomor ini baru saja diterima. Tunggu sebentar lalu coba lagi.');
      }
      var sessionKey = 'regs:' + slug + ':' + clean(d.session, 40);
      if (regCache && clean(d.session, 40)) {
        var regCount = parseInt(regCache.get(sessionKey) || '0', 10) || 0;
        if (regCount >= 6) throw new Error('Terlalu banyak pendaftaran dari sesi ini. Hubungi panitia.');
        regCache.put(sessionKey, String(regCount + 1), 3600);
      }
      var regList = guestList(slug);
      var already = null;
      for (var rg = 0; rg < regList.length; rg++) {
        if (waPhone(regList[rg].wa) === regWa) { already = regList[rg]; break; }
      }
      if (already) {
        if (regCache) regCache.put(throttleKey, '1', 60);
        return response({
          ok: true, existed: true, notified: false,
          guest: { name: already.name, key: already.key, code: already.code, wa: already.wa },
          link: guestLink_(slug, already),
          message: 'Nomor WhatsApp ini sudah terdaftar sebagai tamu.'
        });
      }
      if (regList.some(function (x) { return slugify(x.name) === slugify(regName); })) {
        throw new Error('Nama sudah terdaftar dengan nomor lain. Hubungi panitia untuk memperbarui data.');
      }
      var regGuest = { time: new Date(), name: regName, key: newGuestKey(regName, slug), code: newGuestCode(slug), wa: regWa };
      sheet('Tamu').appendRow([regGuest.time, slug, regGuest.name, regGuest.key, regGuest.code, regGuest.wa]);
      if (regCache) regCache.put(throttleKey, '1', 90);
      logAction('guest.register', slug, regName);
      analyticsAppend_(slug, [{ event: 'register' }], { session: d.session, device: d.device, ref: d.ref, to: regName });
      var regNotify;
      if (prop('WA_AUTOSEND') === '0') {
        logNotif_(slug, regGuest, 'skip', 'Kirim otomatis dinonaktifkan (WA_AUTOSEND=0)');
        regNotify = { sent: false, reason: 'Kirim otomatis dinonaktifkan.' };
      } else {
        regNotify = notifyGuest_(slug, regGuest, 'register');
      }
      return response({
        ok: true, existed: false,
        guest: { name: regGuest.name, key: regGuest.key, code: regGuest.code, wa: regGuest.wa },
        link: guestLink_(slug, regGuest),
        notified: !!regNotify.sent,
        notifyReason: regNotify.reason || ''
      });
    }

    if (action === 'guest.bulk') {
      if (!canManage(d.adminKey, slug)) throw new Error('Akses admin diperlukan.');
      var list = Array.isArray(d.list) ? d.list : [];
      var existingNames = {};
      guestList(slug).forEach(function (g) { existingNames[slugify(g.name)] = true; });
      var added = 0, dup = [];
      list.forEach(function (item) {
        var nm = personName(item && item.name);
        if (!nm) return;
        var sk = slugify(nm);
        if (existingNames[sk]) { dup.push(nm); return; }
        var ng = { time: new Date(), name: nm, key: newGuestKey(nm, slug), code: newGuestCode(slug), wa: clean(item.wa, 20) };
        sheet('Tamu').appendRow([ng.time, slug, ng.name, ng.key, ng.code, ng.wa]);
        existingNames[sk] = true;
        added++;
      });
      logAction('guest.bulk', slug, added + ' ditambahkan');
      return response({ ok: true, added: added, dup: dup });
    }

    if (action === 'guest.list') {
      if (!canManage(d.adminKey, slug)) throw new Error('Akses admin diperlukan.');
      return response({ ok: true, guests: guestList(slug) });
    }

    if (action === 'guest.delete') {
      if (!canManage(d.adminKey, slug)) throw new Error('Akses admin diperlukan.');
      var gkey = clean(d.key, 60);
      var tsh = sheet('Tamu');
      var tv = tsh.getDataRange().getValues();
      var deleted = false;
      for (var ti = tv.length - 1; ti >= 1; ti--) {
        if (String(tv[ti][1]) === slug && String(tv[ti][3]) === gkey) { tsh.deleteRow(ti + 1); deleted = true; }
      }
      if (!deleted) throw new Error('Tamu tidak ditemukan.');
      logAction('guest.delete', slug, gkey);
      return response({ ok: true });
    }

    if (action === 'data.summary') {
      if (!canManage(d.adminKey, slug)) throw new Error('Akses admin diperlukan.');
      var smap = countsMap();
      var listProjects = rows('Proyek').map(function (r) {
        return { slug: String(r[1]), counts: smap[String(r[1])] || emptyCounts() };
      });
      return response({ ok: true, projects: listProjects });
    }

    if (action === 'analytics.track') {
      if (!slug) throw new Error('Slug undangan wajib dikirim.');
      var evs = Array.isArray(d.events) ? d.events : [];
      if (!evs.length) return response({ ok: true, added: 0 });
      try {
        var trkCache = CacheService.getScriptCache();
        var trkKey = 'trk:' + slug + ':' + (clean(d.session, 40) || 'anon');
        var trkCount = parseInt(trkCache.get(trkKey) || '0', 10) || 0;
        if (trkCount > 400) return response({ ok: true, added: 0, limited: true });
        trkCache.put(trkKey, String(trkCount + 1), 3600);
      } catch (err) { /* cache opsional */ }
      var added = analyticsAppend_(slug, evs, d);
      return response({ ok: true, added: added });
    }

    if (action === 'analytics.summary') {
      if (!canManage(d.adminKey, slug)) throw new Error('Akses admin diperlukan.');
      var anCache = null;
      var anKey = 'an:' + slug + ':v1';
      try { anCache = CacheService.getScriptCache(); } catch (err) { anCache = null; }
      if (anCache) {
        var hit = anCache.get(anKey);
        if (hit) return response(JSON.parse(hit));
      }

      var anRows = rows('Analitik').filter(function (r) { return String(r[1]) === slug; }).slice(-8000);
      var totals = { views: 0, sessions: 0, opens: 0, sections: 0, gallery: 0, rsvp: 0, wishes: 0, registers: 0, shares: 0 };
      var sessionsAll = {};
      var fsets = { view: {}, open: {}, register: {}, rsvp: {}, wish: {} };
      var deviceSets = {}, refSets = {}, sectionSets = {};
      var seriesMap = {}, dayList = [];
      for (var di = 13; di >= 0; di--) {
        var dd = new Date();
        dd.setHours(0, 0, 0, 0);
        dd.setDate(dd.getDate() - di);
        var dk = dayKey_(dd);
        dayList.push(dk);
        seriesMap[dk] = { date: dk, label: dayLabel_(dd), views: 0, sessions: {}, rsvp: 0 };
      }

      anRows.forEach(function (r, idx) {
        var ev = String(r[2] || '');
        var session = String(r[3] || '') || ('anon-' + idx);
        var device = String(r[4] || 'lainnya') || 'lainnya';
        var ref = String(r[5] || 'langsung') || 'langsung';
        var detail = String(r[6] || '');
        sessionsAll[session] = true;
        if (ev === 'view') {
          totals.views++;
          fsets.view[session] = true;
          if (!deviceSets[device]) deviceSets[device] = {};
          deviceSets[device][session] = true;
          if (!refSets[ref]) refSets[ref] = {};
          refSets[ref][session] = true;
        } else if (ev === 'open') { totals.opens++; fsets.open[session] = true; }
        else if (ev === 'section') {
          totals.sections++;
          if (detail) { if (!sectionSets[detail]) sectionSets[detail] = {}; sectionSets[detail][session] = true; }
        } else if (ev === 'gallery') totals.gallery++;
        else if (ev === 'rsvp') { totals.rsvp++; fsets.rsvp[session] = true; }
        else if (ev === 'wish') { totals.wishes++; fsets.wish[session] = true; }
        else if (ev === 'register') { totals.registers++; fsets.register[session] = true; }
        else if (ev === 'share') totals.shares++;

        var key = dayKey_(r[0]);
        if (seriesMap[key]) {
          if (ev === 'view') seriesMap[key].views++;
          if (ev === 'rsvp') seriesMap[key].rsvp++;
          if (ev === 'view' || ev === 'open' || ev === 'section') seriesMap[key].sessions[session] = true;
        }
      });
      totals.sessions = Object.keys(sessionsAll).length;

      var series = dayList.map(function (k) {
        var s = seriesMap[k];
        return { date: s.date, label: s.label, views: s.views, sessions: Object.keys(s.sessions).length, rsvp: s.rsvp };
      });

      function setCount(obj) { return Object.keys(obj || {}).length; }
      var devices = Object.keys(deviceSets).map(function (k) {
        return { name: k, count: setCount(deviceSets[k]) };
      }).sort(function (a, b) { return b.count - a.count; });
      var referrers = Object.keys(refSets).map(function (k) {
        return { name: k, count: setCount(refSets[k]) };
      }).sort(function (a, b) { return b.count - a.count; }).slice(0, 8);
      var sections = Object.keys(sectionSets).map(function (k) {
        return { name: k, count: setCount(sectionSets[k]) };
      }).sort(function (a, b) { return b.count - a.count; });

      var funnel = [
        { key: 'view', label: 'Membuka halaman', value: setCount(fsets.view) },
        { key: 'open', label: 'Membuka undangan', value: setCount(fsets.open) },
        { key: 'register', label: 'Mendaftar tamu', value: setCount(fsets.register) },
        { key: 'rsvp', label: 'Mengisi RSVP', value: setCount(fsets.rsvp) },
        { key: 'wish', label: 'Mengirim ucapan', value: setCount(fsets.wish) }
      ];

      var recent = anRows.slice(-15).reverse().map(function (r) {
        return {
          time: r[0], event: String(r[2] || ''), device: String(r[4] || ''),
          ref: String(r[5] || ''), detail: String(r[6] || ''), guest: String(r[7] || '')
        };
      });

      var anOut = {
        ok: true, slug: slug, generatedAt: new Date().toISOString(),
        totals: totals, series: series, devices: devices, referrers: referrers,
        sections: sections, funnel: funnel, recent: recent,
        events: anRows.length, source: 'sheets'
      };
      if (anCache) { try { anCache.put(anKey, JSON.stringify(anOut), 90); } catch (err) { /* noop */ } }
      return response(anOut);
    }

    if (action === 'rsvp.add') {
      var gp = null;
      if (d.key) {
        gp = findGuest(slug, clean(d.key, 60));
        if (!gp) throw new Error('Kunci tamu tidak dikenali. Minta ulang link kepada panitia.');
        if (d.code && String(d.code) !== String(gp.code)) throw new Error('Kode tamu tidak cocok.');
      }
      var rn = gp ? gp.name : personName(d.name);
      if (!rn) throw new Error('Nama wajib diisi.');
      var status = clean(d.status, 20) || 'Hadir';
      if (['Hadir', 'Tidak Hadir', 'Belum Pasti'].indexOf(status) < 0) status = 'Hadir';
      var cnt = Math.max(1, Math.min(20, parseInt(d.count, 10) || 1));
      var rmsg = clean(d.msg, 300);
      var rkey = gp ? gp.key : '';
      var rsh = sheet('RSVP');
      var rv = rsh.getDataRange().getValues();
      var ridx = 0;
      for (var ri = 1; ri < rv.length; ri++) {
        if (String(rv[ri][1]) !== slug) continue;
        if (rkey && String(rv[ri][6]) === rkey) { ridx = ri + 1; break; }
        if (!rkey && !rv[ri][6] && slugify(rv[ri][2]) === slugify(rn)) { ridx = ri + 1; break; }
      }
      var rrow = [new Date(), slug, rn, status, cnt, rmsg, rkey, rkey ? 'terverifikasi' : 'umum'];
      if (ridx) rsh.getRange(ridx, 1, 1, 8).setValues([rrow]);
      else rsh.appendRow(rrow);
      logAction('rsvp.add', slug, rn + ' · ' + status);
      analyticsAppend_(slug, [{ event: 'rsvp', detail: status }], { session: d.session, device: d.device, ref: d.ref, to: rn });
      return response({ ok: true, rsvp: { time: rrow[0], name: rn, status: status, count: cnt, msg: rmsg, verified: !!rkey } });
    }

    if (action === 'wish.add') {
      var gq = null;
      if (d.key) {
        gq = findGuest(slug, clean(d.key, 60));
        if (!gq) throw new Error('Kunci tamu tidak dikenali. Minta ulang link kepada panitia.');
        if (d.code && String(d.code) !== String(gq.code)) throw new Error('Kode tamu tidak cocok.');
      }
      var wn = gq ? gq.name : personName(d.name);
      var wm = clean(d.msg, 600);
      if (!wn) throw new Error('Nama wajib diisi.');
      if (!wm) throw new Error('Ucapan tidak boleh kosong.');
      var wkey = gq ? gq.key : '';
      var wrow = [new Date(), slug, wn, 'Ucapan', '', wm, wkey, wkey ? 'terverifikasi' : 'umum'];
      sheet('Ucapan').appendRow(wrow);
      logAction('wish.add', slug, wn);
      analyticsAppend_(slug, [{ event: 'wish' }], { session: d.session, device: d.device, ref: d.ref, to: wn });
      return response({ ok: true, wish: { time: wrow[0], name: wn, status: 'Ucapan', count: '', msg: wm, verified: !!wkey } });
    }

    if (action === 'admin.data') {
      if (!canManage(d.adminKey, slug)) throw new Error('Akses admin diperlukan.');
      var guests = guestList(slug);
      var rsvp = rows('RSVP').filter(function (r) { return String(r[1]) === slug; }).map(function (r) {
        return { time: r[0], name: String(r[2] || ''), status: String(r[3] || ''), count: r[4], msg: String(r[5] || ''), key: String(r[6] || ''), verified: String(r[7] || '') === 'terverifikasi' };
      });
      var wishes = rows('Ucapan').filter(function (r) { return String(r[1]) === slug; }).map(function (r) {
        return { time: r[0], name: String(r[2] || ''), status: String(r[3] || 'Ucapan'), count: r[4], msg: String(r[5] || ''), key: String(r[6] || ''), verified: String(r[7] || '') === 'terverifikasi' };
      });
      var hadir = rows('Kehadiran').filter(function (r) { return String(r[1]) === slug; }).map(function (r) {
        return { time: r[0], name: String(r[2] || ''), key: String(r[3] || ''), code: String(r[4] || ''), mode: String(r[5] || 'Kode') };
      });
      return response({ ok: true, guests: guests, rsvp: rsvp, wishes: wishes, hadir: hadir, counts: counts(slug) });
    }

    if (action === 'checkin') {
      if (!canManage(d.adminKey, slug)) throw new Error('Akses admin diperlukan.');
      var code = clean(d.code, 8).replace(/\D/g, '');
      var guest = findGuestByCode(slug, code);
      if (!guest) throw new Error('Kode check-in tidak dikenali.');
      var hv = rows('Kehadiran');
      for (var hi = 0; hi < hv.length; hi++) {
        if (String(hv[hi][1]) === slug && String(hv[hi][3]) === guest.key) {
          throw new Error(guest.name + ' sudah check-in sebelumnya.');
        }
      }
      sheet('Kehadiran').appendRow([new Date(), slug, guest.name, guest.key, guest.code, clean(d.mode, 20) || 'Kode']);
      logAction('checkin', slug, guest.name);
      return response({ ok: true, guest: guest });
    }

    if (action === 'rsvp.delete') {
      if (!canManage(d.adminKey, slug)) throw new Error('Akses admin diperlukan.');
      var dk = clean(d.key, 60), dn = personName(d.name);
      var dsh = sheet('RSVP');
      var dv = dsh.getDataRange().getValues();
      var del = false;
      for (var di = dv.length - 1; di >= 1; di--) {
        if (String(dv[di][1]) !== slug) continue;
        if (dk ? String(dv[di][6]) === dk : slugify(dv[di][2]) === slugify(dn)) {
          dsh.deleteRow(di + 1); del = true;
        }
      }
      if (!del) throw new Error('Data RSVP tidak ditemukan.');
      return response({ ok: true });
    }

    if (action === 'wish.delete') {
      if (!canManage(d.adminKey, slug)) throw new Error('Akses admin diperlukan.');
      var wk = clean(d.key, 60), wname = personName(d.name);
      var ush = sheet('Ucapan');
      var uv = ush.getDataRange().getValues();
      var wdel = false;
      for (var ui = uv.length - 1; ui >= 1; ui--) {
        if (String(uv[ui][1]) !== slug) continue;
        if (wk ? String(uv[ui][6]) === wk : slugify(uv[ui][2]) === slugify(wname)) {
          ush.deleteRow(ui + 1); wdel = true;
        }
      }
      if (!wdel) throw new Error('Ucapan tidak ditemukan.');
      return response({ ok: true });
    }

    throw new Error('Aksi tidak dikenali: ' + action);
  } catch (err) {
    return response({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    try { lock.releaseLock(); } catch (err) { /* noop */ }
  }
}
