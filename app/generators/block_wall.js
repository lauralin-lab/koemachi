/* Koemachi · generator: block_wall
   A low garden wall of grey concrete blocks with a capping course, the kind that lines a narrow lane; optionally with a small wooden gate gap left open.
   params: length, height, color. Runs along x. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  YX.GEN.block_wall = {
    label: '围墙', cls: 'street', solid: 'box', face: 'road', nouns: ['围墙', '矮墙', '水泥砖墙', '院墙', 'block wall', 'garden wall', 'low wall', 'wall', 'ブロック塀'],
    params: { length: { d: 8, min: 1, max: 60 }, height: { d: 1.2, min: 0.4, max: 3 }, color: { d: '#b9b7b0', color: 1 } }, dims: { width: 'length', height: 'height' }, foot: (p) => [p.length, 0.3],
    build(b, p, rand) {
      const L = p.length, H = p.height; b.box(L, H - 0.08, 0.2, p.color, 0, 0, 0, { tex: 'brick' }); b.box(L + 0.06, 0.08, 0.28, mix(p.color, '#ffffff', 0.2), 0, H - 0.08, 0);
      for (let i = 0; i < Math.floor(L / 2.4); i++) b.box(0.06, H - 0.08, 0.24, mix(p.color, '#000000', 0.12), -L / 2 + (i + 1) * 2.4, 0, 0, { noShadow: true });
    },
  };
})();
