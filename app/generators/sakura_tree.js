/* Koemachi · generator: sakura_tree
   A cherry tree with a dark, leaning trunk and a wide crown. params: height, season (spring | summer | autumn | winter): pink blossom, green leaves, golden leaves,
   or bare branches. Changing the season changes the crown only. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  const CROWN = { spring: ['#f6c3d3', '#f9d6e0', '#f2a9c4', '#fbe3ea'], summer: ['#5f9a4a', '#6faa52', '#4f8a44', '#7ab55c'], autumn: ['#d98a3a', '#e3a645', '#c8662b', '#e8b957'] };
  YX.GEN.sakura_tree = {
    label: '樱花树', cls: 'nature', solid: 'trunk', face: 'random', nouns: ['樱花树', '樱花', '樱树', '樱桃树', 'cherry tree', 'sakura', 'cherry blossom', '桜', '桜の木'],
    params: { height: { d: 6.2, min: 2, max: 20 }, season: { d: 'spring', opts: ['spring', 'summer', 'autumn', 'winter'] } }, dims: { height: 'height', size: 'height', width: 'height' }, foot: (p) => [p.height * 0.5, p.height * 0.5],
    build(b, p, rand) {
      const H = p.height, bark = '#4a3a35', lean = (rand() - 0.5) * H * 0.18, tr = H * 0.028 + 0.05, cols = CROWN[p.season];
      b.tube([[0, 0, 0], [lean * 0.4, H * 0.22, 0], [lean * 0.8, H * 0.38, 0.1 * H * 0.1], [lean, H * 0.5, 0]], tr, bark, { sides: 8 }); b.cyl(tr * 1.3, tr * 1.8, H * 0.05, bark, 0, 0, 0, { sides: 9 });
      const arms = []; for (let i = 0; i < 4; i++) { const a = i * 1.6 + rand() * 0.6, L = H * (0.26 + rand() * 0.1); arms.push([Math.cos(a) * L + lean, H * (0.62 + rand() * 0.12), Math.sin(a) * L]); b.tube([[lean, H * 0.48, 0], [lean + Math.cos(a) * L * 0.5, H * 0.56, Math.sin(a) * L * 0.5], arms[i]], tr * 0.5, bark, { sides: 6 }); }
      if (cols) { const cr = H * 0.28; b.group({ x: lean, y: H * 0.62, anim: { swing: { axis: 'z', deg: 1.2, freq: 0.16, phase: rand() * 6 } } }, () => {
        b.foliage(cr * 0.85, mix(cols[0], '#ffffff', rand() * 0.06), 0, cr * 0.1, 0, { sy: 0.85, ry: rand() * 360 });
        for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283 + rand() * 0.6, d = cr * (0.6 + rand() * 0.25); b.foliage(cr * (0.45 + rand() * 0.18), mix(cols[i % cols.length], rand() < 0.5 ? '#ffffff' : '#7a3a50', rand() * 0.07), Math.cos(a) * d, (rand() - 0.5) * cr * 0.5, Math.sin(a) * d, { sy: 0.8, ry: rand() * 360 }); }
        b.foliage(cr * 0.5, cols[1], (rand() - 0.5) * cr * 0.4, cr * 0.6, (rand() - 0.5) * cr * 0.4, { sy: 0.85, ry: rand() * 360 }); }); }
      else for (const a of arms) for (let k = 0; k < 3; k++) b.tube([[a[0], a[1], a[2]], [a[0] + (rand() - 0.5) * H * 0.2, a[1] + H * (0.06 + rand() * 0.1), a[2] + (rand() - 0.5) * H * 0.2]], tr * 0.22, bark, { sides: 4 }); // winter: the twigs
      if (p.season === 'spring') for (let i = 0; i < 16; i++) b.box(0.13, 0.01, 0.09, cols[i % 4], lean + (rand() - 0.5) * H * 0.8, 0.01, (rand() - 0.5) * H * 0.8, { ry: rand() * 180, noShadow: true }); // petals on the ground
      b.anchor('top', lean, H * 0.95, 0);
    },
  };
})();
