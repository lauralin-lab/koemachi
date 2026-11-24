/* Koemachi · generator: arcade_roof
   The covered roof of a shotengai (shopping street): steel posts on both sides every 4 m, curved ribs, a translucent ridge roof, paper lanterns hanging
   down the middle that glow at night, and strings of small flags between the posts. Runs along x; the street is `width` wide. params: length, width, lanterns. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  const FLAGS = ['#d9534f', '#f1c14a', '#4a7fb0', '#f4efe6', '#8bb58a', '#e8a0b4'];
  YX.GEN.arcade_roof = {
    label: '商店街拱廊', en: 'Shopping arcade', cls: 'building', solid: false, face: 'road', block: false, nouns: ['商店街拱廊', '商店街', '拱廊', '有顶商店街', '顶棚', 'arcade', 'shotengai', 'covered street', 'shopping arcade', 'covered arcade', '商店街', 'アーケード'],
    params: { length: { d: 60, min: 8, max: 160 }, width: { d: 7.4, min: 4, max: 14 }, lanterns: { d: true, bool: 1 } }, dims: { width: 'length', depth: 'width', size: 'length' }, foot: (p) => [p.length, p.width],
    build(b, p, rand) {
      const L = p.length, W = p.width, H = 4.4, step = 4, n = Math.round(L / step);
      for (let i = 0; i <= n; i++) {
        const x = -L / 2 + (i * L) / n;
        for (const s of [-1, 1]) { b.cyl(0.07, 0.07, H, '#7d8790', x, 0, s * (W / 2), { sides: 8 }); b.box(0.3, 0.06, 0.3, '#4f5860', x, 0, s * (W / 2)); }
        const rib = []; for (let k = 0; k <= 6; k++) { const t = k / 6, z = (t - 0.5) * W; rib.push([x, H + Math.sin(t * Math.PI) * 0.9, z]); } b.tube(rib, 0.05, '#6b747c', { sides: 4 }); // the curved rib
        if (i < n) { const fx = x + step / 2, pts = []; for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push([x + t * step, H - 0.5 - Math.sin(t * Math.PI) * 0.25, 0.0]); } /* a flag string down the middle is under the lanterns */ for (const s of [-1, 1]) { const q = []; for (let k = 0; k <= 8; k++) { const t = k / 8; q.push([x + t * step, H - 0.35 - Math.sin(t * Math.PI) * 0.3, s * (W / 2 - 0.4)]); } b.tube(q, 0.008, '#e8e4da', { sides: 3 }); for (let k = 1; k < 8; k++) { const t = k / 8; b.box(0.14, 0.2, 0.01, FLAGS[(i * 3 + k + (s > 0 ? 2 : 0)) % FLAGS.length], x + t * step, H - 0.35 - Math.sin(t * Math.PI) * 0.3 - 0.11, s * (W / 2 - 0.4)); } } }
      }
      b.roof(L + 0.4, 1.1, W + 0.6, '#cfe4ea', 0, H + 0.1, 0, { opacity: 0.4, rough: 0.2, noShadow: true }); b.box(L + 0.4, 0.12, 0.12, '#6b747c', 0, H + 1.15, 0); // the translucent ridge roof
      b.box(L + 0.4, 0.14, 0.14, '#6b747c', 0, H + 0.04, W / 2 + 0.3); b.box(L + 0.4, 0.14, 0.14, '#6b747c', 0, H + 0.04, -W / 2 - 0.3);
      if (p.lanterns) for (let i = 0; i < n * 1.4; i++) { const x = -L / 2 + 1 + (i * (L - 2)) / (n * 1.4), y = H - 0.9 - (i % 2) * 0.25; b.cyl(0.006, 0.006, 0.8 + (i % 2) * 0.25, '#222', x, y + 0.1, 0.0, { sides: 4 }); b.sphere(0.24, C.lantern, x, y - 0.05, 0, { sy: 1.2, glow: '#ffb070', rough: 0.6, seg: 8 }); b.cyl(0.14, 0.14, 0.04, '#222', x, y + 0.3, 0, { sides: 8 }); b.cyl(0.14, 0.14, 0.04, '#222', x, y - 0.4, 0, { sides: 8 }); }
    },
  };
})();
