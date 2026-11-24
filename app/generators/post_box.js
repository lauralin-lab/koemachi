/* Koemachi · generator: post_box   A red round pillar post box with a slot, a cap and a small plate. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe;
  YX.GEN.post_box = {
    label: '邮筒', en: 'Post box', cls: 'street', solid: 'trunk', face: 'road', nouns: ['邮筒', '信箱', '邮箱', 'post box', 'mailbox', 'postbox', 'ポスト', '郵便ポスト'], params: {}, foot: () => [0.7, 0.7],
    build(b) {
      b.cyl(0.32, 0.36, 0.2, '#6b6b6b', 0, 0, 0, { sides: 14 }); b.cyl(0.3, 0.32, 1.0, '#c4281f', 0, 0.2, 0, { sides: 14, rough: 0.35 }); b.cyl(0.34, 0.3, 0.1, '#a31f18', 0, 1.2, 0, { sides: 14 });
      b.sphere(0.32, '#c4281f', 0, 1.3, 0, { sy: 0.45 }); b.box(0.34, 0.07, 0.05, '#1c1c1c', 0, 1.0, 0.31); b.box(0.2, 0.14, 0.03, '#f1e8d3', 0, 0.62, 0.3); b.sphere(0.05, '#d9b45a', 0, 1.5, 0);
    },
  };
})();
