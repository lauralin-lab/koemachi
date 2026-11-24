/* Koemachi · generator: street_light
   A concrete street light on a slim pole with a short arm and a warm LED hood; it lights the lane after dark (a real light, a glow and a halo). params: height. Arm points +z. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe;
  YX.GEN.street_light = {
    label: '路灯杆', en: 'Street light', cls: 'street', solid: 'trunk', face: 'road', light: { pos: [0, 5.7, 0.9], color: '#ffd6a0', power: 0.9 }, nouns: ['路灯杆', '街灯', '路灯', '水泥路灯', 'street light', 'street lamp', 'lamp post', '街路灯', '街灯'],
    params: { height: { d: 6, min: 3, max: 12 } }, dims: { height: 'height', size: 'height' }, foot: () => [0.5, 0.5],
    build(b, p) {
      const h = p.height; b.cyl(0.07, 0.11, h, '#b9b7b0', 0, 0, 0, { sides: 8 }); b.tube([[0, h - 0.4, 0], [0, h - 0.05, 0.25], [0, h, 0.9]], 0.04, '#9a9a94');
      b.box(0.5, 0.12, 0.26, '#3b3f44', 0, h - 0.1, 1.0); b.box(0.44, 0.04, 0.22, '#fff1d6', 0, h - 0.18, 1.0, { glow: '#ffd6a0', glowK: 1.0 }); b.halo(3.4, '#ffd6a0', 0, h - 0.3, 1.0);
    },
  };
})();
