// the four seasons: trees, roofs, ground, falling petals/leaves/snow, festival lanterns; undo goes back (checks throw when one fails)
const bad = [], chk = (ok, msg) => { out.push((ok ? 'ok    ' : 'FAIL  ') + msg); if (!ok) bad.push(msg); }, S = YX.seasons, E = () => W.env;
const trees = () => byType('sakura_tree').concat(byType('momiji_tree')), white = (o) => { let n = 0; o.mesh.traverse((c) => { if (c.isMesh && c.material && c.material.color && !Array.isArray(c.material) && c.material.color.r > 0.8 && c.material.color.g > 0.8 && c.material.color.b > 0.8) n++; }); return n; };
const house = byType('machiya')[0], top = byType('terrace').find((t) => t.params.top === 'moss');
step(5); // the title card's demo may have changed the season; let the restore finish
const GO = async (phrase) => { await say(phrase, null, 300); step(4.5); };
chk(E().season === 'spring' && trees().every((t) => t.params.season === 'spring'), 'the town starts in spring: ' + trees().length + ' blossom and maple trees, season ' + E().season);
chk(S.level.petal > 0.9 && S.level.snow < 0.05, 'petals are falling in spring (' + S.level.petal.toFixed(2) + ')');
await GO('make it summer'); chk(E().season === 'summer' && trees().every((t) => t.params.season === 'summer'), 'summer: every tree is in summer green'); chk(byType('lantern_string').filter((o) => o.params.festival).length >= 8, 'summer: festival lanterns are up (' + byType('lantern_string').length + ' strings)'); chk(S.level.petal < 0.05 && S.level.leaf < 0.05 && S.level.snow < 0.05, 'summer: nothing falls');
await GO('make it autumn'); chk(trees().every((t) => t.params.season === 'autumn'), 'autumn: red maples, gold cherry leaves'); chk(byType('lantern_string').length === 0, 'autumn: the lanterns are down'); chk(S.level.leaf > 0.9, 'autumn: leaves fall (' + S.level.leaf.toFixed(2) + ')'); chk(E().ground === 'dry', 'autumn: the ground is dry grass (' + E().ground + ')');
const w0 = white(house); await GO('make it winter'); chk(trees().every((t) => t.params.season === 'winter'), 'winter: the trees are bare'); chk(S.level.snow > 0.9, 'winter: snow falls (' + S.level.snow.toFixed(2) + ')'); chk(white(house) > w0, 'winter: snow lies on the roofs (' + w0 + ' -> ' + white(house) + ' white parts on a house)'); chk(E().ground === 'snow', 'winter: the ground is white'); chk(S.queue.length === 0, 'the dissolves are all done (' + S.queue.length + ' waiting)');
await GO('春にして'); YX.ja.pref = false; chk(E().season === 'spring' && white(house) <= w0 && trees().every((t) => t.params.season === 'spring'), 'back to spring (said in Japanese): roofs clear, trees in bloom'); chk(E().ground === 'grass', 'spring: green ground');
await GO('make it autumn'); YX.undo(); step(4.5); chk(E().season === 'spring' && trees().every((t) => t.params.season === 'spring'), 'undo takes the town back a season: ' + E().season);
YX.lang = 'zh'; for (const [p, want] of [['变成秋天', 'autumn'], ['冬天', 'winter'], ['把季节变成夏天', 'summer'], ['春天', 'spring']]) { await say(p, null, 300); step(1); chk(E().season === want, p + ' (中文) -> ' + E().season); } YX.lang = 'en'; step(4);
// a tree asked for in the middle of a season is in that season
await GO('make it winter'); const t = YX.spawn({ type: 'sakura_tree', x: -30, z: 20, params: {}, seed: 4 }); chk(t.params.season === 'winter', 'a cherry tree added in winter is bare');
// time of day
for (const [p, ok] of [['make it night', () => E().time >= 20 || E().time < 4], ['make it morning', () => E().time > 6 && E().time < 10], ['make it noon', () => Math.abs(E().time - 12) < 0.6], ['make it golden hour', () => E().time > 17 && E().time < 18.5]]) { await say(p, null, 300); step(1); chk(ok(), p + ' -> ' + E().time.toFixed(1)); }
out.push(bad.length ? 'SOME CHECKS FAILED' : 'all checks passed'); if (bad.length) throw new Error(out.filter((l) => l.startsWith('FAIL')).join(' || '));
return out.join('\n');
