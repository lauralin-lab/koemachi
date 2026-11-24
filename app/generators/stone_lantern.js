/* Koemachi · generator: stone_lantern
   A Japanese stone lantern (tōrō): a stepped base, a round post, a lantern box with two lit openings, a hipped cap and a jewel on top. It glows after dark. params: height. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  YX.GEN.stone_lantern = {
    label: '石灯笼', cls: 'street', solid: 'trunk', face: 'none', nouns: ['石灯笼', '灯笼', '石灯', '石灯篭', 'stone lantern', 'toro', 'lantern', '灯篭', '石灯籠'], params: { height: { d: 1.9, min: 0.6, max: 8 } }, dims: { height: 'height', size: 'height' }, foot: () => [0.9, 0.9],
    build(b, p) {
      const k = p.height / 1.9, g = C.stone, lg = C.stoneLight;
      b.box(0.9 * k, 0.16 * k, 0.9 * k, mix(g, '#000000', 0.1), 0, 0, 0, { tex: 'stone' }); b.cyl(0.26 * k, 0.34 * k, 0.28 * k, g, 0, 0.16 * k, 0, { sides: 8, tex: 'stone' }); b.cyl(0.13 * k, 0.15 * k, 0.62 * k, lg, 0, 0.44 * k, 0, { sides: 10 });
      b.cyl(0.34 * k, 0.2 * k, 0.12 * k, g, 0, 1.06 * k, 0, { sides: 8 }); b.box(0.42 * k, 0.4 * k, 0.42 * k, lg, 0, 1.18 * k, 0, { tex: 'stone' });
      for (const s of [-1, 1]) { b.box(0.22 * k, 0.24 * k, 0.04 * k, '#fff0c0', 0, 1.26 * k, s * 0.21 * k, { glow: '#ffb860', glowK: 0.9 }); b.box(0.04 * k, 0.24 * k, 0.22 * k, '#fff0c0', s * 0.21 * k, 1.26 * k, 0, { glow: '#ffb860', glowK: 0.9 }); }
      b.pyramid(0.86 * k, 0.34 * k, 0.86 * k, g, 0, 1.58 * k, 0, { tex: 'stone' }); b.sphere(0.07 * k, lg, 0, 1.96 * k, 0); b.halo(2.0 * k, '#ffb860', 0, 1.3 * k, 0);
    },
  };
})();
