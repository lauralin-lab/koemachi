/* Koemachi · generator: vending_machine
   A drinks vending machine with a lit display, a coin slot and a delivery flap. Glows after dark. params: color, wide (a double-width machine). */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe;
  YX.GEN.vending_machine = {
    label: '自动贩卖机', cls: 'street', solid: 'box', face: 'road', mainColor: 'color', nouns: ['自动贩卖机', '贩卖机', '售货机', 'vending machine', 'vending', '自販機', '自動販売機'],
    params: { color: { d: '#2f6db0', color: 1, pick: ['#2f6db0', '#c93a2c', '#e8e4da', '#3f8a5a'] }, wide: { d: false, bool: 1 } }, dims: { size: 'wide' }, foot: (p) => [p.wide ? 2.2 : 1.1, 0.9],
    build(b, p, rand) {
      const w = p.wide ? 2.0 : 0.95, h = 1.85, d = 0.75;
      b.box(w, h, d, p.color, 0, 0, 0, { rough: 0.35, metal: 0.2 }); b.box(w + 0.04, 0.1, d + 0.04, '#e8e4da', 0, h - 0.1, 0);
      const cols = p.wide ? 6 : 3; b.box(w - 0.14, 1.0, 0.04, '#dfe9ef', 0, 0.62, d / 2 + 0.01, { glow: '#fff4d6', glowK: 0.6 }); // the lit display
      for (let c = 0; c < cols; c++) for (let r = 0; r < 2; r++) { const x = -w / 2 + 0.1 + ((c + 0.5) * (w - 0.2)) / cols; b.cyl(0.05, 0.05, 0.22, ['#e8a03a', '#4a9bd1', '#d9534f', '#6bb36b', '#f3f3f3', '#8a5a3c'][(c * 2 + r + Math.floor(rand() * 3)) % 6], x, 0.78 + r * 0.42, d / 2 + 0.04, { sides: 8 }); }
      b.box(w - 0.14, 0.2, 0.04, '#222a30', 0, 0.12, d / 2 + 0.01); b.box(0.16, 0.2, 0.05, '#aeb4b8', w / 2 - 0.2, 1.3, d / 2 + 0.02); // the delivery flap and the coin panel
      b.box(w - 0.1, 0.1, 0.06, C.cream, 0, 1.72, d / 2 + 0.01, { glow: '#fff4d6', glowK: 0.7 });
      b.halo(2.2, '#fff4d6', 0, 1.0, d / 2 + 0.3);
    },
  };
})();
