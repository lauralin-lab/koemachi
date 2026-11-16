let routed = [];
window.__route = (u, s) => { routed.push(u.slice(0, 60)); return '{"op":"say","text":"(model decides)"}'; };
const P = W.player, bench = byType('bench').find((o) => YX.seen(o)) || byType('bench')[0];
P.x = bench.x + 5; P.z = bench.z + 4; P.y = 1.7; P.fly = false; P.yaw = Math.atan2(-(bench.x - P.x), -(bench.z - P.z)); P.pitch = -0.2; for (let i = 0; i < 4; i++) { step(0.1); await wait(30); }
const st = () => 'size ×' + bench.s[0].toFixed(2) + ', ' + Math.hypot(bench.x - P.x, bench.z - P.z).toFixed(1) + ' m away, turned ' + Math.round(bench.rot * 180 / Math.PI) + '°, colour ' + bench.params.color;
const tell = async (t) => { W.aim = bench; const n = routed.length; M.commit(t); step(0.3); await wait(450); step(0.8); const l = logs.filter(Boolean).slice(-1)[0]; out.push((t + '                         ').slice(0, 26) + ' => ' + (l ? l.tier + ' ' + l.msgs.join(' | ').slice(0, 60) : '') + (routed.length > n ? '  [sent to the model]' : '') + '\n      ' + st()); };
out.push('bench #' + bench.id + ': ' + st());
await tell('把这个长椅放大一点'); await tell('more'); await tell('再来一点');
await tell('把它移远一点'); await tell('more'); await tell('again'); await tell('a bit more');
await tell('rotate it 30 degrees'); await tell('more');
await tell('make it red'); await tell('more');
await tell('move it closer'); await tell('再多一点');
return out.join('\n');
