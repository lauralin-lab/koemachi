const C = window.__calls, P = W.player, D = YX.director, T_ = D._test;
let planFor = null;
window.__route = (u, s) => { window.__lastPrompt = s; if (/^You are the director of photography/.test(s)) return planFor ? JSON.stringify(planFor()) : 'sorry'; return '{"op":"say","text":"(router)"}'; };
const house = byType('house')[0];
const worst = (take) => { let n = 0, hit = new Set(); const obs = T_.obstaclesNear(house.x, house.z, 200, null); for (const s of take) for (const ob of obs) if (T_.insideOb(ob, [s.x, s.y, s.z], 0.25)) { n++; hit.add(ob.o.type + '#' + ob.o.id); } return n + ' of ' + take.length + ' samples inside something' + (hit.size ? ' (' + Array.from(hit).slice(0, 4).join(', ') + ')' : ''); };
const front = (d, side) => { const c = Math.cos(house.rot), s = Math.sin(house.rot); return [house.x + side * c + d * s, house.z - side * s + d * c]; };
const stand = (d, side, y) => { const p = front(d, side || 0); P.x = p[0]; P.z = p[1]; P.y = y || 1.7; P.fly = (y || 1.7) > 1.95; P.yaw = Math.atan2(-(house.x - P.x), -(house.z - P.z)); P.pitch = 0; for (let i = 0; i < 3; i++) step(0.1); };
const last = () => { const l = logs.filter(Boolean).slice(-1)[0]; return l ? l.tier + '/' + l.status + ' ' + l.msgs.join(' | ').slice(0, 150) : ''; };
const toasts = () => Array.from(document.querySelectorAll('#toasts .toast')).map((e) => e.textContent).slice(-1)[0] || '';
// 1. the classic orbit, tapped: before, it cut through the neighbours
stand(14); const before = T_.classicKeys('orbit', house, { deg: 360 }, YX.poseNow()); const rawS = T_.sampleKeys(before.keys, before.dur, before.ease), rawTake = T_.toTake(rawS, before.dur);
out.push('orbit 360° of house #' + house.id + ' from 14 m: unchecked path ' + worst(rawTake));
let n0 = W.shots.length; const r1 = YX.exec({ op: 'cam', move: 'orbit', deg: 360, instant: true }, YX.newCtx(YX.viewNow())); out.push('  tapped: ' + (r1 && r1.msg) + ' | cine=' + (YX.cine.active ? YX.cine.active.type + ' ' + YX.cine.active.dur.toFixed(1) + 's' : 'none') + ' shots ' + n0 + '→' + W.shots.length);
out.push('  flown path: ' + worst(W.shots[W.shots.length - 1].take) + ' ; plan card: ' + (document.querySelector('#shotPlan') ? document.querySelector('#shotPlan').textContent : 'none'));
{ const tk = W.shots[W.shots.length - 1].take; let mx = 0, mn = 1e9, jerk = 0; for (let i = 1; i < tk.length; i++) { const d = Math.hypot(tk[i].x - tk[i - 1].x, tk[i].y - tk[i - 1].y, tk[i].z - tk[i - 1].z); mx = Math.max(mx, d); mn = Math.min(mn, d); if (i > 1) { const d0 = Math.hypot(tk[i - 1].x - tk[i - 2].x, tk[i - 1].y - tk[i - 2].y, tk[i - 1].z - tk[i - 2].z); jerk = Math.max(jerk, Math.abs(d - d0)); } } let dev = 0; for (let i = 0; i < tk.length; i++) dev = Math.max(dev, Math.hypot(tk[i].x - rawTake[i].x, tk[i].y - rawTake[i].y, tk[i].z - rawTake[i].z)); out.push('  smoothness: step per sample ' + mn.toFixed(2) + '–' + mx.toFixed(2) + ' m, biggest change between steps ' + jerk.toFixed(2) + ' m, furthest from the plain circle ' + dev.toFixed(1) + ' m, height ' + Math.min(...tk.map((q) => q.y)).toFixed(1) + '–' + Math.max(...tk.map((q) => q.y)).toFixed(1)); }
for (let i = 0; i < 130; i++) step(0.1); out.push('  after it ends: cine=' + !!YX.cine.active + ' player at ' + P.x.toFixed(1) + ',' + P.z.toFixed(1) + ' (stays where the move ended)');
// 2. a plan from the model that runs straight through the house
stand(16); const a = front(16, 0), b = front(-14, 0);
planFor = () => ({ name: 'Through the garden', dur: 8, lens: 35, ease: 'inout', keys: [{ t: 0, pos: [a[0], 1.7, a[1]], look: '#' + house.id }, { t: 0.5, pos: [house.x, 2.2, house.z], look: [b[0], 3, b[1]] }, { t: 1, pos: [b[0], 4, b[1]], look: '#' + house.id }] });
W.aim = house; n0 = W.shots.length; let c0 = C.length; M.commit('给这个房子来个电影感的镜头，从正面穿到后院'); step(0.2); await wait(700); step(0.3); await wait(300);
out.push('free-form request  =>  ' + last() + ' | model calls ' + C.slice(c0).map((c) => c.tier).join(',') + ' | toast: ' + toasts());
const sh = W.shots[W.shots.length - 1]; out.push('  shots ' + n0 + '→' + W.shots.length + ' "' + (sh && sh.name) + '" take ' + (sh && sh.take ? sh.take.length + ' samples, ' + sh.take[sh.take.length - 1].t.toFixed(1) + ' s' : 'none') + ' ; ' + (sh && sh.take ? worst(sh.take) : '') + ' ; highest point ' + (sh && sh.take ? Math.max(...sh.take.map((q) => q.y)).toFixed(1) : '-') + ' m');
const pr = window.__lastPrompt || ''; out.push('  brief sent: ' + pr.length + ' chars; has subject=' + /## Subject\n#\d+ house/.test(pr) + ' obstacles=' + (pr.split('## Obstacles')[1] || '').split('\n').filter((x) => /^#\d+/.test(x)).length + ' roads=' + /## Roads\n#\d+: from/.test(pr) + ' request=' + /电影感/.test(pr));
for (let i = 0; i < 100; i++) step(0.1);
// 3. the model answers nonsense: the classic move is used instead
planFor = null; stand(15, 3); W.aim = house; c0 = C.length; M.commit('环绕这个房子'); step(0.2); await wait(700); step(0.3); await wait(200); out.push('model gives no plan  =>  ' + last() + ' | toast: ' + toasts() + ' | cine=' + (YX.cine.active ? YX.cine.active.type : 'none') + ' ; ' + worst(W.shots[W.shots.length - 1].take)); for (let i = 0; i < 100; i++) step(0.1);
// 4. "record it" right after a move films that move again; with no recent move it records what you see; "stop" ends it
window.__saved = []; M.commit('录下来'); step(0.2); await wait(900); out.push('"录下来" after a move  =>  ' + last() + ' | recording=' + YX.filmBusy() + ' cine=' + (YX.cine.active ? YX.cine.active.type : 'none'));
YX.filmStop(); await wait(1200); YX.cineStop(); if (YX.compare) YX.compare.close();
YX.lastMoveAt = 0; M.commit('record it'); step(0.2); await wait(900); out.push('"record it" with no recent move  =>  ' + last() + ' | live=' + YX.filmLive() + ' cine=' + !!YX.cine.active);
M.commit('stop'); step(0.2); for (let i = 0; i < 12; i++) { await wait(500); if (document.querySelectorAll('#clipList .scard').length) break; } out.push('"stop"  =>  ' + last() + ' | recording=' + YX.filmBusy() + ' | compare view open=' + document.querySelector('#cmp').classList.contains('on') + ' note="' + document.querySelector('#cmpNote').textContent.slice(0, 60) + '" clips in panel=' + document.querySelectorAll('#clipList .scard').length);
if (YX.compare) YX.compare.close();
// 5. sitting on what is pointed at
const tbl = byType('table')[0]; P.x = tbl.x + 4; P.z = tbl.z + 3; P.y = 1.7; P.fly = false; P.yaw = Math.atan2(-(tbl.x - P.x), -(tbl.z - P.z)); P.pitch = -0.25; for (let i = 0; i < 4; i++) { step(0.1); await wait(30); }
out.push('pointing at ' + (W.aim ? W.aim.type + '#' + W.aim.id : 'none') + ' seats=' + YX.seatsOf(tbl).join(','));
const pc = byType('person').length, cc = byType('chair').length + byType('bench').length; W.aim = tbl; M.commit('让一个人坐在这把椅子上'); step(0.3); await wait(500); step(0.5);
const sitter = Array.from(tbl.kids).map((id) => W.objs.get(id)).find((k) => k && k.type === 'person'); out.push('"让一个人坐在这把椅子上"  =>  ' + last() + ' | people ' + pc + '→' + byType('person').length + ', chairs+benches ' + cc + '→' + (byType('chair').length + byType('bench').length) + ' | on the table set: ' + (sitter ? 'pose=' + sitter.params.pose + ' anchor=' + sitter.attach.anchor : 'nobody'));
W.aim = tbl; M.commit('再让一个人坐上去'); step(0.3); await wait(500); step(0.5); out.push('  a second one  =>  ' + last() + ' | people ' + byType('person').length + ' | seated: ' + Array.from(tbl.kids).map((id) => W.objs.get(id)).filter((k) => k && k.type === 'person').map((k) => k.attach.anchor).join(','));
W.aim = tbl; M.commit('have a person sit on this chair'); step(0.3); await wait(500); step(0.5); out.push('  "have a person sit on this chair"  =>  ' + last() + ' | seated: ' + Array.from(tbl.kids).map((id) => W.objs.get(id)).filter((k) => k && k.type === 'person').map((k) => k.attach.anchor).join(','));
M.commit('把这里弄得更热闹一点'); step(0.2); await wait(400); const p2 = window.__lastPrompt || ''; out.push('  scene line: ' + (p2.split('\n').find((x) => x.startsWith('#' + tbl.id + ' ')) || '').slice(0, 150)); out.push('  history: ' + (p2.split('\n').filter((x) => /crosshair was on/.test(x)).slice(-2).join(' || ').slice(0, 260)));
return out.join('\n');
