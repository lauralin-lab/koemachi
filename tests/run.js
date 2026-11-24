// Scenario tests: each file in tests/scenarios/ is the body of an async function that runs inside the page and returns text.
//
//   cd tests && npm install && npx playwright install chromium
//   node run.js                 every scenario
//   node run.js aim2 route1     the ones named
//   node run.js aim2 --shot out.png
//
// The page is the real build (node site/build.mjs) served by the real local server (site/serve.js), as `node site/serve.js` serves it: the Tinker host
// (site/tinker.js) is in the page. The page's calls to /__tinker/messages are answered here by a stand-in model (tests/mock.js), wrapped in a markdown
// fence as a chat model may do, and the browser's SpeechRecognition is a stand-in fed by the same fake microphone. So no key is needed, nothing is
// billed and nothing leaves this machine. Scenarios listed in SIM below get tests/sim.js in front of them: a simulated clock (step(seconds)) and helpers
// (say(text), byType(type), W = the world, M = the mind, out = lines to return).
//
// Environment: CHROME=/path/to/chrome to use an installed browser; VW, VH for the viewport.
'use strict';
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'sw-data-')); // what the page asks the server to keep (Look & Fix pictures) goes here, not into the repository
const { chromium } = require('playwright');

const here = __dirname;
const NATIVE = new Set('lookfix1 session1 koemachi1 ja1 seasons1 generators1'.split(' ')); // scenarios about this fork's own features: they run in Koemachi
const SIM = new Set('t1 d4 r1 w1 dr1 m1 wd1 aim1 people1 rig1 grav1 guide1 aim2 rev1 out1 rig2 lights1 route1 aim3 rig3 pend1 door1 koemachi1 ja1 seasons1 generators1'.split(' '));
const three = [path.join(here, 'node_modules/three/build/three.min.js')].find((f) => fs.existsSync(f)); // served in place of the CDN copy when installed, so the tests run offline

async function serveTinker() { // the real local server, in tinker mode, over a fresh build
  cp.execFileSync('node', [path.join(here, '..', 'site', 'build.mjs')], { stdio: 'ignore' });
  const port = await new Promise((res) => { const t = http.createServer().listen(0, '127.0.0.1', () => { const n = t.address().port; t.close(() => res(n)); }); });
  const child = cp.spawn('node', [path.join(here, '..', 'site', 'serve.js')], { env: Object.assign({}, process.env, { PORT: String(port), TINKER_BASE_URL: 'http://127.0.0.1:9', TINKER_API_KEY: 'test-not-used', SW_ENV_FILE: '/nonexistent', SW_DATA_DIR: DATA, SW_GENERATORS_DIR: path.join(DATA, 'generators') }), stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { await fetch('http://127.0.0.1:' + port + '/__config'); break; } catch (e) { await new Promise((r) => setTimeout(r, 100)); } }
  return { address: () => ({ port }), close: () => child.kill() };
}
const FAKE_SPEECH = `(() => { // SpeechRecognition on top of the fake microphone of mock.js (window.claude 'dictation')
  let cur = null, d = null; const res = (t, fin) => ({ resultIndex: 0, results: [Object.assign([{ transcript: t }], { isFinal: fin })] });
  window.SpeechRecognition = class { start() { cur = this; Promise.resolve(window.claude.use('dictation')).then(async (x) => { if (!d) { d = x; d.onPartial((e) => { if (e.text && cur && cur.onresult) cur.onresult(res(e.text, false)); }); d.onFinal((e) => { if (e.text && cur && cur.onresult) cur.onresult(res(e.text, true)); }); } await d.start(); if (this.onstart) this.onstart(); }); }
    stop() { const me = this; Promise.resolve(d && d.stop()).then(() => { if (me.onend) me.onend(); if (cur === me) cur = null; }); } abort() {} };
})();`;
async function tinkerRoutes(p) { // what Tinker would answer, as the Messages API streams it
  await p.addInitScript(FAKE_SPEECH);
  await p.route('**/__tinker/messages', async (route) => {
    try {
    const body = route.request().postDataJSON(), text = await p.evaluate(async (m) => { const s = await window.claude.use('sample'); return (await s(m, {})).text; }, body.messages);
    const ev = (t, d) => 'event: ' + t + '\ndata: ' + JSON.stringify(Object.assign({ type: t }, d)) + '\n\n', fenced = '```\n' + text + '\n```';
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: ev('message_start', { message: { model: 'stand-in', usage: { input_tokens: 10, output_tokens: 1 } } }) + ev('content_block_delta', { index: 0, delta: { type: 'text_delta', text: fenced } }) + ev('message_delta', { delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 5 } }) + ev('message_stop', {}) });
    } catch (e) { /* the page was closed while the stand-in model was still answering: nothing to do */ }
  });
}
async function runOne(browser, port, name, shot) {
  const file = path.join(here, 'scenarios', name + '.js'); if (!fs.existsSync(file)) return 'NO SUCH SCENARIO: ' + name;
  const body = (SIM.has(name) ? fs.readFileSync(path.join(here, 'sim.js'), 'utf8') + '\n' : '') + fs.readFileSync(file, 'utf8');
  const ctx = await browser.newContext({ viewport: { width: +(process.env.VW || 1360), height: +(process.env.VH || 800) } }), p = await ctx.newPage(), logs = [];
  p.on('console', (m) => { const t = m.text(); if (['error', 'warning'].includes(m.type()) && !/GPU stall|GL Driver/.test(t)) logs.push(m.type() + ': ' + t.slice(0, 400)); });
  p.on('pageerror', (e) => logs.push('pageerror: ' + String(e.stack || e).slice(0, 500)));
  if (three) await p.route('https://cdnjs.cloudflare.com/**', (r) => r.fulfill({ path: three, contentType: 'text/javascript' }));
  await p.addInitScript({ path: path.join(here, 'mock.js') });
  await tinkerRoutes(p);
  await p.addInitScript("try{localStorage.setItem('yanchu.prefs.v2', JSON.stringify({ui:'" + (process.env.LANG_UI || 'en') + "'}))}catch(e){}");
  await p.goto('http://127.0.0.1:' + port + '/', { timeout: 180000 }); await p.waitForTimeout(3000);
  await p.evaluate('window.YX&&YX.ui&&YX.ui.skipTitle&&YX.ui.skipTitle()');
  if (!NATIVE.has(name)) await p.evaluate(fs.readFileSync(path.join(here, 'fixtures', 'legacy_town.js'), 'utf8') + ';YX.legacyTown.setup();'); // the engine scenarios run in the original town; the Koemachi ones in Koemachi
  let res; try { res = await p.evaluate('(async()=>{' + body + '\n})()'); } catch (e) { res = 'EVAL ERROR: ' + String(e.message).slice(0, 1500); }
  if (shot) await p.screenshot({ path: shot });
  await ctx.close();
  return (typeof res === 'string' ? res.replace(/\n@@data:image[\s\S]*$/, '') : JSON.stringify(res, null, 1)) + (logs.length ? '\n--- console ---\n' + logs.slice(0, 12).join('\n') : '');
}

(async () => {
  const args = process.argv.slice(2), si = args.indexOf('--shot'), shot = si >= 0 ? args[si + 1] : null; if (si >= 0) args.splice(si, 2);
  const names = args.length ? args : fs.readdirSync(path.join(here, 'scenarios')).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3)).sort();
  const srv = await serveTinker(), port = srv.address().port;
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
  let bad = 0;
  for (const n of names) { const t0 = Date.now(), out = await runOne(browser, port, n, shot); const fail = /EVAL ERROR|NO SUCH SCENARIO|pageerror:/.test(out); if (fail) bad++; console.log('=== ' + n + '  (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)' + (fail ? '  FAILED' : '') + '\n' + out + '\n'); }
  try { console.log('generators saved by the server (' + path.join(DATA, 'generators') + '): ' + fs.readdirSync(path.join(DATA, 'generators')).join(', ')); } catch (e) {}
  try { const kept = fs.readdirSync(path.join(DATA, 'lookfix')); console.log('kept by the server (' + path.join(DATA, 'lookfix') + '): ' + kept.join(', ')); } catch (e) {}
  await browser.close(); srv.close();
  console.log(bad ? bad + ' of ' + names.length + ' scenarios failed to run' : names.length + ' scenarios ran. They print what happened; read the output against what each scenario says it wants.');
  process.exit(bad ? 1 : 0);
})();
