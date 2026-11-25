// Undo of a model-built new object: one undo removes it (also after Look & Fix revised it, and while it is still being built), stops the build, and it is not kept as a training example.
const wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = [], W = YX.world, LF = YX.lookFix, S = YX.sessions, M = YX.mind;
S.keepMs = 2500;
const count = (t) => Array.from(W.objs.values()).filter((o) => o.type === t && !o.dead).length, pend = () => Array.from(W.objs.values()).filter((o) => o.type === '__pending' && !o.dead).length;
const lines = async () => (await (await fetch('/__session', { cache: 'no-store' })).json()).count;
const bad = [{ match: false, problems: ['blades were floating'], fix: 'attach the blades' }, { match: true, problems: [], fix: '' }];
window.__route = (u) => { const m = /make zorb (\w)/.exec(u); return m ? '{"op":"invent","type":"zorb' + m[1].toLowerCase() + '","label":"Zorb ' + m[1] + '","brief":"a test object","size":[3,3,3],"motion":"none","place":{"front":16}}' : ''; };
const until = async (f, n) => { for (let t = 0; t < (n || 200) && !f(); t++) await wait(100); };
const idle = async () => { await until(() => M.active.size || pend() || LF.busy, 50); for (let t = 0; t < 160 && (M.active.size || LF.busy || pend()); t++) await wait(500); await wait(500); };
const n0 = await lines();

// A: built, looked at, fixed, then undone once
window.__lookVerdicts = bad.slice(); M.commit('make zorb A'); await until(() => count('zorba') > 0, 300); await idle();
out.push('A built: zorba=' + count('zorba') + ', undo depth ' + YX.undoDepth());
const d0 = YX.undoDepth(); YX.undo(); await wait(800);
await wait(S.keepMs + 1500);
out.push('A after ONE undo: zorba=' + count('zorba') + ' (want 0), undo depth ' + d0 + ' -> ' + YX.undoDepth() + ', session lines ' + n0 + ' -> ' + await lines() + ' (want unchanged), still waiting ' + S.pending.length);

// B: undone while it is still being built
window.__lookVerdicts = bad.slice(); window.__slowGen = 3000; M.commit('make zorb B');
for (let t = 0; t < 40 && !pend(); t++) await wait(100);
out.push('B placeholder up: ' + pend() + ', jobs ' + M.active.size);
YX.undo(); await wait(300); out.push('B right after undo: placeholders ' + pend() + ', jobs still running ' + M.active.size + ' (want 0)');
await idle(); window.__slowGen = 0;
out.push('B after it would have finished: zorbb=' + count('zorbb') + ' (want 0), placeholders ' + pend());

// C: undone after the 2.5 s "kept" window has passed
window.__lookVerdicts = [{ match: true, problems: [], fix: '' }]; M.commit('make zorb C'); await until(() => count('zorbc') > 0, 300); await idle(); await wait(S.keepMs + 1500);
const n1 = await lines(); out.push('C built and kept: zorbc=' + count('zorbc') + ', session lines ' + n0 + ' -> ' + n1);
YX.undo(); await wait(1500);
out.push('C after undo: zorbc=' + count('zorbc') + ' (want 0), session lines ' + await lines() + ' (want ' + n0 + '), counter "' + document.getElementById('swLearn').textContent + '"');

// D: undone while Look & Fix is rewriting it
const used = () => SW_HOST.usage.length; window.__lookVerdicts = bad.slice(); M.commit('make zorb D'); await until(() => count('zorbd') > 0, 300); window.__slowGen = 6000;
await until(() => LF.busy, 50); await wait(2600); const u1 = used(); YX.undo(); const t1 = performance.now(); await until(() => !LF.busy, 100);
out.push('D undone mid-fix: zorbd=' + count('zorbd') + ' (want 0), look & fix stopped after ' + Math.round(performance.now() - t1) + ' ms (want < 1500), model calls after undo ' + (used() - u1));
window.__slowGen = 0; await wait(S.keepMs + 1500); out.push('D session lines ' + await lines() + ' (want ' + n0 + ')');
const rej = await (await fetch('/__session', { cache: 'no-store' })).json(); out.push('rejected this run: ' + S.rejected + ', dropped before writing: ' + S.dropped);
return out.join('\n');
