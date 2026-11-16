// where things land relative to the crosshair
YX.lang = 'en'; document.querySelector('#go').click(); await wait(200); YX.cineStop();
const P = W.player; P.fly = true;
const look = (x, y, z, tx, ty, tz) => { P.x = x; P.y = y; P.z = z; const dx = tx - x, dy = ty - y, dz = tz - z; P.yaw = Math.atan2(-dx, -dz); P.pitch = Math.atan2(dy, Math.hypot(dx, dz)); P.vx = 0; P.vz = 0; step(0.2); step(0.2); };
const ids = () => new Set(Array.from(W.objs.values()).filter((o) => !o.dead).map((o) => o.id));
const tryIt = async (label, text, cam, target0) => { look(...cam); const ap = W.aimPoint.slice(), target = ap, aim = W.aim ? W.aim.type + '#' + W.aim.id : '-'; const b = ids(); M.commit(text); step(0.4); await wait(350); step(0.6);
  const nw = Array.from(W.objs.values()).filter((o) => !o.dead && !b.has(o.id)); const o = nw[0];
  const d = (x, z) => Math.hypot(x - target[0], z - target[1]).toFixed(1);
  out.push(label + ': "' + text + '" [crosshair on ' + aim + ', aim point ' + ap.map((v) => v.toFixed(0)) + '] → ' + (o ? o.type + ' at ' + o.x.toFixed(0) + ',' + o.z.toFixed(0) + ', ' + d(o.x, o.z) + ' m from where I pointed' : 'nothing') + ' | ' + lastLog().slice(0, 110));
  M.commit('undo'); step(0.3); await wait(200); step(0.3); };
// 1. looking down-left at open grass 16 m away, no "here"
await tryIt('no place, grass to the left', 'add a bench', [20, 6, -60, 8, 0, -72], [8, -72]);
await tryIt('"here", grass to the left', 'add a bench here', [20, 6, -60, 8, 0, -72], [8, -72]);
// 2. crosshair on a house wall (house #5 at 71,13 after nothing moved; we stand on the road in front)
const h = W.objs.get(5); await tryIt('"here", crosshair on a house', 'add a tree here', [66, 1.8, -2, h.x, 3, h.z], 0);
await tryIt('no place, crosshair on a house', 'add a lamp', [66, 1.8, -2, h.x, 3, h.z], 0);
// 3. crosshair on the road: a building cannot stand there
await tryIt('"here", house on the road', 'add a house here', [40, 12, -20, 40, 0, 0], [40, 0]);
// 4. crosshair on a spot taken by a tree
const tr = byType('tree').find((t) => Math.hypot(t.x - 40, t.z + 5.9) < 1); if (tr) await tryIt('"here", on a tree trunk', 'add a bench here', [40, 4, -18, tr.x, 0.3, tr.z], [tr.x, tr.z]);
// 5. far: crosshair on the ground 50 m away
await tryIt('"here", ground 50 m away', 'add a tree here', [0, 8, 30, 0, 0, -20], [0, -20]);
// 7. the case that ended up behind: standing on the pavement facing the road, low angle, no place, a house
const facing = async (label, text, cam) => { look(...cam); const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), b = ids(); M.commit(text); step(0.4); await wait(350); step(0.6); const o = Array.from(W.objs.values()).find((q) => !q.dead && !b.has(q.id));
  out.push(label + ': "' + text + '" → ' + (o ? o.type + ' ' + ((o.x - P.x) * fx + (o.z - P.z) * fz).toFixed(1) + ' m in front of me, ' + Math.abs((o.x - P.x) * -fz + (o.z - P.z) * fx).toFixed(1) + ' m to the side' : 'nothing') + ' | ' + lastLog().slice(0, 140)); M.commit('undo'); step(0.3); await wait(200); step(0.3); };
await facing('facing the road, eye level', 'add a house', [45, 1.8, -6.5, 45, 1.6, 10]);
await facing('facing the road, eye level', 'add a shed', [45, 1.8, -6.5, 45, 1.6, 10]);
await facing('on the road looking along it', 'add a house', [20, 1.8, 0, 120, 1.6, 0]);
await facing('in the market lane', 'add a fountain', [29, 1.8, -10, 29, 1.6, -30]);
// 6. looking at the sky
await tryIt('no place, sky', 'add a balloon', [0, 2, 30, 0, 30, 0], [0, 10]);
return out.join('\n');
