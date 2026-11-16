// --- user-reported issues, Chinese UI ---
YX.lang = 'zh';
const P = W.player; const bus = byType('bus')[0], n0 = W.objs.size;
out.push('bus #' + bus.id + ' motion=' + bus.motion + ' at ' + bus.x.toFixed(1) + ',' + bus.z.toFixed(1));
// 1. double decker: instant, same object
out.push(await say('把它变成一个双层巴士车', bus)); out.push('  decks=' + bus.params.decks + ' same=' + (W.objs.get(bus.id) === bus) + ' h=' + bus.size[1].toFixed(2));
// 2. move the bus onto the road in front of me
step(1); const v = YX.viewNow(), ra = YX.roadAhead(v); out.push('road ahead: #' + (ra && ra.r.o.id) + ' how=' + (ra && ra.how) + ' d=' + (ra && ra.d && ra.d.toFixed(1)));
out.push(await say('把巴士车挪到眼前的马路上', null)); step(1.5);
{ const f = YX.roadFrame(ra.r, bus.x, bus.z); out.push('  bus now t=' + f[0].toFixed(1) + ' lat=' + f[1].toFixed(2) + ' (want t≈' + ra.t.toFixed(1) + ') motion=' + bus.motion + ' dist to player=' + Math.hypot(bus.x - P.x, bus.z - P.z).toFixed(1)); }
out.push(await say('把它停到路边', bus)); step(1.2); { const f = YX.roadFrame(ra.r, bus.x, bus.z); out.push('  parked lat=' + f[1].toFixed(2) + ' roadW=' + ra.r.w + ' motion=' + bus.motion); }
out.push(await say('把它开到马路上', bus)); step(1.2); out.push('  motion=' + bus.motion);
// 3. conversation: two people, then "let them chat and laugh"
window.__route = (u) => /两个人/.test(u) ? '{"op":"add","type":"person","count":2,"params":{"pose":"sit"},"place":{"front":6}}' : null;
const p0 = byType('person').length;
out.push(await say('有两个人过来坐着', null, 900)); const p1 = byType('person').length; out.push('  people ' + p0 + '→' + p1 + ' group=' + JSON.stringify(W.people));
out.push(await say('让他们聊天、笑', null)); const p2 = byType('person').length; out.push('  people ' + p1 + '→' + p2 + ' gestures=' + W.people.map((id) => W.objs.get(id).params.gesture + '/' + W.objs.get(id).params.pose).join(','));
// what the model would be told next
window.__route = () => '{"op":"say","text":"ok"}'; window.__prompts.length = 0;
await say('让他们看起来很开心地手舞足蹈', null, 900); { const pr = window.__prompts[window.__prompts.length - 1] || ''; const a = pr.indexOf('## 最近的指令'); out.push('--- history section sent to the model ---\n' + pr.slice(a, a + 900)); const b = pr.indexOf('准星落点'); out.push('--- scene head ---\n' + pr.slice(pr.indexOf('## 当前场景'), b + 420)); }
// 4. jump is a real hop, and nothing stays in the air
const kid = W.objs.get(W.people[0]); let maxY = 0;
M.commit('让这个小孩跳两下'); out.push('让这个小孩跳两下  ⇒  (aim none)' + lastLog());
W.aim = kid; M.commit('让这个人跳两下'); step(1.6, () => { maxY = Math.max(maxY, kid.y); }); out.push('让这个人跳两下  ⇒  ' + lastLog() + '   maxY=' + maxY.toFixed(2) + ' endY=' + kid.y.toFixed(3));
const house = byType('house')[0]; YX.exec({ op: 'move', id: '#' + kid.id, by: { up: 4 } }, YX.newCtx()); let top = 0; step(2.5, () => { top = Math.max(top, kid.y); }); out.push('move up 4 → rose to ' + top.toFixed(2) + ' then y=' + kid.y.toFixed(3));
const r = YX.exec({ op: 'move', id: '#' + house.id, by: { up: 5 } }, YX.newCtx()); step(2.5); out.push('house up 5 → y=' + house.y.toFixed(3) + ' msg=' + r.msg);
out.push('objects ' + n0 + '→' + W.objs.size);
return out.join('\n');
