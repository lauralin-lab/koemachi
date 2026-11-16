document.getElementById('go').click(); await wait(500);
const st0 = YX.guide.state(); YX.guide.show(); await wait(600);
const s1 = YX.guide.state(); const P = W.player; YX.setPose({ x: P.x + 12, y: P.y, z: P.z, yaw: P.yaw, pitch: P.pitch }); await wait(900);
const s2 = YX.guide.state(); const h = byType('house')[0]; out.push(await say('make this house taller', h)); await wait(900);
const s3 = YX.guide.state(); const txt = document.getElementById('guide').innerText.replace(/\n+/g, ' | ');
return JSON.stringify({ auto: st0.shown, s1: s1.done, s2: s2.done, s3: s3.done, txt, out });
