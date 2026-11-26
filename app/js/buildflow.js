/* Koemachi · the run-up to a new object: what Inkling is doing while you wait, stage by stage, on a card at the top right.
   Reading your sentence, thinking how to build it, writing the parts (the count grows as the code streams in), then Look & Fix's scan card below it.
   It only reads what the page already knows (the placeholder in the town, the streamed preview); it never calls the model. */
'use strict';
(function () {
  const YX = window.YX, T = YX.T, W = YX.world, M = YX.mind;
  const F = (YX.buildFlow = { stage: '', label: '', t0: 0, ts: {}, parts: 0, doneAt: 0 });
  let flow, card;
  const el = (tag, css, txt) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; };
  const st = document.createElement('style');
  st.textContent = '#swFlow{position:fixed;right:24px;top:96px;width:300px;z-index:9;display:flex;flex-direction:column;gap:10px;pointer-events:none}#swFlow #swScan{position:static;width:auto}'
    + '#swBuild{padding:10px 12px;border-radius:14px;background:rgba(14,16,20,.86);color:#fff;font:600 13px/1.4 var(--f-ui,system-ui);display:none}#swBuild.on{display:block}#swBuild .h{font-size:14px;margin-bottom:6px}'
    + '#swBuild .s{display:flex;gap:8px;align-items:baseline;opacity:.55}#swBuild .s.now{opacity:1}#swBuild .s.done{opacity:.9;color:#8be0a4}#swBuild .s b{width:14px;text-align:center}#swBuild .s span{flex:1}#swBuild .s em{font-style:normal;opacity:.75;font-weight:500}'
    + '#swBuild .bar{height:3px;margin-top:8px;border-radius:2px;background:rgba(255,255,255,.15);overflow:hidden}#swBuild .bar i{display:block;height:100%;width:40%;background:#52b878;animation:swbar 1.3s ease-in-out infinite alternate}@keyframes swbar{from{margin-left:0}to{margin-left:60%}}';
  document.head.appendChild(st);
  flow = el('div'); flow.id = 'swFlow'; document.body.appendChild(flow); card = el('div'); card.id = 'swBuild'; flow.appendChild(card);

  const pending = () => { for (const o of W.objs.values()) if (o.type === '__pending' && !o.dead) return o; return null; };
  const nodes = (g) => { let n = 0; try { g.traverse((c) => { if (c.isMesh) n++; }); } catch (e) {} return n; };
  const routing = () => !!(M && M.active && M.active.size > 0);
  function update() {
    const now = performance.now(), p = pending();
    if (p) {
      if (!F.t0) { F.t0 = now; F.ts = { think: now }; F.lastRoute = F.routeAt ? now - F.routeAt : 0; }
      F.label = String(p.wantType || p.name || '').replace(/_/g, ' ');
      F.parts = p.pv ? nodes(p.pv) : 0;
      if (F.parts > 0 && !F.ts.write) F.ts.write = now;
      F.stage = F.parts > 0 ? 'write' : 'think'; F.doneAt = 0;
    } else if (F.t0 && F.stage !== 'done') { F.stage = 'done'; F.doneAt = now; F.ts.done = now; }
    else if (F.stage === 'done' && now - F.doneAt > 2600) { F.stage = ''; F.t0 = 0; F.routeAt = 0; F.ts = {}; }
    else if (!F.t0) { // reading the sentence: the model is deciding what to do with it, nothing is in the town yet
      if (routing()) { if (!F.routeAt) F.routeAt = now; F.stage = 'read'; } else { F.stage = ''; F.routeAt = 0; }
    }
    paint(now);
  }
  F.line = () => { // one short line, for the film
    const s = Math.round(((performance.now()) - (F.stage === 'read' ? F.routeAt : F.t0)) / 1000);
    return F.stage === 'read' ? T('Inkling · 正在理解你的话… ' + s + ' 秒', 'Inkling · reading your sentence… ' + s + ' s')
      : F.stage === 'think' ? T('Inkling · 正在想怎么造 ' + F.label + '… ' + s + ' 秒', 'Inkling · thinking how to build ' + F.label + '… ' + s + ' s')
      : F.stage === 'write' ? T('Inkling · 正在写零件：已有 ' + F.parts + ' 个', 'Inkling · writing the parts: ' + F.parts + ' so far')
      : F.stage === 'done' ? T('Inkling · 造好了 ' + F.label, 'Inkling · built ' + F.label) : '';
  };
  function paint(now) {
    const on = !!F.stage; card.classList.toggle('on', on); if (!on) return; card.textContent = '';
    card.appendChild(el('div', '', '✦ Inkling' + (F.label ? ' · ' + F.label : ''))).className = 'h';
    const sec = (a, b) => Math.max(0, Math.round(((b || now) - a) / 1000)) + ' s';
    const rows = [
      ['read', T('理解你的话', 'Reading your sentence'), F.routeAt ? sec(F.routeAt, F.t0 || now) : ''],
      ['think', T('想怎么造', 'Thinking how to build it'), F.ts.think ? sec(F.ts.think, F.ts.write || F.ts.done) : ''],
      ['write', F.parts ? T('写零件：已有 ' + F.parts + ' 个', 'Writing the parts: ' + F.parts + ' so far') : T('写零件', 'Writing the parts'), F.ts.write ? sec(F.ts.write, F.ts.done) : ''],
    ], order = ['read', 'think', 'write', 'done'], at = order.indexOf(F.stage);
    for (const [k, label, time] of rows) { const i = order.indexOf(k), done = i < at, cur = i === at; const r = el('div'); r.className = 's' + (done ? ' done' : cur ? ' now' : ''); r.appendChild(el('b', '', done ? '✓' : cur ? '●' : '○')); r.appendChild(el('span', '', label)); if (time && (done || cur)) r.appendChild(el('em', '', time)); card.appendChild(r); }
    if (F.stage === 'done') { const r = el('div'); r.className = 's done'; r.appendChild(el('b', '', '✓')); r.appendChild(el('span', '', T('造好了', 'Built'))); card.appendChild(r); }
    else { const bar = el('div'); bar.className = 'bar'; bar.appendChild(el('i')); card.appendChild(bar); }
  }
  setInterval(update, 250);
})();
