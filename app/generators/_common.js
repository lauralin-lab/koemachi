/* Koemachi · shared pieces for the generators in this folder: a palette and a few building helpers.
   Loaded before every other file here (file names that start with "_" come first). Nothing in this file is a generator. */
'use strict';
(function () {
  const YX = window.YX, mix = YX.mixHex;
  const C = YX.koe = {
    // the palette of the town: weathered wood, slate-blue tiles, whitewash, sea stone, vermilion, indigo
    wood: '#8b6b4b', woodDark: '#4a3828', woodLight: '#b08a62', plaster: '#e9e2d2', cream: '#f1e8d3', kawara: '#56626d', kawaraDark: '#3c464f',
    stone: '#a29d90', stoneDark: '#7d786d', stoneLight: '#c4bfb2', vermilion: '#c93a2c', indigo: '#26406b', lantern: '#d6453a', paper: '#f5ecd0',
    iron: '#2b2f33', asphalt: '#4a4d52', paving: '#b9b3a4', concrete: '#bdbab2', sea: '#2b7a99', sand: '#d9c9a0', moss: '#6f8a4c', glass: '#9cc4d4',
    mix,
  };
  /* a gable roof of slate-blue kawara tiles with eaves and a ridge, ridge along x; (x, y, z) is the centre of its bottom face */
  C.kawaraRoof = function (b, w, d, h, x, y, z, color, o) {
    o = o || {}; const col = color || C.kawara, ov = o.eave == null ? 0.7 : o.eave;
    b.roof(w + ov * 2, h, d + ov * 2, col, x, y, z, { tex: 'roof' });
    b.box(w + ov * 2 + 0.12, 0.16, 0.3, mix(col, '#000000', 0.25), x, y + h - 0.02, z); // the ridge tiles
    for (const s of [-1, 1]) b.box(0.3, 0.3, 0.34, mix(col, '#000000', 0.3), x + s * (w / 2 + ov), y + h - 0.12, z); // the end tiles
  };
  /* a plank wall panel facing +Z at z; boards run vertically */
  C.boards = function (b, w, h, x, y, z, color, depth) { b.box(w, h, depth || 0.12, color || C.wood, x, y, z, { tex: 'wood' }); };
  /* a sign board with text (Japanese words are drawn by the browser's own font) */
  C.sign = function (b, text, w, h, x, y, z, bg, fg, o) {
    b.box(w, h, 0.08, bg || C.indigo, x, y, z, o || {}); b.text(text, Math.min(h * 0.72, w / Math.max(1, text.length) * 0.95), fg || C.cream, x, y + h * 0.14, z + 0.06, { bg: bg || C.indigo });
  };
})();
