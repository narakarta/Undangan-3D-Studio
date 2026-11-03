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
var VERSION = '1.0.0';

var SHEETS = {
  'Proyek':    ['ID', 'Slug', 'Nama', 'Status', 'Data', 'Diperbarui'],
  'Admin':     ['Waktu', 'Nama', 'Peran', 'Proyek', 'Kunci', 'Aktif'],
  'Tamu':      ['Waktu', 'Proyek', 'Nama', 'Kunci', 'Kode', 'WA'],
  'RSVP':      ['Waktu', 'Proyek', 'Nama', 'Status', 'Jumlah', 'Ucapan', 'Kunci', 'Verifikasi'],
  'Ucapan':    ['Waktu', 'Proyek', 'Nama', 'Status', 'Jumlah', 'Ucapan', 'Kunci', 'Verifikasi'],
  'Kehadiran': ['Waktu', 'Proyek', 'Nama', 'Kunci', 'Kode', 'Metode'],
  'Log':       ['Waktu', 'Aksi', 'Proyek', 'Detail']
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

/* ---------- Proyek ---------- */
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

function counts(slug) {
  var n = { guests: 0, rsvp: 0, hadir: 0, wishes: 0 };
  rows('Tamu').forEach(function (r) { if (String(r[1]) === String(slug)) n.guests++; });
  rows('RSVP').forEach(function (r) { if (String(r[1]) === String(slug)) n.rsvp++; });
  rows('Kehadiran').forEach(function (r) { if (String(r[1]) === String(slug)) n.hadir++; });
  rows('Ucapan').forEach(function (r) { if (String(r[1]) === String(slug)) n.wishes++; });
  return n;
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
      result = { ok: true, service: 'undangan3d', version: VERSION, sheetsReady: sheetsReady(), adminKeySet: adminKeySet() };
    } else {
      result = { ok: true, service: 'undangan3d', version: VERSION, adminKeySet: adminKeySet() };
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
      var projects = rows('Proyek').map(function (r) {
        var project = null;
        try { project = JSON.parse(r[4]); } catch (err) { project = null; }
        if (!project || !project.slug) return null;
        return { project: project, counts: counts(project.slug) };
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
      return response({ ok: true, guest: g });
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
      var listProjects = rows('Proyek').map(function (r) {
        return { slug: String(r[1]), counts: counts(String(r[1])) };
      });
      return response({ ok: true, projects: listProjects });
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
