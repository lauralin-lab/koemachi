/* Koemachi · Watch it learn: the same request answered by the base model and by each checkpoint Train my world saved, side by side.
   One sentence goes to every model with the very same prompt (the scene as you see it now). Each answer is built in its own lane, a few metres apart to
   your right, in front of you, and named by a label above it: Base, Epoch 1, Epoch 2… so you can walk along the street and see the model learn.
   Only operations that make something new (add, scatter, row, crowd) are built, in their lane; anything that would change what already stands, or
   needs a long build (invent, plan), is listed in the panel as text instead, so a comparison never changes your town. "Clear lanes" takes it all away. */
'use strict';
(function () {
  const YX = window.YX, T = YX.T, M = YX.mind, W = YX.world, TW = YX.trainWorld;
  if (!TW) return;
  const BUILD = new Set(['add', 'scatter', 'row', 'crowd']), GAP = 13, AHEAD = 8;
  const WL = (YX.watchLearn = { lanes: [], busy: false, text: '' });
  const el = (tag, css, txt) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; };
  let labels = null;

  // the models to compare: the base, then the epochs of the newest training run, oldest first
  function contenders(info) {
    const ms = (info.models || []).filter((m) => m && m.id), run = (m) => m.id.replace(/-e\d+$/, '');
    const last = ms.length ? run(ms[ms.length - 1]) : null, mine = ms.filter((m) => run(m) === last).sort((a, b) => (a.epoch || 0) - (b.epoch || 0));
    return [{ id: 'base', name: T('基础模型', 'Base model'), short: T('基础', 'Base') }].concat(mine.map((m) => ({ id: m.id, name: m.label, short: T('第 ' + m.epoch + ' 轮', 'Epoch ' + m.epoch), nll: m.nll })));
  }
  // a place that points at something already in the town would put every lane's answer on the same spot: it becomes "in front of this lane" instead
  const anchored = (pl) => { let s = ''; try { s = JSON.stringify(pl); } catch (e) {} return /#\d|aim|focus|them|"type"|"on"|"near"|"wall"/.test(s); };
  const laneOp = (op) => { const o = Object.assign({}, op); if (o.place && anchored(o.place)) o.place = { front: AHEAD, right: 0 }; return o; };

  function clear() {
    for (const l of WL.lanes) { for (const id of l.ids || []) { const o = W.objs.get(id); if (o && !o.dead) { try { YX.exec({ op: 'remove', id: '#' + id }, YX.newCtx(YX.viewNow())); } catch (e) {} } } }
    WL.lanes = []; if (labels) labels.textContent = ''; paintPanel();
  }

  async function watch(text) {
    if (WL.busy || !text.trim()) return; WL.busy = true; clear(); WL.text = text; const info = TW.info;
    const list = contenders(info), v = YX.viewNow(), prompt = M.routePrompt(text, text, v, [], []);
    const n = list.length; WL.lanes = list.map((c, k) => ({ c, off: (k - (n - 1) / 2) * GAP, state: 'waiting', ids: [], notes: [], ms: 0 }));
    paintPanel(); drawLabels(v);
    await Promise.all(WL.lanes.map(async (l) => {
      const t0 = performance.now(); l.state = 'thinking'; paintPanel();
      try {
        if (!M.sample) throw new Error(T('AI 没有连接', 'The AI is not connected'));
        const res = await M.sample(prompt, { modelTier: 'quick', cache: false, modelId: l.c.id, label: 'watch ' + l.c.id });
        l.raw = res.text; l.ms = Math.round(performance.now() - t0);
        const ops = M.parseLines(res.text), lv = Object.assign({}, v, { x: v.x + v.rx * l.off, z: v.z + v.rz * l.off, aimId: null, aimOk: false, focusId: null }), ctx = YX.newCtx(lv), skipped = [];
        l.anchor = { x: lv.x + lv.fx * AHEAD, z: lv.z + lv.fz * AHEAD, y: lv.y };
        const before = new Set(W.objs.keys()); // nothing waits between this lane's operations, so what appears meanwhile is this lane's
        for (const op of ops) {
          const name = String(op.op || '').toLowerCase();
          if (!BUILD.has(name)) { skipped.push(name === 'invent' ? 'invent ' + (op.label || op.type || '') : name); continue; }
          let r = null; try { r = YX.exec(laneOp(op), ctx); } catch (e) { r = { ok: false, msg: String(e && e.message || e) }; }
          if (r && r.ok === false) l.notes.push(r.msg || T('没能放下', 'could not place'));
        }
        l.ids = Array.from(W.objs.keys()).filter((id) => !before.has(id));
        const kinds = {}; for (const id of l.ids) { const o = W.objs.get(id); if (o) kinds[o.type] = (kinds[o.type] || 0) + 1; }
        l.built = Object.entries(kinds).map(([k, c]) => (c > 1 ? c + '× ' : '') + k).join(', ');
        l.skipped = skipped; l.state = ops.length ? 'done' : 'empty';
      } catch (e) { l.state = 'error'; l.err = String((e && (e.message || e.code)) || e).slice(0, 120); l.ms = Math.round(performance.now() - t0); }
      paintPanel(); drawLabels(v);
    }));
    WL.busy = false; paintPanel();
  }

  /* ---------- the names above the lanes ---------- */
  let frameHooked = false;
  function drawLabels() {
    if (!labels) { labels = el('div', 'position:fixed;inset:0;pointer-events:none;z-index:3'); document.body.appendChild(labels); }
    labels.textContent = '';
    for (const l of WL.lanes) { const d = el('div', 'position:absolute;transform:translate(-50%,-100%);padding:3px 9px;border-radius:12px;background:rgba(14,16,20,.78);color:#fff;font:700 12px/1.3 var(--f-ui,system-ui);white-space:nowrap;display:none', l.c.short); l.el = d; labels.appendChild(d); }
    if (!frameHooked) { frameHooked = true; const prev = YX.onFrame; YX.onFrame = function (dt) { if (prev) prev.apply(this, arguments); place(); }; }
  }
  function place() {
    if (!WL.lanes.length || !YX.three || !YX.three.camera || !window.THREE) return;
    const cam = YX.three.camera, r = YX.three.renderer && YX.three.renderer.domElement.getBoundingClientRect(), V = place.v || (place.v = new window.THREE.Vector3());
    for (const l of WL.lanes) {
      if (!l.el) continue; const a = l.anchor || (() => { const P = W.player, v = YX.viewNow(); return { x: v.x + v.rx * l.off + v.fx * AHEAD, z: v.z + v.rz * l.off + v.fz * AHEAD, y: P.y }; })();
      V.set(a.x, (a.y || 0) + 3.4, a.z).project(cam);
      if (V.z > 1 || V.z < -1) { l.el.style.display = 'none'; continue; }
      const w = r ? r.width : innerWidth, h = r ? r.height : innerHeight, x0 = r ? r.left : 0, y0 = r ? r.top : 0;
      l.el.style.display = 'block'; l.el.style.left = x0 + (V.x * 0.5 + 0.5) * w + 'px'; l.el.style.top = y0 + (-V.y * 0.5 + 0.5) * h + 'px';
    }
  }

  /* ---------- the panel section (inside Train my world's panel) ---------- */
  let host = null, input = null;
  function paintPanel() { if (host && host.isConnected) fill(); else if (TW.repaint) TW.repaint(); }
  function fill() {
    const info = TW.info; host.textContent = '';
    const list = info ? contenders(info) : [], ready = list.length > 1;
    host.appendChild(el('div', 'font-weight:700;font-size:13px;margin:14px 0 4px;padding-top:10px;border-top:1px solid rgba(255,255,255,.18)', T('看它学习', 'Watch it learn')));
    host.appendChild(el('div', 'opacity:.8;margin-bottom:6px', T('同一句话，基础模型和每个检查点各做一遍，在你面前并排摆开。', 'One sentence, built by the base model and by each checkpoint, side by side in front of you.')));
    if (!ready) { host.appendChild(el('div', 'opacity:.7', T('先训练一次，才有检查点可以比较。', 'Train once first: there is no checkpoint to compare yet.'))); return; }
    input = el('input', 'width:100%;box-sizing:border-box;padding:6px 8px;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;font:500 12px var(--f-ui,system-ui);margin-bottom:6px');
    input.value = WL.text || (M && M.said) || ''; input.placeholder = T('例如：在这里放一家拉面车', 'e.g. put a ramen food truck here'); input.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') go.click(); }; input.onkeyup = (e) => e.stopPropagation(); input.oninput = () => { WL.text = input.value; };
    host.appendChild(input);
    const row = el('div', 'display:flex;gap:6px;margin-bottom:6px'), go = el('button', '', WL.busy ? T('进行中…', 'Working…') : T('看它学习', 'Watch it learn')); go.disabled = WL.busy; go.onclick = () => { WL.text = input.value; watch(input.value); };
    const cl = el('button', '', T('清除', 'Clear lanes')); cl.className = 'ghost'; cl.disabled = WL.busy || !WL.lanes.length; cl.onclick = clear; row.appendChild(go); row.appendChild(cl); host.appendChild(row);
    for (const l of WL.lanes) {
      const box = el('div', 'padding:5px 0;border-top:1px solid rgba(255,255,255,.1)');
      box.appendChild(el('div', 'font-weight:700', l.c.name + (l.c.nll != null ? '  ·  loss ' + (+l.c.nll).toFixed(2) : '')));
      const st = l.state === 'waiting' || l.state === 'thinking' ? T('思考中…', 'thinking…') : l.state === 'error' ? T('出错：', 'error: ') + l.err : l.state === 'empty' ? T('没有给出有效操作', 'no valid operations') : (l.built ? T('放下了 ', 'built ') + l.built : T('没有放下新东西', 'built nothing new')) + ' · ' + (l.ms / 1000).toFixed(1) + 's';
      box.appendChild(el('div', 'opacity:.85' + (l.state === 'error' ? ';color:#ff9d8a' : ''), st));
      if (l.skipped && l.skipped.length) box.appendChild(el('div', 'opacity:.6;font-size:10.5px', T('没有执行（会改动已有的东西或太慢）：', 'not run (would change what stands, or too slow): ') + l.skipped.slice(0, 4).join(', ')));
      if (l.notes && l.notes.length) box.appendChild(el('div', 'opacity:.6;font-size:10.5px;color:#ffc9a8', l.notes.slice(0, 2).join(' · ')));
      host.appendChild(box);
    }
  }
  TW.extra = (box) => { host = el('div'); box.appendChild(host); fill(); };
  WL.watch = watch; WL.clear = clear; WL.contenders = contenders;
})();
