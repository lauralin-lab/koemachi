/* Koemachi · generator: shop_ramen
   A small ramen shop: a red lantern at the door, an indigo-and-white noren reading ラーメン, a food-sample window, a menu stand and an 営業中 (open) sign,
   steam rising from the kitchen vent. params: floors, width, sign (the sign text), lit. Front is +z. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe;
  YX.GEN.shop_ramen = {
    label: '拉面店', cls: 'building', solid: 'box', face: 'road', nouns: ['拉面店', '拉面馆', '面馆', '拉面', 'ramen shop', 'ramen', 'noodle shop', 'ラーメン屋', 'ラーメン店'],
    params: { floors: { d: 2, min: 1, max: 3, int: 1 }, width: { d: 6.4, min: 4, max: 10 }, depth: { d: 8, min: 5, max: 12 }, sign: { d: 'ラーメン', text: 1 }, lit: { d: true, bool: 1 } }, dims: { height: 'floors', width: 'width', depth: 'depth' }, foot: (p) => [p.width + 1, p.depth + 1.5],
    build(b, p, rand) {
      const w = p.width, d = p.depth, S = C.shopFront(b, rand, { w, d, floors: p.floors, wall: '#ece3cf', sign: p.sign, signBg: '#1f1b19', signFg: '#f4efe0', awning: [C.vermilion, '#f4efe0'], noren: { color: '#a42d22', text: 'ラーメン', fg: '#f4efe0' }, lit: p.lit }), fz = S.fz, y = S.base;
      for (const s of [-1, 1]) { const x = s * (w / 2 - 0.45); b.cyl(0.015, 0.015, 0.4, '#222', x, y + 2.2, fz + 0.95, { sides: 4 }); b.sphere(0.27, C.lantern, x, y + 1.95, fz + 0.95, { sy: 1.25, glow: '#ff9a50', rough: 0.6 }); b.cyl(0.16, 0.16, 0.05, '#222', x, y + 1.62, fz + 0.95, { sides: 8 }); b.halo(2.2, '#ffa060', x, y + 1.95, fz + 1.0); } // the red lanterns
      b.text('営業中', 0.3, '#f4efe0', w / 2 - 1.0, y + 1.7, fz + 0.1, { bg: '#2f5d3a' }); // the open sign
      b.box(0.7, 1.0, 0.06, '#f4efe0', -w / 2 + 0.6, y + 0, fz + 1.4, { rx: 12 }); b.box(0.7, 1.0, 0.06, '#f4efe0', -w / 2 + 0.6, y + 0, fz + 1.55, { rx: -12 }); b.text('醤油 味噌', 0.2, '#222', -w / 2 + 0.6, y + 0.55, fz + 1.5, {}); // the menu stand
      b.cyl(0.18, 0.2, 0.28, '#d9d4c6', -w / 2 + 1.2, y + 0.78, fz + 0.1, { sides: 10 }); for (let k = 0; k < 3; k++) b.sphere(0.12 + k * 0.03, '#f6f6f2', w * 0.12 + (k % 2) * 0.1, y + 3.2 + k * 0.5, -d * 0.2, { opacity: 0.35 - k * 0.08, noShadow: true, sy: 0.9, anim: { bob: { amp: 0.06, freq: 0.5 + k * 0.1 } } }); // a bowl of ramen in the window, and steam over the roof vent
    },
  };
})();
