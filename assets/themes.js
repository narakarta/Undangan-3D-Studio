/* Undangan3D Studio — tema visual + generator artwork */
(function (g) {
  'use strict';

  const THEMES = {
    'fairy-forest': {
      id: 'fairy-forest',
      name: 'Hutan Dongeng',
      tag: 'Fairy Forest',
      mood: 'Hangat, dedaunan, kunang-kunang senja',
      vars: {
        bg: '#f6f3e9', bg2: '#e9eeda', card: '#fffdf7', ink: '#33301f',
        ink2: '#78704e', line: '#ddd6bd', accent: '#b98a2f', accent2: '#8f6f22',
        accentSoft: '#f1e6c8', leaf: '#5f8b46', rose: '#d8a7a7',
        shadow: '0 18px 50px rgba(60,72,38,.14)'
      },
      dark: {
        bg: '#131710', bg2: '#1a2113', card: '#1e2417', ink: '#eef1e0',
        ink2: '#a9b393', line: '#37402a', accent: '#d9b667', accent2: '#f1dc9e',
        accentSoft: '#2a3020', leaf: '#7ea862', rose: '#c98f95',
        shadow: '0 18px 50px rgba(0,0,0,.55)'
      },
      scene: {
        kind: 'forest', sky: '#f3e3bd', fog: '#e8d9b6', ground: '#56683c',
        tree: '#3f5f35', trunk: '#6b4b2d', gold: '#d6b25f', accent: '#ffe3a1',
        particle: '#ffe9a8', depth: 18, density: 1
      }
    },
    'midnight-rose': {
      id: 'midnight-rose',
      name: 'Midnight Rose',
      tag: 'Malam & Mawar',
      mood: 'Navy pekat, mawar pucat, cahaya bulan',
      vars: {
        bg: '#0f1522', bg2: '#151d2e', card: '#161f31', ink: '#f2eee9',
        ink2: '#aeb6c6', line: '#293349', accent: '#d9a6ae', accent2: '#f0d3d7',
        accentSoft: '#2b2230', leaf: '#8fa39a', rose: '#e3a7b0',
        shadow: '0 20px 60px rgba(0,0,0,.5)'
      },
      dark: {
        bg: '#0b101a', bg2: '#111827', card: '#131b2a', ink: '#f8f4ef',
        ink2: '#b7bfce', line: '#2a3348', accent: '#e5b3ba', accent2: '#f7e0e3',
        accentSoft: '#2a2233', leaf: '#9db0a6', rose: '#efb6bf',
        shadow: '0 20px 60px rgba(0,0,0,.65)'
      },
      scene: {
        kind: 'night', sky: '#0a1020', fog: '#121a2e', ground: '#141b2a',
        tree: '#1d2940', trunk: '#2a2230', gold: '#e6c07a', accent: '#f4b9c2',
        particle: '#f6d6dc', depth: 22, density: 1.15
      }
    },
    'royal-gold': {
      id: 'royal-gold',
      name: 'Royal Gold',
      tag: 'Istana Emas',
      mood: 'Gading, emas tua, kemegahan klasik',
      vars: {
        bg: '#f8f2e6', bg2: '#efe3cb', card: '#fffbf2', ink: '#372c1d',
        ink2: '#7c6a4e', line: '#e0cfad', accent: '#a9791f', accent2: '#7c5512',
        accentSoft: '#f3e5c4', leaf: '#4e6b4c', rose: '#c99a9a',
        shadow: '0 18px 50px rgba(90,64,22,.16)'
      },
      dark: {
        bg: '#17130d', bg2: '#201a12', card: '#241d14', ink: '#f5ecd8',
        ink2: '#bcae93', line: '#3d3221', accent: '#e0b35f', accent2: '#f6dda0',
        accentSoft: '#2e2517', leaf: '#7c9270', rose: '#c99a9a',
        shadow: '0 18px 50px rgba(0,0,0,.6)'
      },
      scene: {
        kind: 'palace', sky: '#f6e6c4', fog: '#eddcb8', ground: '#cdb98d',
        tree: '#4e6b4c', trunk: '#7a5a33', gold: '#c69a3e', accent: '#ffe4a8',
        particle: '#ffe6a8', depth: 20, density: 0.9
      }
    },
    'tropical-sunset': {
      id: 'tropical-sunset',
      name: 'Tropical Sunset',
      tag: 'Senja Tropis',
      mood: 'Peach, karang, pantai saat matahari tenggelam',
      vars: {
        bg: '#fff4ea', bg2: '#ffe4d4', card: '#fffaf4', ink: '#3c2a24',
        ink2: '#8a6a5d', line: '#f0d2c2', accent: '#c96048', accent2: '#a44834',
        accentSoft: '#fbe0d3', leaf: '#3f7a6a', rose: '#e7a08f',
        shadow: '0 18px 50px rgba(120,62,40,.16)'
      },
      dark: {
        bg: '#1b1210', bg2: '#241714', card: '#281a16', ink: '#fbece2',
        ink2: '#c9a99a', line: '#432a22', accent: '#f09070', accent2: '#ffd0b8',
        accentSoft: '#34201a', leaf: '#6fa595', rose: '#e7a08f',
        shadow: '0 18px 50px rgba(0,0,0,.6)'
      },
      scene: {
        kind: 'beach', sky: '#ffd2a8', fog: '#ffc79a', ground: '#e7b48c',
        tree: '#2f6b5d', trunk: '#7a5436', gold: '#f0a06a', accent: '#ffb27a',
        particle: '#ffd9b0', depth: 24, density: 0.8
      }
    },
    'minimal-sage': {
      id: 'minimal-sage',
      name: 'Minimal Sage',
      tag: 'Minimal Sage',
      mood: 'Bersih, sage lembut, geometri tenang',
      vars: {
        bg: '#f3f5ef', bg2: '#e7ece2', card: '#fcfdfa', ink: '#2f352f',
        ink2: '#6f7a6d', line: '#d7ded1', accent: '#6f8467', accent2: '#52644c',
        accentSoft: '#e4ebe0', leaf: '#7d9270', rose: '#c9b1a8',
        shadow: '0 18px 50px rgba(48,66,44,.12)'
      },
      dark: {
        bg: '#12150f', bg2: '#191e16', card: '#1c2219', ink: '#eef0e9',
        ink2: '#aab3a5', line: '#313a2c', accent: '#a9bd9d', accent2: '#d7e3ce',
        accentSoft: '#252c20', leaf: '#8ca27f', rose: '#c9b1a8',
        shadow: '0 18px 50px rgba(0,0,0,.55)'
      },
      scene: {
        kind: 'minimal', sky: '#eef1e8', fog: '#e7ece2', ground: '#d6ded0',
        tree: '#8ca27f', trunk: '#8c7d6d', gold: '#b9c4ad', accent: '#dfe7d8',
        particle: '#f4f6ee', depth: 16, density: 0.55
      }
    },
    'lavender-dream': {
      id: 'lavender-dream',
      name: 'Lavender Dream',
      tag: 'Taman Lavender',
      mood: 'Ungu lembut, taman bunga, kabut pagi',
      vars: {
        bg: '#f7f4fb', bg2: '#ece4f5', card: '#fffaff', ink: '#322c3d',
        ink2: '#7a6f8a', line: '#ded4ea', accent: '#8b6fb8', accent2: '#6d5298',
        accentSoft: '#eee5f8', leaf: '#7f9a86', rose: '#d6a9c9',
        shadow: '0 18px 50px rgba(70,52,96,.14)'
      },
      dark: {
        bg: '#141019', bg2: '#1b1622', card: '#1f1928', ink: '#f1ecf7',
        ink2: '#b2a8c2', line: '#352c44', accent: '#c4a9e6', accent2: '#e0cdf7',
        accentSoft: '#2a2136', leaf: '#94ad9a', rose: '#d3a3c6',
        shadow: '0 18px 50px rgba(0,0,0,.58)'
      },
      scene: {
        kind: 'garden', sky: '#efe6f7', fog: '#e6dbf1', ground: '#6d7f69',
        tree: '#5c7f63', trunk: '#6b5a52', gold: '#b394d8', accent: '#e8d4ff',
        particle: '#f2e6ff', depth: 18, density: 1
      }
    },
    'ocean-pearl': {
      id: 'ocean-pearl',
      name: 'Ocean Pearl',
      tag: 'Mutiara Laut',
      mood: 'Teal sejuk, pasir pucat, angin laut',
      vars: {
        bg: '#f3f8f8', bg2: '#e2efef', card: '#fbfefe', ink: '#22333a',
        ink2: '#5f7a80', line: '#cfe0e0', accent: '#3f7f88', accent2: '#2c626b',
        accentSoft: '#e1f0f1', leaf: '#4f8a7c', rose: '#d7b3a8',
        shadow: '0 18px 50px rgba(30,66,70,.14)'
      },
      dark: {
        bg: '#0d1719', bg2: '#122124', card: '#16282b', ink: '#eaf4f3',
        ink2: '#a4bdbd', line: '#264245', accent: '#8ec9cf', accent2: '#c4e9ec',
        accentSoft: '#1d3335', leaf: '#78b3a3', rose: '#d7b3a8',
        shadow: '0 18px 50px rgba(0,0,0,.6)'
      },
      scene: {
        kind: 'beach', sky: '#dceff2', fog: '#cfe6ea', ground: '#d9c3a4',
        tree: '#2f6f66', trunk: '#7b5d45', gold: '#bfe0de', accent: '#d7f2f4',
        particle: '#f4ffff', depth: 22, density: 0.85
      }
    },
    'autumn-ember': {
      id: 'autumn-ember',
      name: 'Autumn Ember',
      tag: 'Musim Gugur',
      mood: 'Amber, daun maple, cahaya keemasan',
      vars: {
        bg: '#fbf4ea', bg2: '#f4e4cf', card: '#fffbf3', ink: '#3a2a1e',
        ink2: '#83654d', line: '#e8d2b7', accent: '#b5622c', accent2: '#8f4a1e',
        accentSoft: '#f6e3cd', leaf: '#6b7d43', rose: '#d2927b',
        shadow: '0 18px 50px rgba(100,56,24,.16)'
      },
      dark: {
        bg: '#19110d', bg2: '#221710', card: '#291c14', ink: '#f8e9da',
        ink2: '#c7a78e', line: '#453022', accent: '#e79a5c', accent2: '#f6cba0',
        accentSoft: '#34241a', leaf: '#8a9b5f', rose: '#d2927b',
        shadow: '0 18px 50px rgba(0,0,0,.62)'
      },
      scene: {
        kind: 'autumn', sky: '#f7d9ac', fog: '#f0c89b', ground: '#8a6040',
        tree: '#b5622c', trunk: '#5b3b25', gold: '#e0a15e', accent: '#ffcf96',
        particle: '#ffd7a3', depth: 20, density: 1
      }
    },
    'sakura-blush': {
      id: 'sakura-blush',
      name: 'Sakura Blush',
      tag: 'Sakura',
      mood: 'Merah muda lembut, kelopak, pagi cerah',
      vars: {
        bg: '#fdf5f6', bg2: '#f8e6ea', card: '#fffbfb', ink: '#3b2b31',
        ink2: '#85636b', line: '#eed3d9', accent: '#bd6b83', accent2: '#9c4f66',
        accentSoft: '#f9e1e7', leaf: '#7d9a76', rose: '#e3a7b6',
        shadow: '0 18px 50px rgba(104,48,64,.14)'
      },
      dark: {
        bg: '#1a1115', bg2: '#22161b', card: '#291b21', ink: '#f9edf0',
        ink2: '#c9aab3', line: '#45303a', accent: '#eaa8bb', accent2: '#f7cfd9',
        accentSoft: '#34232b', leaf: '#8fa884', rose: '#e3a7b6',
        shadow: '0 18px 50px rgba(0,0,0,.6)'
      },
      scene: {
        kind: 'sakura', sky: '#fbe4ea', fog: '#f7d7df', ground: '#7d8a6a',
        tree: '#d98fa5', trunk: '#6a4b43', gold: '#c8798f', accent: '#ffd9e3',
        particle: '#ffe3ea', depth: 18, density: 1.05
      }
    },
    'aurora-jade': {
      id: 'aurora-jade',
      name: 'Aurora Jade',
      tag: 'Cahaya Utara',
      mood: 'Malam hijau, aurora, bintang dingin',
      vars: {
        bg: '#f1f7f4', bg2: '#dfeee8', card: '#fbfefc', ink: '#1f332c',
        ink2: '#5e7d72', line: '#cfe2da', accent: '#2f7d63', accent2: '#1f5f4a',
        accentSoft: '#dff0e8', leaf: '#4f8f6d', rose: '#c9a7a2',
        shadow: '0 18px 50px rgba(24,70,56,.16)'
      },
      dark: {
        bg: '#07110f', bg2: '#0b1a17', card: '#0f211d', ink: '#e7f5ef',
        ink2: '#9fc0b5', line: '#1f3b34', accent: '#6fd3ac', accent2: '#b7f0d8',
        accentSoft: '#142e28', leaf: '#6fb894', rose: '#c9a7a2',
        shadow: '0 18px 50px rgba(0,0,0,.65)'
      },
      scene: {
        kind: 'aurora', sky: '#071a22', fog: '#0d2a2f', ground: '#10231f',
        tree: '#1d4a3d', trunk: '#2b3a30', gold: '#a8e6c9', accent: '#7fe3c0',
        particle: '#d6fff0', depth: 26, density: 1.1
      }
    },
    'desert-dune': {
      id: 'desert-dune',
      name: 'Desert Dune',
      tag: 'Gurun Senja',
      mood: 'Pasir hangat, bukit, langit jingga',
      vars: {
        bg: '#fbf3e7', bg2: '#f3e2c9', card: '#fffaf1', ink: '#3a2d22',
        ink2: '#836b54', line: '#e7d2b3', accent: '#b0793d', accent2: '#8d5c28',
        accentSoft: '#f5e3c8', leaf: '#6f8258', rose: '#d6a184',
        shadow: '0 18px 50px rgba(104,70,32,.16)'
      },
      dark: {
        bg: '#1a130e', bg2: '#241a12', card: '#2b1f16', ink: '#f8ead9',
        ink2: '#c9ab8e', line: '#463222', accent: '#e2ad6a', accent2: '#f7d6a6',
        accentSoft: '#352619', leaf: '#8b9c70', rose: '#d6a184',
        shadow: '0 18px 50px rgba(0,0,0,.62)'
      },
      scene: {
        kind: 'desert', sky: '#f6d3a2', fog: '#ecc79a', ground: '#c99b67',
        tree: '#6f8258', trunk: '#7a5a3a', gold: '#e3b070', accent: '#ffd6a0',
        particle: '#f6dcb4', depth: 24, density: 0.75
      }
    },
    'ivory-temple': {
      id: 'ivory-temple',
      name: 'Ivory Temple',
      tag: 'Candi Gading',
      mood: 'Gading, gapura klasik, lentera batu',
      vars: {
        bg: '#faf5ec', bg2: '#f0e6d5', card: '#fffcf6', ink: '#322b22',
        ink2: '#7a6c58', line: '#e2d4bf', accent: '#8a6a3d', accent2: '#6d512b',
        accentSoft: '#efe3cf', leaf: '#63795b', rose: '#c7a39a',
        shadow: '0 18px 50px rgba(96,72,36,.16)'
      },
      dark: {
        bg: '#14110d', bg2: '#1c1712', card: '#231d16', ink: '#f2eadc',
        ink2: '#bfb09a', line: '#3b3125', accent: '#cfa86c', accent2: '#ecd2a5',
        accentSoft: '#2b2418', leaf: '#83957a', rose: '#c7a39a',
        shadow: '0 18px 50px rgba(0,0,0,.6)'
      },
      scene: {
        kind: 'temple', sky: '#f0dfc2', fog: '#e7d3b2', ground: '#b9a17d',
        tree: '#4f6a4a', trunk: '#6d5134', gold: '#c69b55', accent: '#ffe0a8',
        particle: '#f4dfb7', depth: 20, density: 0.85
      }
    },
    'ulos-maroon': {
      id: 'ulos-maroon',
      name: 'Ulos Maroon',
      tag: 'Ulos & Emas',
      mood: 'Maroon ulos, emas tua, adat Batak',
      vars: {
        bg: '#2a1116', bg2: '#35161c', card: '#3c171b', ink: '#f8ecd9',
        ink2: '#cfa891', line: '#552a2e', accent: '#d3a95c', accent2: '#f0d49a',
        accentSoft: '#471f23', leaf: '#8a9a6d', rose: '#d98a88',
        shadow: '0 20px 60px rgba(0,0,0,.55)'
      },
      dark: {
        bg: '#1c0d10', bg2: '#241014', card: '#2e1317', ink: '#fff5e6',
        ink2: '#d8b7a1', line: '#472126', accent: '#e2bd75', accent2: '#f8e2b4',
        accentSoft: '#3a1a1e', leaf: '#9aac7c', rose: '#e59b98',
        shadow: '0 20px 60px rgba(0,0,0,.7)'
      },
      scene: {
        kind: 'lantern', sky: '#2a1015', fog: '#3a161b', ground: '#3c171b',
        tree: '#552a2e', trunk: '#3a1c1e', gold: '#d3a95c', accent: '#f0d49a',
        particle: '#f5d9a0', depth: 22, density: 1
      }
    },
    'none': {
      id: 'none',
      name: 'Tanpa Tema',
      tag: 'None · Polos',
      mood: 'Netral, bersih, tanpa aksen tema',
      vars: {
        bg: '#faf9f6', bg2: '#f1efea', card: '#ffffff', ink: '#2b2a27',
        ink2: '#77746d', line: '#e2dfd8', accent: '#a58b5f', accent2: '#7d6845',
        accentSoft: '#f0ebe1', leaf: '#7c8570', rose: '#d9bcb8',
        shadow: '0 18px 50px rgba(50,48,40,.12)'
      },
      dark: {
        bg: '#121212', bg2: '#181817', card: '#1e1e1c', ink: '#f1efe9',
        ink2: '#b0aca3', line: '#33322e', accent: '#d3b988', accent2: '#efdcb8',
        accentSoft: '#292723', leaf: '#96a08b', rose: '#cfa9a4',
        shadow: '0 18px 50px rgba(0,0,0,.6)'
      },
      scene: {
        kind: 'minimal', sky: '#f7f5f0', fog: '#efede7', ground: '#cac5b8',
        tree: '#7d8870', trunk: '#7a6a53', gold: '#c3a878', accent: '#e8d6b2',
        particle: '#e6dcc4', depth: 20, density: 0.7
      }
    }
  };

  const ORDER = [
    'fairy-forest', 'midnight-rose', 'royal-gold', 'tropical-sunset', 'minimal-sage',
    'lavender-dream', 'ocean-pearl', 'autumn-ember', 'sakura-blush', 'aurora-jade',
    'desert-dune', 'ivory-temple', 'ulos-maroon', 'none'
  ];

  /* Panggung 3D dapat dipilih terpisah dari tema. */
  const STAGES = [
    { id: 'auto', name: 'Ikuti Tema', tag: 'Auto', desc: 'Panggung menyesuaikan tema aktif', tone: '#d9b36a' },
    { id: 'forest', name: 'Hutan Pinus', tag: 'Forest', desc: 'Pinus berkabut & kunang-kunang', tone: '#5f8b46' },
    { id: 'garden', name: 'Taman Bunga', tag: 'Garden', desc: 'Gerbang bunga, topiary, kupu-kupu', tone: '#b98a2f' },
    { id: 'night', name: 'Malam Bulan', tag: 'Moonlight', desc: 'Bulan penuh, bintang, mawar pucat', tone: '#a9b6d8' },
    { id: 'palace', name: 'Istana Emas', tag: 'Palace', desc: 'Pilar klasik & lampu kristal', tone: '#d6b25f' },
    { id: 'beach', name: 'Pantai Senja', tag: 'Beach', desc: 'Matahari terbenam, ombak, kelapa', tone: '#f0a06a' },
    { id: 'sakura', name: 'Sakura', tag: 'Sakura', desc: 'Kelopak berguguran sepanjang lorong', tone: '#e3a7b6' },
    { id: 'autumn', name: 'Musim Gugur', tag: 'Autumn', desc: 'Daun maple & cahaya amber', tone: '#c9772f' },
    { id: 'aurora', name: 'Aurora', tag: 'Aurora', desc: 'Cahaya utara di langit malam', tone: '#6fd3ac' },
    { id: 'desert', name: 'Gurun Senja', tag: 'Desert', desc: 'Bukit pasir, kaktus, langit hangat', tone: '#d9a45f' },
    { id: 'temple', name: 'Gapura Candi', tag: 'Temple', desc: 'Gapura tradisional & lentera batu', tone: '#b08a54' },
    { id: 'lantern', name: 'Lentera Gantung', tag: 'Lantern', desc: 'Lentera kertas & bokeh hangat', tone: '#e2ad6a' },
    { id: 'minimal', name: 'Minimalis', tag: 'Minimal', desc: 'Lingkaran emas & ruang lapang', tone: '#b9c4ad' },
    { id: 'none', name: 'Tanpa Panggung', tag: 'None', desc: 'Latar polos tanpa elemen 3D', tone: '#8b8f98' }
  ];

  /* Preset animasi latar kustom (CSS, tanpa dependensi). */
  const BG_ANIM = [
    { id: 'bokeh', name: 'Bokeh Hangat', desc: 'Bintik cahaya melayang' },
    { id: 'petals', name: 'Kelopak', desc: 'Kelopak jatuh perlahan' },
    { id: 'snow', name: 'Salju', desc: 'Butiran salju lembut' },
    { id: 'aurora', name: 'Aurora', desc: 'Pita cahaya bergelombang' },
    { id: 'waves', name: 'Ombak', desc: 'Lapisan ombak bergerak' },
    { id: 'rays', name: 'Cahaya', desc: 'Berkas cahaya berputar' },
    { id: 'stars', name: 'Bintang', desc: 'Langit berkelip' }
  ];

  function list() {
    return ORDER.map(function (id) { return THEMES[id]; });
  }

  function get(id) {
    return THEMES[id] || THEMES['fairy-forest'];
  }

  function vars(themeId, dark) {
    const t = get(themeId);
    return Object.assign({}, t.vars, dark ? t.dark : {});
  }

  function initials(name) {
    const s = String(name || '').trim();
    if (!s) return '?';
    return s.split(/\s+/).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase();
  }

  function hash(str) {
    let h = 2166136261;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function rng(seed) {
    let a = hash(seed) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Artwork abstrak untuk foto contoh / galeri kosong. SVG data URL, tanpa dependensi. */
  function art(seed, themeId, opts) {
    const t = get(themeId);
    const r = rng(seed + '|' + t.id);
    const w = (opts && opts.w) || 900;
    const h = (opts && opts.h) || 1200;
    const p = t.vars;
    const s = t.scene;
    const id = 'a' + hash(seed + t.id).toString(36);
    const blobs = [];
    for (let i = 0; i < 5; i++) {
      const cx = 90 + r() * (w - 180);
      const cy = 100 + r() * (h - 200);
      const rad = 130 + r() * 330;
      blobs.push('<circle cx="' + cx.toFixed(0) + '" cy="' + cy.toFixed(0) + '" r="' + rad.toFixed(0) + '" fill="url(#' + id + 'g' + i + ')" opacity="' + (0.32 + r() * 0.34).toFixed(2) + '"/>');
    }
    const leaves = [];
    for (let i = 0; i < 7; i++) {
      const x = r() * w;
      const y = r() * h;
      const sc = 0.6 + r() * 1.1;
      const rot = -50 + r() * 100;
      leaves.push('<g transform="translate(' + x.toFixed(0) + ' ' + y.toFixed(0) + ') rotate(' + rot.toFixed(0) + ') scale(' + sc.toFixed(2) + ')" opacity="' + (0.22 + r() * 0.3).toFixed(2) + '"><path d="M0 0C44 18 70 62 58 104 20 96-16 62 0 0Z" fill="none" stroke="' + p.ink2 + '" stroke-width="1.6"/><path d="M4 8C24 36 36 66 52 96" fill="none" stroke="' + p.ink2 + '" stroke-width="1.1"/></g>');
    }
    const defs = [];
    for (let i = 0; i < 5; i++) {
      const c1 = i % 2 ? p.accent : p.leaf;
      defs.push('<radialGradient id="' + id + 'g' + i + '"><stop offset="0" stop-color="' + c1 + '" stop-opacity=".9"/><stop offset="1" stop-color="' + p.bg + '" stop-opacity="0"/></radialGradient>');
    }
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs><linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + s.sky + '"/><stop offset=".55" stop-color="' + p.bg2 + '"/><stop offset="1" stop-color="' + s.ground + '"/></linearGradient>' + defs.join('') + '</defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#' + id + 'b)"/>' +
      '<g>' + blobs.join('') + '</g>' +
      '<circle cx="' + (w * 0.5 + (r() - 0.5) * 160).toFixed(0) + '" cy="' + (h * 0.42).toFixed(0) + '" r="' + (w * 0.2).toFixed(0) + '" fill="' + p.accent + '" opacity=".16"/>' +
      '<circle cx="' + (w * 0.5).toFixed(0) + '" cy="' + (h * 0.42).toFixed(0) + '" r="' + (w * 0.13).toFixed(0) + '" fill="none" stroke="' + p.accent2 + '" stroke-opacity=".5" stroke-width="1.4"/>' +
      leaves.join('') +
      '<g opacity=".18"><path d="M0 ' + (h * 0.74) + 'Q' + (w * 0.3) + ' ' + (h * 0.66) + ' ' + (w * 0.55) + ' ' + (h * 0.76) + 'T' + w + ' ' + (h * 0.7) + '" fill="none" stroke="' + p.ink + '" stroke-width="2"/></g>' +
      '<rect width="' + w + '" height="' + h + '" fill="none" stroke="' + p.line + '" stroke-opacity=".55" stroke-width="2"/>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function swatch(themeId) {
    const t = get(themeId);
    return 'linear-gradient(145deg,' + t.vars.bg + ' 0%,' + t.vars.accentSoft + ' 45%,' + t.scene.gold + ' 100%)';
  }

  function stages() { return STAGES.map(function (s) { return Object.assign({}, s); }); }
  function stage(id) {
    return STAGES.find(function (s) { return s.id === id; }) || STAGES[0];
  }
  function animations() { return BG_ANIM.map(function (a) { return Object.assign({}, a); }); }
  function animation(id) {
    return BG_ANIM.find(function (a) { return a.id === id; }) || BG_ANIM[0];
  }

  g.U3DTheme = {
    list: list, get: get, vars: vars, initials: initials, art: art, swatch: swatch, hash: hash,
    stages: stages, stage: stage, animations: animations, animation: animation
  };
})(window);
