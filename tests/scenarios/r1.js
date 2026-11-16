window.__route = (u, s) => { window.__lastPrompt = s; return '{"op":"say","text":"(router)"}'; };
const C = window.__calls;
const house = byType('house')[0], P = W.player;
const c = Math.cos(house.rot), s = Math.sin(house.rot), toW = (lx, lz) => [house.x + lx * c + lz * s, house.z - lx * s + lz * c];
const n0 = W.objs.size;
// stand in the middle of the room, looking at the dining table
const go = (lx, lz, tx, tz, pitch) => { const a = toW(lx, lz), t = toW(tx, tz); P.fly = false; P.x = a[0]; P.z = a[1]; P.y = 1.7; P.yaw = Math.atan2(-(t[0] - P.x), -(t[1] - P.z)); P.pitch = pitch == null ? -0.35 : pitch; };
go(0, 1.5, 0, 0); for (let i = 0; i < 6; i++) { step(0.3); await wait(60); }
const kids = Array.from(house.kids).map((id) => W.objs.get(id)).filter(Boolean);
out.push('house #' + house.id + ' furnished=' + house.params._furn + ' objects ' + n0 + '→' + W.objs.size + ' kids: ' + kids.map((k) => k.type).join(','));
out.push('inside=' + (YX.insideOf() && YX.insideOf().id) + ' lift=' + (YX.lift || 0).toFixed(2) + ' floorOf=' + YX.floorOf(house) + ' kid y=' + kids[0].y.toFixed(2) + ' visible=' + kids[0].holder.visible);
const tables = kids.filter((k) => k.type === 'ftable'), dining = tables.find((k) => k.params.height > 0.6), coffee = tables.find((k) => k.params.height < 0.6);
const tell = async (text, lookAt) => { if (lookAt) { const l = [(lookAt.x - house.x) * c - (lookAt.z - house.z) * s, (lookAt.x - house.x) * s + (lookAt.z - house.z) * c]; const here = [(P.x - house.x) * c - (P.z - house.z) * s, (P.x - house.x) * s + (P.z - house.z) * c]; go(here[0], here[1], l[0], l[1], -Math.atan2(1.2 + (YX.lift || 0) - lookAt.size[1] * 0.6, Math.hypot(lookAt.x - P.x, lookAt.z - P.z))); for (let i = 0; i < 3; i++) { step(0.1); await wait(40); } } const n = C.length, aim = W.aim; M.commit(text); step(0.2); await wait(450); step(0.6); const l = logs.filter(Boolean).slice(-1)[0]; out.push(text + '  [aim ' + (aim ? aim.type + '#' + aim.id : 'none') + ']  =>  ' + (l ? l.tier + '/' + l.status + ' ' + l.msgs.join(' | ').slice(0, 110) : '') + ' calls ' + (C.length - n)); };
const sz = (o) => o.size.map((v) => v.toFixed(2)).join('x');
out.push('dining table before ' + sz(dining) + ' s=' + dining.s.join(','));
await tell('把房间里的这个桌子放大一点', dining); out.push('   dining after ' + sz(dining) + ' s=' + dining.s.map((v) => v.toFixed(2)).join(','));
await tell('把这个桌子变成红色', dining); out.push('   color=' + dining.params.color);
await tell('把茶几放大一点', dining); out.push('   coffee table s=' + coffee.s.map((v) => v.toFixed(2)).join(','));
const sofa = kids.find((k) => k.type === 'sofa'); await tell('把沙发变成绿色', dining); out.push('   sofa color=' + sofa.params.color);
await tell('make this table bigger', dining); out.push('   dining s=' + dining.s.map((v) => v.toFixed(2)).join(','));
await tell('make the sofa blue', dining); out.push('   sofa color=' + sofa.params.color);
// adding indoors
const before = new Set(W.objs.keys()); go(0, 1.5, 1.2, 1.2, -0.6); for (let i = 0; i < 3; i++) { step(0.1); await wait(40); }
out.push('aimPoint local ' + (() => { const a = W.aimPoint; return [((a[0] - house.x) * c - (a[1] - house.z) * s).toFixed(2), ((a[0] - house.x) * s + (a[1] - house.z) * c).toFixed(2)].join(','); })());
await tell('在这里加一个盆栽'); const added = Array.from(W.objs.values()).filter((o) => !before.has(o.id));
out.push('   added: ' + added.map((o) => o.type + '#' + o.id + ' y=' + o.y.toFixed(2) + ' room=' + YX.roomOf(o) + ' local=' + (((o.x - house.x) * c - (o.z - house.z) * s).toFixed(2)) + ',' + (((o.x - house.x) * s + (o.z - house.z) * c).toFixed(2))).join(' ; '));
await tell('加一把椅子'); const add2 = Array.from(W.objs.values()).filter((o) => !before.has(o.id) && !added.includes(o)); out.push('   added: ' + add2.map((o) => o.type + '#' + o.id + ' y=' + o.y.toFixed(2) + ' room=' + YX.roomOf(o)).join(' ; '));
await tell('add a sofa here'); const add3 = Array.from(W.objs.values()).filter((o) => !before.has(o.id) && !added.includes(o) && !add2.includes(o)); out.push('   added: ' + add3.map((o) => o.type + '#' + o.id + ' y=' + o.y.toFixed(2) + ' room=' + YX.roomOf(o)).join(' ; '));
// moving: relative, and it stays in the room
const x0 = dining.x, z0 = dining.z; await tell('把这个桌子往左移一米', dining); step(1); out.push('   dining moved ' + Math.hypot(dining.x - x0, dining.z - z0).toFixed(2) + ' m, y=' + dining.y.toFixed(2) + ' room=' + YX.roomOf(dining));
await tell('把这个桌子往前移二十米', dining); step(1); out.push('   pushed 20 m: still in room=' + YX.roomHas(house, dining.x, dining.z) + ' y=' + dining.y.toFixed(2));
// what the model is told
await tell('让这个房间看起来更温馨一些');
const pr = window.__lastPrompt || ''; const i = pr.search(/The player is INSIDE|玩家在 #/); out.push('--- scene sent to the model ---\n' + (i < 0 ? '(no indoor line)' : pr.slice(i, i + 330)) + '\n' + pr.split('\n').filter((x) => /^#\d+ /.test(x)).slice(0, 9).join('\n'));
// remove, undo
const cnt = W.objs.size; await tell('把这个桌子删掉', dining); out.push('removed dining: ' + cnt + '→' + W.objs.size + ' dead=' + !!dining.dead); YX.undo(); step(0.5); out.push('undo → ' + W.objs.size);
return out.join('\n');
