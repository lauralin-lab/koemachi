// Checks every file in app/generators/ without a browser: each has the standard header, registers the generator its file name says, has the fields the engine and the
// voice grammar need, and its build(b, p, rand) runs (with a recording builder, in spring and in winter) and draws something.   node tests/check_generators.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const home = path.join(__dirname, '..', 'app', 'generators'), dir = process.env.GEN_DIR || home; // GEN_DIR: check some other folder (for instance files written by "Save as generator")
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort(), bad = [], rows = [];
const YX = { GEN: {}, mixHex: (a) => a }, ctx = vm.createContext({ window: { YX }, console, Math, JSON });
const rng = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const recorder = () => { const n = { parts: 0, groups: 0 }; const b = new Proxy({}, { get: (_, k) => (k === 'group' ? (o, fn) => { n.groups++; fn(); } : k === 'anchor' ? () => {} : (...a) => { n.parts++; } ) }); return { b, n }; };
if (dir !== home) for (const f of fs.readdirSync(home).filter((f) => f.startsWith('_'))) vm.runInContext(fs.readFileSync(path.join(home, f), 'utf8'), ctx, { filename: f }); // the helpers the generators may use
for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8'), name = f.replace(/\.js$/, ''), shared = f.startsWith('_'), m = text.match(/^\/\* Koemachi · (generator: (\w+)|shared)/);
  const fail = (msg) => { bad.push(f + ': ' + msg); };
  if (!m) { fail('the first line must start "/* Koemachi · generator: <name>" (or "· shared" for a helper file)'); continue; }
  if (shared) { if (m[1] !== 'shared') fail('a file that starts with _ is a helper: its header says "· shared"'); try { vm.runInContext(text, ctx, { filename: f }); } catch (e) { fail('does not load: ' + e.message); } continue; }
  if (m[2] !== name) fail('the header names "' + m[2] + '" but the file is ' + f);
  if (!/\n'use strict';/.test(text)) fail("missing 'use strict'");
  const before = new Set(Object.keys(YX.GEN)); try { vm.runInContext(text, ctx, { filename: f }); } catch (e) { fail('does not load: ' + e.message); continue; }
  const added = Object.keys(YX.GEN).filter((k) => !before.has(k)); if (added.length !== 1 || added[0] !== name) { fail('registers ' + JSON.stringify(added) + ', expected exactly ' + name); continue; }
  const g = YX.GEN[name];
  for (const k of ['label', 'en', 'cls']) if (typeof g[k] !== 'string' || !g[k]) fail('missing ' + k);
  if (!Array.isArray(g.nouns) || g.nouns.length < 2) fail('nouns: at least two words the voice grammar can hear (three is better: English, 中文, 日本語)');
  if (!g.params || typeof g.params !== 'object') fail('params must be an object'); if (typeof g.build !== 'function') { fail('build must be a function'); continue; } if (g.build.length > 3) fail('build(b, p, rand) takes three arguments');
  for (const season of ['spring', 'winter']) {
    YX.koe.season = season; const p = {}; for (const k in g.params) p[k] = g.params[k].d; const { b, n } = recorder();
    try { g.build(b, p, rng(7)); } catch (e) { fail('build threw in ' + season + ': ' + e.message); break; } if (n.parts < 2) fail('build drew only ' + n.parts + ' parts in ' + season);
    if (season === 'spring') rows.push([name, n.parts, text.split('\n').length]);
  }
}
for (const r of rows) console.log(r[0].padEnd(20), String(r[1]).padStart(4), 'parts', String(r[2]).padStart(4), 'lines');
console.log('\n' + rows.length + ' generators, ' + files.filter((f) => f.startsWith('_')).length + ' helper files');
if (bad.length) { console.log('\nPROBLEMS:\n- ' + bad.join('\n- ')); process.exit(1); } console.log('all generators pass');
