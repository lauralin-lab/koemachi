// Scenario tests: each file in tests/scenarios/ is the body of an async function that runs inside the page and returns text.
//
//   cd tests && npm install && npx playwright install chromium
//   node run.js                 every scenario
//   node run.js aim2 route1     the ones named
//   node run.js aim2 --shot out.png
//
// The page is app/ served from this machine, with tests/mock.js standing in for the model, the microphone and saving, so no key is needed
// and nothing is billed. Scenarios listed in SIM below get tests/sim.js in front of them: a simulated clock (step(seconds)) and helpers
// (say(text), byType(type), W = the world, M = the mind, out = lines to return).
//
// Environment: CHROME=/path/to/chrome to use an installed browser; VW, VH for the viewport; ROOT to serve another copy of the app.
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');

const here = __dirname, root = path.resolve(process.env.ROOT || path.join(here, '..', 'app'));
const SIM = new Set('t1 d4 r1 w1 dr1 m1 wd1 aim1 people1 rig1 grav1 guide1 aim2 rev1 out1 rig2 lights1 route1 aim3 rig3 pend1 door1'.split(' '));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.mp4': 'video/mp4' };
const three = [path.join(here, 'node_modules/three/build/three.min.js')].find((f) => fs.existsSync(f)); // served in place of the CDN copy when installed, so the tests run offline

function serve() {
  return new Promise((res) => {
    const s = http.createServer((q, r) => {
      const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(root, u === '/' ? '/index.html' : u);
      if (!f.startsWith(root)) { r.writeHead(403); r.end(); return; }
      fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end('not found'); return; } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' }); r.end(d); });
    });
    s.listen(0, '127.0.0.1', () => res(s));
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
  await p.addInitScript("try{localStorage.setItem('yanchu.prefs.v2', JSON.stringify({ui:'" + (process.env.LANG_UI || 'en') + "'}))}catch(e){}");
  await p.goto('http://127.0.0.1:' + port + '/', { timeout: 180000 }); await p.waitForTimeout(3000);
  await p.evaluate('window.YX&&YX.ui&&YX.ui.skipTitle&&YX.ui.skipTitle()');
  let res; try { res = await p.evaluate('(async()=>{' + body + '\n})()'); } catch (e) { res = 'EVAL ERROR: ' + String(e.message).slice(0, 1500); }
  if (shot) await p.screenshot({ path: shot });
  await ctx.close();
  return (typeof res === 'string' ? res.replace(/\n@@data:image[\s\S]*$/, '') : JSON.stringify(res, null, 1)) + (logs.length ? '\n--- console ---\n' + logs.slice(0, 12).join('\n') : '');
}

(async () => {
  const args = process.argv.slice(2), si = args.indexOf('--shot'), shot = si >= 0 ? args[si + 1] : null; if (si >= 0) args.splice(si, 2);
  const names = args.length ? args : fs.readdirSync(path.join(here, 'scenarios')).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3)).sort();
  const srv = await serve(), port = srv.address().port;
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
  let bad = 0;
  for (const n of names) { const t0 = Date.now(), out = await runOne(browser, port, n, shot); const fail = /EVAL ERROR|NO SUCH SCENARIO|pageerror:/.test(out); if (fail) bad++; console.log('=== ' + n + '  (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)' + (fail ? '  FAILED' : '') + '\n' + out + '\n'); }
  await browser.close(); srv.close();
  console.log(bad ? bad + ' of ' + names.length + ' scenarios failed to run' : names.length + ' scenarios ran. They print what happened; read the output against what each scenario says it wants.');
  process.exit(bad ? 1 : 0);
})();
