/* Koemachi · shared shop-front builder for the shotengai generators (shop_ramen, shop_wagashi, shop_zakka). Not a generator itself.
   YX.koe.shopFront(b, rand, o) draws a two-storey wooden-and-plaster shop with an open ground-floor front, a signboard (kanban), a striped awning, noren
   curtains and a tiled roof, facing +z. o = { w, d, floors, wall, sign, signBg, signFg, awning: [c1, c2], noren: { color, text, fg }, lit, roof }.
   It returns { fz: z of the front wall, top: height of the eaves }, so a shop can add its own things. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  C.shopFront = function (b, rand, o) {
    const w = o.w, d = o.d, n = o.floors || 2, FH = 3.2, base = 0.35, top = base + n * FH, fz = d / 2, lit = !!o.lit, dark = C.woodDark;
    b.box(w + 0.3, base, d + 0.3, C.stoneDark, 0, 0, 0, { tex: 'stone' });
    b.box(w, n * FH, d, o.wall || C.plaster, 0, base, 0, { tex: 'plaster' });
    for (const s of [-1, 1]) b.box(0.18, n * FH, d + 0.08, dark, s * (w / 2), base, 0);
    b.box(w + 0.2, 0.16, d + 0.2, dark, 0, base + FH - 0.16, 0);
    // the open front of the shop: a dark room, a lit window, wooden mullions
    b.box(w - 0.9, 2.45, 0.2, '#2b2420', 0, base, fz - 0.1);
    b.box(w - 1.1, 1.0, 0.06, '#f4e3b8', 0, base + 0.75, fz + 0.0, { glow: '#ffd68a', glowK: lit ? 1.3 : 0.9 });
    for (let i = 0; i <= 4; i++) b.box(0.07, 2.45, 0.1, dark, -w / 2 + 0.45 + (i * (w - 0.9)) / 4, base, fz + 0.04);
    b.box(w - 0.8, 0.1, 0.12, dark, 0, base + 2.4, fz + 0.04);
    // signboard and awning
    const sg = o.sign || '店'; b.box(w - 0.2, 0.9, 0.2, o.signBg || C.indigo, 0, base + 2.85, fz + 0.1, { tex: 'wood' }); b.text(sg, 0.72, o.signFg || '#f4efe0', 0, base + 2.87, fz + 0.22, { bg: o.signBg || C.indigo });
    const aw = o.awning || [C.vermilion, '#f4efe0'], k = Math.max(4, Math.round(w / 0.55)); for (let i = 0; i < k; i++) b.box(w / k, 0.07, 0.95, aw[i % 2], -w / 2 + ((i + 0.5) * w) / k, base + 2.05, fz + 0.55, { rx: 22 });
    b.box(w, 0.3, 0.04, aw[0], 0, base + 1.78, fz + 0.98, { rx: 0 });
    if (o.noren) { const m = 3, nw = (w - 1.4) / m; for (let i = 0; i < m; i++) { b.box(nw - 0.06, 0.95, 0.03, o.noren.color, -w / 2 + 0.7 + (i + 0.5) * nw, base + 1.08, fz + 0.45); } b.box(w - 1.3, 0.05, 0.05, dark, 0, base + 2.05, fz + 0.45); if (o.noren.text) b.text(o.noren.text, 0.55, o.noren.fg || '#f4efe0', 0, base + 1.2, fz + 0.5, {}); }
    // upper floors: lattice windows with a lamp or two lit
    for (let f = 1; f < n; f++) for (const s of [-1, 1]) { const x = s * w * 0.24, y = base + f * FH + 0.65, ww = w * 0.34, on = lit || rand() < 0.4; b.box(ww + 0.2, 1.5, 0.1, dark, x, y - 0.1, fz + 0.02); b.box(ww, 1.3, 0.12, '#33414d', x, y, fz + 0.04, on ? { glow: '#ffcf8a', glowK: 1.2 } : { rough: 0.2, metal: 0.2 }); for (let i = 1; i < 6; i++) b.box(0.03, 1.3, 0.05, dark, x - ww / 2 + (i * ww) / 6, y, fz + 0.1); }
    b.box(w + 0.5, 0.1, 0.8, C.tile(o.roof || C.kawara), 0, base + FH + 0.0, fz + 0.45, { rx: -9, tex: 'roof' });
    C.kawaraRoof(b, w, d, 1.2 + w * 0.08, 0, top, 0, o.roof || C.kawara);
    return { fz, top, base, FH };
  };
})();
