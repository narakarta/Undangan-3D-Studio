/* Panggung 3D prosedural — three.js dimuat dinamis, ada fallback CSS */
(function (g) {
  'use strict';

  const state = {
    ready: false, three: false, motion: true, open: false, disposed: false,
    canvas: null, renderer: null, scene: null, camera: null, particles: null,
    particleData: null, burst: null, burstData: null, mouseX: 0, mouseY: 0,
    targetZ: 8.2, theme: null, kind: 'forest', raf: 0, clock: null
  };

  function rnd(a, b) { return a + Math.random() * (b - a); }

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

  function addGround(THREE, scene, pal) {
    const geo = new THREE.PlaneGeometry(90, 90, 1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(pal.ground), roughness: 1, metalness: 0
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.02;
    scene.add(mesh);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.1, 2.22, 80),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(pal.gold), transparent: true, opacity: 0.28, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.015;
    scene.add(ring);
  }

  function addArch(THREE, scene, pal, kind) {
    const group = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(pal.gold), roughness: 0.34, metalness: 0.72,
      emissive: new THREE.Color(pal.gold), emissiveIntensity: 0.12
    });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.065, 10, 90, Math.PI), goldMat);
    arch.position.set(0, 1.5, -0.4);
    group.add(arch);
    const arch2 = new THREE.Mesh(new THREE.TorusGeometry(2.42, 0.026, 8, 80, Math.PI), new THREE.MeshStandardMaterial({
      color: new THREE.Color(pal.accent), roughness: 0.5, metalness: 0.4, transparent: true, opacity: 0.7
    }));
    arch2.position.set(0, 1.5, -0.55);
    group.add(arch2);

    if (kind === 'forest' || kind === 'night') {
      const leafMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(kind === 'night' ? 0x1d2940 : 0x3f5f35), roughness: 0.9 });
      for (let i = 0; i < 22; i++) {
        const a = Math.PI * (i / 21);
        const r = 2.15 + rnd(-0.06, 0.1);
        const s = new THREE.Mesh(new THREE.SphereGeometry(rnd(0.07, 0.15), 6, 5), leafMat);
        s.position.set(Math.cos(a) * r, 1.5 + Math.sin(a) * r, -0.35);
        group.add(s);
      }
      if (kind === 'night') {
        const roseMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.accent), roughness: 0.65, emissive: new THREE.Color(pal.accent), emissiveIntensity: 0.25 });
        for (let i = 0; i < 12; i++) {
          const a = Math.PI * (0.1 + 0.8 * i / 11);
          const r = 2.5;
          const s = new THREE.Mesh(new THREE.SphereGeometry(rnd(0.05, 0.09), 6, 5), roseMat);
          s.position.set(Math.cos(a) * r, 1.5 + Math.sin(a) * r, -0.5);
          group.add(s);
        }
      }
    }
    if (kind === 'palace') {
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
    scene.add(group);
    return group;
  }

  function addTree(THREE, scene, pal, kind, x, z, scale) {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.trunk), roughness: 0.95 });
    const leafMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(pal.tree), roughness: 0.95,
      flatShading: true
    });
    if (kind === 'beach') {
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
    } else if (kind === 'minimal') {
      return null;
    } else {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 1.9, 7), trunkMat);
      trunk.position.y = 0.95;
      group.add(trunk);
      const layers = kind === 'night' ? 2 : 3;
      for (let i = 0; i < layers; i++) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(1.05 - i * 0.24, 1.5, 8), leafMat);
        cone.position.y = 1.9 + i * 0.72;
        cone.rotation.y = rnd(0, 2);
        group.add(cone);
      }
    }
    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    group.rotation.y = rnd(0, Math.PI * 2);
    scene.add(group);
    return group;
  }

  function addForest(THREE, scene, pal, kind, density) {
    const count = kind === 'minimal' ? 0 : Math.round((kind === 'night' ? 14 : kind === 'beach' ? 8 : 22) * density);
    if (kind === 'palace') {
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
      addTree(THREE, scene, pal, kind, x, z, rnd(0.7, 1.35));
    }
    if (kind === 'minimal') {
      [2.9, 3.5, 4.1].forEach(function (r, i) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.02, 6, 80, Math.PI), new THREE.MeshStandardMaterial({
          color: new THREE.Color(pal.gold), roughness: 0.5, metalness: 0.4, transparent: true, opacity: 0.45 - i * 0.1
        }));
        ring.position.set(0, 1.5, -1.2 - i * 0.8);
        scene.add(ring);
      });
    }
  }

  function addParticles(THREE, scene, pal, kind, density, motion) {
    const count = Math.round((kind === 'night' ? 190 : kind === 'forest' ? 160 : kind === 'palace' ? 120 : kind === 'beach' ? 90 : 70) * density);
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
    const tex = kind === 'night' ? petalTexture(THREE) : glowTexture(THREE, 'rgba(255,240,200,.95)');
    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(kind === 'night' ? pal.accent : kind === 'beach' ? pal.accent : pal.particle),
      size: kind === 'night' ? 0.09 : 0.075,
      map: tex, transparent: true, opacity: kind === 'night' ? 0.75 : 0.85,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    state.particles = points;
    state.particleData = data;

    if (kind === 'night') {
      const starGeo = new THREE.BufferGeometry();
      const sp = new Float32Array(520 * 3);
      for (let i = 0; i < 520; i++) {
        sp[i * 3] = rnd(-40, 40);
        sp[i * 3 + 1] = rnd(3, 30);
        sp[i * 3 + 2] = rnd(-30, -12);
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
      const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xf7e6cc, size: 0.11, transparent: true, opacity: 0.8, depthWrite: false }));
      scene.add(stars);
      const moon = new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 24), new THREE.MeshBasicMaterial({ color: 0xfaefd6 }));
      moon.position.set(-7, 8.5, -22);
      scene.add(moon);
      const halo = new THREE.PointLight(0xffe6bd, 20, 50, 2);
      halo.position.copy(moon.position);
      scene.add(halo);
    }
    if (kind === 'beach') {
      const sun = new THREE.Mesh(new THREE.SphereGeometry(2.4, 24, 24), new THREE.MeshBasicMaterial({ color: 0xffd49a }));
      sun.position.set(7, 4.4, -24);
      scene.add(sun);
      const sea = new THREE.Mesh(new THREE.PlaneGeometry(90, 40), new THREE.MeshStandardMaterial({ color: 0x476d72, roughness: 0.35, metalness: 0.25 }));
      sea.rotation.x = -Math.PI / 2;
      sea.position.set(0, 0.02, -28);
      scene.add(sea);
    }
    if (kind === 'forest') {
      const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(pal.particle), transparent: true, opacity: 0.9 });
      for (let i = 0; i < 7; i++) {
        const orb = new THREE.Mesh(new THREE.SphereGeometry(rnd(0.025, 0.05), 6, 5), glowMat);
        const a = rnd(0, Math.PI * 2), r = rnd(2.4, 4.4);
        orb.position.set(Math.cos(a) * r, rnd(0.4, 2.2), Math.sin(a) * r - 1);
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
    const theme = g.U3DTheme ? g.U3DTheme.get(themeId) : null;
    const pal = theme ? theme.scene : { kind: 'forest', sky: '#f3e3bd', fog: '#e8d9b6', ground: '#56683c', tree: '#3f5f35', trunk: '#6b4b2d', gold: '#d6b25f', accent: '#ffe3a1', particle: '#ffe9a8' };
    state.canvas = canvas;
    state.theme = theme;
    state.kind = pal.kind;
    state.motion = !(opts && opts.motion === false);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) state.motion = false;
    const densityBase = opts && opts.density === 'rendah' ? 0.55 : opts && opts.density === 'tinggi' ? 1.35 : 1;
    const density = densityBase * (window.innerWidth < 640 ? 0.62 : 1);

    try {
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.min.js');
      state.THREE = THREE;
      const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.02;
      state.renderer = renderer;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(pal.sky);
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

      addGround(THREE, scene, pal);
      const archGroup = addArch(THREE, scene, pal, pal.kind);
      addForest(THREE, scene, pal, pal.kind, density);
      addParticles(THREE, scene, pal, pal.kind, density, state.motion);

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
    if (state.raf) cancelAnimationFrame(state.raf);
    if (state.renderer) {
      try { state.renderer.dispose(); } catch (e) { /* noop */ }
    }
  }

  g.U3DScene = { mount: mount, open: open, setScroll: setScroll, destroy: destroy, state: state };
})(window);
