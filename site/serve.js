// Spoken World on your own computer.
//   node site/build.mjs && node site/serve.js      then open http://localhost:8080
// The Gemini API key can be typed into the page, or kept in a file so you never type it: put a line  GEMINI_API_KEY=...  in a file named .env
// next to this script (or in the repository root), or set the GEMINI_API_KEY environment variable, or point SW_ENV_FILE at a file of yours.
// The key is read when the page asks for it and given only to the page this server serves (same origin, localhost); it is never printed.
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const ROOT = fs.existsSync(path.join(__dirname, 'index.html')) ? __dirname : path.join(__dirname, 'dist'), PORT = +process.env.PORT || 8080;
const ENVS = [process.env.SW_ENV_FILE, path.join(__dirname, '.env'), path.join(__dirname, '..', '.env'), path.join(os.homedir(), '.env.gemini'), path.join(os.homedir(), 'Documents', '.env.gemini')].filter(Boolean);
function findKey() { // -> { key, from } or null
  if (process.env.GEMINI_API_KEY) return { key: process.env.GEMINI_API_KEY.trim(), from: 'the GEMINI_API_KEY environment variable' };
  for (const f of ENVS) { let txt; try { txt = fs.readFileSync(f, 'utf8'); } catch (e) { continue; } for (const line of txt.split('\n')) { const m = line.match(/^\s*(?:export\s+)?(?:GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*(.*)$/); if (m) { const k = m[1].trim().replace(/^['"]|['"]$/g, ''); if (k) return { key: k, from: f }; } } }
  return null;
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mp4': 'video/mp4', '.webm': 'video/webm', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };
const HOSTS = new Set(['localhost:' + PORT, '127.0.0.1:' + PORT, '[::1]:' + PORT]);
http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p === '/__key') { // only for this server's own page: the right Host (no other name pointed at this machine), and not a request made by another site
    const site = q.headers['sec-fetch-site'], ok = HOSTS.has(String(q.headers.host || '').toLowerCase()) && (!site || site === 'same-origin') && !q.headers.origin, k = ok ? findKey() : null;
    r.writeHead(ok ? 200 : 403, { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }); r.end(JSON.stringify(k ? { key: k.key } : {})); return;
  }
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT + path.sep) || path.basename(f).startsWith('.') || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end('not found'); return; }
  const size = fs.statSync(f).size, type = TYPES[path.extname(f)] || 'application/octet-stream', m = /bytes=(\d+)-(\d*)/.exec(q.headers.range || '');
  if (m) { const a = +m[1], b = m[2] ? Math.min(+m[2], size - 1) : size - 1; r.writeHead(206, { 'content-type': type, 'content-range': `bytes ${a}-${b}/${size}`, 'accept-ranges': 'bytes', 'content-length': b - a + 1, 'cache-control': 'no-store' }); fs.createReadStream(f, { start: a, end: b }).pipe(r); return; }
  r.writeHead(200, { 'content-type': type, 'content-length': size, 'accept-ranges': 'bytes', 'cache-control': 'no-store' }); fs.createReadStream(f).pipe(r);
}).listen(PORT, '127.0.0.1', () => {
  const k = findKey();
  console.log('Spoken World is at http://localhost:' + PORT + '  (Ctrl+C to stop)');
  console.log(k ? 'Gemini key: found in ' + k.from + ' (the page will not ask for it)' : 'Gemini key: none found, so the page will ask for one. To skip that, put GEMINI_API_KEY=... in ' + path.join(__dirname, '.env'));
});
