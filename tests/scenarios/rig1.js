// three cameras on one moment
YX.lang = 'en'; document.querySelector('#go').click(); await wait(200); YX.cineStop();
const P = W.player; P.fly = true; const R0r = YX.three.renderer.render.bind(YX.three.renderer);
const look = (x, y, z, tx, ty, tz) => { P.x = x; P.y = y; P.z = z; const dx = tx - x, dy = ty - y, dz = tz - z; P.yaw = Math.atan2(-dx, -dz); P.pitch = Math.atan2(dy, Math.hypot(dx, dz)); P.vx = 0; P.vz = 0; step(0.2); step(0.2); };
const bus = byType('bus')[0]; let vant = null;
for (let k = 0; k < 24 && !vant; k++) for (const r of [14, 18, 24]) { const a = k * Math.PI / 12, x = bus.x + Math.sin(a) * r, z = bus.z + Math.cos(a) * r; look(x, 4, z, bus.x, 1.5, bus.z); if (YX.seen(bus) && W.aim === bus) { vant = [x, z]; break; } }
out.push('vantage ' + (vant ? vant.map((v) => v.toFixed(1)).join(',') : 'NONE') + ' aim=' + (W.aim ? W.aim.type + '#' + W.aim.id : '-'));
out.push('canvas at start ' + YX.three.renderer.domElement.width + 'x' + YX.three.renderer.domElement.height);
out.push(await say('film the bus with three cameras', undefined, 300));
const rg = YX.rig; out.push('rig on=' + rg.on + ' target=' + rg.target + ' (bus #' + bus.id + ') cams: ' + rg.cams.map((c) => c.A.key + '@' + c.cam.position.x.toFixed(1) + ',' + c.cam.position.y.toFixed(1) + ',' + c.cam.position.z.toFixed(1) + ' d' + Math.hypot(c.cam.position.x - bus.x, c.cam.position.z - bus.z).toFixed(1)).join(' | '));
// each camera sees the bus: project the bus centre into each camera
const seesBus = () => rg.cams.map((c) => { const v = new THREE.Vector3(bus.x, bus.y + 1.5, bus.z).project(c.cam); return c.A.key + (Math.abs(v.x) < 0.8 && Math.abs(v.y) < 0.8 && v.z < 1 ? ' sees it' : ' MISSES ' + v.x.toFixed(2) + ',' + v.y.toFixed(2)); }).join(', ');
out.push('framing now: ' + seesBus()); step(3); out.push('3 s later (bus has driven on): ' + seesBus());
out.push('hud on=' + document.getElementById('rigHud').classList.contains('on') + ' labels: ' + Array.from(document.querySelectorAll('#rigHud .lab')).map((l) => l.textContent).join(' / '));
// monitors are drawn after the frame: count renders in one frame
let n = 0; YX.three.renderer.render = function (...a) { n++; return R0r(...a); }; YX.frame(performance.now() + 99999); YX.three.renderer.render = R0r; out.push('renders in one frame with the rig standing: ' + n);
out.push(await say('action', undefined, 300));
const c = YX.three.renderer.domElement; out.push('rolling: rec=' + !!rg.rec + ' canvas ' + c.width + 'x' + c.height + ' cinema=' + document.body.classList.contains('cinema'));
n = 0; YX.three.renderer.render = function (...a) { n++; return R0r(...a); }; YX.frame(performance.now() + 199999); YX.three.renderer.render = R0r; out.push('renders in one frame while rolling: ' + n);
out.push(await say('cut', undefined, 600)); out.push('after cut: rec=' + !!rg.rec + ' canvas ' + c.width + 'x' + c.height + ' client ' + c.clientWidth + 'x' + c.clientHeight + ' director=' + (document.getElementById('director') || {}).className);
out.push(await say('take down the cameras', undefined, 200)); out.push('after take down: on=' + rg.on + ' markers in scene=' + YX.three.scene.children.filter((m) => m.layers && m.layers.mask === 32).length);
out.push('unseen: ' + await say('film the fire truck with three cameras', undefined, 200) + ' on=' + rg.on);
YX.lang = 'zh'; out.push(await say('用三个机位拍这个', undefined, 200)); out.push('zh: on=' + rg.on); out.push(await say('撤掉机位', undefined, 200));
return out.join('\n');
