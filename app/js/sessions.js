/* Spoken World · sessions: the model calls whose results were kept, written as chat examples to data/sessions.jsonl (by the local server).
   A result counts as kept when it did not fail and was not undone within KEEP_MS (30 s). Each line is {"messages":[system, user, assistant]}:
   for a spoken command, system = the instructions and catalog, user = the scene, recent commands and the sentence, assistant = what the model answered;
   for a new kind of object, system = the code-writing rules, user = what to build, assistant = the code that was kept (after Look & Fix).
   The corner note counts the lines against GOAL, the number wanted before training a style (Phase 3). */
'use strict';
(function () {
  const YX = window.YX, T = YX.T, S = (YX.sessions = { keepMs: 30000, goal: 30, count: 0, pending: [], dropped: 0, lastUndo: 0 });
  let chip = null;
  function paint() {
    if (!chip) { const st = document.createElement('style'); st.textContent = '#swLearn{position:fixed;left:10px;bottom:20px;z-index:3;padding:3px 8px;border-radius:6px;background:rgba(14,16,20,.55);color:#fff;opacity:.6;font:500 10.5px/1.3 var(--f-ui,system-ui);letter-spacing:.02em;pointer-events:none}#swLearn.done{opacity:.9;background:rgba(40,110,60,.7)}'; document.head.appendChild(st); chip = document.createElement('div'); chip.id = 'swLearn'; document.body.appendChild(chip); }
    chip.textContent = T('已学习：' + S.count + ' / ' + S.goal + ' 次编辑', 'Learned from: ' + S.count + ' / ' + S.goal + ' edits'); chip.classList.toggle('done', S.count >= S.goal);
  }
  S.record = function (r) { // r: { kind, system, user, output }
    if (!r || !r.output || !r.user) return;
    if (r.since && S.lastUndo > r.since) { S.dropped++; return; } // undone while the model was still answering
    if (r.kind === 'route' && !/"op"\s*:\s*"(?!say")/.test(r.output)) return; // an answer that only says something changed nothing: not a kept edit
    const e = { r, t: performance.now(), dropped: false, timer: 0 };
    e.timer = setTimeout(() => { S.pending = S.pending.filter((x) => x !== e); if (e.dropped) return; flush(r); }, S.keepMs);
    S.pending.push(e);
  };
  function flush(r) {
    const line = JSON.stringify({ messages: [{ role: 'system', content: r.system }, { role: 'user', content: r.user }, { role: 'assistant', content: r.output }] });
    fetch('/__session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: line }).then((x) => x.json()).then((j) => { if (j && typeof j.count === 'number') { S.count = j.count; paint(); } }).catch(() => {});
  }
  // an undo takes back the latest thing done: the newest pending result is not kept
  const undo0 = YX.undo; YX.undo = function () { const ok = undo0.apply(this, arguments); if (ok) { S.lastUndo = performance.now(); const e = S.pending.filter((x) => !x.dropped).pop(); if (e) { e.dropped = true; S.dropped++; } } return ok; };
  paint(); fetch('/__session', { cache: 'no-store' }).then((x) => x.json()).then((j) => { if (j && typeof j.count === 'number') { S.count = j.count; paint(); } }).catch(() => {});
})();
