const look = async (c, tgt) => { const dx = tgt[0] - c[0], dy = tgt[1] - c[1], dz = tgt[2] - c[2]; YX.setPose({ x: c[0], y: c[1], z: c[2], yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) }); W.player.fly = c[1] > 2; step(0.05); await wait(120); step(0.05); return W.aim ? W.aim.type + '#' + W.aim.id : 'nothing'; };
const rp = (r) => (r && (r.reply || r.msg || JSON.stringify(r).slice(0, 160)));
(await say('set the time to 22:00'));
const h = byType('shop')[0] || byType('house')[0], fr = [Math.sin(h.rot), Math.cos(h.rot)], d = h.foot[1] / 2;
const cam = [h.x + fr[0] * (d + 9), 2.2, h.z + fr[1] * (d + 9)];
out.push('aim: ' + await look(cam, [h.x, 2.2, h.z]) + ' glows ' + h.glows + ' lights ' + h.lights);
const gm = () => { let lit = 0, n = 0; h.mesh.traverse((c) => { if (c.isSprite) lit++; if (c.isMesh) { n++; const m = c.material; if (m && m.emissive && m.emissiveIntensity > 0.05 && (m.emissive.r + m.emissive.g + m.emissive.b) > 0.01) lit++; } }); return lit + '/' + n; };
out.push('lit meshes before: ' + gm());
out.push(rp(await say('turn off the lights in this building')) + ' -> lights ' + h.lights + ', lit ' + gm());
const sv = YX.serialize(); const d1 = sv.objs.find((x) => x.id === h.id); out.push('saved lights: ' + d1.lights);
out.push(rp(await say('把这栋楼的灯打开')) + ' -> ' + h.lights + ', lit ' + gm());
out.push(rp(await say('关灯')) + ' -> ' + h.lights);
out.push(rp(await say('undo')) + ' -> ' + h.lights + ' ' + (W.objs.get(h.id) || {}).lights);
out.push(rp(await say('lights off')) + ' -> ' + (W.objs.get(h.id) || {}).lights);
out.push(rp(await say('turn the lights on')) + ' -> ' + (W.objs.get(h.id) || {}).lights);
const t = byType('tree')[0]; if (t) { out.push('tree aim: ' + await look([t.x + 5, 2, t.z + 5], [t.x, 2, t.z])); out.push(rp(await say('turn off the lights of this tree'))); }
const lp = byType('lamp')[0] || byType('streetlamp')[0]; if (lp) { out.push('lamp aim: ' + await look([lp.x + 4, 2.5, lp.z + 4], [lp.x, 3, lp.z]) + ' glows ' + lp.glows); out.push(rp(await say('switch this lamp off')) + ' -> ' + lp.lights); }
return out.join('\n');
