// people: going to a place beyond sight, keeping a "when X, do Y" promise, putting their arms down
const P = W.player, calls = [];
window.__route = (u, s) => { calls.push(s); window.__lastPrompt = s; if (/^You are |^你是/.test(s) && !/director of photography|compiler|JSONL/.test(s.slice(0, 200))) {
  const said = (s.match(/The stranger says: "([^"]*)"/) || [])[1] || '';
  if (/bus stop/i.test(said) && /wait/i.test(said)) { const m = s.match(/Bus stop[^#;]*#(\d+)/); return m ? 'Sure, I\'ll head over and wait there.\n{"do":"walk","to":"#' + m[1] + '"}' : 'I don\'t see a bus stop around here.\n{"do":"none"}'; }
  if (/^when/i.test(said)) return 'Will do, I\'ll keep an eye out.\n{"do":"when","near":"bus","within":12,"then":["wave",{"do":"walk","to":"it"}],"say":"There it is!"}';
  if (/hands down/i.test(said)) return /waving one arm/.test(s) ? 'Okay, okay, arms down.\n{"do":"still"}' : 'My hands are down already.\n{"do":"none"}';
  return 'Hello!\n{"do":"none"}'; } return '{"op":"say","text":"(router)"}'; };
document.querySelector('#go').click(); await wait(200); YX.cineStop();
const bub = () => document.querySelector('#npcBubble span').textContent;
const stop = byType('busstop')[0]; out.push('bus stop #' + stop.id + ' at ' + stop.x.toFixed(0) + ',' + stop.z.toFixed(0));
const p = YX.spawn({ type: 'person', x: 20, z: -14, rot: 0, params: { pose: 'stand' }, seed: 4242 }); p.motion = 'none';
const near = async () => { P.fly = false; P.x = p.x + 0.5; P.z = p.z + 3.5; P.y = 1.7; P.yaw = Math.atan2(-(p.x - P.x), -(p.z - P.z)); P.pitch = -0.05; for (let i = 0; i < 3; i++) { step(0.3); await wait(40); } W.aim = p; };
await near(); M.commit('talk to this person'); await wait(400); step(0.3);
out.push('distance to the stop: ' + Math.hypot(p.x - stop.x, p.z - stop.z).toFixed(0) + ' m');
M.commit('could you go and wait at the bus stop?'); await wait(500); step(0.3);
out.push('1 prompt lists the far bus stop: ' + /Further away in town[^\n]*Bus stop[^#;]*#/.test(window.__lastPrompt) + ' ; said: "' + bub() + '" ; motion=' + p.motion);
YX.talk.end(); for (let i = 0; i < 120; i++) step(0.5);
out.push('   after 60 s: ' + Math.hypot(p.x - stop.x, p.z - stop.z).toFixed(1) + ' m from the stop, motion=' + p.motion);
// the promise
await near(); M.commit('talk to this person'); await wait(400); step(0.3);
M.commit('when the bus comes, wave and walk to it'); await wait(500); step(0.3);
out.push('2 promise kept on the person: ' + JSON.stringify((p.params._when || []).map((r) => r.what)) + ' ; said: "' + bub() + '"');
YX.talk.end(); P.x = p.x + 30; P.z = p.z - 30; step(0.3);
let fired = null; const trace = []; for (let i = 0; i < 400 && !fired; i++) { step(0.5); if (!(p.params._when || []).length) fired = i * 0.5; if (i % 40 === 0) trace.push(byType('bus').map((b) => b.id + '@' + b.x.toFixed(0) + ',' + b.z.toFixed(0) + ' ' + b.motion + (b.ms ? ' v' + (b.ms.v || 0).toFixed(1) : '')).join(' ') + ' | p ' + p.x.toFixed(1) + ',' + p.z.toFixed(1)); } out.push('   buses: ' + trace.join(' // '));
const bus = byType('bus').map((b) => [Math.hypot(b.x - p.x, b.z - p.z), b]).sort((a, b) => a[0] - b[0])[0];
out.push('   kept after ' + fired + ' s ; gesture=' + p.params.gesture + ' pose=' + p.params.pose + ' motion=' + p.motion + ' ; nearest bus ' + (bus ? bus[0].toFixed(1) + ' m' : '-') + ' ; bubble "' + bub() + '"');
// arms down
p.params.gesture = 'wave'; YX.rebuild(p); p.motion = 'none'; await near(); M.commit('talk to this person'); await wait(400); step(0.3);
M.commit('hands down please'); await wait(500); step(0.3);
out.push('3 prompt says she is waving: ' + /waving one arm/.test(window.__lastPrompt) + ' ; gesture now=' + p.params.gesture + ' pose=' + p.params.pose + ' ; said: "' + bub() + '"');
return out.join('\n');
