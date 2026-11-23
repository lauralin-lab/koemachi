// Kept-edit logging: a result that stays is written to data/sessions.jsonl as a chat example; one that is undone soon is not; the corner counter follows.
const wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = [], S = YX.sessions, count = async () => (await (await fetch('/__session', { cache: 'no-store' })).json()).count;
S.keepMs = 4000;
const n0 = await count(); out.push('before: ' + n0 + ' lines; counter "' + document.getElementById('swLearn').textContent + '"');
window.__route = (u) => (/alpha/.test(u) ? '{"op":"add","type":"tree","place":{"front":10}}' : /beta/.test(u) ? '{"op":"add","type":"lamp","place":{"front":14}}' : /gamma/.test(u) ? '{"op":"say","text":"just talking"}' : '');
YX.mind.commit('alpha please'); await wait(7000);
YX.mind.commit('beta please'); for (let i = 0; i < 40 && !S.pending.length; i++) await wait(200); out.push('beta recorded after ~' + 'poll, pending ' + S.pending.length); out.push('before undo: pending ' + S.pending.length + ' depth ' + YX.undoDepth()); out.push('undo -> ' + YX.undo() + ', dropped ' + S.dropped); await wait(6000);   // beta is undone inside the window
YX.mind.commit('gamma please'); await wait(7000);                                 // only says something
const n1 = await count();
out.push('after an edit kept, one undone, one that only talked: ' + n1 + ' lines (expected ' + (n0 + 1) + '); counter "' + document.getElementById('swLearn').textContent + '"; dropped by undo: ' + S.dropped + '; still waiting: ' + S.pending.length);
return out.join('\n');
