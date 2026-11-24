/* Koemachi · generator: fishing_boat
   A small fishing boat for the harbour: a pointed two-tier hull, a wheelhouse, a mast with a boom, fenders, buoys, crates and a row of squid lamps that glow at night.
   It bobs and rolls gently. params: length, hull (colour), band (colour of the stripe), name. Bow is +z. Put it on the water: y = YX.sea.level. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  const HULLS = ['#f1eee6', '#e9edf0', '#dfe8ec', '#f4e9d2'], BANDS = [C.indigo, C.vermilion, '#2f7a6a', '#c9a02f'];
  YX.GEN.fishing_boat = {
    label: '渔船', en: 'Fishing boat', cls: 'vehicle', float: true, solid: false, face: 'road', mainColor: 'hull', nouns: ['渔船', '小渔船', '船', '小船', '渔舟', 'fishing boat', 'boat', 'fishing vessel', 'small boat', '漁船', '船'],
    params: { length: { d: 9, min: 4, max: 20 }, hull: { d: '#f1eee6', color: 1, pick: HULLS }, band: { d: C.indigo, color: 1, pick: BANDS }, name: { d: '声丸', text: 1 } }, dims: { size: 'length', width: 'length' }, foot: (p) => [p.length * 0.3, p.length],
    build(b, p, rand) {
      const L = p.length, B = L * 0.3, plan = (len, bw) => [[-len / 2, -bw / 2], [len / 2 - L * 0.28, -bw / 2], [len / 2, 0], [len / 2 - L * 0.28, bw / 2], [-len / 2, bw / 2]].map(([x, z]) => [x, -z]); // outline seen from above (the group below turns it flat)
      b.group({ anim: { bob: { amp: 0.05, freq: 0.55 } } }, () => b.group({ anim: { swing: { axis: 'z', deg: 1.6, freq: 0.42, phase: rand() * 6 } } }, () => b.group({ ry: -90 }, () => {
        b.group({ rx: -90, y: -0.35 }, () => { b.extrude(plan(L * 0.96, B * 0.7), 0.6, '#6e3a2e', 0, 0, 0.3, {}); b.extrude(plan(L, B), 0.62, p.hull, 0, 0, 0.6 + 0.31, {}); b.extrude(plan(L + 0.04, B + 0.04), 0.14, p.band, 0, 0, 0.78, {}); }); // the red-brown underwater hull, the white topsides, the stripe
        b.group({ rx: -90, y: 0.2 }, () => b.extrude(plan(L - 0.4, B - 0.3), 0.12, '#b8956a', 0, 0, 0.9, { tex: 'wood' })); // the deck
        for (const s of [-1, 1]) b.tube([[-L / 2, 1.05, s * B / 2], [L / 2 - L * 0.28, 1.05, s * B / 2], [L / 2, 1.05, 0]], 0.03, '#c9c4b8'); // the rail
        const cx = -L * 0.12; b.box(B * 0.72, 1.35, L * 0.26, '#f4f1e8', cx, 1.0, 0); b.box(B * 0.76, 0.1, L * 0.3, p.band, cx, 2.3, 0); // the wheelhouse
        for (const s of [-1, 1]) b.box(0.04, 0.5, L * 0.18, '#2c3a45', s * (B * 0.36 + 0.01), 1.55, 0, { glow: '#ffe2a8', glowK: 0.6 }); b.box(B * 0.6, 0.5, 0.04, '#2c3a45', cx + 0, 1.55, L * 0.13 + 0.01, { glow: '#ffe2a8', glowK: 0.6 });
        b.cyl(0.07, 0.09, 3.4, '#8a8f93', L * 0.2, 0.9, 0, { sides: 8 }); b.tube([[L * 0.2, 3.5, 0], [L * 0.0, 2.8, 0.0], [-L * 0.1, 2.4, 0]], 0.04, '#8a8f93'); b.box(0.5, 0.1, 0.1, '#222', L * 0.2, 3.9, 0); // the mast and boom
        b.box(0.08, 0.08, B * 0.9, '#8a8f93', cx, 2.5, 0); for (let i = 0; i < 6; i++) { const z = -B * 0.4 + (i * B * 0.8) / 5; b.sphere(0.13, '#fffbe6', cx, 2.5, z, { emissive: '#fff3c4', seg: 6 }); b.halo(1.6, '#fff3c4', cx, 2.5, z); } // the squid lamps
        for (const s of [-1, 1]) for (let i = 0; i < 3; i++) b.torus(0.17, 0.07, '#202224', -L * 0.3 + i * L * 0.3, 0.75, s * (B / 2 + 0.05), { ry: 90 }); // tyre fenders
        for (let i = 0; i < 3; i++) b.sphere(0.2, '#e8742a', L * 0.12 + i * 0.35, 1.15, B * 0.3, { flat: true, seg: 5 });
        b.box(0.7, 0.4, 0.5, '#3f7fb5', -L * 0.38, 1.0, -0.4); b.box(0.7, 0.4, 0.5, '#e8e8e2', -L * 0.38, 1.0, 0.4); b.text(p.name, 0.34, '#1f1b19', -L / 2 - 0.02, 0.95, 0, { ry: 90 });
      })));
    },
  };
})();
