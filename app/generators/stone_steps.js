/* Koemachi · generator: stone_steps
   A flight of stone steps with cheek walls. The top is at the back (-z), the bottom at the front (+z); stand it on the lower terrace.
   params: width, rise (total height), tread (depth of one step). Walkable: people and the player climb it (floor()). */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex, RISER = 0.18;
  const steps = (p) => Math.max(1, Math.round(p.rise / RISER));
  YX.GEN.stone_steps = {
    label: '石阶', cls: 'ground', solid: false, face: 'none', block: false, nouns: ['石阶', '台阶', '楼梯', '阶梯', '石梯', 'stone steps', 'steps', 'stairs', '階段', '石段'],
    params: { width: { d: 3.2, min: 1, max: 30 }, rise: { d: 3, min: 0.2, max: 40 }, tread: { d: 0.34, min: 0.2, max: 1 }, rail: { d: true, bool: 1 } },
    dims: { width: 'width', height: 'rise', size: 'width' }, foot: (p) => [p.width + 1, steps(p) * p.tread],
    floor(p, lx, lz) { const n = steps(p), run = n * p.tread; if (Math.abs(lx) > p.width / 2 + 0.3 || Math.abs(lz) > run / 2) return null; const i = Math.max(0, Math.min(n - 1, Math.floor((run / 2 - lz) / p.tread))); return ((i + 1) * p.rise) / n; },
    build(b, p, rand) {
      const n = steps(p), run = n * p.tread, w = p.width, riser = p.rise / n;
      for (let i = 0; i < n; i++) {
        const z = run / 2 - (i + 0.5) * p.tread, h = (i + 1) * riser, wear = rand() * 0.06;
        b.box(w, h, p.tread, mix(C.stoneLight, C.stoneDark, wear * 4), 0, 0, z, { tex: 'stone' });
        b.box(w, 0.05, p.tread + 0.04, mix(C.stoneLight, '#ffffff', 0.12), 0, h - 0.05, z, { noShadow: true });
        for (const s of [-1, 1]) b.box(0.4, h + 0.28, p.tread, C.stone, s * (w / 2 + 0.2), 0, z, { tex: 'stone' }); // the cheek walls step up with it
      }
      if (p.rail && p.rise > 0.9) for (const s of [-1, 1]) { // a plain iron handrail on a few posts
        const x = s * (w / 2 - 0.12), post = (z, h) => b.cyl(0.03, 0.03, 0.95, C.iron, x, h, z, { sides: 6 });
        post(run / 2 - 0.2, riser + 0.1); post(0, p.rise / 2 + 0.1); post(-run / 2 + 0.2, p.rise);
        b.tube([[x, riser + 0.95, run / 2 - 0.2], [x, p.rise / 2 + 1.05, 0], [x, p.rise + 0.95, -run / 2 + 0.2]], 0.025, C.iron);
      }
    },
  };
})();
