// Builds Koemachi into site/dist: the page in app/ with site/tinker.js loaded first, so that the AI (Inkling via Tinker, through the local server),
// voice input (Web Speech) and file saving come from the host in that file.
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url)), root = join(here, '..'), app = join(root, 'app'), out = join(here, 'dist');
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
cpSync(app, out, { recursive: true });
copyFileSync(join(here, 'tinker.js'), join(out, 'js', 'tinker.js'));

const d = new Date(), p2 = (v) => String(v).padStart(2, '0'), build = process.env.SW_BUILD || (p2(d.getUTCMonth() + 1) + '-' + p2(d.getUTCDate()) + ' ' + p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes()) + ' UTC');

function patch(file, pairs) {
  const p = join(out, file); let s = readFileSync(p, 'utf8');
  for (const [a, b] of pairs) {
    const n = s.split(a).length - 1;
    if (n !== 1) throw new Error(file + ': expected the text once, found it ' + n + ' times: ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  }
  writeFileSync(p, s);
}

// every file in app/generators/ is a generator: one script tag each, in name order ("_common.js" first), right after the built-in ones
const gens = readdirSync(join(app, 'generators')).filter((n) => n.endsWith('.js')).sort();
patch('index.html', [['<script src="js/gens2.js"></script>', '<script src="js/gens2.js"></script>\n' + gens.map((n) => '<script src="generators/' + n + '"></script>').join('\n')]]);
// the only other change to the page itself: the Tinker host loads first. Its wording reaches the page through the host (app/js/host.js).
patch('index.html', [
  ['<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js">', '<script>window.SW_BUILD=' + JSON.stringify(build) + ';</script>\n<script src="js/tinker.js"></script>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js">'],
]);
// which build this is: an open tab asks now and then, and says so when the files on the server are newer than the page it is running
writeFileSync(join(out, 'version.json'), JSON.stringify({ build }));
console.log('built', out, '· build', build);
