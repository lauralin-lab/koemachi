const ex = (op) => { const r = YX.exec(op, YX.newCtx(YX.viewNow())); return (r && (r.ok ? 'ok: ' : 'FAIL: ') + r.msg) || JSON.stringify(r); };
const P = W.player, o = YX.spawn({ type: '__pending', x: P.x + 4, z: P.z - 6, y: 0, rot: 0, psize: [1.4, 1, 2], name: 'Sleepy boar' }, { animate: true }); o.wantType = 'sleepy_boar'; step(0.5); W.aim = o; W.focusId = o.id;
const job = { name: 'sleepy_boar', label: 'Sleepy boar', size: [1.4, 1, 2], motion: 'none', phId: o.id }; M.active.add(job);
const pend = () => byType('__pending').length;
const ops = [{ op: 'clone', id: '#' + o.id, count: 2 }, { op: 'add', type: 'sleepy_boar', count: 1 }, { op: 'add', type: 'Sleepy Boar' }, { op: 'set', id: '#' + o.id, params: { scale: 2 } }, { op: 'resize', factor: 1.5 }, { op: 'rotate', id: '#' + o.id, deg: 90 }, { op: 'walk', id: '#' + o.id, to: { near: 'me' } }, { op: 'add', type: '__pending' }];
for (const op of ops) { let r; try { r = ex(op); } catch (e) { r = 'THROWN ' + e.message; } out.push(JSON.stringify(op).slice(0, 64) + '  =>  ' + String(r).slice(0, 150) + '   [placeholders ' + pend() + ', builds running ' + M.active.size + ']'); }
out.push('kept for later on the placeholder: ' + (o.after || []).map((q) => q.op).join(', '));
// the build finishes: the placeholder becomes a real thing (a bench stands in for the boar here)
const rot0 = o.rot; o.type = 'bench'; o.params = YX.fillParams(YX.GEN.bench, {}, YX.rng(o.seed)); o.psize = null; YX.rebuild(o); const msgs = YX.afterBuilt(o); step(0.5);
out.push('when it appeared: ' + msgs.join(' | ')); out.push('scale ' + o.s.map((v) => v.toFixed(2)).join(',') + ' turned by ' + (((o.rot - rot0) * 180) / Math.PI).toFixed(0) + '°, queue ' + (o.after ? o.after.length : 0));
M.active.delete(job); for (const x of byType('__pending')) YX.removeObj(x);
return out.join('\n');
