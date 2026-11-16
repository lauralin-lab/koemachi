const D = YX.director, bird = byType('bird')[0], sq = byType('fountain')[0] || byType('house')[0];
const eight = (cx, cz, r, y) => { const k = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.2832; k.push([+(cx + Math.sin(a) * r).toFixed(1), y + (i % 2 ? 2 : 0), +(cz + Math.sin(a) * Math.cos(a) * r).toFixed(1)]); } return k; };
let canned = null, asked = []; const S0 = M.sample; M.sample = async (p, o) => { asked.push(p); return { text: JSON.stringify(canned) }; };
const track = (o, secs) => { let minY = 1e9, maxY = -1e9, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, hit = 0; step(secs, () => { minY = Math.min(minY, o.y); maxY = Math.max(maxY, o.y); x0 = Math.min(x0, o.x); x1 = Math.max(x1, o.x); z0 = Math.min(z0, o.z); z1 = Math.max(z1, o.z); for (const b of W.objs.values()) { const bd = YX.defOf(b); if (b === o || !bd || bd.cls !== 'building' || !b.box) continue; const dx = o.x - b.x, dz = o.z - b.z, c = Math.cos(b.rot), s = Math.sin(b.rot), lx = dx * c - dz * s, lz = dx * s + dz * c; if (Math.abs(lx) < b.foot[0] / 2 && Math.abs(lz) < b.foot[1] / 2 && o.y < b.y + b.size[1]) hit++; } }); return 'x ' + x0.toFixed(0) + '..' + x1.toFixed(0) + ' z ' + z0.toFixed(0) + '..' + z1.toFixed(0) + ' y ' + minY.toFixed(1) + '..' + maxY.toFixed(1) + ' frames inside a building: ' + hit + ' motion ' + o.motion; };
canned = { name: 'Figure of eight', loop: true, speed: 7, keys: eight(sq.x, sq.z, 26, 9) };
W.aim = bird; let r = D.route({ obj: bird, text: 'fly a figure of eight over the square' }); out.push(r.msg); await wait(60); step(0.2);
out.push('brief has the bird, the obstacles and the request: ' + [/The thing that moves\n#\d+ bird/.test(asked[0]), /What stands nearby/.test(asked[0]), /figure of eight over the square/.test(asked[0])].join(',') + ' (' + asked[0].length + ' chars)');
out.push('route: ' + (bird.route ? bird.route.pts.length + ' pts loop ' + bird.route.loop + ' speed ' + bird.route.speed : 'none') + ' | ' + track(bird, 30));
M.history.push({ text: 'fly a figure of eight over the square', aim: '', ops: ['{"op":"route","id":"#' + bird.id + '","design":"x"}'], msgs: [], ids: [] });
out.push(await say('bigger')); out.push('   ' + track(bird, 30));
out.push(await say('higher')); out.push('   ' + track(bird, 20));
out.push(await say('the other way')); out.push(await say('路线慢一点')); out.push('   speed ' + bird.route.speed);
const sv = YX.serialize().objs.find((x) => x.id === bird.id); out.push('saved: motion ' + sv.motion + ' route pts ' + (sv.route ? sv.route.pts.length : 0));
out.push(await say('undo')); out.push('   after undo speed ' + (bird.route || W.objs.get(bird.id).route || {}).speed);
out.push(await say('stop the path')); out.push('   motion ' + W.objs.get(bird.id).motion + ' route ' + !!W.objs.get(bird.id).route);
// someone on foot: a path that the canned answer draws straight through a house
const p = byType('person').find((o) => !o.attach) , h = byType('house')[0];
canned = { name: 'Round the house', loop: false, keys: [[p.x, 0, p.z], [h.x, 0, h.z], [h.x + (h.x - p.x), 0, h.z + (h.z - p.z)]] };
r = D.route({ obj: p, text: 'walk straight across to the other side' }); await wait(60); step(0.2);
out.push('person: ' + (p.route ? p.route.pts.length + ' pts' : 'none') + ' pose ' + p.params.pose + ' | ' + track(p, 40) + ' pose after ' + p.params.pose);
// a house cannot be sent along a path while physics is realistic
r = D.route({ obj: h, text: 'drive around the block' }); out.push('house: ' + r.msg);
// a path that ends on a roof: it lands there
{ const b2 = byType('bird')[0], hh = byType('house')[1], top = hh.y + hh.box.max.y * hh.s[1]; canned = { name: 'To the roof', loop: false, speed: 9, keys: [[b2.x, b2.y, b2.z], [(b2.x + hh.x) / 2, top + 6, (b2.z + hh.z) / 2], [hh.x, top + 0.5, hh.z]] };
  D.route({ obj: b2, text: 'land on that roof' }); await wait(60); step(40); out.push('bird after a path ending on a roof: motion ' + b2.motion + ' attached to ' + (b2.attach ? '#' + b2.attach.to + ' (' + b2.attach.anchor + ')' : 'nothing') + ' house #' + hh.id + ' pose ' + b2.params.pose + ' y ' + b2.y.toFixed(1) + ' roof top ' + top.toFixed(1)); }
M.sample = S0; return out.join('\n');
