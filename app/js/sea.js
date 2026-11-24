/* Spoken World · sea: a large gently moving water surface south of the town (z > 38), a little above the ground (y = SEA_Y).
   Terraces stand in it; boats float on it (their y is relative to the floor, which is 0 out here, so give a boat y: YX.sea.level).
   The waves are a few slow sines of the vertices, recomputed every other frame (about 8 000 vertices). The mesh is made on the first frame, when the scene exists. */
'use strict';
(function () {
  const YX = window.YX, SEA_Y = YX.SEA_LEVEL || 0.1, X0 = -1200, X1 = 1200, Z0 = 38, Z1 = 1100, NX = 120, NZ = 70;
  let m = null, g = null, P = null, base = null, t = 0, tick = 0, wanted = true;
  const wave = (x, z, t) => 0.05 * Math.sin(x * 0.09 + t * 0.9) + 0.04 * Math.sin(z * 0.13 - t * 0.7 + 1.3) + 0.025 * Math.sin((x + z) * 0.21 + t * 1.7);
  function make() {
    g = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, NX, NZ); g.rotateX(-Math.PI / 2); g.translate((X0 + X1) / 2, SEA_Y, (Z0 + Z1) / 2);
    const col = new Float32Array((NX + 1) * (NZ + 1) * 3), shallow = new THREE.Color('#6cc3cf'), deep = new THREE.Color('#1f6b8f'), c = new THREE.Color(); // lighter near the shore, deeper out to sea
    for (let i = 0; i < (NX + 1) * (NZ + 1); i++) { const z = g.attributes.position.getZ(i), t = Math.min(1, Math.max(0, (z - 40) / 260)); c.copy(shallow).lerp(deep, Math.pow(t, 0.6)); col.set([c.r, c.g, c.b], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: 0.14, metalness: 0.1, transparent: true, opacity: 0.94 }));
    m.receiveShadow = true; m.frustumCulled = false; m.visible = wanted; YX.three.scene.add(m); P = g.attributes.position; base = Float32Array.from(P.array);
  }
  YX.sea = { level: SEA_Y, wave: (x, z) => SEA_Y + wave(x, z, t), show(on) { wanted = !!on; if (m) m.visible = wanted; } };
  const prev = YX.onFrame;
  YX.onFrame = function (dt) {
    if (prev) prev.apply(this, arguments);
    if (!m) { if (!YX.three || !YX.three.scene) return; make(); }
    if (!m.visible) return; t += dt; if ((tick++ & 1) === 1) return; // every second frame is enough for something this slow
    const a = P.array; for (let i = 0; i < a.length; i += 3) a[i + 1] = base[i + 1] + wave(base[i], base[i + 2], t);
    P.needsUpdate = true; g.computeVertexNormals();
  };
})();
