/* Registry plugin — dipakai platform (playground) dan runtime undangan */
(function (g) {
  'use strict';

  const PLUGINS = [
    {
      id: 'scene3d', name: 'Panggung 3D', icon: 'cube', section: 'hero',
      desc: 'Latar tiga dimensi prosedural (three.js) dengan partikel, cahaya, dan parallax.',
      defaultOn: true, live: true
    },
    {
      id: 'music', name: 'Musik Ambient', icon: 'music', section: 'music',
      desc: 'Musik latar generatif (WebAudio) — tanpa file MP3, hemat kuota.',
      defaultOn: true, live: true
    },
    {
      id: 'countdown', name: 'Hitung Mundur', icon: 'clock', section: 'countdown',
      desc: 'Hitung mundur hari, jam, menit, dan detik menuju acara.',
      defaultOn: true, live: true
    },
    {
      id: 'story', name: 'Love Story', icon: 'book', section: 'story',
      desc: 'Timeline perjalanan cinta dengan animasi saat digulir.',
      defaultOn: true, live: true
    },
    {
      id: 'gallery', name: 'Galeri Foto', icon: 'image', section: 'gallery',
      desc: 'Grid foto dengan lightbox dan caption.',
      defaultOn: true, live: true
    },
    {
      id: 'rsvp', name: 'RSVP', icon: 'check', section: 'rsvp',
      desc: 'Konfirmasi kehadiran + jumlah tamu, tersimpan ke Google Sheets.',
      defaultOn: true, live: true
    },
    {
      id: 'wishes', name: 'Buku Ucapan', icon: 'chat', section: 'wishes',
      desc: 'Ucapan & doa tamu, tampil langsung di undangan.',
      defaultOn: true, live: true
    },
    {
      id: 'maps', name: 'Peta Lokasi', icon: 'pin', section: 'events',
      desc: 'Tombol navigasi Google Maps untuk akad dan resepsi.',
      defaultOn: true, live: true
    },
    {
      id: 'gift', name: 'Amplop Digital', icon: 'gift', section: 'gift',
      desc: 'Rekening bank, e-wallet, dan alamat kirim hadiah.',
      defaultOn: false, live: true
    },
    {
      id: 'share', name: 'Bagikan', icon: 'share', section: 'share',
      desc: 'Tombol bagikan WhatsApp dan salin tautan undangan.',
      defaultOn: true, live: true
    },
    {
      id: 'dark', name: 'Mode Gelap', icon: 'moon', section: 'theme',
      desc: 'Tombol ganti mode terang/gelap untuk tamu.',
      defaultOn: true, live: true
    },
    {
      id: 'checkin', name: 'Check-in Tamu', icon: 'qr', section: 'admin',
      desc: 'Panel panitia: validasi kode tamu, kehadiran, dan ekspor data.',
      defaultOn: true, live: true, admin: true
    }
  ];

  function get(id) {
    return PLUGINS.find(function (p) { return p.id === id; }) || null;
  }

  function defaults() {
    const o = {};
    PLUGINS.forEach(function (p) { o[p.id] = p.defaultOn; });
    return o;
  }

  function normalize(plugins) {
    const d = defaults();
    if (!plugins || typeof plugins !== 'object') return d;
    Object.keys(d).forEach(function (id) {
      if (typeof plugins[id] === 'boolean') d[id] = plugins[id];
    });
    return d;
  }

  function isOn(project, id) {
    const p = normalize(project && project.plugins);
    return !!p[id];
  }

  function count(project) {
    const p = normalize(project && project.plugins);
    return Object.keys(p).filter(function (k) { return p[k]; }).length;
  }

  g.U3DPlugins = { list: PLUGINS, get: get, defaults: defaults, normalize: normalize, isOn: isOn, count: count };
})(window);
