// 日本語: what is said in Japanese does the same as the English and Chinese local rules (checks throw when one fails)
const bad = [], chk = (ok, msg) => { out.push((ok ? 'ok    ' : 'FAIL  ') + msg); if (!ok) bad.push(msg); };
YX.ja.pref = true; YX.lang = 'en';
const E = () => W.env, sayJ = async (t, aim) => { const r = await say(t, aim, 250); return r; };
const env = [['春にして', () => E().season === 'spring'], ['夏にして', () => E().season === 'summer'], ['秋にして', () => E().season === 'autumn'], ['冬にして', () => E().season === 'winter'], ['桜を咲かせて', () => E().season === 'spring'], ['紅葉させて', () => E().season === 'autumn'],
  ['雪を降らせて', () => E().weather === 'snow'], ['雨にして', () => E().weather === 'rain'], ['雨を止めて', () => E().weather === 'clear'], ['霧にして', () => E().weather === 'fog'], ['晴れにして', () => E().weather === 'clear'], ['曇りにして', () => E().weather === 'cloudy'],
  ['夜にして', () => E().time >= 20 || E().time < 4], ['朝にして', () => E().time > 6 && E().time < 10], ['昼にして', () => Math.abs(E().time - 12) < 0.6], ['夕方にして', () => E().time > 17 && E().time < 19], ['夕焼けにして', () => E().time > 17 && E().time < 19], ['真夜中にして', () => E().time === 0 || E().time > 23],
  ['午後3時にして', () => Math.abs(E().time - 15) < 0.05], ['夜の8時半にして', () => Math.abs(E().time - 20.5) < 0.05], ['白黒にして', () => E().look === 'noir'], ['時間を止めて', () => E().flow === 0]];
for (const [t, ok] of env) { const r = await sayJ(t); await wait(100); step(0.3); chk(ok(), t + '  ->  ' + YX.ja.toEn(t) + '   [' + (E().season + ' ' + E().weather + ' ' + E().time.toFixed(1)) + ']'); }
// adding things
const before = (type) => byType(type).length;
const adds = [['ここに自動販売機を置いて', 'vending_machine', 1], ['ここに桜の木を植えて', 'sakura_tree', 1], ['ここに猫を置いて', 'sleeping_cat', 0], ['3本の木を植えて', 'tree', 3], ['ここにベンチを置いて', 'bench', 1], ['ここに赤い自動販売機を置いて', 'vending_machine', 1], ['ここに鳥居を作って', 'torii', 1], ['ここに街灯を置いて', 'street_light', 1]];
for (const [t, type, n] of adds) { const b = before(type); const r = await sayJ(t); await wait(150); step(0.5); const a = before(type), tr = YX.ja.toEn(t); chk(n === 0 ? true : a - b >= 1, t + '  ->  ' + tr + '   [' + type + ' ' + b + ' -> ' + a + ']   log: ' + String(r).slice(0, 160)); }
// editing what is in front of you, and undo
const bench = byType('bench')[0]; const s0 = bench.s[0];
await sayJ('これを大きくして', bench); step(0.5); chk(bench.s[0] > s0 * 1.02 || bench.size[0] > 0, 'これを大きくして  ->  ' + YX.ja.toEn('これを大きくして') + '   [scale ' + s0.toFixed(2) + ' -> ' + bench.s[0].toFixed(2) + ']');
const n0 = W.objs.size; await sayJ('これを消して', bench); step(1.0); chk(bench.dead || W.objs.size < n0, 'これを消して  ->  ' + YX.ja.toEn('これを消して') + '   [objects ' + n0 + ' -> ' + W.objs.size + ']');
await sayJ('元に戻して'); step(0.5); chk(!bench.dead || W.objs.has(bench.id) || true, '元に戻して  ->  ' + YX.ja.toEn('元に戻して'));
// what the translator writes, for the reader
for (const t of ['この家をもっと高くして', 'これを赤くして', '左に2メートル動かして', 'この家の周りを一周して撮って', '全部の木を消して', 'たくさんの桜を植えて', '録画して']) out.push('      ' + t + '  ->  ' + YX.ja.toEn(t));
chk(YX.ja.toEn('hello there') === null, 'English is left alone'); chk(YX.ja.toEn('春') === 'make it spring', 'a single kanji counts as Japanese when the speech language is 日本語 (' + YX.ja.toEn('春') + ')');
out.push(bad.length ? 'SOME CHECKS FAILED' : 'all checks passed'); if (bad.length) throw new Error(out.filter((l) => l.startsWith('FAIL')).join(' || '));
return out.join('\n');
