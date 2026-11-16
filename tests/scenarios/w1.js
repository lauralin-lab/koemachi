window.__route = (u, s) => '{"op":"say","text":"(router)"}';
const P = W.player, rd = YX.roads()[0], ro = rd.o;
const edge = (o) => { const ex = o.x - rd.x, ez = o.z - rd.z; return Math.abs(ex * -rd.dz + ez * rd.dx); };
const along = Array.from(W.objs.values()).filter((o) => o !== ro && !o.attach && o.type !== 'road' && Math.abs((o.x - rd.x) * rd.dx + (o.z - rd.z) * rd.dz) < rd.hl && edge(o) < 20 && !(o.motion === 'drive'));
const samp = ['house', 'lamp', 'tree', 'bench', 'shop'].map((t) => along.find((o) => o.type === t)).filter(Boolean);
const gap = () => samp.map((o) => o.type + '#' + o.id + ' ' + (edge(o) - YX.roads()[0].w / 2).toFixed(2)).join('  ');
out.push('road #' + ro.id + ' width ' + rd.w + ' ; distance to the kerb: ' + gap());
P.x = 20; P.z = -14; P.y = 6; P.fly = true; P.yaw = Math.PI; P.pitch = -0.5; for (let i = 0; i < 3; i++) { step(0.2); await wait(40); }
out.push('aim=' + (W.aim ? W.aim.type + '#' + W.aim.id : 'none')); W.aim = ro;
const tell = async (text) => { W.aim = ro; M.commit(text); step(0.3); await wait(500); step(1); await wait(600); step(1); const l = logs.filter(Boolean).slice(-1)[0]; out.push(text + '  =>  ' + (l ? l.tier + '/' + l.status + ' ' + l.msgs.join(' | ').slice(0, 150) : '')); out.push('   width ' + YX.roads()[0].w + ' ; distance to the kerb: ' + gap() + ' ; standing on a road: ' + Array.from(W.objs.values()).filter((o) => YX.onRoad(o) != null).length); };
await tell('把这条路加宽一倍'); await tell('把这条路变窄一点'); YX.undo(); step(0.5); YX.undo(); step(0.5); out.push('undo ×2: width ' + YX.roads()[0].w + ' ; ' + gap());
// people do not stand in walls: put one inside a shop corner and wait for the check
const shop = byType('shop')[0], c = Math.cos(shop.rot), s = Math.sin(shop.rot), w = shop.foot[0], d = shop.foot[1], inside = [shop.x + (w / 2 - 0.3) * c + (d / 2 - 0.2) * s, shop.z - (w / 2 - 0.3) * s + (d / 2 - 0.2) * c];
const man = YX.spawn({ type: 'person', x: inside[0], z: inside[1], motion: 'none' }); const loc = (o) => { const dx = o.x - shop.x, dz = o.z - shop.z; return [(dx * c - dz * s), (dx * s + dz * c)]; };
out.push('person put inside the shop corner: local ' + loc(man).map((v) => v.toFixed(2)).join(',') + ' (half-size ' + (w / 2).toFixed(2) + ',' + (d / 2).toFixed(2) + ')'); for (let i = 0; i < 70; i++) step(0.05); await wait(300); for (let i = 0; i < 20; i++) step(0.05);
out.push('   after a moment: local ' + loc(man).map((v) => v.toFixed(2)).join(',') + ' clear of the front wall by ' + (loc(man)[1] - d / 2).toFixed(2) + ' m, side wall by ' + (Math.abs(loc(man)[0]) - w / 2).toFixed(2) + ' m');
const r = YX.exec({ op: 'add', type: 'person', count: 6, place: { near: '#' + shop.id } }, YX.newCtx(YX.viewNow())); step(1); const ppl = byType('person').slice(-6); out.push('6 people added near the shop: inside its rectangle+skirt: ' + ppl.filter((o) => { const l = loc(o); return Math.abs(l[0]) < w / 2 + 0.3 && l[1] > -d / 2 - 0.3 && l[1] < d / 2 + 0.8; }).length);
return out.join('\n');
