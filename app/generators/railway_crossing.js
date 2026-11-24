/* Koemachi · generator: railway_crossing
   The warning post of a level crossing: a striped post with a cross-arm of two red lamps, a crossbuck sign and a bell box.
   params: alarm (lamps flash), phase (0 or 1: which lamp is lit while alarm is on; the railway controller flips it twice a second). Faces +z. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe;
  YX.GEN.railway_crossing = {
    label: '道口警报器', cls: 'street', solid: 'trunk', face: 'road', nouns: ['道口警报器', '道口', '铁路道口', '平交道', 'railway crossing', 'level crossing', 'crossing signal', '踏切', '踏切警報機'],
    params: { alarm: { d: false, bool: 1 }, phase: { d: 0, min: 0, max: 1, int: 1 } }, foot: () => [1.6, 0.8],
    build(b, p) {
      for (let i = 0; i < 8; i++) b.cyl(0.075, 0.075, 0.4, i % 2 ? '#1c1c1c' : '#f0c020', 0, i * 0.4, 0, { sides: 8 });
      b.box(2.5, 0.12, 0.12, '#1c1c1c', 0, 3.0, 0); b.cyl(0.09, 0.09, 0.12, '#1c1c1c', 0, 3.2, 0, { sides: 8 });
      for (const [k, s] of [[0, -1], [1, 1]]) { const on = p.alarm && p.phase === k; b.cyl(0.2, 0.2, 0.12, '#222', s * 0.85, 2.8, 0.06, { rx: 90, sides: 14 }); b.cyl(0.16, 0.16, 0.06, on ? '#ff3b2a' : '#6b1a14', s * 0.85, 2.8, 0.13, { rx: 90, sides: 14, emissive: on ? '#ff3b2a' : null }); if (on) b.halo(1.4, '#ff3b2a', s * 0.85, 3.0, 0.4); b.box(0.5, 0.05, 0.3, '#222', s * 0.85, 3.0, 0.2); } // the lamp hoods
      for (const r of [-38, 38]) b.box(1.5, 0.2, 0.05, '#f4f0e6', 0, 2.1, 0.06, { rz: r }); // the crossbuck
      b.box(0.3, 0.4, 0.2, '#8d9399', 0.2, 1.1, 0.12); b.box(0.3, 0.04, 0.22, '#c93a2c', 0.2, 1.25, 0.12);
    },
  };
})();
