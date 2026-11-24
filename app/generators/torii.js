/* Koemachi · generator: torii
   A vermilion shrine gate: two round pillars on black stone bases, a tie beam (nuki) through them, and a curved top lintel (kasagi) with a black cap (shimaki),
   with a small plaque. params: height, width, color, shimenawa (a sacred rope across). Faces +z (walk through it along z). */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  YX.GEN.torii = {
    label: '鸟居', cls: 'street', solid: false, face: 'road', mainColor: 'color', nouns: ['鸟居', '神社大门', '红色鸟居', '神门', 'torii', 'shrine gate', 'torii gate', '鳥居'],
    params: { height: { d: 4.8, min: 2, max: 20 }, width: { d: 4.2, min: 2, max: 16 }, color: { d: C.vermilion, color: 1 }, shimenawa: { d: false, bool: 1 } }, dims: { height: 'height', width: 'width', size: 'height' }, foot: (p) => [p.width + 1, 1.2],
    build(b, p) {
      const H = p.height, W = p.width, r = H * 0.04, c = p.color, dk = '#1d1b1a';
      for (const s of [-1, 1]) { b.cyl(r * 1.35, r * 1.5, H * 0.07, '#2b2a28', s * W / 2, 0, 0, { sides: 12, tex: 'stone' }); b.cyl(r, r * 1.12, H * 0.93, c, s * W / 2, H * 0.07, 0, { sides: 14, rough: 0.5 }); b.cyl(r * 1.08, r * 1.08, H * 0.02, dk, s * W / 2, H * 0.2, 0, { sides: 14 }); }
      b.box(W + r * 3.2, H * 0.045, r * 1.5, c, 0, H * 0.74, 0, { rough: 0.5 }); // the tie beam, sticking out past the pillars
      for (const s of [-1, 1]) b.box(r * 0.5, H * 0.09, r * 1.0, mix(c, '#000000', 0.2), s * (W / 2 - r * 1.2), H * 0.7, 0); // the wedges that hold it
      const kw = W + H * 0.5, kk = []; for (let i = 0; i <= 12; i++) { const t = i / 12, x = (t - 0.5) * kw, y = H + 0.02 * H + Math.pow(Math.abs(t - 0.5) * 2, 2.2) * H * 0.07; kk.push([x, y, 0]); } // the top lintel curves up at its ends
      b.tube(kk, r * 0.9, c); b.tube(kk.map((q) => [q[0], q[1] - r * 1.3, q[2]]), r * 0.7, dk);
      b.box(W * 0.9, H * 0.04, r * 1.4, c, 0, H * 0.94, 0);
      b.box(W * 0.16, H * 0.15, r * 0.5, '#e8e0cc', 0, H * 0.78, r * 0.9); b.text('声町神社', Math.min(H * 0.12, W * 0.12), '#1d1b1a', 0, H * 0.8, r * 1.2, {}); // the plaque
      if (p.shimenawa) { const rp = []; for (let i = 0; i <= 10; i++) { const t = i / 10; rp.push([(t - 0.5) * W * 0.92, H * 0.68 - Math.sin(t * Math.PI) * -0.0 - 0.18 * Math.sin(t * Math.PI), 0]); } b.tube(rp, 0.09, '#d9c590'); for (let i = 1; i < 6; i++) { const t = i / 6; b.box(0.05, 0.4, 0.02, '#f4f0e6', (t - 0.5) * W * 0.9, H * 0.6 - 0.18 * Math.sin(t * Math.PI), 0.05); } }
      b.anchor('top', 0, H * 1.1, 0);
    },
  };
})();
