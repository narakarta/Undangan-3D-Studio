/* Panggung 3D prosedural — three.js dimuat dinamis, ada fallback CSS */
(function (g) {
  'use strict';

  const state = {
    ready: false, three: false, motion: true, open: false, disposed: false,
    canvas: null, renderer: null, scene: null, camera: null, particles: null,
    particleData: null, burst: null, burstData: null, mouseX: 0, mouseY: 0,
    targetZ: 8.2, theme: null, kind: 'forest', stage: 'forest', transparent: false,
    raf: 0, clock: null, anim: []
  };

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* Palet panggung: panggung tetap dikenali walau tema berganti. */
  const STAGE_SCENE = {
    forest: { ground: '#56683c' },
    garden: { ground: '#6d7f69' },
    night: { sky: '#0a1020', fog: '#121a2e', ground: '#141b2a' },
    palace: { ground: '#cdb98d' },
    beach: { sky: '#ffd2a8', fog: '#ffc79a', ground: '#e3c9a2' },
    sakura: { sky: '#fbe4ea', fog: '#f7d7df', ground: '#7d8a6a' },
    autumn: { sky: '#f7d9ac', fog: '#f0c89b', ground: '#8a6040' },
    aurora: { sky: '#071a22', fog: '#0d2a2f', ground: '#10231f' },
    desert: { sky: '#f6d3a2', fog: '#ecc79a', ground: '#c99b67' },
    temple: { sky: '#f0dfc2', fog: '#e7d3b2', ground: '#b9a17d' },
    lantern: { sky: '#241713', fog: '#3a2620', ground: '#2a2220' },
    minimal: { ground: '#d6ded0' }
  };

  function stagePal(pal, stage) {
    const o = STAGE_SCENE[stage] || {};
    return Object.assign({}, pal, {
      sky: o.sky || pal.sky,
      fog: o.fog || pal.fog,
      ground: o.ground || pal.ground,
      stage: stage
    });
  }

  function glowTexture(THREE, color) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.25, color);
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function petalTexture(THREE) {
    const c = document.createElement('canvas');
    c.width = 48; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(24, 32, 14, 24, 0.4, 0, Math.PI * 2);
    ctx.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function leafTexture(THREE) {
    const c = document.createElement('canvas');
    c.width = c.height = 48;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(24, 3);
    ctx.bezierCurveTo(44, 14, 42, 36, 24, 45);
    ctx.bezierCurveTo(6, 36, 4, 14, 24, 3);
    ctx.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function ribbonTexture(THREE, color) {
    const c = document.createElement('canvas');
    c.width = 4; c.height = 128;
    const ctx = c.getContext('2d');
    const grd = ctx.createLinearGradient(0, 128, 0, 0);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(0.28, color);
    grd.addColorStop(0.62, color);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 4, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function groundTexture(THREE) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,255,255,.62)');
    g.addColorStop(.45, 'rgba(255,255,255,.34)');
    g.addColorStop(.78, 'rgba(255,255,255,.1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function addGround(THREE, scene, pal, transparent) {
    const geo = new THREE.PlaneGeometry(100, 100, 1, 1);
    const mat = transparent
      ? new THREE.MeshBasicMaterial({
          color: new THREE.Color(pal.ground), map: groundTexture(THREE),
          transparent: true, opacity: 1, depthWrite: false, fog: false, side: THREE.DoubleSide
        })
      : new THREE.MeshStandardMaterial({
          color: new THREE.Color(pal.ground), roughness: 1, metalness: 0
        });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.02;
    scene.add(mesh);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.1, 2.22, 80),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(pal.gold), transparent: true, opacity: transparent ? 0.38 : 0.28, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.015;
    scene.add(ring);
  }

  function lanternMesh(THREE, color, scale) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 10, 8),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.95 })
    );
    body.scale.y = 1.25;
    body.position.y = -0.42;
    g.add(body);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x8a6534, roughness: 0.5, metalness: 0.5 });
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.04, 8), capMat);
    top.position.y = -0.29;
    g.add(top);
    const bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.035, 8), capMat);
    bottom.position.y = -0.55;
    g.add(bottom);
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.28, 4), new THREE.MeshBasicMaterial({ color: 0x4a3a2a }));
    str.position.y = -0.15;
    g.add(str);
    if (scale) g.scale.setScalar(scale);
    return g;
  }

  function addArch(THREE, scene, pal, stage) {
    const group = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(pal.gold), roughness: 0.34, metalness: 0.72,
      emissive: new THREE.Color(pal.gold), emissiveIntensity: 0.12
    });

    if (stage === 'temple') {
      const stoneMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xd8c7a4), roughness: 0.82, metalness: 0.06 });
      const trimMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.gold), roughness: 0.42, metalness: 0.55 });
      [-2.55, 2.55].forEach(function (x) {
        const tower = new THREE.Group();
        const sizes = [[1.05, 0.28, 0.92], [0.86, 0.9, 0.76], [0.7, 0.72, 0.64], [0.52, 0.5, 0.5]];
        let y = 0.14;
        sizes.forEach(function (s, i) {
          const m = new THREE.Mesh(new THREE.BoxGeometry(s[0], s[1], s[2]), stoneMat);
          m.position.y = y + s[1] / 2;
          tower.add(m);
          if (i === 1) {
            const band = new THREE.Mesh(new THREE.BoxGeometry(s[0] + 0.04, 0.06, s[2] + 0.04), trimMat);
            band.position.y = y + s[1] - 0.06;
            tower.add(band);
          }
          y += s[1];
        });
        const finial = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 6), trimMat);
        finial.position.y = y + 0.18;
        tower.add(finial);
        tower.position.set(x, 0, -0.55);
        group.add(tower);
      });
      for (let i = 0; i < 3; i++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(3.6 - i * 0.3, 0.11, 0.62 - i * 0.1), stoneMat);
        step.position.set(0, 0.06 + i * 0.11, 0.1 - i * 0.32);
        group.add(step);
      }
      [-3.15, 3.15].forEach(function (x) {
        const l = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.42), stoneMat);
        base.position.y = 0.08;
        l.add(base);
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.62, 8), stoneMat);
        pillar.position.y = 0.47;
        l.add(pillar);
        const house = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.34), stoneMat);
        house.position.y = 0.9;
        l.add(house);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(pal.accent) }));
        glow.position.y = 0.9;
        l.add(glow);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.2, 4), stoneMat);
        roof.position.y = 1.12;
        roof.rotation.y = Math.PI / 4;
        l.add(roof);
        l.position.set(x, 0, -0.9);
        group.add(l);
      });
      const lamp = new THREE.PointLight(0xffe0a8, 9, 16, 2);
      lamp.position.set(0, 1.4, 0.4);
      group.add(lamp);
      scene.add(group);
      return group;
    }

    const arch = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.065, 10, 90, Math.PI), goldMat);
    arch.position.set(0, 1.5, -0.4);
    group.add(arch);
    const arch2 = new THREE.Mesh(new THREE.TorusGeometry(2.42, 0.026, 8, 80, Math.PI), new THREE.MeshStandardMaterial({
      color: new THREE.Color(pal.accent), roughness: 0.5, metalness: 0.4, transparent: true, opacity: 0.7
    }));
    arch2.position.set(0, 1.5, -0.55);
    group.add(arch2);

    if (stage === 'forest' || stage === 'night' || stage === 'garden' || stage === 'sakura' || stage === 'autumn' || stage === 'aurora' || stage === 'lantern') {
      const leafy = stage === 'sakura' ? 0xf0b8c8 : stage === 'autumn' ? 0xd07a35 : stage === 'aurora' ? 0x9fe8cf : stage === 'lantern' ? 0x8a7a5a : 0x3f5f35;
      const leafMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(leafy), roughness: 0.9 });
      for (let i = 0; i < 22; i++) {
        const a = Math.PI * (i / 21);
        const r = 2.15 + rnd(-0.06, 0.1);
        const s = new THREE.Mesh(new THREE.SphereGeometry(rnd(0.07, 0.15), 6, 5), leafMat);
        s.position.set(Math.cos(a) * r, 1.5 + Math.sin(a) * r, -0.35);
        group.add(s);
      }
    }
    if (stage === 'night') {
      const roseMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.accent), roughness: 0.65, emissive: new THREE.Color(pal.accent), emissiveIntensity: 0.25 });
      for (let i = 0; i < 12; i++) {
        const a = Math.PI * (0.1 + 0.8 * i / 11);
        const r = 2.5;
        const s = new THREE.Mesh(new THREE.SphereGeometry(rnd(0.05, 0.09), 6, 5), roseMat);
        s.position.set(Math.cos(a) * r, 1.5 + Math.sin(a) * r, -0.5);
        group.add(s);
      }
    }
    if (stage === 'garden') {
      const petalMats = [0xe8a7b8, pal.gold, 0xfff0d2].map(function (c) {
        return new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: 0.7 });
      });
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 9; i++) {
          const m = new THREE.Mesh(new THREE.SphereGeometry(rnd(0.08, 0.16), 6, 5), pick(petalMats));
          m.position.set(side * (1.5 + i * 0.16), 1.5 + Math.sin(Math.PI * i / 8) * 0.85 + rnd(-0.05, 0.09), -0.32);
          group.add(m);
        }
      }
    }
    if (stage === 'lantern') {
      const hung = new THREE.Group();
      for (let i = 0; i < 7; i++) {
        const x = -1.85 + (3.7 / 6) * i;
        const y = 1.5 + Math.sqrt(Math.max(0, 2.1 * 2.1 - x * x)) - 0.12;
        const l = lanternMesh(THREE, i % 2 ? 0xffd79a : 0xffc27a, 0.9);
        l.position.set(x, y, -0.42);
        hung.add(l);
      }
      group.add(hung);
      group.userData.hung = hung;
      const glow = new THREE.PointLight(0xffcb8a, 12, 18, 2);
      glow.position.set(0, 2.2, 0.4);
      group.add(glow);
    }
    if (stage === 'palace') {
      const pillarMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xe8dbc0), roughness: 0.55, metalness: 0.1 });
      [-2.15, 2.15].forEach(function (x) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 1.5, 12), pillarMat);
        col.position.set(x, 0.75, -0.4);
        group.add(col);
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.42), pillarMat);
        base.position.set(x, 0.05, -0.4);
        group.add(base);
      });
      const chand = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45 + i * 0.16, 0.015, 6, 40), goldMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -i * 0.18;
        chand.add(ring);
      }
      chand.position.set(0, 4.1, -1.4);
      group.add(chand);
      group.userData.chand = chand;
    }
    if (stage === 'beach') {
      const wood = new THREE.MeshStandardMaterial({ color: 0x7a5436, roughness: 0.9 });
      [-1.7, 1.7].forEach(function (x) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.4, 7), wood);
        p.position.set(x, 0.7, -0.2);
        p.rotation.z = x < 0 ? 0.05 : -0.05;
        group.add(p);
      });
    }
    if (stage === 'desert') {
      const stone = new THREE.MeshStandardMaterial({ color: 0xb98d5c, roughness: 0.9 });
      [-2.5, 2.5].forEach(function (x) {
        const ob = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.5, 4), stone);
        ob.position.set(x, 0.75, -0.55);
        ob.rotation.y = Math.PI / 4;
        group.add(ob);
      });
    }
    scene.add(group);
    return group;
  }

  function addPine(THREE, group, leafMat, trunkMat, dark) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 1.9, 7), trunkMat);
    trunk.position.y = 0.95;
    group.add(trunk);
    const layers = dark ? 2 : 3;
    for (let i = 0; i < layers; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.05 - i * 0.24, 1.5, 8), leafMat);
      cone.position.y = 1.9 + i * 0.72;
      cone.rotation.y = rnd(0, 2);
      group.add(cone);
    }
  }

  function addPalm(THREE, group, leafMat, trunkMat) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 3.4, 7), trunkMat);
    trunk.position.y = 1.7;
    trunk.rotation.z = rnd(-0.12, 0.12);
    group.add(trunk);
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.32, 2.1, 4), leafMat);
      leaf.position.y = 3.35;
      leaf.rotation.z = Math.PI / 2.4;
      leaf.rotation.y = (Math.PI * 2 / 6) * i;
      leaf.position.x = Math.cos(leaf.rotation.y) * 0.8;
      leaf.position.z = Math.sin(leaf.rotation.y) * 0.8;
      group.add(leaf);
    }
  }

  function addCherry(THREE, group, trunkMat) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 2.1, 7), trunkMat);
    trunk.position.y = 1.05;
    trunk.rotation.z = rnd(-0.1, 0.1);
    group.add(trunk);
    const mats = [0xf3bccb, 0xeda8bb, 0xf8d3dd].map(function (c) {
      return new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: 0.86, flatShading: true });
    });
    for (let i = 0; i < 7; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(rnd(0.34, 0.62), 6, 5), pick(mats));
      const a = rnd(0, Math.PI * 2);
      const r = rnd(0.1, 0.85);
      s.position.set(Math.cos(a) * r, 2.15 + rnd(-0.15, 0.7), Math.sin(a) * r);
      group.add(s);
    }
  }

  function addMaple(THREE, group, trunkMat) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 2.0, 7), trunkMat);
    trunk.position.y = 1.0;
    group.add(trunk);
    const mats = [0xd07a35, 0xb5622c, 0xe0a15e].map(function (c) {
      return new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: 0.9, flatShading: true });
    });
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.0 - i * 0.22, 1.35, 7), pick(mats));
      cone.position.y = 1.85 + i * 0.62;
      cone.rotation.y = rnd(0, 2);
      group.add(cone);
    }
  }

  function addCactus(THREE, group) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x5f7a4a, roughness: 0.9, flatShading: true });
    const h = rnd(1.2, 2.2);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, h, 7), mat);
    body.position.y = h / 2;
    group.add(body);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, h * 0.45, 6), mat);
    arm.position.set(0.24, h * 0.58, 0);
    arm.rotation.z = -0.9;
    group.add(arm);
    const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, h * 0.36, 6), mat);
    arm2.position.set(-0.22, h * 0.72, 0);
    arm2.rotation.z = 0.95;
    group.add(arm2);
  }

  function addTopiary(THREE, group, leafMat, trunkMat) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.7, 6), trunkMat);
    trunk.position.y = 0.35;
    group.add(trunk);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(rnd(0.42, 0.62), 8, 7), leafMat);
    ball.position.y = 1.0;
    group.add(ball);
    if (Math.random() > 0.45) {
      const top = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.8, 7), leafMat);
      top.position.y = 1.72;
      group.add(top);
    }
  }

  function addTree(THREE, scene, pal, stage, x, z, scale) {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.trunk), roughness: 0.95 });
    const leafMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(stage === 'aurora' ? '#1d4a3d' : pal.tree), roughness: 0.95,
      flatShading: true
    });
    if (stage === 'minimal') return null;
    if (stage === 'beach') addPalm(THREE, group, leafMat, trunkMat);
    else if (stage === 'sakura') addCherry(THREE, group, trunkMat);
    else if (stage === 'autumn') addMaple(THREE, group, trunkMat);
    else if (stage === 'desert') addCactus(THREE, group);
    else if (stage === 'garden') addTopiary(THREE, group, leafMat, trunkMat);
    else addPine(THREE, group, leafMat, trunkMat, stage === 'night' || stage === 'aurora' || stage === 'lantern');
    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    group.rotation.y = rnd(0, Math.PI * 2);
    scene.add(group);
    return group;
  }

  const TREE_COUNT = {
    forest: 22, garden: 16, night: 14, palace: 0, beach: 9, sakura: 16,
    autumn: 18, aurora: 10, desert: 12, temple: 9, lantern: 7, minimal: 0
  };

  function addForest(THREE, scene, pal, stage, density) {
    const count = Math.round((TREE_COUNT[stage] == null ? 18 : TREE_COUNT[stage]) * density);
    if (stage === 'palace') {
      [-3.4, 3.4, -5.4, 5.4].forEach(function (x, i) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 3.2, 12), new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xe6d8bc), roughness: 0.6, metalness: 0.08
        }));
        col.position.set(x, 1.6, -2.4 - i * 0.6);
        scene.add(col);
      });
    }
    for (let i = 0; i < count; i++) {
      const angle = rnd(0, Math.PI);
      const radius = rnd(5.2, 16);
      let x = Math.cos(angle) * radius;
      const z = -Math.abs(Math.sin(angle) * radius) - 2;
      if (Math.abs(x) < 3.6 && z > -9) x = (x < 0 ? -1 : 1) * rnd(3.8, 5.6);
      addTree(THREE, scene, pal, stage, x, z, rnd(0.7, 1.35));
    }
    if (stage === 'garden') {
      const cols = [0xe8a7b8, pal.gold, 0xfff0d2, pal.accent];
      for (let i = 0; i < 26; i++) {
        const a = rnd(0, Math.PI * 2);
        const r = rnd(2.7, 8);
        const f = new THREE.Mesh(new THREE.SphereGeometry(rnd(0.05, 0.11), 5, 4), new THREE.MeshStandardMaterial({ color: new THREE.Color(pick(cols)), roughness: 0.7 }));
        f.position.set(Math.cos(a) * r, rnd(0.05, 0.14), Math.sin(a) * r - 1);
        scene.add(f);
      }
    }
    if (stage === 'desert') {
      for (let i = 0; i < 5; i++) {
        const dune = new THREE.Mesh(
          new THREE.SphereGeometry(rnd(4, 7), 18, 10),
          new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.ground).offsetHSL(0, -0.03, 0.05), roughness: 1 })
        );
        dune.scale.y = 0.16;
        dune.position.set(rnd(-14, 14), -0.4, rnd(-20, -8));
        scene.add(dune);
      }
      for (let i = 0; i < 7; i++) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rnd(0.2, 0.55), 0), new THREE.MeshStandardMaterial({ color: 0xa8845c, roughness: 1, flatShading: true }));
        rock.position.set(rnd(-9, 9), 0.12, rnd(-9, -1));
        rock.rotation.set(rnd(0, 3), rnd(0, 3), rnd(0, 3));
        scene.add(rock);
      }
    }
    if (stage === 'aurora') {
      for (let i = 0; i < 9; i++) {
        const snow = new THREE.Mesh(new THREE.CircleGeometry(rnd(0.5, 1.4), 10), new THREE.MeshBasicMaterial({ color: 0xd6fff0, transparent: true, opacity: 0.12 }));
        snow.rotation.x = -Math.PI / 2;
        snow.position.set(rnd(-12, 12), 0.01, rnd(-16, -2));
        scene.add(snow);
      }
    }
    if (stage === 'minimal') {
      [2.9, 3.5, 4.1].forEach(function (r, i) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.02, 6, 80, Math.PI), new THREE.MeshStandardMaterial({
          color: new THREE.Color(pal.gold), roughness: 0.5, metalness: 0.4, transparent: true, opacity: 0.45 - i * 0.1
        }));
        ring.position.set(0, 1.5, -1.2 - i * 0.8);
        scene.add(ring);
      });
    }
  }

  function addAurora(THREE, scene, pal) {
    const ribbons = [];
    const colors = ['rgba(111,240,192,.75)', 'rgba(127,168,255,.6)', 'rgba(199,143,255,.5)'];
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.PlaneGeometry(22, rnd(4.5, 7), 1, 1);
      const mat = new THREE.MeshBasicMaterial({
        map: ribbonTexture(THREE, colors[i]), transparent: true, opacity: 0.42,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(rnd(-5, 5), rnd(6.5, 10.5), -18 - i * 1.5);
      mesh.rotation.z = rnd(-0.3, 0.3);
      scene.add(mesh);
      ribbons.push({ mesh: mesh, baseX: mesh.position.x, baseY: mesh.position.y, phase: rnd(0, 6.28), speed: rnd(0.1, 0.24) });
    }
    state.anim.push(function (t) {
      ribbons.forEach(function (r, i) {
        r.mesh.position.x = r.baseX + Math.sin(t * r.speed + r.phase) * 1.6;
        r.mesh.position.y = r.baseY + Math.sin(t * 0.18 + i) * 0.35;
        r.mesh.material.opacity = 0.24 + Math.abs(Math.sin(t * 0.3 + r.phase)) * 0.28;
      });
    });
  }

  function addButterflies(THREE, scene, pal) {
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(pal.accent), side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const flies = [];
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Group();
      const wing1 = new THREE.Mesh(new THREE.CircleGeometry(0.09, 6), mat);
      wing1.scale.x = 0.55;
      wing1.position.x = -0.05;
      const wing2 = wing1.clone();
      wing2.position.x = 0.05;
      b.add(wing1); b.add(wing2);
      const base = new THREE.Vector3(rnd(-3, 3), rnd(0.8, 2.8), rnd(-5, -0.5));
      b.position.copy(base);
      group.add(b);
      flies.push({ b: b, base: base, phase: rnd(0, 6.28), speed: rnd(0.4, 0.9), amp: rnd(0.3, 0.9) });
    }
    scene.add(group);
    state.anim.push(function (t) {
      flies.forEach(function (f) {
        f.b.position.x = f.base.x + Math.sin(t * f.speed + f.phase) * f.amp;
        f.b.position.y = f.base.y + Math.sin(t * f.speed * 1.7 + f.phase) * 0.22;
        f.b.position.z = f.base.z + Math.cos(t * f.speed * 0.8 + f.phase) * 0.3;
        f.b.rotation.z = Math.sin(t * f.speed * 6) * 0.6;
      });
    });
  }

  function addLanternStrings(THREE, scene, pal) {
    const group = new THREE.Group();
    const mats = [0xffd79a, 0xffc27a, 0xffe6bd].map(function (c) {
      return new THREE.MeshBasicMaterial({ color: new THREE.Color(c), transparent: true, opacity: 0.92 });
    });
    const hung = [];
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < 5; i++) {
        const l = lanternMesh(THREE, pick([0xffd79a, 0xffc27a, 0xffe6bd]), rnd(0.8, 1.4));
        const x = -4 + i * 2 + rnd(-0.3, 0.3);
        const y = 3.2 + row * 0.9 + rnd(-0.2, 0.2);
        const z = -3 - row * 1.2 + rnd(-0.4, 0.4);
        l.position.set(x, y, z);
        group.add(l);
        hung.push({ g: l, phase: rnd(0, 6.28), baseZ: z });
      }
    }
    const stringMat = new THREE.LineBasicMaterial({ color: 0x6a4c34, transparent: true, opacity: 0.4 });
    for (let row = 0; row < 3; row++) {
      const pts = [];
      for (let i = 0; i <= 16; i++) {
        const x = -5 + (10 / 16) * i;
        pts.push(new THREE.Vector3(x, 4.4 + row * 0.9 + Math.sin(i / 16 * Math.PI) * 0.25, -3 - row * 1.2));
      }
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), stringMat));
    }
    scene.add(group);
    state.anim.push(function (t) {
      hung.forEach(function (h) {
        h.g.rotation.z = Math.sin(t * 0.5 + h.phase) * 0.09;
        h.g.position.z = h.baseZ + Math.sin(t * 0.3 + h.phase) * 0.06;
      });
    });
    const glow = new THREE.PointLight(0xffcb8a, 18, 30, 2);
    glow.position.set(0, 4.2, -2.5);
    scene.add(glow);
  }

  function addParticles(THREE, scene, pal, stage, density, motion) {
    const baseCount = {
      forest: 160, night: 190, palace: 120, beach: 90, minimal: 70, garden: 155,
      sakura: 175, autumn: 155, aurora: 140, desert: 85, temple: 105, lantern: 130
    };
    const count = Math.round((baseCount[stage] || 140) * density);
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const data = [];
    for (let i = 0; i < count; i++) {
      const x = rnd(-14, 14);
      const y = rnd(0.1, 7.5);
      const z = rnd(-8, 6);
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      data.push({ x: x, y: y, z: z, s: rnd(0.3, 1), p: rnd(0, Math.PI * 2), v: rnd(0.08, 0.3) });
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const petalStages = { night: true, sakura: true, autumn: true };
    const tex = petalStages[stage] ? petalTexture(THREE) : glowTexture(THREE, 'rgba(255,240,200,.95)');
    const colors = {
      night: pal.accent, sakura: '#f8c6d5', autumn: '#e79a4f', aurora: '#a8f0d2',
      desert: '#f0cf9c', lantern: '#ffd79a', garden: '#ffe9a8', beach: pal.accent,
      temple: '#f4dfb7', forest: pal.particle, palace: pal.particle, minimal: pal.particle
    };
    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(colors[stage] || pal.particle),
      size: stage === 'night' ? 0.09 : stage === 'sakura' ? 0.1 : 0.075,
      map: tex, transparent: true, opacity: stage === 'night' ? 0.75 : 0.85,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    state.particles = points;
    state.particleData = data;

    if (stage === 'night' || stage === 'aurora' || stage === 'lantern') {
      const starCount = stage === 'aurora' ? 620 : 520;
      const starGeo = new THREE.BufferGeometry();
      const sp = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        sp[i * 3] = rnd(-40, 40);
        sp[i * 3 + 1] = rnd(3, 30);
        sp[i * 3 + 2] = rnd(-30, -12);
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
      const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xf7e6cc, size: 0.11, transparent: true, opacity: 0.8, depthWrite: false }));
      scene.add(stars);
    }
    if (stage === 'night') {
      const moon = new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 24), new THREE.MeshBasicMaterial({ color: 0xfaefd6 }));
      moon.position.set(-7, 8.5, -22);
      scene.add(moon);
      const halo = new THREE.PointLight(0xffe6bd, 20, 50, 2);
      halo.position.copy(moon.position);
      scene.add(halo);
    }
    if (stage === 'beach') {
      const sun = new THREE.Mesh(new THREE.SphereGeometry(2.4, 24, 24), new THREE.MeshBasicMaterial({ color: 0xffd49a }));
      sun.position.set(7, 4.4, -24);
      scene.add(sun);
      const sea = new THREE.Mesh(new THREE.PlaneGeometry(90, 40), new THREE.MeshStandardMaterial({
        color: 0x476d72, roughness: 0.35, metalness: 0.25,
        transparent: state.transparent, opacity: state.transparent ? 0.5 : 1
      }));
      sea.rotation.x = -Math.PI / 2;
      sea.position.set(0, 0.02, -28);
      scene.add(sea);
    }
    if (stage === 'desert') {
      const sun = new THREE.Mesh(new THREE.SphereGeometry(2.2, 24, 24), new THREE.MeshBasicMaterial({ color: 0xffca8a }));
      sun.position.set(-6, 4.2, -25);
      scene.add(sun);
      const halo = new THREE.PointLight(0xffc58a, 16, 46, 2);
      halo.position.set(-6, 4.2, -20);
      scene.add(halo);
    }
    if (stage === 'forest' || stage === 'garden' || stage === 'sakura') {
      const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(stage === 'sakura' ? '#ffd7e2' : pal.particle), transparent: true, opacity: 0.9 });
      for (let i = 0; i < 7; i++) {
        const orb = new THREE.Mesh(new THREE.SphereGeometry(rnd(0.025, 0.05), 6, 5), glowMat);
        const a = rnd(0, Math.PI * 2), r = rnd(2.4, 4.4);
        orb.position.set(Math.cos(a) * r, rnd(0.4, 2.2), Math.sin(a) * r - 1);
        scene.add(orb);
      }
    }
    if (stage === 'aurora') addAurora(THREE, scene, pal);
    if (stage === 'garden') addButterflies(THREE, scene, pal);
    if (stage === 'lantern') addLanternStrings(THREE, scene, pal);
    if (stage === 'temple') {
      const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(pal.accent), transparent: true, opacity: 0.85 });
      for (let i = 0; i < 6; i++) {
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), glowMat);
        const a = rnd(0, Math.PI * 2), r = rnd(2.6, 5);
        orb.position.set(Math.cos(a) * r, rnd(0.35, 1.6), Math.sin(a) * r - 1);
        scene.add(orb);
      }
    }
    return points;
  }

  function burst(THREE, scene, pal) {
    if (!scene) return;
    const count = 70;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const data = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0; pos[i * 3 + 1] = 1.6; pos[i * 3 + 2] = 0;
      const a = rnd(0, Math.PI * 2), b = rnd(-1, 1);
      data.push({ vx: Math.cos(a) * rnd(0.5, 2.4), vy: Math.abs(b) * rnd(1.2, 3.2) + 0.4, vz: Math.sin(a) * rnd(0.5, 2.4), life: 1 });
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(pal.accent), size: 0.11, map: glowTexture(THREE, 'rgba(255,235,190,.95)'),
      transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    state.burst = pts;
    state.burstData = data;
  }

  async function mount(canvas, themeId, opts) {
    if (!canvas) return false;
    document.documentElement.classList.remove('no3d');
    canvas.style.display = '';
    const theme = g.U3DTheme ? g.U3DTheme.get(themeId) : null;
    const basePal = theme ? theme.scene : { kind: 'forest', sky: '#f3e3bd', fog: '#e8d9b6', ground: '#56683c', tree: '#3f5f35', trunk: '#6b4b2d', gold: '#d6b25f', accent: '#ffe3a1', particle: '#ffe9a8' };
    const stageId = opts && opts.stage && opts.stage !== 'auto' ? opts.stage : basePal.kind;
    if (stageId === 'none') {
      state.canvas = canvas;
      state.theme = theme;
      state.kind = 'none';
      state.stage = 'none';
      state.transparent = !!(opts && opts.transparent);
      state.motion = false;
      document.documentElement.classList.add('no3d');
      canvas.style.display = 'none';
      return false;
    }
    const pal = stagePal(basePal, stageId);
    state.canvas = canvas;
    state.theme = theme;
    state.kind = stageId;
    state.stage = stageId;
    state.transparent = !!(opts && opts.transparent);
    state.motion = !(opts && opts.motion === false);
    state.anim = [];
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) state.motion = false;
    const densityBase = opts && opts.density === 'rendah' ? 0.55 : opts && opts.density === 'tinggi' ? 1.35 : 1;
    const density = densityBase * (window.innerWidth < 640 ? 0.62 : 1);

    try {
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.min.js');
      state.THREE = THREE;
      const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: state.transparent, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.02;
      if (state.transparent) renderer.setClearColor(0x000000, 0);
      state.renderer = renderer;

      const scene = new THREE.Scene();
      if (state.transparent) scene.background = null;
      else scene.background = new THREE.Color(pal.sky);
      scene.fog = new THREE.Fog(new THREE.Color(pal.fog), 13, 42);
      state.scene = scene;

      const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 160);
      camera.position.set(0, 1.65, 8.2);
      camera.lookAt(0, 1.55, 0);
      state.camera = camera;

      scene.add(new THREE.HemisphereLight(0xfff1d6, new THREE.Color(pal.ground), 1.05));
      const dir = new THREE.DirectionalLight(0xffe6b8, 1.5);
      dir.position.set(4.5, 9, 5);
      scene.add(dir);
      const rim = new THREE.PointLight(new THREE.Color(pal.accent), 22, 32, 2);
      rim.position.set(-4.5, 3.2, -2);
      scene.add(rim);

      addGround(THREE, scene, pal, state.transparent);
      const archGroup = addArch(THREE, scene, pal, stageId);
      addForest(THREE, scene, pal, stageId, density);
      addParticles(THREE, scene, pal, stageId, density, state.motion);

      state.clock = new THREE.Clock();
      state.ready = true;
      state.three = true;
      state.open = false;
      state.targetZ = 8.2;
      resize(THREE);
      window.addEventListener('resize', function () { resize(THREE); });
      window.addEventListener('pointermove', function (e) {
        state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        state.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      }, { passive: true });
      renderer.render(scene, camera);

      let last = 0;
      function loop() {
        state.raf = requestAnimationFrame(loop);
        if (state.disposed) return;
        const now = performance.now();
        if (now - last < 33) return;
        last = now;
        const t = state.clock.getElapsedTime();
        if (state.motion) {
          camera.position.x += (state.mouseX * 0.5 - camera.position.x) * 0.022;
          camera.position.y += (1.65 - state.mouseY * 0.18 - camera.position.y) * 0.022;
          camera.position.z += (state.targetZ + Math.sin(t * 0.22) * 0.14 - camera.position.z) * 0.03;
          camera.lookAt(state.mouseX * 0.15, 1.55 - state.mouseY * 0.1, 0);
          if (state.particles && state.particleData) {
            const pos = state.particles.geometry.attributes.position.array;
            for (let i = 0; i < state.particleData.length; i++) {
              const p = state.particleData[i];
              pos[i * 3] = p.x + Math.sin(t * p.v + p.p) * 0.35;
              pos[i * 3 + 1] = p.y + Math.sin(t * p.v * 0.7 + p.p) * 0.22;
              pos[i * 3 + 2] = p.z + Math.cos(t * p.v * 0.55 + p.p) * 0.2;
            }
            state.particles.geometry.attributes.position.needsUpdate = true;
            state.particles.rotation.y = Math.sin(t * 0.03) * 0.03;
          }
          if (state.burst && state.burstData) {
            const bp = state.burst.geometry.attributes.position.array;
            let alive = 0;
            for (let i = 0; i < state.burstData.length; i++) {
              const b = state.burstData[i];
              if (b.life <= 0) continue;
              alive++;
              b.life -= 0.012;
              bp[i * 3] += b.vx * 0.016;
              bp[i * 3 + 1] += b.vy * 0.016;
              bp[i * 3 + 2] += b.vz * 0.016;
              b.vy -= 0.006;
            }
            state.burst.geometry.attributes.position.needsUpdate = true;
            state.burst.material.opacity = Math.max(0, state.burst.material.opacity - 0.008);
            if (!alive || state.burst.material.opacity <= 0) {
              scene.remove(state.burst);
              state.burst = null;
              state.burstData = null;
            }
          }
          if (archGroup && archGroup.userData.chand) {
            archGroup.userData.chand.rotation.y = t * 0.12;
          }
          if (archGroup && archGroup.userData.hung) {
            archGroup.userData.hung.rotation.z = Math.sin(t * 0.5) * 0.025;
          }
          for (let i = 0; i < state.anim.length; i++) {
            try { state.anim[i](t); } catch (e) { /* noop */ }
          }
        }
        renderer.render(scene, camera);
      }
      if (state.motion) loop();
      return true;
    } catch (err) {
      document.documentElement.classList.add('no3d');
      canvas.style.display = 'none';
      return false;
    }
  }

  function resize(THREE) {
    if (!state.renderer || !state.camera) return;
    const w = window.innerWidth, h = window.innerHeight;
    state.renderer.setSize(w, h, false);
    state.camera.aspect = w / h;
    state.camera.updateProjectionMatrix();
    if (state.scene) state.renderer.render(state.scene, state.camera);
  }

  function open() {
    state.open = true;
    state.targetZ = 6.9;
    if (state.scene && state.THREE) {
      const pal = state.theme ? state.theme.scene : null;
      if (pal) burst(state.THREE, state.scene, pal);
    }
  }

  function setScroll(y) {
    if (!state.open) return;
    state.targetZ = 6.9 + Math.min(y / 300, 3) * 0.4;
  }

  function destroy() {
    state.disposed = true;
    state.anim = [];
    if (state.raf) cancelAnimationFrame(state.raf);
    if (state.renderer) {
      try { state.renderer.dispose(); } catch (e) { /* noop */ }
    }
  }

  g.U3DScene = {
    mount: mount, open: open, setScroll: setScroll, destroy: destroy, state: state,
    stages: g.U3DTheme ? g.U3DTheme.stages() : []
  };
})(window);
