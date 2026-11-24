/* Koemachi · generator: traffic_mirror
   A convex curve mirror on a pole, for blind lane corners. params: height; the mirror faces +z (turn it with rotation). */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe;
  YX.GEN.traffic_mirror = {
    label: '反光镜', en: 'Curve mirror', cls: 'street', solid: 'trunk', face: 'road', nouns: ['反光镜', '凸面镜', '广角镜', 'convex mirror', 'traffic mirror', 'curve mirror', 'カーブミラー'], params: { height: { d: 3.4, min: 2, max: 6 } }, dims: { height: 'height' }, foot: () => [0.8, 0.8],
    build(b, p) {
      const h = p.height; b.cyl(0.04, 0.05, h, '#d9d4c6', 0, 0, 0, { sides: 8 }); for (let i = 0; i < 4; i++) b.cyl(0.052, 0.052, 0.18, '#c93a2c', 0, 0.4 + i * 0.5, 0, { sides: 8 }); // the red-white banding
      b.cyl(0.03, 0.03, 0.35, '#d9d4c6', 0, h - 0.1, 0.18, { rx: 90, sides: 6 });
      b.cyl(0.45, 0.45, 0.06, '#e0701f', 0, h + 0.05, 0.45, { rx: 90, sides: 20 }); b.sphere(0.4, '#dcecf4', 0, h + 0.05, 0.5, { sz: 0.18, rough: 0.18, emissive: '#6f8a99' });
    },
  };
})();
