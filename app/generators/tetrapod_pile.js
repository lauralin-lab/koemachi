/* Koemachi · generator: tetrapod_pile
   A heap of concrete tetrapods (four-armed wave breakers) along the foot of a breakwater, two rows deep, each turned a different way. params: length, size (of one block). */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  const ARMS = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map((v) => v.map((c) => c / Math.sqrt(3)));
  YX.GEN.tetrapod_pile = {
    label: '消波块', cls: 'nature', solid: false, face: 'none', block: false, nouns: ['消波块', '四脚锥体', '防波堤石块', '海边水泥块', 'tetrapod', 'tetrapods', 'wave breaker', 'breakwater blocks', 'テトラポッド', '消波ブロック'],
    params: { length: { d: 20, min: 2, max: 120 }, size: { d: 1.0, min: 0.4, max: 3 } }, dims: { width: 'length', size: 'size' }, foot: (p) => [p.length, 4],
    build(b, p, rand) {
      const s = p.size, n = Math.max(2, Math.round(p.length / (s * 2.3)));
      for (let row = 0; row < 2; row++) for (let i = 0; i < n; i++) {
        const x = -p.length / 2 + ((i + 0.5 + (row ? 0.5 : 0)) * p.length) / (n + 0.5) + (rand() - 0.5) * s * 0.4, z = (row ? 1 : -0.4) * s * 1.1 + (rand() - 0.5) * s * 0.4, a = rand() * 6.283, ca = Math.cos(a), sa = Math.sin(a), y = row * s * 0.5 + 0.25 * s;
        const col = mix('#b9b6ae', '#8f8c85', rand() * 0.6);
        for (const v of ARMS) b.tube([[x, y + s * 0.6, z], [x + (v[0] * ca + v[2] * sa) * s * 0.75, y + s * 0.6 + v[1] * s * 0.75, z + (-v[0] * sa + v[2] * ca) * s * 0.75]], s * 0.19, col, { sides: 4 });
        b.sphere(s * 0.2, col, x, y + s * 0.6, z, { flat: true, seg: 5 });
      }
    },
  };
})();
