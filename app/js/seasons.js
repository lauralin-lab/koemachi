/* Koemachi · seasons: spring, summer, autumn and winter in the town.
   The season is one value of the world's environment (W.env.season, set by "make it autumn" or {"op":"env","season":"autumn"}, saved and undone like the weather).
   When it changes, over about two seconds:
     - the cherry and maple trees are rebuilt in the new season's dress, the old one dissolving over the new (YX.dissolve);
     - in or out of winter, the roofs and the terraces are rebuilt with or without snow (generators read YX.koe.season);
     - the ground goes green, dry or white (the engine tweens its colour);
     - petals (spring), leaves (autumn) or snow (winter) fall round the player, fading in as the last ones fade out;
     - in summer, strings of festival lanterns go up over the lanes, the quay and the shrine path, and come down again after.
   The player's own trees (a cherry tree asked for in the middle of winter) are bare because their season defaults to this one. */
'use strict';
(function () {
  const YX = window.YX, W = YX.world, C = YX.koe, GROUND = { spring: 'grass', summer: 'grass', autumn: 'dry', winter: 'snow' };
  const TREES = new Set(['sakura_tree', 'momiji_tree']), SNOWY = new Set(['machiya', 'shop_ramen', 'shop_wagashi', 'shop_zakka', 'sento', 'shrine', 'station', 'terrace', 'harbor_shed']);
  const S = (YX.seasons = { applied: null, queue: [], level: { petal: 0, leaf: 0, snow: 0 }, target: { petal: 1, leaf: 0, snow: 0 }, per: 14, dur: 1.4 });

  /* the old look of an object dissolves over its new look: a clone of the old one fades out above the rebuilt one */
  YX.dissolve = function (o, change, dur) {
    let ghost = null;
    if (o.mesh && o.holder && Math.hypot(o.x - W.player.x, o.z - W.player.z) < 160) {
      ghost = o.mesh.clone(true); ghost.traverse((c) => { if (c.material) { const f = (m) => { const k = m.clone(); k.transparent = true; k.depthWrite = false; return k; }; c.material = Array.isArray(c.material) ? c.material.map(f) : f(c.material); } });
    }
    change();
    if (ghost && !o.dead) { o.holder.add(ghost); YX.tween(dur || S.dur, (k) => ghost.traverse((c) => { if (c.material) for (const m of [].concat(c.material)) m.opacity = 1 - k; }), { done: () => { o.holder.remove(ghost); ghost.traverse((c) => { if (c.material) for (const m of [].concat(c.material)) m.dispose(); }); } }); }
  };

  /* ---------- the change ---------- */
  function apply(next, prev, instant) {
    C.season = next; const winterFlip = (prev === 'winter') !== (next === 'winter'), cam = YX.three.camera.position, list = [];
    for (const o of W.objs.values()) {
      if (o.dead) continue;
      if (TREES.has(o.type)) list.push(() => { o.params.season = next; YX.rebuild(o); }, o);
      else if (winterFlip && SNOWY.has(o.type)) { if (o.type === 'terrace' && ['asphalt', 'concrete'].includes(o.params.top)) continue; list.push(() => YX.rebuild(o), o); }
    }
    const jobs = []; for (let i = 0; i < list.length; i += 2) jobs.push({ change: list[i], o: list[i + 1] });
    jobs.sort((a, b) => Math.hypot(a.o.x - cam.x, a.o.z - cam.z) - Math.hypot(b.o.x - cam.x, b.o.z - cam.z)); // the ones in front of you change first
    if (instant) for (const j of jobs) j.change(); else S.queue = S.queue.concat(jobs);
    YX.setEnv({ ground: GROUND[next] }, instant ? { instant: true } : undefined);
    S.target = { petal: next === 'spring' ? 1 : 0, leaf: next === 'autumn' ? 1 : 0, snow: next === 'winter' ? 1 : 0 };
    if (instant) for (const k in S.level) S.level[k] = S.target[k];
    festival(next === 'summer', instant);
  }
  function festival(on, instant) { // the strings of lanterns that go up for the summer festival
    const have = Array.from(W.objs.values()).filter((o) => o.type === 'lantern_string' && o.params.festival && !o.dead);
    if (on && !have.length) { for (const f of C.festival || []) YX.spawn({ type: 'lantern_string', x: f[0], z: f[1], rot: (f[2] || 0) * YX.DEG, params: { length: f[3], height: f[4] || 4.4, festival: true }, seed: 77 + Math.floor(f[0] * 3) }, { animate: !instant }); }
    if (!on) for (const o of have) YX.removeObj(o, { animate: !instant });
  }

  /* ---------- falling petals, leaves and snow ---------- */
  const BX = 46, BZ = 46, LOW = -9, BH = 24, KIND = {
    petal: { n: 950, size: 0.18, colors: ['#f7c4d4', '#fbd9e3', '#f2a9c4', '#ffffff'], fall: [0.45, 0.95], sway: 1.0, wind: 0.5, shape: 'petal' },
    leaf: { n: 700, size: 0.24, colors: ['#c8321f', '#e0701f', '#d9a22a', '#a82418'], fall: [0.9, 1.6], sway: 1.4, wind: 0.8, shape: 'leaf' },
    snow: { n: 1500, size: 0.12, colors: ['#ffffff', '#eef4fa'], fall: [0.7, 1.3], sway: 0.35, wind: 0.25, shape: 'dot' },
  };
  const sys = {}; let t = 0;
  function texture(shape) {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.translate(32, 32); g.fillStyle = '#fff';
    if (shape === 'dot') { const r = g.createRadialGradient(0, 0, 2, 0, 0, 30); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.beginPath(); g.arc(0, 0, 30, 0, 6.283); g.fill(); }
    else if (shape === 'petal') { g.rotate(-0.6); g.beginPath(); g.ellipse(0, 0, 26, 14, 0, 0, 6.283); g.fill(); g.fillStyle = 'rgba(0,0,0,0.12)'; g.beginPath(); g.ellipse(-8, 0, 8, 4, 0, 0, 6.283); g.fill(); }
    else { g.rotate(0.5); g.beginPath(); g.moveTo(0, -28); g.quadraticCurveTo(24, -6, 0, 28); g.quadraticCurveTo(-24, -6, 0, -28); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.moveTo(0, -24); g.lineTo(0, 26); g.stroke(); }
    const tx = new THREE.CanvasTexture(c); return tx;
  }
  function make(name) {
    const K = KIND[name], n = K.n, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), data = [], tint = new THREE.Color();
    for (let i = 0; i < n; i++) { const r = Math.random; tint.set(K.colors[Math.floor(r() * K.colors.length)]); col.set([tint.r, tint.g, tint.b], i * 3); data.push({ x: r() * BX, y: r() * BH, z: r() * BZ, v: K.fall[0] + r() * (K.fall[1] - K.fall[0]), ph: r() * 6.283, sw: 0.6 + r() * 0.8 }); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.Points(g, new THREE.PointsMaterial({ size: K.size, map: texture(K.shape), vertexColors: true, transparent: true, opacity: 0, depthWrite: false, alphaTest: 0.02, sizeAttenuation: true }));
    m.frustumCulled = false; m.visible = false; YX.three.scene.add(m); return { K, g, m, data, pos };
  }
  const wrap = (v, size, low) => ((((v - low) % size) + size) % size) + low;
  function fall(dt, daylight) {
    const cam = YX.three.camera.position;
    for (const name in KIND) {
      const lv = S.level[name] += Math.max(-dt * 0.55, Math.min(dt * 0.55, S.target[name] - S.level[name])); // a little under two seconds
      let s = sys[name]; if (lv < 0.01) { if (s) s.m.visible = false; continue; } if (!s) s = sys[name] = make(name);
      s.m.visible = true; s.m.material.opacity = lv * (name === 'snow' ? 0.9 : 0.95); const lum = 0.3 + 0.7 * daylight; s.m.material.color.setRGB(lum, lum, lum);
      const K = s.K, P = s.pos;
      for (let i = 0; i < s.data.length; i++) {
        const d = s.data[i], k = t * d.sw + d.ph;
        P[i * 3] = cam.x + wrap(d.x + t * K.wind + Math.sin(k) * K.sway - cam.x, BX, -BX / 2);
        P[i * 3 + 1] = cam.y + wrap(d.y - t * d.v - cam.y + 3, BH, LOW);
        P[i * 3 + 2] = cam.z + wrap(d.z + Math.cos(k * 0.8) * K.sway * 0.7 - cam.z, BZ, -BZ / 2);
      }
      s.g.attributes.position.needsUpdate = true;
    }
  }
  const dayLight = () => { const h = W.env.time; return h < 5 ? 0.15 : h < 7 ? 0.15 + (h - 5) * 0.425 : h < 17 ? 1 : h < 19.5 ? 1 - (h - 17) * 0.34 : 0.15; };

  /* ---------- the frame ---------- */
  const prev = YX.onFrame, restore0 = YX.restore;
  YX.restore = function (data) { if (data && data.env && YX.SEASONS.includes(data.env.season)) { C.season = data.env.season; S.applied = data.env.season; for (const k in S.level) S.level[k] = S.target[k] = (k === 'petal' ? 'spring' : k === 'leaf' ? 'autumn' : 'winter') === data.env.season ? 1 : 0; } return restore0.apply(this, arguments); }; // a saved world comes back in its own season, with no dissolve
  YX.onFrame = function (dt) {
    if (prev) prev.apply(this, arguments);
    if (!YX.three || !YX.three.scene) return; t += dt;
    if (S.applied == null) { S.applied = W.env.season || 'spring'; C.season = S.applied; S.target = { petal: S.applied === 'spring' ? 1 : 0, leaf: S.applied === 'autumn' ? 1 : 0, snow: S.applied === 'winter' ? 1 : 0 }; for (const k in S.level) S.level[k] = S.target[k]; }
    else if (W.env.season !== S.applied && YX.SEASONS.includes(W.env.season)) { const before = S.applied; S.applied = W.env.season; apply(S.applied, before, false); }
    for (let i = 0; i < S.per && S.queue.length; i++) { const j = S.queue.shift(); if (j.o.dead) continue; try { YX.dissolve(j.o, j.change, S.dur); } catch (e) { console.warn('season', e); } }
    fall(dt, dayLight());
  };
})();
