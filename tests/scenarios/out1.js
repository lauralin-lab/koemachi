const look = async (c, tgt) => { const dx = tgt[0] - c[0], dy = tgt[1] - c[1], dz = tgt[2] - c[2]; YX.setPose({ x: c[0], y: c[1], z: c[2], yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) }); W.player.fly = c[1] > 2; step(0.05); await wait(120); step(0.05); return W.aim ? W.aim.type + '#' + W.aim.id : 'nothing'; };
const h = byType('house')[0], fr = [Math.sin(h.rot), Math.cos(h.rot)], sp = YX.spaceOf(h), door = YX.spaceSpot(h, sp.doorX, sp.hz);
const cam = [door[0] + fr[0] * 10, 1.7, door[1] + fr[1] * 10];
out.push('aim ' + await look(cam, [h.x, 1.6, h.z]) + ' floor ' + (sp.floor * h.s[1]).toFixed(2) + ' door at ' + door.map((v) => v.toFixed(1)));
const n0 = byType('person').length;
out.push(await say('a person walks out of this house'));
const ps = byType('person'), p = ps[ps.length - 1]; out.push('people ' + n0 + '→' + ps.length + ' new #' + p.id + ' room ' + YX.roomOf(p) + ' motion ' + p.motion + ' via ' + (p.ms && p.ms.via ? p.ms.via.length : '-'));
const tr = []; for (let i = 0; i < 9; i++) { step(0.8); const l = [(p.x - door[0]) * fr[0] + (p.z - door[1]) * fr[1]]; tr.push(l[0].toFixed(1) + '/' + p.y.toFixed(2)); } out.push('along the door axis (m outside the wall) / height: ' + tr.join('  ') + ' → motion ' + p.motion + ' pose ' + p.params.pose);
// send him back in
out.push(await say('walk into this house')); const tr2 = []; for (let i = 0; i < 12; i++) { step(0.8); tr2.push(((p.x - door[0]) * fr[0] + (p.z - door[1]) * fr[1]).toFixed(1) + '/' + p.y.toFixed(2)); } out.push(tr2.join('  ') + ' → room ' + YX.roomOf(p) + ' motion ' + p.motion);
// he is inside now: "have him come out"
W.focus = p; out.push(await say('have him walk out of the house')); step(6); out.push('room ' + YX.roomOf(p) + ' y ' + p.y.toFixed(2) + ' outside by ' + ((p.x - door[0]) * fr[0] + (p.z - door[1]) * fr[1]).toFixed(1) + ' people ' + byType('person').length);
out.push(await say('让他走进这栋房子')); step(9); out.push('room ' + YX.roomOf(p));
out.push(await say('一个人从房子里走出来')); step(6); out.push('room ' + YX.roomOf(p) + ' people ' + byType('person').length + ' (the one inside comes out, nobody new)');
out.push(await say('一个人走出房子')); step(1); out.push('people ' + byType('person').length + ' (house empty: a new one)');
out.push(await say('undo')); out.push('people ' + byType('person').length);
return out.join('\n');
