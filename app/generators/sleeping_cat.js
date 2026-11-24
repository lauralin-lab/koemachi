/* Koemachi · generator: sleeping_cat   A cat curled up asleep, with a slowly breathing back. params: color (fur), pattern (plain | tabby | tuxedo). */
'use strict';
(function () {
  const YX = window.YX, mix = YX.mixHex;
  YX.GEN.sleeping_cat = {
    label: '睡着的猫', en: 'Sleeping cat', cls: 'creature', solid: false, face: 'random', nouns: ['睡着的猫', '睡觉的猫', '猫', '小猫', 'sleeping cat', 'cat asleep', '寝ている猫'],
    params: { color: { d: '#d98b3a', color: 1, pick: ['#d98b3a', '#5a5a5e', '#e8e4da', '#3a3430'] }, pattern: { d: 'tabby', opts: ['plain', 'tabby', 'tuxedo'] } }, dims: { size: 'color' }, foot: () => [0.7, 0.6], mainColor: 'color',
    build(b, p, rand) {
      const c = p.color, dk = mix(c, '#000000', 0.3);
      b.group({ anim: { pulse: { amp: 0.03, freq: 0.5 } } }, () => { b.sphere(0.22, c, 0, 0.17, 0, { sx: 1.25, sy: 0.7, sz: 1.0 }); });
      b.sphere(0.13, c, 0.28, 0.12, 0.06, { sx: 1, sy: 0.9 }); for (const s of [-1, 1]) b.cone(0.045, 0.1, dk, 0.32, 0.22, 0.06 + s * 0.07, { sides: 4 });
      b.tube([[-0.25, 0.07, 0.1], [-0.38, 0.06, 0.28], [-0.12, 0.05, 0.3]], 0.04, c);
      if (p.pattern === 'tabby') for (let i = 0; i < 4; i++) b.box(0.03, 0.02, 0.2, dk, -0.12 + i * 0.1, 0.3, 0, { noShadow: true });
      if (p.pattern === 'tuxedo') b.sphere(0.1, '#f4f0e6', 0.3, 0.07, 0.12, { sy: 0.6 });
    },
  };
})();
