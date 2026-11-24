/* Koemachi · generator: sento
   A public bathhouse: a big building with a temple-style gable over the entrance, two noren (男 / 女), a ゆ lantern sign and, behind it, a tall brick chimney
   with a thin plume of steam. params: width, depth, chimney (height), sign. Front is +z. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  YX.GEN.sento = {
    label: '澡堂', en: 'Bathhouse', cls: 'building', solid: 'box', face: 'road', nouns: ['澡堂', '浴场', '钱汤', '公共浴室', '大澡堂', 'sento', 'bathhouse', 'public bath', '銭湯', 'お風呂屋'],
    params: { width: { d: 12, min: 8, max: 18 }, depth: { d: 12, min: 8, max: 18 }, chimney: { d: 18, min: 8, max: 30 }, sign: { d: 'ゆ', text: 1 } }, dims: { width: 'width', depth: 'depth', height: 'chimney' }, foot: (p) => [p.width + 1.5, p.depth + 1.5],
    build(b, p, rand) {
      const w = p.width, d = p.depth, fz = d / 2, base = 0.5, H = 6.2, dark = C.woodDark;
      b.box(w + 0.4, base, d + 0.4, C.stoneDark, 0, 0, 0, { tex: 'stone' }); b.box(w, H, d, '#e8dfcc', 0, base, 0, { tex: 'plaster' });
      for (const s of [-1, 1]) b.box(0.22, H, d + 0.1, dark, s * (w / 2), base, 0); b.box(w + 0.3, 0.2, d + 0.3, dark, 0, base + H - 0.2, 0);
      b.box(w - 0.4, 1.5, 0.16, '#d4c8ae', 0, base + 3.6, fz + 0.04, { tex: 'wood' }); // the band under the eaves
      C.kawaraRoof(b, w, d, 2.6, 0, base + H, 0, C.kawara, { eave: 0.9 });
      // the entrance: a curved temple gable (karahafu) on two pillars, double door with two noren
      const ew = 5.2, ex = 0; for (const s of [-1, 1]) b.cyl(0.18, 0.2, 3.6, '#8a2f24', ex + s * (ew / 2 - 0.2), base, fz + 1.5, { sides: 10 });
      b.box(ew, 0.3, 0.4, '#8a2f24', ex, base + 3.5, fz + 1.5); b.box(ew + 0.6, 0.2, 2.6, C.kawara, ex, base + 3.8, fz + 0.9, { rx: -6, tex: 'roof' });
      const gp = []; for (let i = 0; i <= 10; i++) { const t = i / 10, x = (t - 0.5) * (ew + 1.6), y = 3.9 + 1.4 * Math.sin(t * Math.PI) ** 0.7; gp.push([x, y]); } b.extrude([[-(ew + 1.6) / 2, 3.9], ...gp, [(ew + 1.6) / 2, 3.9]], 0.5, '#6f7a82', ex, base, fz + 1.4, { tex: 'roof' }); // the curved gable board
      b.box(ew - 0.4, 3.2, 0.2, '#2b2420', ex, base, fz + 0.05);
      for (const [s, ch, col] of [[-1, '男', '#27406b'], [1, '女', '#a42d22']]) { b.box(ew / 2 - 0.4, 1.7, 0.04, col, ex + s * (ew / 4), base + 1.1, fz + 0.45); b.text(ch, 0.9, '#f4efe0', ex + s * (ew / 4), base + 1.55, fz + 0.5, {}); b.box(ew / 2 - 0.3, 0.06, 0.06, dark, ex + s * (ew / 4), base + 2.9, fz + 0.45); }
      b.cyl(0.02, 0.02, 0.5, '#222', ex, base + 4.2, fz + 0.1, { sides: 4 }); b.box(0.9, 1.2, 0.5, '#f4efe0', ex + ew / 2 + 1.6, base + 2.2, fz + 0.5, { glow: '#ffe2a8', glowK: 0.7 }); b.text(p.sign, 1.0, '#27406b', ex + ew / 2 + 1.6, base + 2.25, fz + 0.78, {}); b.halo(3, '#ffe2a8', ex + ew / 2 + 1.6, base + 2.6, fz + 0.9); // the ゆ lantern
      // the chimney, behind
      const ch = p.chimney, cz = -d / 2 + 1.6, cx = w / 2 - 1.8; b.box(2.2, 1.2, 2.2, C.stoneDark, cx, 0, cz, { tex: 'brick' }); b.cyl(0.55, 0.9, ch, '#9a6a52', cx, 1.2, cz, { sides: 14, tex: 'brick' }); b.cyl(0.7, 0.55, 0.5, '#6b4f43', cx, ch + 1.2, cz, { sides: 14 }); b.cyl(0.5, 0.5, 0.7, '#6b4f43', cx, ch * 0.62, cz, { sides: 14 });
      b.text('ゆ', 1.1, '#f4efe0', cx, ch * 0.45, cz + 0.8, { bg: '#27406b' });
      for (let k = 0; k < 5; k++) b.sphere(0.5 + k * 0.28, '#f4f4f0', cx + k * 0.5, ch + 2.0 + k * 1.3, cz, { opacity: 0.3 - k * 0.04, noShadow: true, anim: { bob: { amp: 0.12, freq: 0.3 + k * 0.05 } } });
    },
  };
})();
