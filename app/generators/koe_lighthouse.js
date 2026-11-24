/* Koemachi · generator: koe_lighthouse
   A small white harbour lighthouse with a red band, a gallery with a rail, a glazed lamp room and a green cap; it shines after dark (a real light and a halo).
   params: height. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  YX.GEN.koe_lighthouse = {
    label: '灯塔', en: 'Lighthouse', cls: 'building', solid: 'trunk', face: 'road', light: { pos: [0, 9.4, 0], color: '#ffe9a8', power: 1.6, always: true }, nouns: ['灯塔', '小灯塔', '海港灯塔', '航标灯', 'lighthouse', 'harbour light', 'harbor lighthouse', '灯台', '灯台'],
    params: { height: { d: 9, min: 4, max: 30 } }, dims: { height: 'height', size: 'height' }, foot: () => [4, 4],
    build(b, p) {
      const H = p.height, k = H / 9;
      b.cyl(1.9 * k, 2.1 * k, 0.5, C.stone, 0, 0, 0, { sides: 12, tex: 'stone' }); b.cyl(1.2 * k, 1.5 * k, H * 0.34, '#f4f1ea', 0, 0.5, 0, { sides: 14 }); b.cyl(1.04 * k, 1.2 * k, H * 0.14, C.vermilion, 0, 0.5 + H * 0.34, 0, { sides: 14 }); b.cyl(0.9 * k, 1.04 * k, H * 0.34, '#f4f1ea', 0, 0.5 + H * 0.48, 0, { sides: 14 });
      const gy = 0.5 + H * 0.82; b.cyl(1.35 * k, 1.0 * k, 0.25, '#4a4f52', 0, gy, 0, { sides: 14 }); const rail = []; for (let i = 0; i <= 14; i++) { const a = (i / 14) * 6.283; rail.push([Math.cos(a) * 1.3 * k, gy + 0.95, Math.sin(a) * 1.3 * k]); } b.tube(rail, 0.03, '#2b2f33'); for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.283; b.cyl(0.02, 0.02, 0.95, '#2b2f33', Math.cos(a) * 1.3 * k, gy + 0.25, Math.sin(a) * 1.3 * k, { sides: 4 }); }
      b.cyl(0.62 * k, 0.62 * k, 1.0, '#fff4cf', 0, gy + 0.25, 0, { sides: 12, opacity: 0.55, glow: '#ffe9a8', glowK: 1.0 }); b.cyl(0.62 * k, 0.62 * k, 0.1, '#3a4045', 0, gy + 1.25, 0, { sides: 12 }); b.cone(0.85 * k, 0.75, '#2f6b52', 0, gy + 1.3, 0, { sides: 12 }); b.sphere(0.12, '#d9b45a', 0, gy + 2.1, 0);
      b.box(0.7, 1.5, 0.16, '#6b4a35', 0, 0.5, 1.5 * k - 0.02); b.halo(9, '#ffe9a8', 0, gy + 0.7, 0);
      b.anchor('top', 0, gy + 2.2, 0);
    },
  };
})();
