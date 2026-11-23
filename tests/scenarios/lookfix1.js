// Look & Fix: a new kind of object is looked at; the first check finds a problem, the code is revised and rebuilt, the second check passes.
const wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = [], W = YX.world, LF = YX.lookFix;
const usedBefore = SW_HOST.usage.length, countOf = () => Array.from(W.objs.values()).filter((o) => o.type === 'zorbwheel' && !o.dead).length, n0 = countOf();
const logs = []; const prevLog = YX.hooks.log; YX.hooks.log = (e) => { logs[e.id] = '[' + e.tier + '/' + e.status + '] ' + e.text + ' => ' + e.msgs.join(' | '); if (prevLog) try { prevLog(e); } catch (x) {} };
window.__lookVerdicts = [{ match: false, problems: ['blades were floating', 'no door'], fix: 'attach the blades to the hub and add a door' }, { match: true, problems: [], fix: '' }];
window.__route = (u) => (/zorb/i.test(u) ? '{"op":"invent","type":"zorbwheel","label":"Zorb wheel","brief":"a test object","size":[7,13,7],"motion":"none","place":{"front":16}}' : '');
YX.mind.commit('make me a zorb wheel');
let t = 0; while (t++ < 160 && !(countOf() > n0 && YX.mind.active.size === 0 && LF.busy === 0)) await wait(500);
await wait(1500);
const usage = SW_HOST.usage.slice(usedBefore), lab = usage.map((u) => (u.label || u.task || u.tier) + (u.error ? ' ERR ' + u.error : '')), box = document.getElementById('lfBox');
out.push('model calls: ' + lab.join(' | '));
out.push('images sent: ' + (window.__images || []).length + ' (largest ' + Math.max(0, ...(window.__images || [0])) + ' base64 chars = ' + Math.round(Math.max(0, ...(window.__images || [0])) * 0.75 / 1024) + ' KB)');
out.push('corner note: ' + (box ? Array.from(box.children).map((d) => d.textContent).join(' / ') : '(none)'));
out.push('log: ' + logs.filter(Boolean).join(' || '));
out.push('zorbwheel instances: ' + Array.from(W.objs.values()).filter((o) => o.type === 'zorbwheel').length + ', look & fix still busy: ' + LF.busy);
return out.join('\n');
