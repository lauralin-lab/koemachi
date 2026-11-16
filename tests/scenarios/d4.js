const C = window.__calls; let verdict = 'yes';
const CODE = 'b.box(1.9,0.6,4.6,p.color,0,0.3,0); b.box(1.7,0.55,2.4,"#222",0,0.9,-0.2); for (const x of [-1,1]) for (const z of [-1,1]) b.cyl(0.33,0.33,0.25,"#111",x*0.9,0.33,z*1.4,{rz:90});';
const mk = async (name, label, place) => { YX.registerCustom({ name, label, size: [1.9, 1.45, 4.7], motion: 'none', params: { color: { d: '#c0392b' } } }, CODE); YX.exec({ op: 'add', type: name, place }, YX.newCtx(YX.viewNow())); step(1); await wait(600); step(1); return byType(name)[0]; };
const t = await mk('tesla_model_3', 'Tesla Model 3', { front: 8 });
window.__route = (u, s) => /Can it /.test(s) ? verdict : '{"op":"set","id":"#' + window.__tid + '","params":{"motion":"drive"}}';
const nr0 = YX.nearestRoad(t.x, t.z); out.push('tesla: cls=' + YX.defOf(t).cls + ' motion=' + t.motion + ' at ' + t.x.toFixed(1) + ',' + t.z.toFixed(1) + ' road dist ' + nr0.dist.toFixed(1));
const probe = async (o, text) => { const n0 = C.length, x0 = o.x, z0 = o.z; W.aim = o; window.__tid = o.id; M.commit(text); step(0.2); await wait(900); step(0.5); await wait(500); step(4); const l = logs.filter(Boolean).slice(-1)[0], nr = YX.nearestRoad(o.x, o.z); out.push(text + '  =>  ' + (l ? l.tier + '/' + l.status + ' ' + l.msgs.join(' | ').slice(0, 90) : '') + '  motion=' + o.motion + ' cls=' + YX.defOf(o).cls + ' moved ' + Math.hypot(o.x - x0, o.z - z0).toFixed(1) + 'm, lateral to road ' + nr.lat.toFixed(1) + ' calls ' + C.slice(n0).map((c) => c.tier).join(',') + ' toasts: ' + Array.from(document.querySelectorAll('#toasts .toast')).map((e) => e.textContent).slice(-2).join(' / ')); };
await probe(t, '让它跑起来');
step(3); out.push('  3 s later: speed ' + (t.vel || 0).toFixed(1) + ' at ' + t.x.toFixed(1) + ',' + t.z.toFixed(1) + ' rot ' + t.rot.toFixed(2));
YX.undo(); step(0.5); const t2 = byType('tesla_model_3')[0]; out.push('undo → motion=' + (t2 && t2.motion) + ' cls stays ' + YX.defOf(t2).cls);
// far from any road
const far = await mk('tesla_far', 'Tesla Roadster', { at: [150, 150] }); await probe(far, '让它开起来');
// something that should not drive
verdict = 'no'; const st = await mk('stone_lion', 'Stone lion statue', { front: 6 }); await probe(st, 'make it drive'); await probe(st, 'make it drive');
// a second tesla of the same type now simply drives
YX.exec({ op: 'add', type: 'tesla_model_3' }, YX.newCtx(YX.viewNow())); step(2); const all = byType('tesla_model_3'); out.push('another tesla added without a place: ' + all.map((o) => o.motion).join(','));
return out.join('\n');
