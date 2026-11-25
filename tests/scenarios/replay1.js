// Replay it: record a build with Tinker's part written on the picture, then one lap around the result; the clip appears.
const wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = [], W = YX.world, M = YX.mind, LF = YX.lookFix, R = YX.replay;
window.__lookVerdicts = [{ match: false, problems: ['blades were floating'], fix: 'attach the blades' }, { match: true, problems: [], fix: '' }];
window.__route = (u) => (/zorb/i.test(u) ? '{"op":"invent","type":"zorbr","label":"Zorb R","brief":"a test object","size":[3,3,3],"motion":"none","place":{"front":16}}' : '');
const until = async (f, n) => { for (let t = 0; t < (n || 200) && !f(); t++) await wait(100); return f(); };
R.lapS = 0.5; // the test browser draws a few frames a second, so a lap of 8 s of film time would take minutes
await R.start(); out.push('recording: ' + !!R.rec + ', button "' + document.getElementById('swReplayBtn').textContent + '"');
await wait(1500); const s0 = R.sample(); out.push('first seconds: picture lit pixels ' + s0.lit + ', average brightness ' + s0.avg);
{ const sp = document.getElementById('spellText'), mic = document.getElementById('mic'); mic.classList.add('on'); sp.textContent = 'make zorb'; sp.className = 'on partial'; await wait(300); out.push('while holding: ' + JSON.stringify(R.captions())); sp.textContent = 'make zorb R'; sp.className = 'on done'; mic.classList.remove('on'); await wait(300); out.push('after release: ' + JSON.stringify(R.captions())); sp.className = ''; await wait(300); out.push('caption faded on the page, still on the picture: ' + JSON.stringify(R.captions())); }
M.commit('make zorb R'); await until(() => (R.rec && R.rec.seen), 100);
const seen = new Set(); for (let t = 0; t < 400 && R.rec && !R.rec.final; t++) { for (const c of R.captions()) seen.add(c.replace(/\d+(\.\d)?s/g, 'Ns')); await wait(150); }
out.push('captions drawn on the picture:\n  ' + Array.from(seen).slice(0, 9).join('\n  '));
const q0 = Date.now(); await until(() => R.rec && R.rec.quiet > 6, 300); out.push('quiet for ' + (R.rec ? R.rec.quiet.toFixed(0) : '?') + ' s after the work, still recording (no auto stop): ' + !!(R.rec && !R.rec.final)); R.finish();
out.push('last lap started after I stopped it: ' + (R.rec ? R.rec.final : 'already finished'));
await until(() => !R.rec && R.last, 300);
out.push('clip: ' + (R.last ? Math.round(R.last.size / 1024) + ' KB, ' + R.last.secs.toFixed(1) + ' s, ' + R.last.type + ', with voice: ' + R.last.audio : 'NONE'));
out.push('button after: "' + document.getElementById('swReplayBtn').textContent + '", cinema mode off: ' + !document.body.classList.contains('cinema') + ', zorbr built: ' + Array.from(W.objs.values()).filter((o) => o.type === 'zorbr').length);
return out.join('\n');
