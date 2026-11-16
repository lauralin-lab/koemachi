// Builds the open-web version of Spoken World into site/dist: the same page as app/ (the Claude artifact), with site/gemini.js loaded first so that
// the AI, voice input, saving and the video model come from the viewer's Gemini API key.
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url)), root = join(here, '..'), app = join(root, 'app'), out = join(here, 'dist');
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
cpSync(app, out, { recursive: true });
copyFileSync(join(here, 'gemini.js'), join(out, 'js', 'gemini.js'));

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

// the only change to the page itself: the Gemini host loads first. Its wording and its video model reach the page through the host (app/js/host.js).
patch('index.html', [
  ['<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js">', '<script>window.SW_BUILD=' + JSON.stringify(build) + ';</script>\n<script src="js/gemini.js"></script>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js">'],
]);
// which build this is: an open tab asks now and then, and says so when the files on the server are newer than the page it is running
writeFileSync(join(out, 'version.json'), JSON.stringify({ build }));
console.log('built', out, '· build', build);
