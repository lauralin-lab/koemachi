/* Koemachi · generator: shop_wagashi
   A shop of traditional sweets, pale wood and cream, with a cream noren reading 和菓子, a glass case of colourful sweets and a red parasol over a little bench.
   params: floors, width, sign, lit. Front is +z. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  YX.GEN.shop_wagashi = {
    label: '和菓子店', en: 'Wagashi shop', cls: 'building', solid: 'box', face: 'road', nouns: ['和菓子店', '和菓子', '点心铺', '甜品店', '糕点店', 'wagashi shop', 'sweets shop', 'wagashi', 'japanese sweets', '和菓子屋'],
    params: { floors: { d: 2, min: 1, max: 3, int: 1 }, width: { d: 6.0, min: 4, max: 10 }, depth: { d: 8, min: 5, max: 12 }, sign: { d: '和菓子', text: 1 }, lit: { d: true, bool: 1 } }, dims: { height: 'floors', width: 'width', depth: 'depth' }, foot: (p) => [p.width + 1, p.depth + 2],
    build(b, p, rand) {
      const w = p.width, d = p.depth, S = C.shopFront(b, rand, { w, d, floors: p.floors, wall: '#f3e8d2', sign: p.sign, signBg: '#e9dcc0', signFg: '#4a3a2c', awning: ['#7a9a6a', '#f4efe0'], noren: { color: '#efe4cc', text: '和菓子', fg: '#7a4a3c' }, lit: p.lit, roof: '#5f6b75' }), fz = S.fz, y = S.base;
      b.box(w - 1.4, 0.9, 0.5, '#d9c9a8', 0, y, fz - 0.15, { tex: 'wood' }); b.box(w - 1.5, 0.5, 0.45, '#eaf3f6', 0, y + 0.9, fz - 0.15, { opacity: 0.45, rough: 0.1 }); // the glass case
      const cols = ['#f2b5c6', '#bcd9a0', '#f6e09a', '#d9c0e8', '#f4efe6', '#e8a07a']; for (let i = 0; i < 9; i++) b.sphere(0.1, cols[i % cols.length], -w / 2 + 1.0 + (i * (w - 2)) / 8, y + 1.0, fz - 0.15, { sy: 0.7 });
      const px = w / 2 + 0.7; b.cyl(0.03, 0.03, 2.0, '#6b4f3a', px, 0, fz + 1.4, { sides: 6 }); b.cone(1.1, 0.5, '#c93a2c', px, 2.0, fz + 1.4, { sides: 12 }); b.cyl(0.015, 0.015, 0.3, '#6b4f3a', px, 2.5, fz + 1.4, { sides: 4 }); // the red parasol
      b.box(1.5, 0.08, 0.5, '#8a6a4a', px, 0.5, fz + 1.4, { tex: 'wood' }); b.box(1.4, 0.04, 0.45, '#c93a2c', px, 0.58, fz + 1.4); for (const s of [-1, 1]) b.box(0.08, 0.5, 0.4, '#6b4f3a', px + s * 0.6, 0, fz + 1.4); // and a bench with a red cloth
    },
  };
})();
