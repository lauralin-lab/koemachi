/* Koemachi · generator: lantern_string
   A line of paper lanterns on a wire, sagging between two points 'length' apart along x; the festival hangs them over lanes, the quay and the shrine path.
   The lanterns glow after dark. params: length, color (one colour or alternating red and white), height (of the wire above the floor), festival (marks the summer ones). */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  YX.GEN.lantern_string = {
    label: '灯笼串', en: 'Lantern string', cls: 'street', solid: false, face: 'none', block: false, float: true, nouns: ['灯笼串', '祭典灯笼', '挂灯笼', '纸灯笼', 'lantern string', 'paper lanterns', 'festival lanterns', 'string of lanterns', '提灯', '祭り提灯'],
    params: { length: { d: 14, min: 2, max: 80 }, height: { d: 4.4, min: 2, max: 12 }, color: { d: C.lantern, color: 1 }, festival: { d: false, bool: 1 } }, dims: { width: 'length', height: 'height', size: 'length' }, foot: (p) => [p.length, 0.6], mainColor: 'color',
    build(b, p, rand) {
      const L = p.length, H = p.height, sag = Math.min(0.9, L * 0.05), n = Math.max(3, Math.round(L / 1.25)), wire = [];
      for (let i = 0; i <= 8; i++) { const t = i / 8; wire.push([(t - 0.5) * L, H - sag * 4 * t * (1 - t), 0]); } b.tube(wire, 0.012, '#1c1f22', { sides: 3 });
      for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = (t - 0.5) * L, y = H - sag * 4 * t * (1 - t) - 0.1, red = i % 2 === 0, col = red ? p.color : '#f4efe0';
        b.cyl(0.006, 0.006, 0.18, '#222', x, y - 0.14, 0, { sides: 3 }); b.sphere(0.2, col, x, y - 0.4, 0, { sy: 1.25, glow: red ? '#ffa860' : '#ffe2a8', rough: 0.7, seg: 7 }); b.cyl(0.1, 0.1, 0.03, '#222', x, y - 0.14, 0, { sides: 6 }); b.cyl(0.1, 0.1, 0.03, '#222', x, y - 0.66, 0, { sides: 6 }); }
      for (const s of [-1, 1]) b.cyl(0.04, 0.05, H, '#8a7a66', s * (L / 2), 0, 0, { sides: 5 }); // two bamboo poles hold it up
    },
  };
})();
