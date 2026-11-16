window.__route = (u, s) => { window.__lastPrompt = s; return window.__reply || '{"op":"say","text":"(router)"}'; };
const P = W.player, shop = byType('shop').find((o) => o.params.name === 'BOOKS') || byType('shop')[0];
const c = Math.cos(shop.rot), s = Math.sin(shop.rot); P.x = shop.x + 13 * s; P.z = shop.z + 13 * c; P.y = 1.7; P.fly = false; P.yaw = Math.atan2(-(shop.x - P.x), -(shop.z - P.z)); P.pitch = 0.1; for (let i = 0; i < 4; i++) { step(0.1); await wait(30); }
out.push('shop #' + shop.id + ' sign="' + shop.params.name + '" nickname="' + shop.name + '" aim=' + (W.aim ? W.aim.type + '#' + W.aim.id : 'none'));
const tell = async (t, aim) => { W.aim = aim === undefined ? shop : aim; M.commit(t); step(0.3); await wait(450); step(0.5); const l = logs.filter(Boolean).slice(-1)[0]; out.push(t + '\n   => ' + (l ? l.tier + '/' + l.status + ' ' + l.msgs.join(' | ').slice(0, 170) : '') + '\n      sign="' + shop.params.name + '" nickname="' + shop.name + '"'); };
await tell('Change the text from books to Envisioning Studio Books.');
await tell('把招牌改成 月光书店');
await tell('change the sign to Night Owl Books', null);
await tell('rename this shop to Corner Books');
// what the model path does with the three spellings a model might use
for (const pr of ['{"op":"set","id":"#ID","params":{"name":"MODEL NAME"}}', '{"op":"set","id":"#ID","params":{"text":"MODEL TEXT"}}', '{"op":"set","id":"#ID","params":{"sign":"MODEL SIGN"}}', '{"op":"set","id":"#ID","params":{"label":"my bookshop"}}', '{"op":"set","id":"#ID","params":{"banner":"x","roof":"flat"}}']) { window.__reply = pr.replace('#ID', '#' + shop.id); await tell('(model) ' + pr.slice(26, 70)); }
window.__reply = null; M.commit('make it livelier here'); step(0.2); await wait(400); const p2 = window.__lastPrompt || ''; out.push('scene line: ' + (p2.split('\n').find((x) => x.startsWith('#' + shop.id + ' ')) || '').slice(0, 200)); out.push('history tail: ' + (p2.split('\n').filter((x) => /no property/.test(x)).slice(-1)[0] || '').slice(0, 260));
out.push('catalog: ' + (p2.split('\n').find((x) => /^shop /.test(x)) || '').slice(0, 160));
const bus = byType('bus')[0]; const r = YX.exec({ op: 'set', id: '#' + bus.id, params: { text: 'AIRPORT EXPRESS' } }, YX.newCtx(YX.viewNow())); out.push('bus: ' + (r && r.msg) + ' → "' + bus.params.name + '"');
return out.join('\n');
