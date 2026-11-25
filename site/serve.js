// Koemachi on your own computer.
//   node site/build.mjs && node site/serve.js      then open http://localhost:8080
// The model is Thinking Machines' Inkling via Tinker's Anthropic-compatible Messages API. Put TINKER_BASE_URL, TINKER_API_KEY and (optionally)
// TINKER_MODEL in a file named .env next to this script or in the repository root, in the environment, or in the file SW_ENV_FILE points to.
// The page sends its model calls to POST /__tinker/messages on this server, which adds the key and forwards them, so the key never reaches the browser.
const http = require('http'), fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = fs.existsSync(path.join(__dirname, 'index.html')) ? __dirname : path.join(__dirname, 'dist'), PORT = +process.env.PORT || 8080;
const ENVS = [process.env.SW_ENV_FILE, path.join(__dirname, '.env'), path.join(__dirname, '..', '.env')].filter(Boolean);
function envVal(name) { // process environment first, then the .env files
  if (process.env[name]) return process.env[name].trim();
  for (const f of ENVS) { let txt; try { txt = fs.readFileSync(f, 'utf8'); } catch (e) { continue; } for (const line of txt.split('\n')) { const m = line.match(new RegExp('^\\s*(?:export\\s+)?' + name + '\\s*=\\s*(.*)$')); if (m) { const v = m[1].trim().replace(/^['"]|['"]$/g, ''); if (v) return v; } } }
  return '';
}
function tinkerCfg() {
  const base = envVal('TINKER_BASE_URL').replace(/\/+$/, ''), key = envVal('TINKER_API_KEY'), model = envVal('TINKER_MODEL') || 'inkling-2-small';
  return { key, model, url: base && (/\/v1\/messages$/.test(base) ? base : /\/v1$/.test(base) ? base + '/messages' : base + '/v1/messages') };
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mp4': 'video/mp4', '.webm': 'video/webm', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };
const HOSTS = new Set(['localhost:' + PORT, '127.0.0.1:' + PORT, '[::1]:' + PORT]);
const sameOrigin = (q) => { const site = q.headers['sec-fetch-site'], host = String(q.headers.host || '').toLowerCase(), o = q.headers.origin; return HOSTS.has(host) && (!site || site === 'same-origin') && (!o || o === 'http://' + host); }; // a page of this server, not another site or another name pointed at this machine
const json = (r, code, obj) => { r.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }); r.end(JSON.stringify(obj)); };
const DATA = process.env.SW_DATA_DIR || path.join(__dirname, '..', 'data');
async function keepShot(q, r) { // Look & Fix pictures and notes: written to data/lookfix/, under a plain file name
  if (!sameOrigin(q)) return json(r, 403, { error: { message: 'forbidden' } });
  let raw = ''; for await (const ch of q) { raw += ch; if (raw.length > 4e6) return json(r, 413, { error: { message: 'too large' } }); }
  let b; try { b = JSON.parse(raw); } catch (e) { return json(r, 400, { error: { message: 'bad json' } }); }
  if (!b || !/^[\w.-]{1,90}\.(jpg|json)$/.test(b.file || '')) return json(r, 400, { error: { message: 'bad file name' } });
  const dir = path.join(DATA, 'lookfix'); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, b.file), b.text != null ? String(b.text) : Buffer.from(String(b.data || ''), 'base64'));
  json(r, 200, { ok: true });
}
const GEN_DIR = process.env.SW_GENERATORS_DIR || path.join(__dirname, '..', 'app', 'generators');
async function keepGenerator(q, r) { // "Save as generator": one new file in app/generators/, never overwriting one that exists
  if (!sameOrigin(q)) return json(r, 403, { error: { message: 'forbidden' } });
  let raw = ''; for await (const ch of q) { raw += ch; if (raw.length > 200000) return json(r, 413, { error: { message: 'too large' } }); }
  let b; try { b = JSON.parse(raw); } catch (e) { return json(r, 400, { error: { message: 'bad json' } }); }
  if (!b || !/^[a-z][a-z0-9_]{1,30}$/.test(b.name || '') || typeof b.source !== 'string') return json(r, 400, { error: { message: 'bad name' } });
  if (!b.source.startsWith('/* Koemachi · generator: ' + b.name + '\n') || !b.source.includes('YX.GEN.' + b.name + ' = {') || /<\/script|require\(|import\(|process\.|child_process/.test(b.source)) return json(r, 400, { error: { message: 'not a generator file' } });
  const file = path.join(GEN_DIR, b.name + '.js'); if (fs.existsSync(file)) return json(r, 409, { error: { message: 'exists' } });
  fs.mkdirSync(GEN_DIR, { recursive: true }); fs.writeFileSync(file, b.source, { flag: 'wx' }); json(r, 200, { ok: true, file: 'app/generators/' + b.name + '.js' });
}
const SESSIONS = () => path.join(DATA, 'sessions.jsonl');
const sessionCount = () => { try { return fs.readFileSync(SESSIONS(), 'utf8').split('\n').filter(Boolean).length; } catch (e) { return 0; } };
function rejectSession(id, r) { // the example with this id leaves sessions.jsonl and is kept, marked, in sessions.rejected.jsonl, so nothing is lost and nothing is trained on
  if (!/^[\w-]{1,40}$/.test(id)) return json(r, 400, { error: { message: 'bad id' } });
  let lines = []; try { lines = fs.readFileSync(SESSIONS(), 'utf8').split('\n').filter(Boolean); } catch (e) {}
  const keep = [], out = []; for (const l of lines) { let j = null; try { j = JSON.parse(l); } catch (e) {} (j && j.id === id ? out : keep).push(l); }
  if (out.length) { fs.appendFileSync(path.join(DATA, 'sessions.rejected.jsonl'), out.join('\n') + '\n'); const tmp = SESSIONS() + '.tmp'; fs.writeFileSync(tmp, keep.length ? keep.join('\n') + '\n' : ''); fs.renameSync(tmp, SESSIONS()); }
  json(r, 200, { ok: true, removed: out.length, count: keep.length });
}
async function keepSession(q, r) { // one kept model result, a chat example, appended as a line
  if (!sameOrigin(q)) return json(r, 403, { error: { message: 'forbidden' } });
  if (q.method === 'GET') return json(r, 200, { count: sessionCount() });
  let raw = ''; for await (const ch of q) { raw += ch; if (raw.length > 2e6) return json(r, 413, { error: { message: 'too large' } }); }
  let b; try { b = JSON.parse(raw); } catch (e) { return json(r, 400, { error: { message: 'bad json' } }); }
  if (b && typeof b.reject === 'string') return rejectSession(b.reject, r); // an undone result: out of the examples
  if (!b || !Array.isArray(b.messages) || b.messages.length !== 3 || !b.messages.every((m) => m && typeof m.content === 'string')) return json(r, 400, { error: { message: 'not a chat example' } });
  fs.mkdirSync(DATA, { recursive: true }); fs.appendFileSync(SESSIONS(), JSON.stringify(Object.assign({ messages: b.messages }, /^[\w-]{1,40}$/.test(b.id || '') ? { id: b.id } : {})) + '\n');
  json(r, 200, { ok: true, count: sessionCount() });
}
/* ---------- Train my world: a LoRA on the edits you kept (train/train.py), and switching the town to it ----------
   data/models.json lists the saved checkpoints (each a tinker:// sampler path, which the Messages API takes as `model`); data/active.json names the one in use.
   The proxy above swaps it in for TINKER_MODEL, so the page and the key never change. */
const MIN_TRAIN = +process.env.SW_MIN_TRAIN || 30;
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const modelList = () => { const l = readJson(path.join(DATA, 'models.json'), []); return Array.isArray(l) ? l : []; };
function activeModel(base) { const id = readJson(path.join(DATA, 'active.json'), {}).id, e = id && modelList().find((m) => m.id === id); return e ? { model: e.path, entry: e } : { model: base, entry: null }; }
let trainer = null; // the running training process, if any
function trainStatus() {
  const st = readJson(path.join(DATA, 'train', 'status.json'), null);
  if (st && st.state === 'running' && !trainer) return Object.assign({}, st, { state: 'error', message: 'training stopped without finishing (the server restarted?)' });
  return st;
}
async function trainRoute(q, r) {
  if (!sameOrigin(q)) return json(r, 403, { error: { message: 'forbidden' } });
  const c = tinkerCfg(), count = sessionCount(), am = activeModel(c.model);
  if (q.method === 'GET') return json(r, 200, { count, min: MIN_TRAIN, training: !!trainer, status: trainStatus(), models: modelList(), active: am.entry ? am.entry.id : null, base: c.model });
  let raw = ''; for await (const ch of q) { raw += ch; if (raw.length > 1e4) return json(r, 413, { error: { message: 'too large' } }); }
  if (trainer) return json(r, 409, { error: { message: 'already training' } });
  if (!c.key) return json(r, 500, { error: { type: 'not_configured', message: 'Set TINKER_API_KEY in .env, then restart the server.' } });
  if (count < MIN_TRAIN) return json(r, 400, { error: { message: 'need ' + MIN_TRAIN + ' kept edits, have ' + count } });
  fs.mkdirSync(path.join(DATA, 'train'), { recursive: true });
  const log = fs.openSync(path.join(DATA, 'train', 'train.log'), 'a');
  const bin = process.env.SW_UV || 'uv';
  const child = cp.spawn(bin, ['run', '--project', path.join(__dirname, '..', 'train'), 'python', path.join(__dirname, '..', 'train', 'train.py'), '--data', DATA], { env: Object.assign({}, process.env, { TINKER_API_KEY: c.key }), stdio: ['ignore', log, log] });
  trainer = child; const done = () => { trainer = null; try { fs.closeSync(log); } catch (e) {} };
  child.on('error', (e) => { done(); fs.writeFileSync(path.join(DATA, 'train', 'status.json'), JSON.stringify({ state: 'error', message: 'could not start training: ' + e.message + ' (is uv installed?)' })); });
  child.on('exit', done);
  fs.writeFileSync(path.join(DATA, 'train', 'status.json'), JSON.stringify({ state: 'running', step: 0, total: 0, message: 'starting', started: Date.now() / 1000 }));
  json(r, 202, { ok: true });
}
async function modelRoute(q, r) { // switch the town to a saved model, or (id null) back to the base model
  if (!sameOrigin(q)) return json(r, 403, { error: { message: 'forbidden' } });
  let raw = ''; for await (const ch of q) { raw += ch; if (raw.length > 1e4) return json(r, 413, { error: { message: 'too large' } }); }
  let b; try { b = JSON.parse(raw); } catch (e) { return json(r, 400, { error: { message: 'bad json' } }); }
  if (b.id != null && !modelList().some((m) => m.id === b.id)) return json(r, 404, { error: { message: 'no such model' } });
  fs.mkdirSync(DATA, { recursive: true }); fs.writeFileSync(path.join(DATA, 'active.json'), JSON.stringify({ id: b.id == null ? null : b.id }));
  json(r, 200, { ok: true, active: b.id == null ? null : b.id });
}
async function tinkerProxy(q, r) { // the page's Messages request, with the key and the model filled in here, answered as the stream Tinker sends it
  if (!sameOrigin(q)) return json(r, 403, { error: { message: 'forbidden' } });
  const c = tinkerCfg(); if (!c.url || !c.key) return json(r, 500, { error: { type: 'not_configured', message: 'Set TINKER_BASE_URL and TINKER_API_KEY in .env, then restart the server.' } });
  let raw = ''; for await (const ch of q) { raw += ch; if (raw.length > 4e6) return json(r, 413, { error: { message: 'request too large' } }); }
  let body; try { body = JSON.parse(raw); } catch (e) { return json(r, 400, { error: { message: 'bad json' } }); }
  const pick = body.koe_model; delete body.koe_model; // Watch it learn asks for one model by id ("base" or a saved checkpoint); otherwise the one in use
  if (pick != null) { const e = pick === 'base' ? null : modelList().find((m) => m.id === pick); if (pick !== 'base' && !e) return json(r, 404, { error: { message: 'no such model: ' + String(pick).slice(0, 60) } }); body.model = e ? e.path : c.model; } else body.model = activeModel(c.model).model;
  const ctl = new AbortController(); r.on('close', () => ctl.abort());
  try {
    const u = await fetch(c.url, { method: 'POST', headers: { 'content-type': 'application/json', 'anthropic-version': '2023-06-01', 'x-api-key': c.key, authorization: 'Bearer ' + c.key }, body: JSON.stringify(body), signal: ctl.signal });
    r.writeHead(u.status, { 'content-type': u.headers.get('content-type') || 'application/json', 'cache-control': 'no-store', 'x-accel-buffering': 'no' });
    for await (const ch of u.body) r.write(ch); r.end();
  } catch (e) { if (!r.headersSent) json(r, 502, { error: { message: 'Tinker cannot be reached: ' + ((e && e.cause && e.cause.code) || (e && e.message) || e) } }); else r.end(); }
}
http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p === '/__config') { if (!sameOrigin(q)) return json(r, 403, {}); const c = tinkerCfg(), am = activeModel(c.model); return json(r, 200, { model: c.model, active: am.entry ? { id: am.entry.id, label: am.entry.label } : null, ready: !!(c.url && c.key) }); } // never the key
  if (p === '/__tinker/messages' && q.method === 'POST') { tinkerProxy(q, r); return; }
  if (p === '/__session' && (q.method === 'POST' || q.method === 'GET')) { keepSession(q, r).catch(() => { if (!r.headersSent) json(r, 500, {}); }); return; }
  if (p === '/__train' && (q.method === 'POST' || q.method === 'GET')) { trainRoute(q, r).catch(() => { if (!r.headersSent) json(r, 500, {}); }); return; }
  if (p === '/__model' && q.method === 'POST') { modelRoute(q, r).catch(() => { if (!r.headersSent) json(r, 500, {}); }); return; }
  if (p === '/__generator' && q.method === 'POST') { keepGenerator(q, r).catch(() => { if (!r.headersSent) json(r, 500, {}); }); return; }
  if (p === '/__shot' && q.method === 'POST') { keepShot(q, r).catch(() => { if (!r.headersSent) json(r, 500, {}); }); return; }
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT + path.sep) || path.basename(f).startsWith('.') || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end('not found'); return; }
  const size = fs.statSync(f).size, type = TYPES[path.extname(f)] || 'application/octet-stream', m = /bytes=(\d+)-(\d*)/.exec(q.headers.range || '');
  if (m) { const a = +m[1], b = m[2] ? Math.min(+m[2], size - 1) : size - 1; r.writeHead(206, { 'content-type': type, 'content-range': `bytes ${a}-${b}/${size}`, 'accept-ranges': 'bytes', 'content-length': b - a + 1, 'cache-control': 'no-store' }); fs.createReadStream(f, { start: a, end: b }).pipe(r); return; }
  r.writeHead(200, { 'content-type': type, 'content-length': size, 'accept-ranges': 'bytes', 'cache-control': 'no-store' }); fs.createReadStream(f).pipe(r);
}).listen(PORT, '127.0.0.1', () => {
  const c = tinkerCfg();
  console.log('Koemachi is at http://localhost:' + PORT + '  (Ctrl+C to stop)');
  console.log('Model: Tinker, ' + c.model + (c.url && c.key ? '' : '  (NOT READY: set ' + [!c.url && 'TINKER_BASE_URL', !c.key && 'TINKER_API_KEY'].filter(Boolean).join(' and ') + ' in ' + path.join(__dirname, '..', '.env') + ')'));
});
