/* Koemachi · generator: utility_pole
   A wooden telephone/power pole with a cross-arm, insulators, a pole transformer and three wires that sag toward the next pole.
   params: height, span (distance to the next pole along +x, metres; 0 = no wires), transformer. Rotate it so +x points along the street. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe;
  YX.GEN.utility_pole = {
    label: '电线杆', en: 'Utility pole', cls: 'street', solid: 'trunk', face: 'none', nouns: ['电线杆', '电杆', '电线', 'utility pole', 'telephone pole', 'power pole', '電柱'],
    params: { height: { d: 8.2, min: 5, max: 14 }, span: { d: 26, min: 0, max: 60 }, transformer: { d: false, bool: 1 } }, dims: { height: 'height', size: 'height' }, foot: () => [0.6, 0.6],
    build(b, p) {
      const h = p.height; b.cyl(0.11, 0.16, h, '#6b5a48', 0, 0, 0, { sides: 8 });
      for (const y of [h - 0.5, h - 1.6]) { b.box(2.0, 0.1, 0.12, '#5a4a3a', 0, y, 0); for (const s of [-0.8, 0, 0.8]) b.cyl(0.04, 0.05, 0.16, '#d9d4c6', s, y + 0.1, 0, { sides: 6 }); }
      if (p.transformer) b.cyl(0.26, 0.26, 0.8, '#8d9399', 0.45, h - 3.0, 0, { sides: 10 });
      b.box(0.3, 0.1, 0.08, '#c9b84a', 0, 3.4, 0.14); // the tag
      if (p.span > 0) for (const [y, off] of [[h - 0.4, -0.8], [h - 0.4, 0], [h - 0.4, 0.8], [h - 1.5, -0.8], [h - 1.5, 0.8]]) { // wires, hanging in a gentle curve
        const pts = []; for (let i = 0; i <= 5; i++) { const t = i / 5; pts.push([t * p.span, y + 0.1 - 0.9 * 4 * t * (1 - t), off]); } b.tube(pts, 0.012, '#1c1f22', { sides: 3 });
      }
      b.anchor('top', 0, h, 0);
    },
  };
})();
