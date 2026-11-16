const look = async (c, tgt) => { const dx = tgt[0] - c[0], dy = tgt[1] - c[1], dz = tgt[2] - c[2]; YX.setPose({ x: c[0], y: c[1], z: c[2], yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) }); W.player.fly = c[1] > 2; step(0.05); await wait(120); step(0.05); return W.aim ? W.aim.type + '#' + W.aim.id : 'nothing'; };
const h = byType('house').find((o) => Math.abs(o.rot % 6.283) < 0.01 || true), fr = [Math.sin(h.rot), Math.cos(h.rot)]; // the house's front direction
const d = h.foot[1] / 2, px = h.x + fr[0] * (d + 0.7), pz = h.z + fr[1] * (d + 0.7);
const p = YX.spawn({ type: 'person', x: px, z: pz, rot: h.rot, params: { pose: 'stand' }, seed: 5 }); p.motion = 'none'; step(0.1);
out.push('house#' + h.id + ' box depth ' + ((h.box.max.z - h.box.min.z) * h.s[2]).toFixed(1) + ' vs walls ' + h.foot[1].toFixed(1) + '; person#' + p.id + ' stands ' + (0.7).toFixed(1) + ' m in front of the wall');
out.push('from 5 m out, crosshair on the person\'s neck: ' + await look([px + fr[0] * 5, 1.5, pz + fr[1] * 5], [px, 1.42, pz]));
out.push('from 1.6 m (under the eaves), on the neck: ' + await look([px + fr[0] * 1.6, 1.5, pz + fr[1] * 1.6], [px, 1.42, pz]));
out.push('same spot, crosshair on the wall beside them: ' + await look([px + fr[0] * 1.6, 1.5, pz + fr[1] * 1.6], [px + fr[1] * 2.2, 1.6, pz - fr[0] * 2.2 - 0]) + ' (want the house)');
out.push('can the person be seen (was hidden by the house outline): ' + YX.seen(p));
out.push((await say('remove this person', null)).replace(/\s+/g, ' ').slice(0, 120));
const bu = YX.spawn({ type: 'bush', x: h.x + fr[0] * (d + 0.5) + fr[1] * 2.5, z: h.z + fr[1] * (d + 0.5) - fr[0] * 2.5, rot: 0, params: {}, seed: 3 }); step(0.1);
out.push('bush against the wall, from 4 m: ' + await look([bu.x + fr[0] * 4, 1.2, bu.z + fr[1] * 4], [bu.x, 0.5, bu.z]) + ' (want bush#' + bu.id + ')');
const bn = byType('bench')[0]; const sit = YX.spawn({ type: 'person', x: bn.x, z: bn.z, rot: bn.rot, params: { pose: 'sit', outfit: 'dress' }, seed: 8 }); YX.exec({ op: 'move', id: '#' + sit.id, place: { on: '#' + bn.id } }, YX.newCtx()); step(0.2);
const bf = [Math.sin(bn.rot), Math.cos(bn.rot)]; out.push('someone sitting on a bench, from 3 m in front, crosshair on their chest: ' + await look([sit.x + bf[0] * 3, 1.3, sit.z + bf[1] * 3], [sit.x, sit.y + 0.75, sit.z]) + ' (want person#' + sit.id + '; attach=' + JSON.stringify(sit.attach || null) + ')');
{ const e = (k) => [bn.x + k * bf[1] * (bn.size[0] / 2 - 0.12), 0.45, bn.z - k * bf[0] * (bn.size[0] / 2 - 0.12)], far = Math.hypot(e(1)[0] - sit.x, e(1)[2] - sit.z) > Math.hypot(e(-1)[0] - sit.x, e(-1)[2] - sit.z) ? e(1) : e(-1); out.push('crosshair on the end of the bench away from them (' + Math.hypot(far[0] - sit.x, far[2] - sit.z).toFixed(1) + ' m): ' + await look([far[0] + bf[0] * 3, 1.3, far[2] + bf[1] * 3], far) + ' (want bench#' + bn.id + ')'); }
// flight
const bird = byType('bird').find((b) => b.motion === 'fly'); const tr = []; const run = (n) => { for (let i = 0; i < n; i++) { step(0.25); tr.push([bird.x, bird.z]); } };
tr.length = 0; run(160); const spread = (a) => { const cx = a.reduce((s, q) => s + q[0], 0) / a.length, cz = a.reduce((s, q) => s + q[1], 0) / a.length; const r = a.map((q) => Math.hypot(q[0] - cx, q[1] - cz)); return [Math.min(...r).toFixed(1), Math.max(...r).toFixed(1)]; };
out.push('bird circling: distance from the middle of its path stays within ' + spread(tr).join('..') + ' m');
out.push(await say('make this bird fly more randomly', bird)); tr.length = 0; run(480); out.push('roaming: ' + spread(tr).join('..') + ' m; flight=' + bird.flight + '; height ' + bird.y.toFixed(1));
out.push('saved: ' + (YX.serialize().objs.find((q) => q.id === bird.id) || {}).flight);
out.push(await say('让这只鸟绕圈飞', bird)); out.push('flight=' + bird.flight); out.push(await say('undo', null)); out.push('after undo flight=' + (W.objs.get(bird.id) || {}).flight);
out.push(await say('让这只鸟飞得更随机一点', bird)); out.push('flight=' + bird.flight);
const car = byType('car')[0]; out.push(await say('make this car fly randomly', car));
return out.join('\n');
