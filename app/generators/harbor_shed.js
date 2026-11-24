/* Koemachi · generator: harbor_shed
   An open fish-market shed on the quay: a concrete floor, steel posts, a ribbed blue-grey roof, a sign (魚市場), stacks of white and blue fish crates, a weighing table,
   a hand cart and a net drying on a frame, with a string of bare bulbs along the ridge. params: length, depth. Front is +z. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  YX.GEN.harbor_shed = {
    label: '渔市场棚', cls: 'building', solid: false, face: 'road', nouns: ['渔市场', '鱼市场', '海边棚屋', '渔港棚', 'fish market', 'harbor shed', 'harbour shed', 'fish market shed', '魚市場', '漁協'],
    params: { length: { d: 16, min: 6, max: 40 }, depth: { d: 8, min: 4, max: 16 }, sign: { d: '魚市場', text: 1 } }, dims: { width: 'length', depth: 'depth' }, foot: (p) => [p.length + 1, p.depth + 1.5],
    build(b, p, rand) {
      const L = p.length, D = p.depth, H = 4.2, n = Math.max(2, Math.round(L / 4));
      b.box(L + 0.6, 0.12, D + 0.6, '#aaa79f', 0, 0, 0);
      for (let i = 0; i <= n; i++) for (const s of [-1, 1]) b.box(0.18, H, 0.18, '#5b6670', -L / 2 + (i * L) / n, 0.12, s * (D / 2 - 0.1));
      b.box(L + 1, 0.2, D + 0.9, '#7f8d96', 0, H + 0.12, 0, { rx: 0 }); b.roof(L + 1.0, 1.1, D + 1.0, '#8ea0a8', 0, H + 0.3, 0, { rough: 0.5 });
      for (let i = 0; i < L * 2; i++) b.box(0.05, 0.04, D + 1.0, '#6f7f87', -L / 2 + 0.25 + i * 0.5, H + 0.62 + 0.0, 0, { noShadow: true }); // the ribs of the roof
      b.box(L * 0.5, 0.9, 0.12, C.indigo, 0, H - 0.9, D / 2 + 0.02); b.text(p.sign, 0.75, '#f4efe0', 0, H - 0.84, D / 2 + 0.1, { bg: C.indigo });
      b.box(L, 0.1, 0.06, '#222', 0, H + 0.0, -D / 2 + 0.2); for (let i = 0; i < n * 2; i++) { const x = -L / 2 + 0.5 + (i * (L - 1)) / (n * 2 - 1); b.sphere(0.1, '#fff0c0', x, H - 0.3, -D / 2 + 0.2, { glow: '#ffd68a', glowK: 0.9 }); }
      for (let s = 0; s < Math.max(3, Math.round(L / 3.5)); s++) { const x = -L / 2 + 1.2 + s * 3.3, h = 2 + Math.floor(rand() * 3); for (let k = 0; k < h; k++) b.box(0.9, 0.34, 0.6, (s + k) % 3 ? '#eef0ee' : '#3f7fb5', x, 0.12 + k * 0.34, -D / 2 + 1.0, { rough: 0.5 }); }
      b.box(2.0, 0.9, 1.0, '#8a8f93', L * 0.2, 0.12, D * 0.1, { metal: 0.5, rough: 0.4 }); b.box(0.8, 0.06, 0.6, '#c9c4b8', L * 0.2 + 0.4, 1.0, D * 0.1);
      b.box(1.2, 0.08, 0.7, '#b0865a', -L * 0.3, 0.55, D * 0.15, { tex: 'wood' }); for (const sx of [-1, 1]) b.cyl(0.2, 0.2, 0.06, '#222', -L * 0.3 + sx * 0.5, 0.2, D * 0.15 + 0.45, { rz: 90, sides: 10 }); // a hand cart
      for (const s of [-1, 1]) b.cyl(0.04, 0.04, 2.2, '#8a6a4a', L / 2 - 1.5 + s * 1.2, 0.12, D * 0.3, { sides: 6 }); b.box(2.6, 1.3, 0.04, '#3f6f5a', L / 2 - 1.5, 0.8, D * 0.3, { opacity: 0.6 }); // a net drying on a frame
    },
  };
})();
