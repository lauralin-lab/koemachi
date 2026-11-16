const look = async (c, tgt) => { const dx = tgt[0] - c[0], dy = tgt[1] - c[1], dz = tgt[2] - c[2]; YX.setPose({ x: c[0], y: c[1], z: c[2], yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) }); W.player.fly = c[1] > 2; step(0.1); await wait(120); step(0.1); return W.aim ? W.aim.type + '#' + W.aim.id : 'nothing'; };
const hill = YX.spawn({ type: 'hill', x: -150, z: 150, params: { size: 30, height: 20 }, seed: 3 }); step(0.2);
out.push('hill box half-width ' + ((hill.box.max.x - hill.box.min.x) / 2).toFixed(0) + ' m, 20 m tall');
// a bicycle near the foot of the hill, well inside the hill's box
const bx = hill.x + 25, bz = hill.z + 25, bike = YX.spawn({ type: 'bicycle', x: bx, z: bz, rot: 0, seed: 4 }); bike.motion = 'none'; step(1.5);
out.push('bike in the corner of the hill box, off its slope: y=' + bike.y.toFixed(2) + ' size ' + bike.size.map((v) => v.toFixed(1)).join('x'));
const from = [bx + 4, 1.3, bz + 3.4];
out.push('crosshair on the bike frame: ' + await look(from, [bx, 0.75, bz]));
out.push('in the gap inside the frame triangle / between the wheels (low, middle): ' + await look(from, [bx, 0.28, bz]) + ' , ' + await look(from, [bx, 0.5, bz + 0.25]) + ' , ' + await look(from, [bx, 0.5, bz - 0.3]));
out.push('on the hillside 6 m above the bike: ' + await look(from, [bx - 14, 6, bz - 14]) + ' (want the hill)');
out.push('at the sky: ' + await look(from, [bx, 40, bz + 30]));
out.push((await say('make it red')) + '  (crosshair in the gap)'); await look(from, [bx, 0.5, bz + 0.25]); out.push(await say('remove this'));
out.push('bike gone: ' + !!bike.dead + ' hill still there: ' + !hill.dead);
// a lamp post: the crosshair just beside the thin pole
const lp = byType('lamp')[0]; out.push('5 cm beside a lamp post (pole is ~8 cm): ' + await look([lp.x + 6, 1.6, lp.z + 0.5], [lp.x, 1.6, lp.z + 0.11]) + ' ; 1.2 m beside it: ' + await look([lp.x + 6, 1.6, lp.z + 0.5], [lp.x, 1.6, lp.z + 1.3]));
// timing of the aim pass
const t0 = performance.now(); for (let i = 0; i < 60; i++) { W.player.yaw += 0.01; step(0.034); } out.push('60 frames with the aim pass, software GL: ' + ((performance.now() - t0) / 60).toFixed(1) + ' ms each');
return out.join('\n');
