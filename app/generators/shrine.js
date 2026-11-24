/* Koemachi · generator: shrine
   A small Shinto shrine hall (haiden): a raised wooden floor on stone, red-brown pillars, a sliding lattice door, a deep tiled roof with crossed finials (chigi),
   an offering box with a bell rope, a sacred rope (shimenawa) with white paper streamers, and two paper lanterns. params: width, depth. Front is +z. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  YX.GEN.shrine = {
    label: '神社', cls: 'building', solid: 'box', face: 'road', nouns: ['神社', '小神社', '神殿', '祠', '拜殿', 'shrine', 'small shrine', 'shinto shrine', 'temple', '神社の社殿', 'お社'],
    params: { width: { d: 6.4, min: 3, max: 14 }, depth: { d: 5.2, min: 3, max: 12 }, lit: { d: false, bool: 1 } }, dims: { width: 'width', depth: 'depth' }, foot: (p) => [p.width + 2, p.depth + 3.5],
    build(b, p, rand) {
      const w = p.width, d = p.depth, base = 0.9, H = 3.3, fz = d / 2, red = '#8f3b2a', wood = '#6b4a35', dk = C.woodDark;
      b.box(w + 1.2, base, d + 1.2, C.stone, 0, 0, 0, { tex: 'stone' }); b.box(w + 1.4, 0.1, d + 1.4, C.stoneLight, 0, base - 0.1, 0);
      b.box(w + 0.8, 0.14, d + 0.8, wood, 0, base, 0, { tex: 'wood' }); // the floor and its verandah
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cyl(0.14, 0.15, H, red, sx * (w / 2 - 0.05), base + 0.14, sz * (d / 2 - 0.05), { sides: 10 });
      b.box(w, H - 0.3, d, '#e4d8c0', 0, base + 0.14, 0, { tex: 'plaster' }); for (const sx of [-1, 1]) b.box(0.2, H, d + 0.1, red, sx * (w / 2), base + 0.14, 0);
      b.box(w - 0.5, 2.3, 0.1, '#3a2a22', 0, base + 0.2, fz + 0.04); for (let i = 1; i < 7; i++) b.box(0.04, 2.3, 0.06, '#8a6a4a', -w / 2 + 0.25 + (i * (w - 0.5)) / 7, base + 0.2, fz + 0.1); for (let r = 1; r < 5; r++) b.box(w - 0.5, 0.04, 0.06, '#8a6a4a', 0, base + 0.2 + r * 0.46, fz + 0.1); // the lattice door
      b.box(w + 0.6, 0.3, d + 0.6, red, 0, base + H - 0.2, 0);
      C.kawaraRoof(b, w + 0.6, d + 0.4, 2.0, 0, base + H + 0.1, 0, '#5b6b64', { eave: 1.2 }); // the deep roof, greenish like old copper
      for (const s of [-1, 1]) for (const r of [-28, 28]) b.box(0.08, 1.1, 0.1, '#b9a46a', s * (w / 2 + 1.2), base + H + 1.9, 0.0, { rz: r * s * 0.0, rx: r }); // the crossed finials
      for (let i = 0; i < 9; i++) b.cyl(0.06, 0.06, 0.3, '#d9c590', -w / 2 - 0.4 + (i * (w + 0.8)) / 8, base + H - 0.2, fz + 0.5, { rx: 90, sides: 6 }); // the log ends under the eaves
      // in front: steps, the offering box and bell rope, the sacred rope, two lanterns
      for (let i = 0; i < 3; i++) b.box(2.4, 0.3 * (i + 1), 0.4, C.stoneLight, 0, 0, fz + 0.6 + (2 - i) * 0.4, { tex: 'stone' });
      b.box(1.5, 0.7, 0.7, '#7a5a40', 0, base + 0.14, fz + 1.4, { tex: 'wood' }); for (let i = 0; i < 6; i++) b.box(1.5, 0.03, 0.04, dk, 0, base + 0.5 + 0.0, fz + 1.74 - i * 0.0, { noShadow: true }); b.box(1.4, 0.06, 0.72, '#4a3828', 0, base + 0.84, fz + 1.4);
      b.tube([[-0.25, base + 3.0, fz + 1.2], [-0.15, base + 2.0, fz + 1.3], [-0.1, base + 1.3, fz + 1.4]], 0.05, '#c93a2c'); b.sphere(0.14, '#d9b45a', -0.25, base + 3.05, fz + 1.2, { metal: 0.8, rough: 0.3 });
      const rp = []; for (let i = 0; i <= 12; i++) { const t = i / 12; rp.push([(t - 0.5) * (w - 0.3), base + 2.55 - 0.28 * Math.sin(t * Math.PI), fz + 0.25]); } b.tube(rp, 0.1, '#d9c590');
      for (let i = 1; i < 7; i++) { const t = i / 7; b.box(0.12, 0.45, 0.02, '#f4f0e6', (t - 0.5) * (w - 0.4), base + 2.3 - 0.28 * Math.sin(t * Math.PI), fz + 0.3, { rz: i % 2 ? 8 : -8 }); }
      for (const s of [-1, 1]) { const x = s * (w / 2 - 0.4); b.cyl(0.01, 0.01, 0.4, '#222', x, base + 2.4, fz + 0.9, { sides: 4 }); b.sphere(0.22, '#e8dcc0', x, base + 2.05, fz + 0.9, { sy: 1.2, glow: '#ffcf8a', rough: 0.7 }); b.halo(1.8, '#ffcf8a', x, base + 2.05, fz + 0.9); }
    },
  };
})();
