// injected before page scripts: a stand-in for the model (window.claude.use("sample") is what the test bridge in run.js asks) and for the microphone
(() => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const WINDMILL = `//@meta {"name":"windmill","label":"风车","size":[7,13,7],"motion":"none","params":{"height":{"d":12,"min":4,"max":40},"color":{"d":"#f2e9d8"},"blades":{"d":4,"min":2,"max":8,"int":true}},"dims":{"height":"height"}}
const H = p.height, k = H / 12;
b.cyl(2.2*k, 3.1*k, H*0.72, p.color, 0, 0, 0, {sides: 8, tex: "plaster"});
b.cyl(3.2*k, 3.3*k, 0.4*k, "#8f8a82", 0, 0, 0, {sides: 8, tex: "stone"});
b.cone(2.7*k, H*0.2, "#8a4b3a", 0, H*0.72, 0, {sides: 8, flat: true});
b.box(1.2*k, 2.2*k, 0.2*k, "#5d4031", 0, 0.4*k, 3.0*k, {tex: "wood"});
for (let i = 0; i < 3; i++) { b.box(0.8*k, 1.0*k, 0.15*k, "#3b5269", 0, H*(0.25+i*0.15), (2.9-i*0.25)*k, {glow: "#ffd68a"}); }
b.cyl(0.25*k, 0.25*k, 1.4*k, "#5d4031", 0, H*0.74, 2.0*k, {rx: 90});
b.group({x: 0, y: H*0.74, z: 3.5*k, anim: {spin: {axis: "z", speed: 0.9}}}, () => {
  b.sphere(0.4*k, "#5d4031", 0, 0, 0);
  for (let i = 0; i < p.blades; i++) { b.group({rz: i * 360 / p.blades}, () => { b.box(0.16*k, 5.2*k, 0.12*k, "#5d4031", 0, 0, 0); b.box(1.3*k, 4.0*k, 0.05*k, "#f4efe6", 0.7*k, 1.0*k, 0, {opacity: 0.95}); for (let j = 0; j < 5; j++) b.box(1.3*k, 0.05*k, 0.08*k, "#5d4031", 0.7*k, (1.2 + j*0.9)*k, 0); }); }
});
b.anchor("top", 0, H*0.93, 0);`;
  const PLAN = ['{"op":"env","time":17.2,"ground":"sand","weather":"clear"}','{"op":"add","type":"water","params":{"width":260,"depth":90},"place":{"at":[0,-95]}}','{"op":"add","type":"road","params":{"length":150,"width":7},"place":{"at":[0,-20]}}','{"op":"add","type":"house","params":{"floors":1,"wall":"#f7f5ef","roofColor":"#2e6da4"},"place":{"at":[-30,-34]}}','{"op":"add","type":"house","params":{"floors":2,"wall":"#f7f5ef","roofColor":"#2e6da4"},"place":{"at":[-10,-34]}}','{"op":"add","type":"cafe","params":{"name":"SEA","awning":"#2e6da4"},"place":{"at":[14,-34]}}','{"op":"scatter","type":"tree","params":{"kind":"palm"},"count":10,"radius":30,"place":{"at":[0,-50]}}','{"op":"crowd","count":5,"activity":"chat","place":{"at":[6,-12]}}','{"op":"invent","type":"windmill","label":"风车","brief":"海边的白色风车","size":[7,13,7],"place":{"at":[40,-40]}}'].join('\n');
  async function stream(text, opt, cps) { let i = 0; while (i < text.length) { if (opt && opt.signal && opt.signal.aborted) throw { code: 'cancelled', message: 'x' }; i = Math.min(text.length, i + (cps || 60)); if (opt && opt.onText) opt.onText({ text: text.slice(0, i), delta: '' }); await sleep(40); } return { text, truncated: false, modelTierApplied: (opt && opt.modelTier) || 'default' }; }
  const calls = (window.__calls = []);
  const sample = async (input, opt) => {
    const s = typeof input === 'string' ? input : input[input.length - 1].content; calls.push({ tier: opt && opt.modelTier, head: s.slice(0, 24), len: s.length });
    await sleep(120);
    (window.__prompts = window.__prompts || []).push(s);
    if (s.startsWith('只回复') || /^Reply with/.test(s)) return stream('ok', opt);
    if (s.includes('程序化生成器') || s.includes('procedural generator')) { if (window.__slowGen) await sleep(window.__slowGen); return stream(window.__badCode && !s.includes('运行出错') && !s.includes('failed when it ran') ? '//@meta {"name":"x"}\nb.box(1,1,1,"#fff"\n' : WINDMILL, opt, 90); }
    if (s.includes('布景师') || s.includes('set designer')) return stream(PLAN, opt, 80);
    const u = s.slice(Math.max(s.lastIndexOf('## 玩家说'), s.lastIndexOf('## The player says')));
    if (window.__route) { const r = window.__route(u, s); if (r) return stream(r + '\n', opt); }
    if (/风车|windmill/i.test(u)) return stream('{"op":"invent","type":"windmill","label":"' + (/windmill/i.test(u) ? 'Windmill' : '风车') + '","brief":"a Dutch windmill that turns, white tower, red-brown cap, four blades","size":[7,13,7],"motion":"none","place":{"front":16}}\n', opt);
    if (/聊天|chatting/.test(u)) return stream('{"op":"crowd","count":7,"activity":"chat","place":{"front":7}}\n', opt);
    if (/渔村|fishing village/i.test(u)) return stream('{"op":"plan","brief":"seaside fishing village: white houses with blue roofs, sand, palm trees, a pier","clear":true}\n', opt);
    return stream('{"op":"say","text":"(mock) not understood"}\n', opt);
  };
  sample.json = async () => ({}); sample.limits = async () => ({ maxPromptBytes: 262144 });
  let st = 'idle'; const hs = { p: [], f: [], s: [] }, emit = (k, v) => hs[k].forEach((h) => h(v));
  const dictation = { start: async () => { st = 'starting'; emit('s', { state: st }); await sleep(60); st = 'listening'; emit('s', { state: st }); }, stop: async () => { if (window.__pendingFinal) { const t = window.__pendingFinal; window.__pendingFinal = ''; emit('p', { text: '' }); emit('f', { text: t }); } st = 'idle'; emit('s', { state: st, reason: 'stopped' }); }, active: () => st !== 'idle', onPartial: (h) => { hs.p.push(h); return () => {}; }, onFinal: (h) => { hs.f.push(h); return () => {}; }, onState: (h) => { hs.s.push(h); return () => {}; } };
  window.__speak = async (text) => { for (let i = 1; i <= text.length; i++) { emit('p', { text: text.slice(0, i) }); await sleep(25); } window.__pendingFinal = text; };
  const downloads = { save: async (r) => { (window.__saved = window.__saved || []).push({ filename: r.filename, size: r.data.size || r.data.length }); return { status: 'saved' }; } };
  window.claude = { use: async (n) => (n === 'sample' ? sample : n === 'dictation' ? dictation : n === 'downloads' ? downloads : null) };
})();
