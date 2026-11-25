/* Koemachi · Train my world: teach the model your town from the edits you kept (data/sessions.jsonl), then switch the town to it.
   A small button above the "Learned from" note opens a panel: how many edits are kept, a Train button (enabled from MIN edits), the progress of the run
   (train/train.py, started by the local server), and the checkpoints it saved, each with a "Use" button. Using one makes the server send its
   model calls to that LoRA instead of the base model; "Use base model" goes back. The key never reaches the page. */
'use strict';
(function () {
  const YX = window.YX, T = YX.T, TW = (YX.trainWorld = { info: null });
  let btn, box, timer = 0;
  const el = (tag, css, txt) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; };
  const api = (path, body) => fetch(path, body === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error((j.error && j.error.message) || 'HTTP ' + r.status); return j; });
  const UI = 'font:500 11.5px/1.45 var(--f-ui,system-ui);color:#fff';
  function build() {
    const st = document.createElement('style');
    st.textContent = '#swTrainBtn{position:fixed;left:10px;bottom:46px;z-index:4;padding:5px 10px;border:0;border-radius:6px;background:rgba(14,16,20,.7);color:#fff;font:600 11px/1.2 var(--f-ui,system-ui);cursor:pointer}#swTrainBtn:hover{background:rgba(40,110,60,.85)}#swTrainBtn.on{background:rgba(40,110,60,.85)}'
      + '#swTrain{position:fixed;left:10px;bottom:76px;z-index:5;width:320px;max-height:60vh;overflow:auto;padding:12px;border-radius:10px;background:rgba(14,16,20,.92);box-shadow:0 8px 30px rgba(0,0,0,.4)}#swTrain button{border:0;border-radius:6px;padding:5px 10px;font:600 11px var(--f-ui,system-ui);cursor:pointer;background:#2f7d4a;color:#fff}#swTrain button:disabled{opacity:.4;cursor:default}#swTrain button.ghost{background:rgba(255,255,255,.14)}';
    document.head.appendChild(st);
    btn = el('button', '', T('训练我的世界', 'Train my world')); btn.id = 'swTrainBtn'; btn.onclick = toggle; document.body.appendChild(btn);
    box = el('div'); box.id = 'swTrain'; box.style.display = 'none'; box.style.cssText += ';' + UI; document.body.appendChild(box);
  }
  function toggle() { const open = box.style.display === 'none'; box.style.display = open ? 'block' : 'none'; btn.classList.toggle('on', open); if (open) refresh(); else clearTimeout(timer); }
  function refresh() {
    clearTimeout(timer);
    api('/__train').then((j) => { TW.info = j; if (!(box.contains(document.activeElement) && document.activeElement.tagName === 'INPUT')) paint(); const run = j.training || (j.status && j.status.state === 'running'); if (box.style.display !== 'none') timer = setTimeout(refresh, run ? 2500 : 8000); }).catch((e) => { box.textContent = T('无法读取训练状态：', 'Cannot read training status: ') + e.message; });
  }
  function paint() {
    const j = TW.info; if (!j) return; box.textContent = '';
    const s = j.status, running = j.training || (s && s.state === 'running'), enough = j.count >= j.min;
    box.appendChild(el('div', 'font-weight:700;font-size:13px;margin-bottom:4px', T('训练我的世界', 'Train my world')));
    box.appendChild(el('div', 'opacity:.8;margin-bottom:8px', T('用你保留下来的编辑，在 ' + (j.base || 'Inkling') + ' 上训练一个 LoRA。', 'Train a LoRA on ' + (j.base || 'Inkling') + ' from the edits you kept.')));
    box.appendChild(el('div', 'margin-bottom:8px', T('已保留 ', 'Kept: ') + j.count + ' / ' + j.min + (enough ? '' : T('（还不够）', ' (not enough yet)'))));
    const go = el('button', '', running ? T('训练中…', 'Training…') : T('开始训练', 'Train my world')); go.disabled = running || !enough;
    go.onclick = () => { go.disabled = true; api('/__train', {}).then(refresh).catch((e) => { box.appendChild(el('div', 'color:#ff9d8a;margin-top:6px', e.message)); }); };
    box.appendChild(go);
    if (s && (running || s.state === 'error' || s.state === 'done')) {
      const pct = s.total ? Math.round(100 * (s.step || 0) / s.total) : 0, bar = el('div', 'margin:10px 0 4px;height:6px;border-radius:3px;background:rgba(255,255,255,.18);overflow:hidden');
      bar.appendChild(el('div', 'height:100%;width:' + (s.state === 'done' ? 100 : pct) + '%;background:' + (s.state === 'error' ? '#d9573f' : '#52b878')));
      box.appendChild(bar);
      box.appendChild(el('div', 'opacity:.85;' + (s.state === 'error' ? 'color:#ff9d8a' : ''), (s.message || '') + (s.nll != null && s.state !== 'error' ? ' · loss ' + (+s.nll).toFixed(3) : '')));
    }
    box.appendChild(el('div', 'font-weight:700;margin:12px 0 4px', T('模型', 'Models')));
    const row = (label, sub, active, onuse) => { const r = el('div', 'display:flex;align-items:center;gap:8px;padding:5px 0;border-top:1px solid rgba(255,255,255,.1)'); const t = el('div', 'flex:1;min-width:0'); t.appendChild(el('div', 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap', label)); if (sub) t.appendChild(el('div', 'opacity:.6;font-size:10.5px', sub)); r.appendChild(t); const b = el('button', '', active ? T('使用中', 'In use') : T('使用', 'Use')); b.disabled = active; if (!active) b.className = 'ghost'; b.onclick = () => { b.disabled = true; api('/__model', { id: onuse }).then(() => { refresh(); YX.trainWorld.onSwitch && YX.trainWorld.onSwitch(onuse); }).catch((e) => { box.appendChild(el('div', 'color:#ff9d8a', e.message)); }); }; r.appendChild(b); box.appendChild(r); };
    row(T('基础模型', 'Base model'), j.base, !j.active, null);
    for (const m of (j.models || []).slice().reverse()) row(m.label, m.examples + (T(' 条编辑 · 损失 ', ' edits · loss ')) + (+m.nll).toFixed(3), j.active === m.id, m.id);
  }
    build();
  TW.repaint = () => { if (TW.info) paint(); };
  const paint0 = paint; paint = function () { paint0(); if (TW.extra) try { TW.extra(box, TW.info); } catch (e) { console.warn(e); } };
})();
