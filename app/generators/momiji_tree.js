/* Koemachi · generator: momiji_tree
   A Japanese maple: a slim trunk, a layered rounded crown. params: height, season (spring | summer | autumn | winter): young lime leaves tipped with coral, fresh
   green, brilliant red and orange, or bare. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  const CROWN = { spring: ['#a9d05a', '#c9dc6a', '#d9795a', '#8fc04e'], summer: ['#4f8f45', '#5fa04c', '#3f7f3f', '#6aae55'], autumn: ['#c8321f', '#e0701f', '#d9a22a', '#a82418'] };
  YX.GEN.momiji_tree = {
    label: '红枫', cls: 'nature', solid: 'trunk', face: 'random', nouns: ['红枫', '枫树', '枫叶树', '槭树', 'maple', 'japanese maple', 'momiji', 'maple tree', '紅葉', 'モミジ', '楓'],
    params: { height: { d: 4.8, min: 2, max: 16 }, season: { d: 'spring', opts: ['spring', 'summer', 'autumn', 'winter'] } }, dims: { height: 'height', size: 'height', width: 'height' }, foot: (p) => [p.height * 0.5, p.height * 0.5],
    build(b, p, rand) {
      const H = p.height, bark = '#5a4636', tr = H * 0.022 + 0.04, cols = CROWN[p.season];
      b.tube([[0, 0, 0], [(rand() - 0.5) * H * 0.1, H * 0.3, 0], [(rand() - 0.5) * H * 0.14, H * 0.55, 0]], tr, bark, { sides: 7 }); b.cyl(tr * 1.3, tr * 1.7, H * 0.04, bark, 0, 0, 0, { sides: 8 });
      if (cols) { const cr = H * 0.3; b.group({ y: H * 0.5, anim: { swing: { axis: 'z', deg: 1.6, freq: 0.2, phase: rand() * 6 } } }, () => { for (let l = 0; l < 3; l++) for (let i = 0; i < 4 - l; i++) { const a = (i / (4 - l)) * 6.283 + rand() + l, d = cr * (0.7 - l * 0.22) * (0.6 + rand() * 0.4); b.foliage(cr * (0.5 - l * 0.08) * (0.8 + rand() * 0.3), mix(cols[(i + l) % cols.length], rand() < 0.5 ? '#ffffff' : '#2a0c08', rand() * 0.08), Math.cos(a) * d, l * cr * 0.45, Math.sin(a) * d, { sy: 0.7, ry: rand() * 360 }); } }); }
      else for (let i = 0; i < 7; i++) { const a = i * 0.9 + rand(), L = H * (0.18 + rand() * 0.1); b.tube([[0, H * 0.45, 0], [Math.cos(a) * L * 0.6, H * 0.6, Math.sin(a) * L * 0.6], [Math.cos(a) * L, H * (0.72 + rand() * 0.1), Math.sin(a) * L]], tr * 0.35, bark, { sides: 5 }); }
      if (p.season === 'autumn') for (let i = 0; i < 18; i++) b.box(0.12, 0.01, 0.1, cols[i % 4], (rand() - 0.5) * H * 0.9, 0.01, (rand() - 0.5) * H * 0.9, { ry: rand() * 180, noShadow: true }); // fallen leaves
      b.anchor('top', 0, H * 0.9, 0);
    },
  };
})();
