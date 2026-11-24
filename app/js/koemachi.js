/* Koemachi (声町) · the starting town: an original fictional seaside hill town, built from code.
   The town climbs a slope between the sea (south, +z) and a wooded hill (north, -z), in five stepped levels, each a "terrace" generator (see floors.js: people
   and the player walk on them, and every object on one takes its height): the quay (1.3 m), the railway and shopping level (4.2 m), the lanes of wooden houses
   (8.4 m), the wooded slope (14.5 m) and the shrine (20.5 m). Stone steps join the levels. The layout below is one small function per part of the town; every
   building and prop comes from a generator in app/generators/. Coordinates are metres: x east, z south, rot 0 = front faces south. */
'use strict';
(function () {
  const YX = window.YX, W = YX.world, DEG = YX.DEG, C = YX.koe;
  const LV = (YX.KOE_LEVEL = { quay: 1.3, rail: 4.2, lanes: 8.4, hill: 14.5, shrine: 20.5 });
  const SEA_Y = (YX.SEA_LEVEL = 0.1); // the still water (sea.js builds the surface; the town is built before that file loads)
  const FACE = { S: 0, N: 180, E: 90, W: 270 }; // the direction a front faces, as a rot in degrees

  YX.buildTown = function () {
    YX.clearWorld(); W.nextId = 1; W.shots = []; W.focusId = null;
    const R = YX.rng(20260101), rr = (a, b) => a + R() * (b - a), pk = (arr) => arr[Math.floor(R() * arr.length)], ri = (a, b) => Math.floor(rr(a, b + 1));
    const add = (type, x, z, deg, params, extra) => YX.spawn(Object.assign({ type, x, z, rot: (deg || 0) * DEG, params: params || {}, seed: Math.floor(R() * 4e9) + 1 }, extra || {}));
    const X = { add, R, rr, pk, ri };
    terraces(X); backdrop(X); seafront(X); railway(X); shotengai(X); lanes(X); hillside(X); people(X);
    YX.rebase(); lighting();
    const P = W.player; P.x = 36; P.z = 27; P.y = LV.rail + 1.7; P.yaw = Math.PI - 0.6; P.pitch = -0.05; P.vx = P.vz = 0; P.fly = false;
  };

  /* the five levels, and the steps between them */
  function terraces({ add }) {
    const T = (x, z, w, d, h, top, wall) => add('terrace', x, z, 0, { width: w, depth: d, height: h, top, wall: wall || C.stone });
    T(-35, 47, 210, 14, LV.quay, 'paving', C.stoneLight);   // the quay along the harbour
    T(0, 17, 290, 46, LV.rail, 'paving', C.stoneLight);     // railway and shopping street (z -6..40)
    T(0, -26, 220, 40, LV.lanes, 'dirt', C.stone);          // the lanes of houses (z -46..-6)
    T(0, -58, 180, 24, LV.hill, 'moss', C.stoneDark);       // the wooded slope (z -70..-46)
    T(0, -85, 80, 30, LV.shrine, 'paving', C.stoneDark);    // the shrine (z -100..-70)
    const steps = (x, zTop, rise, w) => { const n = Math.round(rise / 0.18), run = n * 0.34; return add('stone_steps', x, zTop + run / 2, 0, { rise, width: w || 3.2 }); }; // stands on the lower level, top at zTop
    steps(-20, 40, LV.rail - LV.quay, 5); steps(52, 40, LV.rail - LV.quay, 3.6);
    steps(-62, -6, LV.lanes - LV.rail, 3.6); steps(34, -6, LV.lanes - LV.rail, 3.6);
    steps(0, -46, LV.hill - LV.lanes, 4.2); steps(0, -70, LV.shrine - LV.hill, 4.2);
  }

  /* the hills behind the town and on both sides, and a few trees on their feet */
  function backdrop({ add, rr, pk }) {
    add('hill', 0, -200, 0, { size: 160, height: 76, color: '#5f8a4e' }); add('hill', -170, -120, 0, { size: 90, height: 46, color: '#668f52' }); add('hill', 175, -110, 0, { size: 100, height: 54, color: '#5b854b' });
    add('hill', -280, 20, 0, { size: 120, height: 44, color: '#6a9355' }); add('hill', 290, 10, 0, { size: 130, height: 50, color: '#5f8a4e' });
    add('hill', -220, 34, 0, { size: 80, height: 40, color: '#668f52' }); add('hill', 222, 34, 0, { size: 80, height: 40, color: '#5b854b' }); // the train comes out of one and goes into the other
    for (let i = 0; i < 8; i++) { const a = rr(0, 6.283), d = rr(10, 60), x = (i % 2 ? 1 : -1) * rr(125, 170) + Math.cos(a) * d * 0.3, z = rr(-120, 30); add('kuromatsu', x, z, rr(0, 360), { height: rr(8, 14), lean: rr(-0.3, 0.3) }); }
  }

  /* the harbour: quay with a fish market, two piers and a long breakwater with a lighthouse, boats, pines */
  function seafront({ add, R, rr, pk }) {
    const T = (x, z, w, d, h, top, wall) => add('terrace', x, z, 0, { width: w, depth: d, height: h, top, wall: wall || C.stone });
    T(-98, 66, 8, 24, LV.quay, 'paving', C.stone);             // pier A (west of the basin)
    T(-58, 76, 8, 44, LV.quay + 0.3, 'concrete', C.concrete);  // pier B, which is also the west arm of the breakwater
    T(-30, 94, 52, 8, LV.quay + 0.4, 'concrete', C.concrete);  // the breakwater's east arm
    T(105, 46, 70, 12, 0.5, 'sand', C.sand);                   // the beach east of the town
    add('tetrapod_pile', -30, 100.5, 0, { length: 50, size: 1.1 }); add('tetrapod_pile', -50, 76, 90, { length: 40, size: 1.0 }); add('tetrapod_pile', -5, 91, 0, { length: 8, size: 1.0 });
    add('koe_lighthouse', -8, 94, 0, { height: 9 });
    add('harbor_shed', -76, 47, FACE.S, { length: 18, depth: 8 });
    for (const [x, z, r, p] of [[-88, 62, 40, {}], [-80, 71, -20, { hull: '#e9edf0', band: '#c93a2c', length: 7.5 }], [-72, 61, 80, { band: '#2f7a6a' }], [-76, 74, 10, { length: 10.5 }], [-90, 75, -35, { length: 6.5, band: '#c9a02f' }], [-66, 66, 95, { length: 7 }], [-41, 112, 30, {}], [12, 124, 160, { length: 8 }]]) add('fishing_boat', x, z, r, p, { y: SEA_Y });
    for (let x = -130; x <= 60; x += 17) add('street_light', x, 44.5, 0, { height: 5.4 });
    for (let x = -16; x <= 60; x += 19) add('kuromatsu', x + rr(-2, 2), 50 + rr(-1, 1), rr(0, 360), { height: rr(6, 9), lean: rr(-0.3, 0.3) });
    for (let i = 0; i < 5; i++) add('kuromatsu', 82 + i * 12 + rr(-2, 2), 45 + rr(-2, 2), rr(0, 360), { height: rr(6, 10), lean: rr(-0.4, 0.4) });
    for (const x of [-48, -34, -6]) add('bench', x, 51.5, 0, {});
    add('vending_machine', -92, 44.2, FACE.S, { color: '#c93a2c' }); add('vending_machine', -90.4, 44.2, FACE.S, { color: '#2f6db0' }); add('post_box', -60, 44, FACE.S, {});
  }

  /* the single-track line along the top of the cliff, a tiny station, and the level crossing at the end of Eki-dori */
  function railway({ add }) {
    const Z = 33; YX.koe.rail = { z: Z, xc: 34, x0: -178, x1: 178 };
    for (let x = -120; x <= 120; x += 40) add('rail_track', x, Z, 0, { length: 40 });
    add('station', -62, Z - 2.7, 0, { length: 18, name: '声町' });
    add('terrace', 34, Z, 0, { width: 4.4, depth: 3.4, height: 0.36, top: 'concrete', wall: C.concrete }); // the crossing deck, level with the rails
    add('railway_crossing', 31.4, Z - 2.7, 0, {}); add('railway_crossing', 36.6, Z + 2.7, 180, {});
    add('crossing_arm', 32.0, Z - 2.1, 0, { length: 3.6 }); add('crossing_arm', 36.0, Z + 2.1, 180, { length: 3.6 });
    add('train', -80, Z, 90, { cars: 2, lit: false }, { y: 0.36 });
    for (let x = -118; x <= 122; x += 26) add('utility_pole', x, Z + 3.7, 0, { span: 26, height: 8.4, transformer: x % 52 === 0 });
    add('road_marking', 34, 22, 0, { text: '止まれ', size: 1.3, bar: true }); add('road_marking', 34, 43.4, 180, { text: '止まれ', size: 1.3, bar: false });
    add('vending_machine', -49, 27.6, FACE.N, {}); add('post_box', -51.5, 27.6, FACE.N, {}); add('traffic_mirror', 38, 26, FACE.W, {});
    for (let i = 0; i < 6; i++) add('bicycle', -70 + i * 1.1, 26.6, 80 + i * 6, { color: ['#2e6da4', '#c93a2c', '#6b8f4e', '#e8e4da', '#8a5a3c', '#2b2f33'][i] });
    add('bench', -62, 27, FACE.N, {});
  }

  /* the shotengai: a covered shopping street with ramen, sweets, a general store and the bathhouse */
  function shotengai({ add, R, rr, pk }) {
    const Z = 14; add('terrace', -20, Z, 0, { width: 66, depth: 7.4, height: 0.08, top: 'paving', wall: C.paving }); // the street's own paving, a hair above the level
    add('arcade_roof', -20, Z, 0, { length: 64, width: 7.4 });
    const row = (list, z, rot) => { let x = list.start; for (const [type, w, params] of list.items) { x += w / 2; add(type, x, z, rot, Object.assign({ width: w, depth: 8 }, params)); x += w / 2 + 0.5; } };
    row({ start: -52, items: [['shop_wagashi', 6.0, {}], ['shop_ramen', 6.4, {}], ['shop_zakka', 7.0, {}], ['machiya', 6.2, { floors: 2, noren: true, style: 'mixed' }], ['machiya', 5.8, { floors: 2, noren: true, style: 'wood' }], ['shop_wagashi', 6.0, {}]] }, Z - 7.7, FACE.S);
    add('sento', 7.5, Z - 9.7, FACE.S, { width: 12, depth: 12, chimney: 18 });
    row({ start: -50, items: [['shop_zakka', 7.0, {}], ['machiya', 6.0, { floors: 2, noren: true }], ['shop_ramen', 6.4, {}], ['shop_wagashi', 6.0, {}], ['machiya', 6.4, { floors: 3, noren: true, style: 'plaster' }], ['shop_zakka', 7.0, {}], ['machiya', 6.0, { floors: 2, noren: true }]] }, Z + 7.7, FACE.N);
    for (let x = -50; x <= 10; x += 20) add('vending_machine', x, Z + 3.1, FACE.N, { color: pk(['#2f6db0', '#c93a2c', '#3f8a5a']) });
    add('bicycle', -2, Z + 3.0, 100, { color: '#c93a2c' }); add('bicycle', -30, Z - 3.1, 80, { color: '#2e6da4' }); add('sleeping_cat', -36, Z + 3.3, 20, { color: '#d98b3a', pattern: 'tabby' });
    add('road_marking', 15, Z, 90, { text: '止まれ', size: 1.2, bar: false });
  }

  /* the lanes of wooden houses on the second level, and the houses along the streets of the first */
  function lanes({ add, R, rr, pk, ri }) {
    const asph = (x, z, w, d) => add('terrace', x, z, 0, { width: w, depth: d, height: 0.06, top: 'asphalt', wall: C.asphalt });
    const house = (x, z, rot, o) => add('machiya', x, z, rot, Object.assign({ floors: pk([1, 2, 2, 2, 3]), width: rr(5.6, 7.6), depth: rr(7, 9), style: pk(['mixed', 'mixed', 'wood', 'plaster']), roofColor: pk(['#56626d', '#4d5963', '#625f5a', '#5a6670']), balcony: R() < 0.7, laundry: R() < 0.7, plants: ri(0, 3), noren: R() < 0.2, lit: false }, o || {}));
    // lanes on the second level: two east-west lanes 4 m wide, and a north-south lane at each flight of steps
    asph(0, -14, 200, 4); asph(0, -34, 200, 4); asph(-62, -26, 4, 40); asph(34, -26, 4, 40); asph(0, -24, 4, 20);
    const rows = [[-20.5, FACE.S], [-28.0, FACE.N], [-40.2, FACE.S]];
    for (const [z, rot] of rows) for (let x = -84; x <= 84; x += rr(9.4, 10.8)) { if ((x > -67 && x < -57) || (x > 29 && x < 39)) continue; if (Math.abs(x) < 6.5) continue; if (R() < 0.2) continue; house(x, z + rr(-0.3, 0.3), rot); }
    for (let x = -100; x <= 100; x += 26) { add('utility_pole', x, -11.8, 0, { span: 26, height: 8.4, transformer: x % 52 === 0 }); add('utility_pole', x + 9, -31.8, 0, { span: 26, height: 8.4 }); }
    for (let x = -90; x <= 90; x += 24) add('street_light', x, -15.9 + 0.0, 180, { height: 5.4 });
    for (const x of [-62, 34]) for (const z of [-14, -34]) { add('traffic_mirror', x + 2.8, z - 2.4, FACE.S, {}); add('road_marking', x, z + 3.4, 0, { text: '止まれ', size: 1.1, bar: false }); }
    add('block_wall', -30, -9, 0, { length: 60 }); add('block_wall', 62, -9, 0, { length: 60 });
    for (let x = -80; x <= 80; x += 34) add('vending_machine', x, -12.3, FACE.N, { color: pk(['#2f6db0', '#c93a2c', '#e8e4da', '#3f8a5a']) });
    // the first level: houses facing Eki-dori and the secondary street east of it
    for (const z of [2, 9.5, 17, 24.5]) { house(41.5, z, FACE.W); house(26.5, z, FACE.E); }
    asph(34, 17, 4, 46); asph(88, 14, 100, 4);
    for (let x = 54; x <= 120; x += rr(10.4, 12)) { house(x, 5.5, FACE.S); house(x + rr(-1, 1), 22.5, FACE.N); }
    for (let x = -118; x <= -84; x += rr(10, 12)) house(x, -1.5, FACE.S);
    add('post_box', 31.6, 38.4, FACE.S, {}); add('vending_machine', 37.6, -3.6, FACE.S, {}); add('sleeping_cat', 33.2, -0.5, 60, { color: '#5a5a5e', pattern: 'plain' });
  }

  /* the steps up the slope between cherry and maple trees, the red torii and the small shrine at the top with its view of the sea */
  function hillside({ add, rr, pk }) {
    for (let i = 0; i < 6; i++) { const z = -50 - i * 3.6; for (const s of [-1, 1]) { add(i % 2 ? 'momiji_tree' : 'sakura_tree', s * (5.2 + rr(0, 1.2)), z, rr(0, 360), { height: rr(5, 7) }); } }
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) add('stone_lantern', s * 3.1, -49.2 - i * 4.6, 0, { height: 1.9 });
    add('torii', 0, -47.8, 0, { height: 4.6, width: 4.4 });
    for (let i = 0; i < 7; i++) { const s = i % 2 ? 1 : -1; add(i % 3 ? 'sakura_tree' : 'momiji_tree', s * rr(14, 60), -48 - rr(0, 22), rr(0, 360), { height: rr(5, 8) }); add('kuromatsu', s * rr(20, 80), -50 - rr(0, 20), rr(0, 360), { height: rr(7, 11), lean: rr(-0.3, 0.3) }); }
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) add('stone_lantern', s * 3.1, -72.5 - i * 4.4, 0, { height: 1.9 });
    add('torii', 0, -72.0, 0, { height: 5.6, width: 5.0, shimenawa: true });
    add('shrine', 0, -89, 0, { width: 6.4, depth: 5.2 });
    for (const s of [-1, 1]) { add('stone_lantern', s * 5.8, -83, 0, { height: 2.2 }); add('sakura_tree', s * 14, -82, rr(0, 360), { height: 6.5 }); add('momiji_tree', s * 19, -90, rr(0, 360), { height: 5.5 }); add('kuromatsu', s * 11, -96, rr(0, 360), { height: 9, lean: s * 0.25 }); }
    add('bench', 12, -78.5, 0, {}); add('bench', -12, -78.5, 0, {});
    add('shrine_attendant', 6.5, -78.2, 200, {}); add('sleeping_cat', -4.4, -75.0, 30, { color: '#e8e4da', pattern: 'tuxedo' });
  }

  /* the people: students going home, an old man with his dog, a cyclist, and the shrine attendant sweeping (placed on the hillside) */
  function people({ add, R, rr, pk }) {
    const student = (x, z, girl) => add('person', x, z, rr(0, 360), { pose: 'walk', age: 'adult', shirt: girl ? '#25314d' : '#f4f1ea', pants: '#25314d', outfit: girl ? 'dress' : 'shirt', hairdo: girl ? pk(['long', 'ponytail']) : 'short', height: girl ? 1.58 : 1.68 });
    student(-52, -15, true); student(-48, -14.5, false); student(20, -35, false); student(24, -33.4, true); student(-18, 15.5, false); student(2, 12.8, true);
    const man = add('person', 70, -33, 90, { pose: 'walk', shirt: '#8a7a5a', pants: '#4a4a3a', hair: '#a8a8a8', hairdo: 'short', hat: 'straw', height: 1.62 }); add('dog', 71.4, -33.6, 90, { color: '#c99a5b', size: 0.8 });
    add('person', -34, 21.5, 120, { pose: 'walk', shirt: '#c06a4a', pants: '#3b3b46', hair: '#2b2018', hairdo: 'bun' }); add('person', 6, 36.8, 0, { pose: 'stand', shirt: '#4a7fb0', pants: '#2f3e55' });
    add('person', -64, 28.2, 20, { pose: 'sit', shirt: '#e8b04a', pants: '#27455f' });
    const bike = add('bicycle', 60, 14, 90, { color: '#2e6da4' }), rider = add('person', 60, 14, 90, { pose: 'ride', shirt: '#d9534f', pants: '#2f3e55', height: 1.7 });
    try { YX.attachTo(rider, bike); bike.route = { pts: [[52, 0, 13], [118, 0, 13], [121, 0, 15], [52, 0, 15], [49, 0, 13]], loop: true, speed: 3.4 }; bike.motion = 'route'; YX.initMotion(bike); } catch (e) { console.warn('cyclist', e); }
  }

  /* golden hour over the sea: low warm sun in the south-west, a light haze */
  function lighting() {
    const t = 17.45, a = ((t - 6) / 12) * Math.PI, bx = Math.cos(a) * 0.85, bz = -0.42, want = Math.atan2(0.62, -0.5); // the sun low in the south-west, over the water
    YX.setEnv({ time: t, weather: 'clear', ground: 'grass', look: 'none', light: 'soft', haze: 0.8, az: (want - Math.atan2(bz, bx)) / DEG, flow: 0 }, { instant: true });
    if (YX.sea) YX.sea.show(true);
  }
})();
