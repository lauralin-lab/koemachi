// Koemachi: the town is all there, its levels and steps work as floors, edges are walls, and the railway runs to its timetable (checks throw when one fails)
const bad = [], chk = (ok, msg) => { out.push((ok ? 'ok    ' : 'FAIL  ') + msg); if (!ok) bad.push(msg); }, F = (x, z) => YX.floorAt(x, z, Infinity), near = (a, b) => Math.abs(a - b) < 0.02;
const need = { terrace: 12, stone_steps: 6, machiya: 30, shop_ramen: 1, shop_wagashi: 1, shop_zakka: 1, sento: 1, arcade_roof: 1, station: 1, train: 1, railway_crossing: 2, crossing_arm: 2, rail_track: 7, torii: 2, shrine: 1, shrine_attendant: 1, fishing_boat: 4, koe_lighthouse: 1, harbor_shed: 1, tetrapod_pile: 1, vending_machine: 3, post_box: 1, traffic_mirror: 1, road_marking: 2, utility_pole: 10, street_light: 5, sleeping_cat: 2, sakura_tree: 4, momiji_tree: 4, kuromatsu: 6, stone_lantern: 6, person: 6 };
for (const k in need) chk(byType(k).length >= need[k], k + ' x' + byType(k).length + ' (at least ' + need[k] + ')');
chk(YX.sea && near(YX.sea.level, 0.1), 'the sea is there, at ' + (YX.sea && YX.sea.level));
chk(W.env.time > 17 && W.env.time < 18 && W.env.haze > 0, 'golden hour with haze: time ' + W.env.time.toFixed(2) + ', haze ' + W.env.haze);
// the five levels, and the steps between them climb in small steps
chk(near(F(-35, 47), 1.3), 'quay at ' + F(-35, 47)); chk(near(F(60, 20), 4.2), 'railway level at ' + F(60, 20)); chk(near(F(0, -26) , 8.4) || near(F(20, -20), 8.4), 'lanes level near ' + F(20, -20));
chk(near(F(20, -50), 14.5), 'wooded slope at ' + F(20, -50)); chk(near(F(0, -90), 20.5), 'shrine level at ' + F(0, -90));
for (const [name, x, z0, z1] of [['quay to railway', -20, 41.5, 38.5], ['railway to lanes', -62, -3, -9], ['lanes to slope', 0, -35, -47], ['slope to shrine', 0, -59, -71]]) {
  let prev = F(x, z0), worst = 0, up = true; const dir = z1 < z0 ? -1 : 1;
  for (let z = z0; (z1 - z) * dir > 0; z += 0.05 * dir) { const h = F(x, z); worst = Math.max(worst, Math.abs(h - prev)); if (h < prev - 1e-6) up = false; prev = h; }
  chk(worst <= 0.21 && up, name + ': climbs in steps of at most ' + worst.toFixed(2) + ' m, never down; ends at ' + prev.toFixed(2));
}
chk(F(0, -6.5) - F(0, -5.5) > 3, 'the retaining wall between railway level and lanes is a wall: ' + (F(0, -5.5)).toFixed(1) + ' to ' + F(0, -6.5).toFixed(1));
// everything stands on the floor it is placed on
const offs = []; for (const o of W.objs.values()) { const d = YX.defOf(o); if (!d || d.floor || d.cls === 'sky' || o.type === 'train') continue; /* the train is pinned to the rail level by the controller */ if (Math.abs((o.base || 0) - YX.baseOf(o)) > 0.01) offs.push(o.type + '#' + o.id + ' base ' + (o.base || 0).toFixed(2) + ' should be ' + YX.baseOf(o).toFixed(2) + ' at ' + o.x.toFixed(1) + ',' + o.z.toFixed(1)); }
chk(offs.length === 0, 'every object stands on its own floor (' + offs.length + ' off) ' + offs.join('; '));
const hs = byType('machiya'); chk(hs.every((h) => h.base > 4 && h.base < 9), 'all ' + hs.length + ' houses are on the 4.2 m or 8.4 m levels'); chk(near(byType('shrine')[0].base, 20.5), 'the shrine is on the top terrace: ' + byType('shrine')[0].base);
chk(byType('fishing_boat').every((b) => b.y > 0 && b.base === 0), 'boats float at the water, not on a terrace: ' + byType('fishing_boat').map((b) => b.x + ',' + b.z + ' y' + b.y + ' base' + b.base).join(' | '));
// a thing set down on a terrace stays on it, a walker will not step off an edge
const bench = YX.spawn({ type: 'bench', x: -40, z: 20, params: {}, seed: 3 }); step(1); chk(near(bench.base, 4.2) && bench.y < 0.05, 'a bench added on the railway level rests at ' + bench.base.toFixed(2) + ' (y ' + bench.y.toFixed(2) + ')');
chk(YX.isBlocked(0, -5.5, 0.4, { self: byType('person')[0] }) === true || F(0, -5.5) === 4.2, 'a spot on another level counts as blocked for a walker');
// the railway: the lamps flash and the arms come down when the train comes, and go up when it has gone
const R = YX.railway, cross = byType('railway_crossing'), arms = byType('crossing_arm'), tr = byType('train')[0];
R.t = 8; R.alarmT = 0; R.arm = 82; step(2); chk(tr.holder.visible && tr.x > -100 && tr.x < 0 && near(tr.base, 4.2), 'the train is running, at x ' + tr.x.toFixed(0));
step(5); chk(cross.every((c) => c.params.alarm === true), 'the crossing lamps are flashing (phase ' + cross[0].params.phase + ')'); chk(R.arm < 3 && arms.every((a) => a.bank < 0.1), 'the barrier arms are down (' + R.arm.toFixed(0) + ' degrees)');
const ph0 = cross[0].params.phase; step(0.5); chk(cross[0].params.phase !== ph0 || cross[1].params.phase !== ph0, 'the lamps alternate');
R.t = 24; step(10); chk(cross.every((c) => c.params.alarm === false) && R.arm > 79, 'after the train: lamps off, arms up (' + R.arm.toFixed(0) + ' degrees)'); chk(!tr.holder.visible || Math.abs(tr.z - 33) < 0.1, 'the train keeps to the track, or is parked out of sight: x ' + tr.x.toFixed(0) + ', z ' + tr.z.toFixed(1) + ', visible ' + tr.holder.visible);
R.t = 59.9; step(1); chk(R.dir === -1 && R.t > 60, 'the next train comes the other way (direction ' + R.dir + ')');
out.push(bad.length ? 'SOME CHECKS FAILED' : 'all checks passed');
if (bad.length) throw new Error(out.filter((l) => l.startsWith('FAIL')).join(' || '));
return out.join('\n');
