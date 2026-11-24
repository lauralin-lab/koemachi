/* Koemachi · generator: train
   A short local train of one or two diesel cars in cream with an indigo-and-vermilion band, running on the track. The front is +z (turn it to run along x).
   params: cars (1-2), lit (windows lit and headlights on). The railway controller (app/js/railway.js) moves it; its wheels are at the floor, put it at y = 0.36 on the rails. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  function car(b, len, z0, front, back, lit) {
    const w = 2.8, h = 3.0, y0 = 0.55;
    b.box(w, h, len, '#efe9da', 0, y0, z0, { rough: 0.45, metal: 0.15 }); b.box(w + 0.03, 0.34, len + 0.02, C.indigo, 0, y0 + 0.55, z0); b.box(w + 0.04, 0.12, len + 0.03, C.vermilion, 0, y0 + 0.9, z0);
    b.box(w - 0.3, 0.18, len - 0.2, '#b9b3a4', 0, y0 + h, z0); b.box(1.2, 0.3, 1.4, '#c4c0b6', 0, y0 + h + 0.18, z0 - len * 0.25); b.box(1.2, 0.3, 1.4, '#c4c0b6', 0, y0 + h + 0.18, z0 + len * 0.25); // the roof and its air-conditioning boxes
    const n = Math.floor((len - 3) / 1.9); for (let i = 0; i < n; i++) for (const s of [-1, 1]) b.box(0.06, 0.95, 1.2, '#2c3a45', s * (w / 2 + 0.01), y0 + 1.5, z0 - len / 2 + 2.3 + i * 1.9, lit ? { glow: '#ffe2a8', glowK: 0.7 } : { rough: 0.2, metal: 0.3 });
    for (const zz of [-0.36, 0.36]) for (const bz of [z0 + zz * len]) { b.box(w - 0.4, 0.3, 2.6, '#3c4146', 0, 0.25, bz); for (const ax of [-0.9, 0.9]) for (const s of [-1, 1]) b.cyl(0.4, 0.4, 0.12, '#33363a', s * 1.0, 0.4, bz + ax, { rz: 90, sides: 12 }); } // bogies
    if (front) { b.box(w - 0.5, 1.0, 0.06, '#26343f', 0, y0 + 1.7, z0 + len / 2 + 0.01, { rough: 0.2 }); b.box(0.9, 0.22, 0.06, '#10161a', 0, y0 + 2.6, z0 + len / 2 + 0.02, lit ? { glow: '#ffd36a' } : {}); b.text('普通 声町', 0.2, '#ffb347', 0, y0 + 2.62, z0 + len / 2 + 0.06, {}); for (const s of [-1, 1]) { b.cyl(0.14, 0.14, 0.06, lit ? '#fffbe6' : '#c9c6bc', s * 0.9, y0 + 0.55, z0 + len / 2 + 0.03, { rx: 90, sides: 10, emissive: lit ? '#fff3c4' : null }); b.cyl(0.08, 0.08, 0.06, '#c93a2c', s * 1.1, y0 + 0.55, z0 + len / 2 + 0.03, { rx: 90, sides: 8 }); } }
    if (back) { b.box(w - 0.5, 0.9, 0.06, '#26343f', 0, y0 + 1.7, z0 - len / 2 - 0.01); }
  }
  YX.GEN.train = {
    label: '电车', cls: 'vehicle', float: true, solid: false, face: 'road', nouns: ['电车', '火车', '列车', '小火车', '柴油列车', 'train', 'railcar', 'local train', '電車', '列車', '気動車'],
    params: { cars: { d: 2, min: 1, max: 2, int: 1 }, lit: { d: false, bool: 1 } }, dims: { width: 'cars' }, foot: (p) => [3, p.cars * 17],
    build(b, p) {
      const len = 16, gap = 1.1, total = p.cars * len + (p.cars - 1) * gap;
      for (let i = 0; i < p.cars; i++) { const z0 = total / 2 - len / 2 - i * (len + gap); car(b, len, z0, i === 0, i === p.cars - 1, p.lit); if (i) b.box(1.4, 0.9, gap + 0.4, '#2b2f33', 0, 0.9, z0 + len / 2 + gap / 2); } // the gangway between cars
      b.anchor('top', 0, 3.8, 0);
    },
  };
})();
