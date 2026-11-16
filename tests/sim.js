// shared test helpers (prepended to scenario scripts)
YX.three.renderer.setPixelRatio(0.3); if (YX.resize) YX.resize();
const W = YX.world, M = YX.mind, wait = (ms) => new Promise((r) => setTimeout(r, ms));
const logs = []; const prevLog = YX.hooks.log; YX.hooks.log = (e) => { logs[e.id] = { text: e.text, tier: e.tier, status: e.status, msgs: e.msgs.slice() }; if (prevLog) try { prevLog(e); } catch (x) {} };
const lastLog = () => { const l = logs[logs.length - 1]; return l ? '[' + l.tier + '/' + l.status + '] ' + l.msgs.join(' | ') : '(no log)'; };
const F0 = YX.frame; let fake = performance.now() + 5000, lastT = 0; YX.frame = (t) => { if (t <= lastT) return; lastT = t; F0(t); };
const R0 = YX.three.renderer.render.bind(YX.three.renderer);
const step = (sec, each) => { YX.three.renderer.render = () => {}; fake = Math.max(fake, lastT); /* the page own frames may have run ahead in real time: carry on from them */ const n = Math.round(sec * 30); for (let i = 0; i < n; i++) { fake += 33.4; YX.frame(fake); if (each) each(i); } YX.three.renderer.render = R0; };
const byType = (t) => Array.from(W.objs.values()).filter((o) => o.type === t);
const say = async (text, aim, ms) => { if (aim !== undefined) W.aim = aim; M.commit(text); step(0.2); await wait(ms || 250); step(0.6); return text + '  ⇒  ' + lastLog(); };
const out = [];
