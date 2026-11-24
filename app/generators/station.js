/* Koemachi · generator: station
   A tiny unstaffed station: a low platform beside the track, a small wooden waiting shelter with a kawara roof, a bench, a name board (声町 / こえまち / Koemachi),
   a timetable, a ticket validator, a bicycle rack and two lamps. The platform is 0.7 m high and walkable. It runs along x; the track lies on its +z side
   (put the track's centre line 2.7 m in front of the station's origin). */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe;
  YX.GEN.station = {
    label: '车站', cls: 'building', solid: false, face: 'road', nouns: ['车站', '小车站', '火车站', '无人车站', 'station', 'train station', 'railway station', '駅', '無人駅'],
    params: { length: { d: 18, min: 8, max: 40 }, name: { d: '声町', text: 1 } }, dims: { width: 'length' }, foot: (p) => [p.length, 4.4],
    floor: (p, lx, lz) => (Math.abs(lx) <= p.length / 2 && lz >= -2.2 && lz <= 0.9 ? 0.7 : null),
    build(b, p, rand) {
      const L = p.length; b.box(L, 0.7, 3.1, '#b9b3a4', 0, 0, -0.65, { tex: 'stone' }); b.box(L, 0.04, 0.4, '#f0c020', 0, 0.7, 0.72, { noShadow: true }); // the platform, and its yellow edge line
      const x0 = -L * 0.18; // the shelter
      for (const s of [-1, 1]) for (const z of [-1.7, -0.3]) b.box(0.16, 2.5, 0.16, C.woodDark, x0 + s * 2.3, 0.7, z);
      b.box(4.9, 2.2, 0.1, C.wood, x0, 0.7, -1.78, { tex: 'wood' }); for (const s of [-1, 1]) b.box(0.1, 2.2, 1.4, C.wood, x0 + s * 2.36, 0.7, -1.05, { tex: 'wood' });
      C.kawaraRoof(b, 4.9, 2.2, 0.9, x0, 3.2, -1.0, C.kawara, { eave: 0.5 });
      b.box(3.2, 0.1, 0.5, C.woodLight, x0, 1.15, -1.5, { tex: 'wood' }); for (const s of [-1.2, 1.2]) b.box(0.08, 0.45, 0.4, C.woodDark, x0 + s, 0.7, -1.5);
      b.box(1.4, 0.9, 0.05, '#e8eef0', x0 + 1.6, 1.9, -1.72); b.box(1.3, 0.8, 0.04, '#33414d', x0 + 1.6, 1.95, -1.69, { glow: '#fff4d6', glowK: 0.4 }); // the timetable
      C.sign(b, p.name, 2.6, 0.7, x0, 3.3, 0.18, C.indigo, '#f4f0e6'); b.text('こえまち  KOEMACHI', 0.34, '#f4f0e6', x0, 3.02, 0.2, { bg: C.indigo });
      for (const s of [-1, 1]) { const x = x0 + s * L * 0.38; b.cyl(0.05, 0.06, 3.0, C.iron, x, 0.7, 0.2, { sides: 8 }); b.cyl(0.2, 0.12, 0.16, '#fff3d6', x, 3.55, 0.2, { glow: '#ffd9a0', sides: 8 }); b.halo(3, '#ffd9a0', x, 3.6, 0.2); }
      b.box(0.5, 1.1, 0.4, '#5a7a8a', L * 0.38, 0.7, -1.9); b.box(0.36, 0.2, 0.05, '#e8eef0', L * 0.38, 1.55, -1.69); // the validator
      for (let i = 0; i < 5; i++) b.torus(0.18, 0.025, '#8d9399', -L * 0.44 + i * 0.35, 0.7 + 0.2, -2.0, { ry: 0 }); // a small bicycle rack
    },
  };
})();
