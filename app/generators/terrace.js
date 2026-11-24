/* Koemachi · generator: terrace
   A flat stone-walled platform, the building block of the hillside: every level of the town is a terrace, and people walk on it (floor()).
   Signature: build(b, p, rand); origin at the centre of the base, top at y = height. Edit the params to resize it. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  const TOPS = { paving: C.paving, grass: '#7da35a', dirt: '#9a7e5c', asphalt: C.asphalt, sand: C.sand, moss: C.moss, concrete: C.concrete };
  YX.GEN.terrace = {
    label: '台地', en: 'Terrace', cls: 'ground', solid: false, face: 'none', block: false, nouns: ['台地', '平台', '梯田', '石台', '露台', '台座', 'terrace', 'platform', '段丘', '石垣'],
    params: { width: { d: 40, min: 2, max: 400 }, depth: { d: 20, min: 2, max: 400 }, height: { d: 3, min: 0.02, max: 40 }, top: { d: 'paving', opts: ['paving', 'grass', 'dirt', 'asphalt', 'sand', 'moss', 'concrete'] }, wall: { d: '#a29d90', color: 1 } },
    dims: { width: 'width', depth: 'depth', height: 'height', size: 'width' }, foot: (p) => [p.width, p.depth],
    floor: (p, lx, lz) => (Math.abs(lx) <= p.width / 2 && Math.abs(lz) <= p.depth / 2 ? p.height : null),
    build(b, p, rand) {
      const w = p.width, d = p.depth, h = p.height, snowy = C.season === 'winter' && p.top !== 'asphalt' && p.top !== 'concrete', top = snowy ? '#edf2f6' : TOPS[p.top] || C.paving;
      b.box(w, h - 0.06, d, p.wall, 0, 0, 0, { tex: 'stone' }); // the stone-faced body
      b.box(w, 0.06, d, top, 0, h - 0.06, 0, !snowy && p.top === 'grass' ? { tex: 'grass' } : !snowy && p.top === 'sand' ? { tex: 'sand' } : {}); // the top
      if (h > 1.4) for (let y = 0.9; y < h - 0.5; y += 0.9) b.box(w + 0.04, 0.05, d + 0.04, mix(p.wall, '#000000', 0.18), 0, y, 0, { noShadow: true }); // courses of the dry-stone wall
      b.box(w + 0.16, 0.14, d + 0.16, mix(p.wall, '#ffffff', 0.25), 0, h - 0.2, 0); // coping stones along the edge
    },
  };
})();
