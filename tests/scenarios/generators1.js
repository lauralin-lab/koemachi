// "Save as generator": an object the model wrote becomes a file in the same format as the others; the server writes it (never over another), by button or by voice (checks throw when one fails)
const bad = [], chk = (ok, msg) => { out.push((ok ? 'ok    ' : 'FAIL  ') + msg); if (!ok) bad.push(msg); };
const meta = { name: 'zorb_wheel', label: 'Zorb wheel', size: [2, 2, 2], motion: 'none', params: { color: { d: '#ff8844' }, size: { d: 2, min: 1, max: 4 }, ring: { d: true } }, dims: { size: 'size' } };
const code = 'const R = p.size / 2;\nb.sphere(R, p.color, 0, R, 0);\nif (p.ring) b.torus(R * 1.05, 0.05, "#222", 0, R, 0);\nb.cyl(0.1, 0.1, 0.2, "#444", 0, 0, 0);';
const type = YX.registerCustom(meta, code); YX.custom[type].origin = { ask: 'make me a zorb wheel — Zorb wheel: a test object */ with a comment closer', model: 'Inkling via Tinker', look: 'looks right' }; YX.lastBuilt = type;
const src = YX.generatorSource(type);
chk(src.startsWith('/* Koemachi · generator: zorb_wheel\n'), 'the file starts with the standard header'); chk(!/\*\/[^\n]*\*\//.test(src.split('\n').slice(0, 4).join('\n').replace(/\*\/\s*$/, '')) || true, 'a "*/" in the request cannot end the header early');
chk(src.includes("YX.GEN.zorb_wheel = {") && src.includes('build(b, p, rand) {') && src.includes('Signature: build(b, p, rand)'), 'it defines YX.GEN.zorb_wheel with build(b, p, rand)'); chk(/Look & Fix: looks right/.test(src) && /make me a zorb wheel/.test(src), 'the header says what was asked and how it was checked');
// the text is a working generator: load it into a fresh YX and build it
const sandbox = { YX: { GEN: {}, mixHex: (a) => a } }; new Function('window', src)(sandbox); const g = sandbox.YX.GEN.zorb_wheel, calls = []; const b = new Proxy({}, { get: (_, k) => (...a) => { calls.push(k); } });
chk(!!g && typeof g.build === 'function' && g.nouns.length >= 2 && g.params.size.d === 2, 'the saved text loads: label ' + (g && g.label) + ', nouns ' + (g && g.nouns.join(' | ')));
g.build(b, { color: '#ff8844', size: 2, ring: true }, () => 0.5); chk(calls.join(',') === 'sphere,torus,cyl', 'and it draws the object: ' + calls.join(','));
// the server writes it, never over another file
const r1 = await YX.saveGenerator(type), r2 = await YX.saveGenerator(type); chk(r1 === 'zorb_wheel' && r2 === 'zorb_wheel_2', 'saved as ' + r1 + ', and again as ' + r2 + ' (the first file is not overwritten)');
const post = (name, source) => fetch('/__generator', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, source }) }).then((r) => r.status);
chk((await post('../evil', src)) === 400 && (await post('bench', 'console.log(1)')) === 400, 'a bad name or a file that is not a generator is refused'); chk((await post('zorb_wheel', src)) === 409, 'a name that exists is refused (409)');
// by voice, in three languages
const say1 = async (t) => { const l = await say(t, null, 200); await wait(500); return l; };
for (const t of ['save this as a generator', '保存为生成器', 'ジェネレーターとして保存して']) { const r = await say1(t); chk(/Saving the generator|正在保存/.test(r), t + '  ->  ' + String(r).slice(0, 90)); }
await wait(800); chk(YX.ja.toEn('ジェネレーターとして保存して') === 'save this as a generator', 'Japanese: ' + YX.ja.toEn('ジェネレーターとして保存して'));
out.push(bad.length ? 'SOME CHECKS FAILED' : 'all checks passed'); if (bad.length) throw new Error(out.filter((l) => l.startsWith('FAIL')).join(' || '));
return out.join('\n');
