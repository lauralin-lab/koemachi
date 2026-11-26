/* Koemachi · Tinker features: one place that names what runs on Tinker, shows whether each part is on, and says how to start it.
   Look & Fix starts by itself (and can be switched off here), Watch it learn and Train my world open the training panel, Replay it films. Nothing here calls the model by itself:
   the one button that does ("Try it") says so, and only runs when you press it. */
'use strict';
(function () {
  const YX = window.YX, T = YX.T, M = YX.mind, $ = (id) => document.getElementById(id), LF = YX.lookFix;
  const el = (tag, css, txt) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; };
  const H = (YX.hub = { info: null, cfg: null });
  let btn, box, timer = 0;
  const TRY = () => (YX.lang === 'zh' ? '在这里造一辆拉面小摊车' : 'Build a ramen food truck here');

  function build() {
    const st = document.createElement('style');
    st.textContent = '#swHubBtn{position:fixed;left:10px;bottom:102px;z-index:4;padding:5px 10px;border:0;border-radius:6px;background:rgba(40,110,60,.9);color:#fff;font:700 11px/1.2 var(--f-ui,system-ui);cursor:pointer}#swHubBtn:hover,#swHubBtn.on{background:rgba(52,140,78,.98)}'
      + '#swHub{position:fixed;left:10px;bottom:132px;z-index:6;width:340px;max-height:72vh;overflow:auto;padding:12px;border-radius:12px;background:rgba(14,16,20,.94);box-shadow:0 8px 30px rgba(0,0,0,.45);color:#fff;font:500 12px/1.45 var(--f-ui,system-ui);display:none}#swHub.on{display:block}'
      + '#swHub .card{margin-top:10px;padding:9px 10px;border-radius:9px;background:rgba(255,255,255,.07)}#swHub .row{display:flex;align-items:center;gap:8px}#swHub .name{font-weight:700;font-size:13px;flex:1}'
      + '#swHub .chip{padding:1px 7px;border-radius:999px;font-weight:700;font-size:10.5px;background:rgba(255,255,255,.16)}#swHub .chip.on{background:#2f9a57}#swHub .chip.busy{background:#c28a1c}#swHub .chip.off{background:#6b4a4a}'
      + '#swHub button{border:0;border-radius:6px;padding:5px 10px;font:600 11px var(--f-ui,system-ui);cursor:pointer;background:#2f6f4a;color:#fff}#swHub button.ghost{background:rgba(255,255,255,.14)}#swHub button:disabled{opacity:.45;cursor:default}'
      + '#swHub .dim{opacity:.72}#swHub .bad{color:#ffd27a}#swHub .good{color:#8be0a4}#swHub .steps{margin:4px 0 6px 16px;padding:0}';
    document.head.appendChild(st);
    btn = el('button', '', '✦ ' + T('Tinker 功能', 'Tinker features')); btn.id = 'swHubBtn'; btn.title = T('Look & Fix、训练我的世界、Watch it learn、Replay it：开关和用法', 'Look & Fix, Train my world, Watch it learn, Replay it: what is on, and how to start each'); btn.onclick = toggle; document.body.appendChild(btn);
    box = el('div'); box.id = 'swHub'; document.body.appendChild(box);
  }
  function toggle() { const open = !box.classList.contains('on'); box.classList.toggle('on', open); btn.classList.toggle('on', open); if (open) refresh(); else clearTimeout(timer); }
  const get = (p) => fetch(p, { cache: 'no-store' }).then((r) => r.json());
  function refresh() { clearTimeout(timer); Promise.all([get('/__config').catch(() => null), get('/__train').catch(() => null)]).then(([c, t]) => { H.cfg = c; H.info = t; paint(); }); if (box.classList.contains('on')) timer = setTimeout(refresh, 3000); }
  function openTrain() { box.classList.remove('on'); btn.classList.remove('on'); const tb = $('swTrainBtn'), tp = $('swTrain'); if (tb && tp && tp.style.display === 'none') tb.click(); }
  const card = (name, chip, kind) => { const c = el('div'); c.className = 'card'; const r = el('div'); r.className = 'row'; r.appendChild(el('div', '', name)).className = 'name'; const ch = el('span', '', chip); ch.className = 'chip ' + (kind || ''); r.appendChild(ch); c.appendChild(r); box.appendChild(c); return { c, r }; };
  const line = (c, txt, cls) => { const d = el('div', 'margin-top:4px', txt); if (cls) d.className = cls; c.appendChild(d); return d; };

  function paint() {
    if (!box.classList.contains('on')) return; box.textContent = '';
    const cfg = H.cfg || {}, info = H.info || {}, model = cfg.active ? cfg.active.label : (cfg.model || 'Inkling').replace(/^.*\//, '') + ' · ' + T('基础', 'base');
    const top = el('div'); top.className = 'row'; top.appendChild(el('div', 'font-weight:800;font-size:14px;flex:1', '✦ ' + T('Tinker 功能', 'Tinker features'))); const x = el('button', '', '×'); x.className = 'ghost'; x.onclick = toggle; top.appendChild(x); box.appendChild(top);
    line(box, T('正在用：', 'Model in use: ') + model + (cfg.active ? T('（你训练的）', ' (trained by you)') : ''), 'dim');

    /* Look & Fix */
    const on = !!(LF && LF.enabled), busy = !!(LF && LF.busy > 0), a = card('Look & Fix', !LF ? T('不可用', 'missing') : busy ? T('检查中', 'looking') : on ? T('已开启', 'ON') : T('已关闭', 'OFF'), busy ? 'busy' : on ? 'on' : 'off');
    const sw = el('button', '', on ? T('关闭', 'Turn off') : T('开启', 'Turn on')); sw.className = 'ghost'; sw.onclick = () => { if (LF) LF.enabled = !LF.enabled; paint(); }; a.r.appendChild(sw);
    line(a.c, T('不用手动启动。Inkling 每次为一种新东西现写代码后，会自己拍一张图给它看，有问题就改，最多两轮。目录里已有的东西不会触发。', 'No start needed. Whenever Inkling writes the code for a new kind of object, it photographs the result, looks at it, and fixes what is wrong (two rounds at most). Things already in the catalog do not trigger it.'), 'dim');
    const hist = (LF && LF.history || []).slice(-3).reverse(); if (hist.length) for (const h of hist) line(a.c, (h.match ? '✓ ' : '⚠ ') + (h.match ? T('看起来没问题', 'Looks right') : (h.problems || []).join('; ')), h.match ? 'good' : 'bad'); else line(a.c, T('这次打开页面后还没有检查过。', 'Nothing looked at since this page opened.'), 'dim');
    const tr = el('button', '', T('试一下：', 'Try it: ') + TRY()); tr.style.marginTop = '6px'; tr.title = T('会调用模型：约 1–3 分钟，几次调用', 'Calls the model: about 1 to 3 minutes, several calls'); tr.disabled = !M || !on; tr.onclick = () => { toggle(); try { M.commit(TRY()); } catch (e) { console.warn(e); } }; a.c.appendChild(tr);
    line(a.c, T('前后对比图存在 data/lookfix/', 'Before and after pictures are kept in data/lookfix/'), 'dim');

    /* Train my world */
    const n = info.count || 0, min = info.min || 30, run = info.training || (info.status && info.status.state === 'running'), ready = n >= min, b = card(T('训练我的世界', 'Train my world'), run ? T('训练中', 'training') : ready ? T('可以训练', 'ready') : T('攒数据中', 'collecting'), run ? 'busy' : ready ? 'on' : '');
    line(b.c, T('已保留 ', 'Kept: ') + n + ' / ' + min + T(' 条编辑', ' edits') + (ready ? '' : T('。多对小镇下几条模型处理的指令。', '. Keep giving the town commands the model handles.')), 'dim');
    const ob = el('button', '', T('打开训练面板', 'Open the training panel')); ob.style.marginTop = '6px'; ob.onclick = openTrain; b.c.appendChild(ob);

    /* Watch it learn */
    const WL = YX.watchLearn, cs = WL && info.models ? WL.contenders(info) : [], lanes = WL ? WL.lanes.length : 0, can = cs.length > 1, w = card('Watch it learn', lanes ? T(lanes + ' 条车道', lanes + ' lanes') : can ? T('可以对比', 'ready') : T('需要先训练', 'needs training'), lanes || can ? 'on' : 'off');
    line(w.c, T('把同一句话交给基础模型和你训练出的每一轮，各建在街上一条车道里，边走边比。', 'Gives one sentence to the base model and every epoch you trained, builds each answer in its own lane on the street, and you walk along them to compare.'), 'dim');
    if (can) line(w.c, T('现在可比：', 'Ready to compare: ') + cs.map((c) => c.short).join(' · '), 'good'); else { const s = el('ol'); s.className = 'steps'; for (const t of [T('先训练一次（上面）', 'Train once (above)'), T('点“打开”，输入一句话', 'Press Open, type a sentence'), T('点 Watch it learn，沿街往右走', 'Press Watch it learn, walk right along the street')]) s.appendChild(el('li', '', t)); w.c.appendChild(s); }
    const ow = el('button', '', T('打开', 'Open')); ow.style.marginTop = '4px'; ow.onclick = openTrain; w.c.appendChild(ow);
    if (lanes && WL.clear) { const cl = el('button', '', T('清除车道', 'Clear lanes')); cl.className = 'ghost'; cl.style.cssText += ';margin-left:6px;margin-top:4px'; cl.onclick = () => { WL.clear(); paint(); }; w.c.appendChild(cl); }

    /* Replay it */
    const R = YX.replay, rc = card('Replay it', R && R.rec ? T('录制中', 'recording') : T('待机', 'idle'), R && R.rec ? 'busy' : '');
    line(rc.c, T('录下按住说话、模型生成、Look & Fix 检查的全过程，最后绕一圈。没有时间限制，按 Esc 结束。', 'Films the hold-to-talk, the build and the Look & Fix check from start to end, then one lap. No time limit; Esc stops it.'), 'dim');
    const rb = el('button', '', R && R.rec ? T('结束并环绕', 'Finish with a lap') : T('● 开始录制', '● Start recording')); rb.style.marginTop = '6px'; rb.onclick = () => { toggle(); if (R) (R.rec ? R.finish() : R.start()); }; rc.c.appendChild(rb);
  }
  build(); H.toggle = toggle; H.paint = paint;
})();
