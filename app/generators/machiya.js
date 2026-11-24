/* Koemachi · generator: machiya
   A narrow wooden town house with a slate-blue kawara roof, lattice windows, a sliding front door and, upstairs, a small balcony with laundry.
   params: floors 1-3, width, depth, style (wood | plaster | mixed), roofColor, balcony, laundry, plants, noren, lit.
   Front is +z. Signature: build(b, p, rand); origin at the centre of the base. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  const ROOFS = [C.kawara, '#4d5963', '#625f5a', '#5a6670'], PLASTERS = [C.plaster, '#e3dac6', '#ddd6c8', '#eae3d6'], WOODS = [C.wood, '#7d5f43', '#94725a', '#6e5440'];
  const CLOTH = ['#e9eef2', '#d9534f', '#f1c14a', '#4a7fb0', '#f4efe6', '#8bb58a', '#e8a0b4'];
  function lattice(b, x, y, w, h, z, frame, lit, rand) { // a window opening with a wooden lattice
    b.box(w + 0.2, h + 0.2, 0.1, frame, x, y - 0.1, z);
    b.box(w, h, 0.14, '#33414d', x, y, z, lit ? { glow: '#ffcf8a', glowK: 1.2, rough: 0.3 } : { rough: 0.2, metal: 0.2 });
    const n = Math.max(3, Math.round(w / 0.16)); for (let i = 0; i < n; i++) b.box(0.035, h, 0.06, frame, x - w / 2 + ((i + 0.5) * w) / n, y, z + 0.07);
    b.box(w, 0.04, 0.08, frame, x, y + h * 0.5, z + 0.07);
  }
  YX.GEN.machiya = {
    label: '町屋', en: 'Wooden house', cls: 'building', solid: 'box', face: 'road', mainColor: 'roofColor',
    nouns: ['町屋', '木屋', '日式房子', '木造房', '民家', '和风房子', 'machiya', 'wooden house', 'japanese house', '日本家屋', '木造住宅'],
    params: {
      floors: { d: 2, min: 1, max: 3, int: 1 }, width: { d: 6.6, min: 4, max: 14 }, depth: { d: 8, min: 5, max: 16 }, style: { d: 'mixed', opts: ['wood', 'plaster', 'mixed'] },
      roofColor: { d: C.kawara, color: 1, pick: ROOFS }, balcony: { d: true, bool: 1 }, laundry: { d: true, bool: 1 }, plants: { d: 2, min: 0, max: 5, int: 1 }, noren: { d: false, bool: 1 }, lit: { d: false, bool: 1 },
    },
    dims: { height: 'floors', width: 'width', depth: 'depth' }, foot: (p) => [p.width + 1.4, p.depth + 1.4],
    build(b, p, rand) {
      const w = p.width, d = p.depth, n = p.floors, FH = 2.9, base = 0.5, top = base + n * FH, wood = WOODS[Math.floor(rand() * WOODS.length)], pl = PLASTERS[Math.floor(rand() * PLASTERS.length)], dark = C.woodDark;
      b.box(w + 0.3, base, d + 0.3, C.stoneDark, 0, 0, 0, { tex: 'stone' });
      for (let i = 0; i < n; i++) { // walls: boards below, plaster above (or all of one)
        const y0 = base + i * FH, plast = p.style === 'plaster' || (p.style === 'mixed' && i > 0);
        b.box(w, FH, d, plast ? pl : wood, 0, y0, 0, { tex: plast ? 'plaster' : 'wood' });
        for (const sx of [-1, 1]) b.box(0.16, FH, d + 0.1, dark, sx * (w / 2), y0, 0); // the corner posts
        b.box(w + 0.2, 0.14, d + 0.2, dark, 0, y0 + FH - 0.14, 0); // the beam under each floor
      }
      // ground floor front: a sliding door with a lattice, a window, a small tiled hood over both
      const dx = (rand() < 0.5 ? -1 : 1) * (w / 2 - 1.3), wx = -dx * 0.5, zf = d / 2 + 0.02, lit = p.lit || rand() < 0.6; // lit only after dark: a window that has a lamp shows it at night
      b.box(1.5, 2.15, 0.1, dark, dx, base, zf); b.box(1.3, 1.95, 0.14, '#6b8794', dx, base + 0.08, zf + 0.02, lit ? { glow: '#ffcf8a', glowK: 1.2 } : { rough: 0.25, metal: 0.15, opacity: 0.8 });
      for (let i = 1; i < 4; i++) b.box(0.035, 1.95, 0.05, dark, dx - 0.65 + (i * 1.3) / 4, base + 0.08, zf + 0.1); b.box(1.3, 0.05, 0.05, dark, dx, base + 1.0, zf + 0.1);
      lattice(b, wx, base + 1.05, Math.min(2.2, w * 0.34), 1.1, zf, dark, lit, rand);
      b.box(w + 0.5, 0.12, 1.2, C.tile(p.roofColor), 0, base + FH - 0.5, d / 2 + 0.55, { rx: -10, tex: 'roof' }); // the hood (hisashi)
      if (p.noren) { b.box(1.1, 0.7, 0.04, C.indigo, dx, base + 1.5, zf + 0.5); b.box(1.2, 0.07, 0.06, dark, dx, base + 2.2, zf + 0.5); }
      for (let k = 0; k < p.plants; k++) { const px = dx + (k % 2 ? 1 : -1) * (0.95 + 0.4 * (k >> 1)); b.cyl(0.2, 0.15, 0.32, '#8a5a3c', px, 0, d / 2 + 0.5, { sides: 8 }); b.foliage(0.3, mix('#4f8a45', '#7ab55c', rand()), px, 0.55, d / 2 + 0.5, { sy: 0.9 }); if (rand() < 0.5) b.sphere(0.08, '#e85d75', px + 0.1, 0.8, d / 2 + 0.6); }
      // upper floors: sliding windows; the first upper floor may have a balcony with laundry
      for (let i = 1; i < n; i++) {
        const y0 = base + i * FH, ww = w * 0.38;
        for (const s of [-1, 1]) lattice(b, s * (w * 0.24), y0 + 0.75, ww, 1.55, zf, dark, lit || rand() < 0.65, rand);
        if (p.balcony && i === 1) {
          const bz = d / 2 + 0.55; b.box(w * 0.82, 0.12, 1.1, C.woodLight, 0, y0 - 0.02, bz, { tex: 'wood' });
          for (let k = 0; k <= 6; k++) b.box(0.05, 0.95, 0.05, dark, -w * 0.41 + (k * w * 0.82) / 6, y0 + 0.1, d / 2 + 1.05);
          b.box(w * 0.82, 0.06, 0.07, dark, 0, y0 + 1.0, d / 2 + 1.05); b.box(w * 0.82, 0.05, 0.05, dark, 0, y0 + 0.55, d / 2 + 1.05);
          if (p.laundry) { const m = 3 + Math.floor(rand() * 3); for (let k = 0; k < m; k++) { const cx = -w * 0.34 + (k * w * 0.68) / Math.max(1, m - 1) + (rand() - 0.5) * 0.2, big = rand() < 0.35; b.box(big ? 0.9 : 0.5, big ? 0.75 : 0.55, 0.04, CLOTH[Math.floor(rand() * CLOTH.length)], cx, y0 + (big ? 0.28 : 0.4), d / 2 + 1.1, { rx: big ? 8 : 0 }); } }
        }
      }
      if (n > 1) b.box(w + 0.5, 0.1, 0.7, C.tile(p.roofColor), 0, base + 2 * FH - 0.55, d / 2 + 0.4, { rx: -9, tex: 'roof' });
      for (const sx of [-1, 1]) { const y = base + 1.2; b.box(0.1, 0.8, 1.0, dark, sx * (w / 2 + 0.02), y, -d * 0.1); b.box(0.06, 0.65, 0.85, '#33414d', sx * (w / 2 + 0.05), y + 0.07, -d * 0.1, lit ? { glow: '#ffcf8a', glowK: 1.2 } : {}); } // a small window on each side
      if (rand() < 0.55) b.box(0.7, 0.5, 0.3, '#c9ccc9', w / 2 - 0.5, base + 0.4, -d / 2 - 0.2); // an air-conditioner's outdoor unit at the back
      const rh = 1.1 + w * 0.12; YX.koe.kawaraRoof(b, w, d, rh, 0, top, 0, p.roofColor);
      b.anchor('top', 0, top + rh, 0);
    },
  };
})();
