// The run-up to a new object (stage card) and Look & Fix's scan card, both on screen without recording anything.
const wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = [], $ = (id) => document.getElementById(id), M = YX.mind;
window.__lookVerdicts = [{ match: false, problems: ['blades were floating'], fix: 'attach the blades' }, { match: true, problems: [], fix: '' }];
window.__route = (u) => (/zorb/i.test(u) ? '{"op":"invent","type":"zorbr","label":"Zorb R","brief":"a test object","size":[3,3,3],"motion":"none","place":{"front":16}}' : '');
out.push('recording: ' + !!YX.replay.rec);
M.commit('make zorb R'); const cards = new Set(), scans = new Set();
for (let i = 0; i < 600; i++) {
  const b = $('swBuild'); if (b && b.classList.contains('on')) cards.add(Array.from(b.querySelectorAll('.s')).map((r) => (/done/.test(r.className) ? '✓' : /now/.test(r.className) ? '●' : '○') + r.querySelector('span').textContent.replace(/\d+ so far/, 'N so far')).join(' | '));
  const s = $('swScan'); if (s && s.classList.contains('on')) scans.add(s.className.replace(/\bon\b/, '').trim() + ' · ' + s.querySelector('.h').textContent + ' · ' + s.querySelector('.t').textContent);
  await wait(150); if (i > 60 && YX.lookFix.busy === 0 && !YX.buildFlow.stage && scans.size > 1) break;
}
out.push('stage card (stages seen):\n  ' + (Array.from(cards).join('\n  ') || 'NEVER SHOWN'));
out.push('scan card without recording:\n  ' + (Array.from(scans).join('\n  ') || 'NEVER SHOWN'));
out.push('the scan card sits inside the same column as the stage card: ' + ($('swScan') && $('swScan').parentNode === $('swFlow')));
await wait(6500); out.push('after it is all over, nothing is left on screen: build card on=' + $('swBuild').classList.contains('on') + ', scan card on=' + $('swScan').classList.contains('on'));
return out.join('\n');
