/* Koemachi · generator: road_marking
   Paint on the road, lying flat: the word 止まれ (stop) in white, and a stop line beyond it (+z). params: text, size, bar (a stop line). */
'use strict';
(function () {
  const YX = window.YX;
  YX.GEN.road_marking = {
    label: '路面标线', en: 'Road marking', cls: 'ground', flat: true, solid: false, face: 'none', block: false, nouns: ['路面标线', '停止线', '止まれ', '停车标线', 'road marking', 'stop marking', 'road paint'],
    params: { text: { d: '止まれ', text: 1 }, size: { d: 1.6, min: 0.5, max: 4 }, bar: { d: true, bool: 1 } }, dims: { size: 'size' }, foot: (p) => [p.size * 2, p.size * 2],
    build(b, p) {
      b.text(p.text, p.size, '#f4f2ea', 0, 0.045, 0, { rx: -90, rz: 180 }); // lying face up, its letters reading right for a driver coming from the north (-z), heading south toward the line
      if (p.bar) b.box(3.2, 0.02, 0.28, '#f4f2ea', 0, 0.02, p.size * 0.7 + 0.5, { noShadow: true });
    },
  };
})();
