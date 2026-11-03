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
    }
  };

  const ORDER = ['fairy-forest', 'midnight-rose', 'royal-gold', 'tropical-sunset', 'minimal-sage'];

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

  g.U3DTheme = { list: list, get: get, vars: vars, initials: initials, art: art, swatch: swatch, hash: hash };
})(window);
