/* Koemachi · generator: rail_track
   A straight piece of single-track railway: ballast, sleepers and two steel rails, running along x. Chain several to make a line.
   params: length (metres). The rail heads are 0.4 m above the floor. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe;
  YX.GEN.rail_track = {
    label: '铁轨', en: 'Rail track', cls: 'ground', solid: false, face: 'none', block: false, nouns: ['铁轨', '铁路', '轨道', '火车轨道', 'rail track', 'railway', 'railroad', 'track', '線路'],
    params: { length: { d: 40, min: 4, max: 200 } }, dims: { width: 'length', size: 'length' }, foot: (p) => [p.length, 3],
    build(b, p) {
      const L = p.length; b.box(L, 0.22, 2.7, '#8d8a84', 0, 0, 0, { tex: 'stone' }); b.box(L, 0.04, 1.8, '#77746e', 0, 0.2, 0, { noShadow: true });
      for (let x = -L / 2 + 0.3; x < L / 2; x += 0.62) b.box(0.22, 0.12, 2.3, '#4b4036', x, 0.22, 0);
      for (const s of [-1, 1]) { b.box(L, 0.05, 0.13, '#5d6166', 0, 0.34, s * 0.72, { metal: 0.6, rough: 0.35 }); b.box(L, 0.1, 0.06, '#5d6166', 0, 0.24, s * 0.72); }
    },
  };
})();
