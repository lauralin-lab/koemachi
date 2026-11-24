/* Koemachi · generator: shop_zakka
   A general store (雑貨): green signboard, striped awning, shelves and crates of brooms, buckets, baskets, tins and vegetables out on the pavement.
   params: floors, width, sign, lit. Front is +z. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  YX.GEN.shop_zakka = {
    label: '杂货店', en: 'General store', cls: 'building', solid: 'box', face: 'road', nouns: ['杂货店', '杂货铺', '小卖部', '便利店', '商店', 'general store', 'zakka', 'variety store', 'corner shop', '雑貨店', '雑貨屋'],
    params: { floors: { d: 2, min: 1, max: 3, int: 1 }, width: { d: 7.0, min: 4, max: 10 }, depth: { d: 8, min: 5, max: 12 }, sign: { d: '雑貨', text: 1 }, lit: { d: true, bool: 1 } }, dims: { height: 'floors', width: 'width', depth: 'depth' }, foot: (p) => [p.width + 1, p.depth + 2],
    build(b, p, rand) {
      const w = p.width, d = p.depth, S = C.shopFront(b, rand, { w, d, floors: p.floors, wall: '#e6dcc4', sign: p.sign, signBg: '#2f5d3a', signFg: '#f4efe0', awning: ['#d9a441', '#f4efe0'], lit: p.lit }), fz = S.fz, y = S.base;
      b.box(w - 1.2, 1.9, 0.35, C.woodLight, 0, y, fz + 0.2, { tex: 'wood' }); for (let r = 0; r < 3; r++) b.box(w - 1.3, 0.05, 0.4, C.woodDark, 0, y + 0.55 + r * 0.55, fz + 0.2); // a shelf unit along the front
      for (let i = 0; i < 8; i++) { const x = -w / 2 + 0.9 + (i * (w - 1.8)) / 7, r = i % 3; b.cyl(0.11, 0.1, 0.22, ['#c93a2c', '#4a7fb0', '#d9a441', '#6b8f4e'][i % 4], x, y + 0.6 + r * 0.55, fz + 0.28, { sides: 8 }); }
      for (let i = 0; i < 3; i++) { const x = -w / 2 + 0.7 + i * 1.0; b.cyl(0.35, 0.28, 0.42, '#9aa3a8', x, 0, fz + 1.6, { sides: 10, metal: 0.5, rough: 0.4 }); b.torus(0.3, 0.02, '#6f777c', x, 0.42, fz + 1.6, { rx: 90 }); } // tin buckets
      b.box(1.1, 0.5, 0.7, '#a77b4f', w / 2 - 1.0, 0, fz + 1.5, { tex: 'wood' }); for (let i = 0; i < 6; i++) b.sphere(0.13, ['#d9534f', '#e8a03a', '#6bb36b'][i % 3], w / 2 - 1.3 + (i % 3) * 0.3, 0.55, fz + 1.35 + (i >> 1) * 0.18); // a crate of vegetables
      for (let i = 0; i < 4; i++) b.cyl(0.03, 0.03, 1.5, '#a58a5a', -w / 2 + 3.2 + i * 0.12, 0, fz + 1.2, { rz: 8, sides: 5 }); // brooms leaning on the wall
    },
  };
})();
