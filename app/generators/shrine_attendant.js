/* Koemachi · generator: shrine_attendant
   A shrine attendant in a white jacket and pale-blue hakama, sweeping with a bamboo broom: the broom swings in slow strokes and the body leans with it.
   params: shirt, hakama (colours). Stands in place. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  YX.GEN.shrine_attendant = {
    label: '神社工作人员', en: 'Shrine attendant', cls: 'creature', solid: false, face: 'none', block: false, nouns: ['神社工作人员', '神职人员', '巫女', '神主', '扫地的人', 'shrine attendant', 'shrine keeper', 'priest', '神職', '巫女さん'],
    params: { shirt: { d: '#f4f1ea', color: 1 }, hakama: { d: '#8fb4c9', color: 1 }, height: { d: 1.65, min: 1, max: 3 } }, dims: { height: 'height' }, foot: () => [1.2, 1.2], mainColor: 'hakama',
    build(b, p, rand) {
      const k = p.height / 1.65, skin = '#f1c9a5';
      b.group({ scale: k }, () => {
        b.cyl(0.3, 0.2, 0.95, p.hakama, 0, 0, 0, { sides: 12 }); for (const s of [-1, 1]) b.box(0.18, 0.1, 0.28, '#2b2420', s * 0.09, 0, 0.06); // the hakama and sandals
        b.group({ y: 0.95, anim: { swing: { axis: 'x', deg: 7, freq: 0.45, phase: 0 } } }, () => {
          b.cyl(0.19, 0.22, 0.5, p.shirt, 0, 0, 0, { sides: 12 }); b.box(0.5, 0.05, 0.3, p.hakama, 0, 0.0, 0); b.sphere(0.115, skin, 0, 0.7, 0); b.sphere(0.12, '#1d1815', 0, 0.74, -0.025, { sy: 0.9 }); b.sphere(0.06, '#1d1815', 0, 0.78, -0.13);
          for (const s of [-1, 1]) b.tube([[s * 0.2, 0.4, 0], [s * 0.2, 0.18, 0.15], [s * 0.1, 0.1, 0.38]], 0.045, p.shirt);
          b.group({ x: 0.0, y: 0.1, z: 0.4, anim: { swing: { axis: 'x', deg: 22, freq: 0.7, phase: 0.6 } } }, () => { b.cyl(0.018, 0.018, 1.5, '#a8854f', 0, -0.9, 0, { sides: 5 }); b.cone(0.16, 0.45, '#c9ac6a', 0, -0.95, 0, { sides: 8, rx: 180 }); });
        });
      });
    },
  };
})();
