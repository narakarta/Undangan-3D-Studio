/* Data contoh saat platform pertama kali dibuka */
(function (g) {
  'use strict';
  const art = g.U3DTheme.art;
  const basePlugins = g.U3DPlugins.defaults();

  function plugins(overrides) {
    return Object.assign({}, basePlugins, overrides || {});
  }

  const projects = [
    {
      id: 'prj-rizky-anisa',
      slug: 'rizky-anisa',
      status: 'published',
      theme: 'fairy-forest',
      groom: {
        name: 'Rizky Maulana', short: 'Rizky', order: 'Putra',
        parents: 'Bapak H. Ahmad Fauzi & Ibu Hj. Siti Aminah',
        ig: '@rizkymaulana', photo: art('rizky-portrait', 'fairy-forest')
      },
      bride: {
        name: 'Anisa Rahmadani', short: 'Anisa', order: 'Putri',
        parents: 'Bapak H. Sulaiman & Ibu Hj. Nur Hayati',
        ig: '@anisarahma', photo: art('anisa-portrait', 'fairy-forest')
      },
      event: {
        date: '2026-12-20',
        akad: {
          time: '08.00', label: 'Akad Nikah',
          place: 'Masjid Al-Ikhlas',
          address: 'Jl. Melati Raya No. 12, Bandung, Jawa Barat',
          maps: 'https://www.google.com/maps/search/?api=1&query=Masjid+Al-Ikhlas+Bandung'
        },
        resepsi: {
          time: '11.00 – 15.00', label: 'Resepsi',
          place: 'Gedung Balai Kartini',
          address: 'Jl. Gatot Subroto No. 88, Bandung, Jawa Barat',
          maps: 'https://www.google.com/maps/search/?api=1&query=Balai+Kartini+Bandung'
        }
      },
      quote: {
        text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu dapat ketenangan hati dan menjadikan kasih sayang di antara kamu.',
        source: 'QS. Ar-Rum: 21'
      },
      story: [
        { year: '2019', title: 'Pertama Bertemu', text: 'Diawali obrolan singkat di sebuah acara kampus. Ternyata kami punya selera musik dan tempat kopi yang sama.' },
        { year: '2022', title: 'Mulai Serius', text: 'Setelah tiga tahun saling mengenal, kami memutuskan untuk berjalan bersama dengan restu keluarga.' },
        { year: '2026', title: 'Menikah', text: 'Dengan memohon rahmat Allah, kami mengundang Anda untuk menjadi saksi janji suci kami.' }
      ],
      gallery: [
        { src: art('galeri-rizky-1', 'fairy-forest', { w: 900, h: 1200 }), caption: 'Senja di kebun teh' },
        { src: art('galeri-rizky-2', 'fairy-forest', { w: 900, h: 1200 }), caption: 'Setelah hujan' },
        { src: art('galeri-rizky-3', 'fairy-forest', { w: 900, h: 1200 }), caption: 'Jalan pulang' }
      ],
      gift: {
        bank: 'BCA', number: '1234567890', holder: 'Rizky Maulana',
        wallet: '0812-3456-7890', address: 'Jl. Melati Raya No. 12, Bandung'
      },
      plugins: plugins({ gift: true }),
      scene: { density: 'tinggi', motion: true },
      demoStats: { guests: 48, rsvp: 31, hadir: 27, wishes: 23 },
      createdAt: '2026-10-08T09:12:00.000Z',
      updatedAt: '2026-11-01T14:22:00.000Z'
    },
    {
      id: 'prj-bima-salsa',
      slug: 'bima-salsa',
      status: 'draft',
      theme: 'royal-gold',
      groom: {
        name: 'Bima Aditya Pratama', short: 'Bima', order: 'Putra',
        parents: 'Bapak Ir. Hendra Pratama & Ibu Retno Wulandari',
        ig: '@bimaaditya', photo: art('bima-portrait', 'royal-gold')
      },
      bride: {
        name: 'Salsabila Putri', short: 'Salsa', order: 'Putri',
        parents: 'Bapak Drs. Agus Salim & Ibu Lestari Handayani',
        ig: '@salsabilaputri', photo: art('salsa-portrait', 'royal-gold')
      },
      event: {
        date: '2027-01-17',
        akad: {
          time: '09.00', label: 'Akad Nikah',
          place: 'Kediaman Mempelai Wanita',
          address: 'Jl. Cendana No. 5, Yogyakarta',
          maps: 'https://www.google.com/maps/search/?api=1&query=Cendana+Yogyakarta'
        },
        resepsi: {
          time: '12.00 – 16.00', label: 'Resepsi',
          place: 'Pendopo Agung Royal Ambarrukmo',
          address: 'Jl. Laksda Adisucipto No. 81, Yogyakarta',
          maps: 'https://www.google.com/maps/search/?api=1&query=Royal+Ambarrukmo+Yogyakarta'
        }
      },
      quote: {
        text: 'Cinta tidak pernah meminta, ia senantiasa memberi. Cinta tidak pernah mengeluh, ia senantiasa bersyukur.',
        source: 'Khalil Gibran'
      },
      story: [
        { year: '2020', title: 'Teman Satu Tim', text: 'Kami dipertemukan dalam satu kepanitiaan dan sering lembur bersama.' },
        { year: '2023', title: 'LDR Jogja–Jakarta', text: 'Jarak mengajarkan kami arti kepercayaan dan kesabaran.' },
        { year: '2027', title: 'Menyempurnakan', text: 'Dengan restu kedua keluarga, kami melangkah ke jenjang pernikahan.' }
      ],
      gallery: [
        { src: art('galeri-bima-1', 'royal-gold', { w: 900, h: 1200 }), caption: 'Candi Prambanan' },
        { src: art('galeri-bima-2', 'royal-gold', { w: 900, h: 1200 }), caption: 'Sore di Malioboro' },
        { src: art('galeri-bima-3', 'royal-gold', { w: 900, h: 1200 }), caption: 'Rumah nenek' }
      ],
      gift: {
        bank: 'Mandiri', number: '1370012345678', holder: 'Salsabila Putri',
        wallet: '0813-2222-1111', address: 'Jl. Cendana No. 5, Yogyakarta'
      },
      plugins: plugins({ music: true, gift: true }),
      scene: { density: 'sedang', motion: true },
      demoStats: { guests: 0, rsvp: 0, hadir: 0, wishes: 0 },
      createdAt: '2026-10-21T08:00:00.000Z',
      updatedAt: '2026-10-28T10:05:00.000Z'
    },
    {
      id: 'prj-daffa-nadia',
      slug: 'daffa-nadia',
      status: 'published',
      theme: 'midnight-rose',
      groom: {
        name: 'Daffa Alfarizi', short: 'Daffa', order: 'Putra',
        parents: 'Bapak Mahmud Alfarizi & Ibu Rina Kusuma',
        ig: '@daffaalf', photo: art('daffa-portrait', 'midnight-rose')
      },
      bride: {
        name: 'Nadia Khairunnisa', short: 'Nadia', order: 'Putri',
        parents: 'Bapak Dr. Faisal Rahman & Ibu Dewi Anggraini',
        ig: '@nadiakhr', photo: art('nadia-portrait', 'midnight-rose')
      },
      event: {
        date: '2027-02-14',
        akad: {
          time: '08.30', label: 'Akad Nikah',
          place: 'Masjid Raya Bintaro',
          address: 'Jl. Bintaro Utama No. 3, Tangerang Selatan',
          maps: 'https://www.google.com/maps/search/?api=1&query=Masjid+Raya+Bintaro'
        },
        resepsi: {
          time: '18.00 – 21.00', label: 'Resepsi',
          place: 'The Grand Ballroom Senayan',
          address: 'Jl. Asia Afrika No. 8, Jakarta Pusat',
          maps: 'https://www.google.com/maps/search/?api=1&query=Grand+Ballroom+Senayan'
        }
      },
      quote: {
        text: 'Aku mencintaimu dengan segenap jiwaku, dan seluruh keberadaanku. Cinta ini tidak berubah karena jarak dan waktu.',
        source: 'Rumi'
      },
      story: [
        { year: '2018', title: 'Satu Kelas', text: 'Duduk bersebelahan saat kelas bahasa Inggris, lalu bertukar buku catatan.' },
        { year: '2021', title: 'Menjalin Komitmen', text: 'Setelah lulus, kami memilih untuk saling menjaga dari kota yang berbeda.' },
        { year: '2027', title: 'Selamanya', text: 'Kami mengundang orang-orang terkasih untuk merayakan awal perjalanan baru kami.' }
      ],
      gallery: [
        { src: art('galeri-daffa-1', 'midnight-rose', { w: 900, h: 1200 }), caption: 'Malam di kota' },
        { src: art('galeri-daffa-2', 'midnight-rose', { w: 900, h: 1200 }), caption: 'Cahaya lilin' },
        { src: art('galeri-daffa-3', 'midnight-rose', { w: 900, h: 1200 }), caption: 'Mawar pertama' }
      ],
      gift: {
        bank: 'BNI', number: '0456789012', holder: 'Daffa Alfarizi',
        wallet: '0857-7777-8888', address: 'Jl. Bintaro Utama No. 3, Tangerang Selatan'
      },
      plugins: plugins({ gift: false, dark: true }),
      scene: { density: 'tinggi', motion: true },
      demoStats: { guests: 64, rsvp: 42, hadir: 38, wishes: 35 },
      createdAt: '2026-10-24T12:30:00.000Z',
      updatedAt: '2026-11-02T20:15:00.000Z'
    }
  ];

  g.U3D_SEED = { projects: projects };
})(window);
