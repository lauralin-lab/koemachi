/* Koemachi · Replay it: film the whole story of a request, with Tinker's part in it written on the picture, and end with one lap around the result.
   Press ● Replay it, then talk to the town as usual (hold Space), or run Watch it learn. Every frame of the 3D view is drawn onto a 16:9 canvas together with
   what the model is doing (your sentence, the model in use, "Inkling is building…", Look & Fix's note, the names above the lanes of Watch it learn), and that
   canvas is recorded, with your microphone if you allow it. When the work has been quiet for a moment (or you press Esc) the camera orbits the result once,
   then the clip is finished and opens like any other clip (film.js). Nothing leaves your computer. */
'use strict';
(function () {
  const YX = window.YX, T = YX.T, W = YX.world, M = YX.mind, U = YX.ui, $ = (id) => document.getElementById(id);
  const SIZE = [1280, 720], QUIET_S = 3, LAP_S = 8; // no time limit: the film runs until you stop it
  const R = (YX.replay = { rec: null, entries: [], lastMs: 0, autoStop: false });
  const canvas = YX.three.renderer.domElement;
  let btn = null, model = { label: '', base: '' };

  /* ---------- what the model is doing, as the picture's captions ---------- */
  const prevLog = YX.hooks.log; YX.hooks.log = function (e) { if (R.rec && e && !R.entries.includes(e)) R.entries.push(e); if (prevLog) return prevLog.apply(this, arguments); };
  const clip = (ctx, s, w) => { s = String(s || ''); while (s.length > 3 && ctx.measureText(s).width > w) s = s.slice(0, -2); return s; };
  { const sp = $('spellText'); if (sp && window.MutationObserver) new MutationObserver(() => { R.spellTick = performance.now(); }).observe(sp, { childList: true, characterData: true, subtree: true }); } // the page rewrites its caption on every partial and every final, even when the words are the same
  { const mc = $('mic'); if (mc && window.MutationObserver) new MutationObserver(() => { const on = mc.classList.contains('on'); if (on && !R.micOn) R.micT0 = performance.now(); R.micOn = on; gate(on); }).observe(mc, { attributes: true, attributeFilter: ['class'] }); } // the moment a hold begins, exactly
  function spoken() { // the sentence as the town shows it while you hold Space (the page hides that caption in film mode, so it is read here and drawn into the picture)
    const el = $('spellText'), on = el && /\bon\b/.test(el.className); let t = '';
    if (on) { const c = el.cloneNode(true); c.querySelectorAll('.seal').forEach((x) => x.remove()); t = c.textContent.trim(); }
    if (t && !R.gotWords && R.holdT0 && !(R.spellTick >= R.holdT0)) t = ''; // the page's caption of the PREVIOUS sentence is still fading: only a caption written since this hold began counts (a recognizer that answers once, after you let go, still counts)
    if (t) { R.said = t; R.gotWords = true; R.saidDone = /\bdone\b/.test(el.className); }
    return t;
  }
  const listening = () => { const m = $('mic'); return !!(m && m.classList.contains('on')); };
  function lines() { // up to four short lines, newest work last
    const out = [], e = R.entries[R.entries.length - 1], live = $('liveMsg');
    const said = spoken() || R.said || (listening() ? '' : (M && M.said) || '');
    if (said) out.push({ k: 'say', t: (listening() ? '🎙 ' : '“') + said + (listening() ? '…' : '”') });
    else if (listening()) out.push({ k: 'say', t: T('🎙 聆听中…', '🎙 Listening…') });
    if (!e && live && live.textContent.trim()) out.push({ k: 'ai', t: live.textContent.trim() });
    if (e) { const st = e.status === 'run' ? T('进行中', 'working') : e.status === 'ok' ? T('完成', 'done') : T('没成功', 'did not work'); out.push({ k: 'ai', t: (e.tier === 'invent' ? 'Inkling · ' : e.tier === 'quick' || e.tier === 'local' ? (e.tier === 'local' ? T('内置语法 · ', 'built-in grammar · ') : 'Inkling · ') : '') + st + (e.msgs && e.msgs.length ? ' · ' + String(e.msgs[e.msgs.length - 1]).replace(/\s+/g, ' ') : '') }); }
    const lf = $('lfBox'); if (lf && lf.textContent.trim()) out.push({ k: 'lf', t: 'Look & Fix · ' + Array.from(lf.children).map((d) => { const c = d.cloneNode(true); c.querySelectorAll('button,a').forEach((x) => x.remove()); return c.textContent.trim(); }).filter(Boolean).slice(-1)[0] });
    if (R.rec && R.rec.final) out.push({ k: 'lap', t: T('最后一圈', 'One last lap') });
    return out.slice(-4);
  }
  function project(x, y, z) { const cam = YX.three.camera, v = project.v || (project.v = new window.THREE.Vector3()); v.set(x, y, z).project(cam); return v.z > 1 || v.z < -1 ? null : [(v.x * 0.5 + 0.5) * SIZE[0], (-v.y * 0.5 + 0.5) * SIZE[1]]; }
  function pill(g, text, x, y, o) {
    o = o || {}; g.font = '600 ' + (o.size || 22) + 'px system-ui, -apple-system, sans-serif'; const w = Math.min(o.max || 900, g.measureText(text).width + 28), h = (o.size || 22) + 16;
    g.fillStyle = o.bg || 'rgba(14,16,20,.72)'; g.beginPath(); (g.roundRect ? g.roundRect(x - (o.center ? w / 2 : 0), y - h, w, h, h / 2) : g.rect(x - (o.center ? w / 2 : 0), y - h, w, h)); g.fill();
    g.fillStyle = o.fg || '#fff'; g.textBaseline = 'middle'; g.textAlign = o.center ? 'center' : 'left'; g.fillText(clip(g, text, w - 28), x + (o.center ? 0 : 14), y - h / 2 + 1);
  }
  /* what Look & Fix looks at: the picture it renders off screen and shows the model, with a scan line while the model is looking and its verdict after */
  const scan = (R.scan = { img: null, t0: 0, phase: '', round: 0, text: '', until: 0 });
  const LFx = YX.lookFix; if (LFx) { const prevLook = LFx.onLook; LFx.onLook = function (e) { if (R.rec && e) { const now = performance.now();
    if (e.phase === 'look') { scan.img = new Image(); scan.img.src = 'data:image/jpeg;base64,' + e.b64; scan.phase = 'look'; scan.t0 = now; scan.round = e.round || 0; scan.text = ''; scan.until = now + 120000; }
    else if (e.phase === 'verdict') { scan.phase = 'verdict'; scan.t0 = now; scan.text = e.match ? '✓ ' + T('看起来没问题', 'Looks right') : '⚠ ' + (e.problems && e.problems.length ? e.problems.join('; ') : T('有问题', 'Something is off')); scan.ok = !!e.match; scan.until = now + 5000; }
    paintScan(); }
    if (prevLook) return prevLook.apply(this, arguments); }; }
  const scanOn = () => R.rec && !R.rec.final && scan.img && performance.now() < scan.until;
  let scanBox = null;
  function paintScan() { // the same card on your screen (not in the film): the picture, a scan line, the verdict
    if (!scanBox) { scanBox = document.createElement('div'); scanBox.id = 'swScan'; scanBox.innerHTML = '<div class="h"></div><div class="p"><img alt=""><i></i></div><div class="t"></div>'; document.body.appendChild(scanBox); }
    const on = scanOn(); scanBox.classList.toggle('on', !!on); if (!on) return;
    const img = scanBox.querySelector('img'); if (img.src !== scan.img.src) img.src = scan.img.src;
    scanBox.className = 'on ' + scan.phase + (scan.ok ? ' ok' : ''); scanBox.querySelector('.h').textContent = scan.phase === 'look' ? '🔍 ' + T('Inkling 正在检查', 'Inkling is looking at it') + (scan.round ? ' · ' + T('第 ' + (scan.round + 1) + ' 次', 'again') : '') : 'Look & Fix'; scanBox.querySelector('.t').textContent = scan.text;
  }
  function drawScan(g) {
    if (!scanOn() || !scan.img.complete || !scan.img.naturalWidth) return; const W0 = 300, x = SIZE[0] - 24 - W0, y = 104, h = Math.round(W0 * scan.img.naturalHeight / scan.img.naturalWidth), now = performance.now();
    g.save(); g.fillStyle = 'rgba(14,16,20,.82)'; g.beginPath(); (g.roundRect ? g.roundRect(x - 10, y - 46, W0 + 20, h + 100, 14) : g.rect(x - 10, y - 46, W0 + 20, h + 100)); g.fill();
    g.fillStyle = '#fff'; g.font = '600 18px system-ui, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(clip(g, scan.phase === 'look' ? '🔍 ' + T('Inkling 正在检查', 'Inkling is looking at it') : 'Look & Fix', W0), x, y - 24);
    g.drawImage(scan.img, x, y, W0, h);
    if (scan.phase === 'look') { const k = ((now - scan.t0) % 1400) / 1400, ly = y + (k < 0.5 ? k * 2 : 2 - k * 2) * h; const gr = g.createLinearGradient(0, ly - 26, 0, ly + 4); gr.addColorStop(0, 'rgba(80,220,120,0)'); gr.addColorStop(1, 'rgba(80,220,120,.55)'); g.fillStyle = gr; g.fillRect(x, ly - 26, W0, 30); g.fillStyle = 'rgba(150,255,180,.95)'; g.fillRect(x, ly, W0, 2.5); g.strokeStyle = 'rgba(150,255,180,.9)'; g.lineWidth = 2; g.strokeRect(x, y, W0, h); }
    if (scan.text) { g.fillStyle = scan.ok ? '#8be0a4' : '#ffd27a'; g.font = '600 17px system-ui, sans-serif'; g.fillText(clip(g, scan.text, W0), x, y + h + 26); }
    g.restore();
  }
  function paintFrame() {
    const r = R.rec; if (!r) return; const g = r.g;
    g.fillStyle = '#000'; g.fillRect(0, 0, SIZE[0], SIZE[1]); try { g.drawImage(canvas, 0, 0, SIZE[0], SIZE[1]); } catch (e) {}
    const secs = (performance.now() - r.t0) / 1000;
    pill(g, 'Tinker · ' + (model.label || model.base || 'Inkling'), 24, 62, { size: 20, bg: 'rgba(40,110,60,.82)' });
    pill(g, '● ' + Math.floor(secs / 60) + ':' + String(Math.floor(secs % 60)).padStart(2, '0'), SIZE[0] - 24 - 100, 62, { size: 20 });
    const WL = YX.watchLearn; if (WL && WL.lanes.length) for (const l of WL.lanes) { if (!l.anchor) continue; const p = project(l.anchor.x, (l.anchor.y || 0) + 3.4, l.anchor.z); if (p) pill(g, l.c.short + (l.c.nll != null ? ' · loss ' + (+l.c.nll).toFixed(2) : ''), p[0], p[1], { size: 24, center: true }); }
    drawScan(g);
    const ls = lines(); let y = SIZE[1] - 28; for (let i = ls.length - 1; i >= 0; i--) { const l = ls[i]; pill(g, l.t, 24, y, { size: l.k === 'say' ? 26 : 21, max: SIZE[0] - 48, bg: l.k === 'ai' ? 'rgba(40,110,60,.82)' : l.k === 'lf' ? 'rgba(120,86,20,.84)' : l.k === 'lap' ? 'rgba(14,16,20,.9)' : 'rgba(14,16,20,.72)' }); y -= (l.k === 'say' ? 26 : 21) + 24; }
  }
  R.captions = () => lines().map((l) => l.t);
  R.sample = () => { const r = R.rec; if (!r) return null; const d = r.g.getImageData(0, 0, SIZE[0], SIZE[1] - 140).data; let lum = 0, lit = 0; for (let i = 0; i < d.length; i += 4 * 97) { const v = d[i] + d[i + 1] + d[i + 2]; lum += v; if (v > 30) lit++; } return { avg: Math.round(lum / (d.length / (4 * 97)) / 3), lit }; };

  /* ---------- the microphone is open only while you hold (Space or the 🎙 button), so the room around you is not in the film ---------- */
  let gateT = 0;
  function micSet(v) { const r = R.rec; if (!r || !r.mic) return; for (const t of r.mic.getAudioTracks()) t.enabled = v; r.micOpen = v; }
  function gate(open) { if (!R.rec || !R.rec.mic) return; clearTimeout(gateT); if (open) micSet(true); else gateT = setTimeout(() => micSet(false), 700); } // a short tail, so the end of a sentence is not cut
  R.gate = gate;
  window.addEventListener('keydown', (e) => { if (R.rec && e.code === 'Space' && !e.repeat && !/^(INPUT|TEXTAREA)$/.test((e.target && e.target.tagName) || '')) gate(true); }, true);
  window.addEventListener('keyup', (e) => { if (R.rec && e.code === 'Space') gate(false); }, true);

  /* ---------- recording ---------- */
  const mimes = (audio) => (audio ? ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'] : ['video/mp4;codecs=avc1.640028', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']);
  const pick = (audio) => mimes(audio).find((m) => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || '';
  const busy = () => (M && M.active && M.active.size > 0) || (YX.lookFix && YX.lookFix.busy > 0) || (YX.watchLearn && YX.watchLearn.busy);
  async function start() {
    if (R.rec) return finish();
    if (YX.filmBusy && YX.filmBusy()) return U.toast(T('正在录别的片子', 'Another clip is being recorded'));
    if (typeof MediaRecorder === 'undefined' || !canvas.captureStream) return U.toast(T('这个浏览器不支持录制', 'This browser cannot record'));
    let mic = null; try { mic = await Promise.race([navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }), new Promise((ok) => setTimeout(() => ok(null), 6000))]); } catch (e) { mic = null; } // no microphone, no permission or no answer: a silent film
    try { const c = await (await fetch('/__config', { cache: 'no-store' })).json(); model = { base: c.model || '', label: c.active ? c.active.label : (c.model || '').replace(/^.*\//, '') + ' · ' + T('基础', 'base') }; } catch (e) {}
    const comp = document.createElement('canvas'); comp.width = SIZE[0]; comp.height = SIZE[1]; const g = comp.getContext('2d', { willReadFrequently: true });
    U.closePops(); YX.filmFrame(SIZE); document.body.classList.add('cinema'); R.entries = []; R.said = ''; R.saidDone = false; scan.until = 0;
    await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
    const stream = comp.captureStream(30); let msrc = null, mixed = false, ac = YX.audio && YX.audio.ctx();
    if (ac) { try { if (ac.state === 'suspended') await ac.resume(); const dest = ac.createMediaStreamDestination(); if (mic) { msrc = ac.createMediaStreamSource(mic); msrc.connect(dest); } YX.audio.tap = dest; for (const t of dest.stream.getAudioTracks()) stream.addTrack(t); mixed = true; } catch (e) { ac = null; msrc = null; YX.audio.tap = null; } } // your voice and the town's own sounds, mixed into one track
    if (!mixed && mic) for (const t of mic.getAudioTracks()) stream.addTrack(t);
    if (mic) for (const t of mic.getAudioTracks()) t.enabled = false; // closed until you hold
    const mime = pick(!!mic || mixed); let mr; try { mr = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 6e6 } : undefined); } catch (e) { cleanup(mic); return U.toast(T('录制没能启动', 'Recording could not start')); }
    const rec = (R.rec = { mr, mic, msrc, town: mixed, comp, g, chunks: [], t0: performance.now(), type: (mr.mimeType || mime || 'video/webm').split(';')[0], seen: false, quiet: 0, final: false, raf: 0, last: performance.now() });
    mr.ondataavailable = (e) => { if (e.data && e.data.size) rec.chunks.push(e.data); }; mr.onstop = () => done(rec);
    mr.start(1000); paintBtn();
    const loop = () => { if (R.rec !== rec) return; rec.raf = requestAnimationFrame(loop); paintFrame(); tick(rec); };
    rec.iv = setInterval(() => { if (R.rec === rec) { paintHeard(!rec.final); paintScan(); } }, 120); loop();
    U.toast(mic ? T('开始录制，没有时间限制。只在你按住空格或 🎙 时才录你的声音。想结束就按 Esc，我会绕它一圈', 'Recording, no time limit. Your microphone is on only while you hold Space or 🎙. Press Esc to stop, and I take one lap around it') : T('开始录制（没有麦克风声音），没有时间限制。按 Esc 结束', 'Recording (no microphone), no time limit. Esc to stop'));
  }
  /* what you see while recording: the page hides its own caption in film mode, so this strip says whether you were heard (it is on your screen only, not in the film) */
  let heard = null, hold = null;
  function holdBtn(on) { // the page's own mic button is hidden (and cannot be pressed) in film mode, so a press there fell through to the 3D view and aimed it: this one stands in for it
    if (!hold) {
      hold = document.createElement('button'); hold.id = 'swHold'; hold.type = 'button'; hold.textContent = '🎙'; document.body.appendChild(hold);
      const mic = () => $('mic'), fire = (t) => { const m = mic(); if (m) m.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, pointerType: 'mouse' })); };
      hold.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); try { hold.setPointerCapture(e.pointerId); } catch (x) {} hold.classList.add('down'); gate(true); fire('pointerdown'); });
      for (const t of ['pointerup', 'pointercancel']) hold.addEventListener(t, (e) => { e.stopPropagation(); hold.classList.remove('down'); gate(false); fire('pointerup'); });
      hold.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    hold.title = T('按住说话（也可以按住空格）', 'Hold to talk (or hold Space)'); hold.classList.toggle('on', !!on);
  }
  function paintHeard(on) {
    holdBtn(on);
    const lis = on && listening(); // a new hold starts clean (the last sentence must not look like this one), and a hold that heard nothing says so
    if (lis && !R.wasListening) { R.endT = 0; R.holdT0 = R.micT0 || performance.now(); R.said = ''; R.saidDone = false; R.gotWords = false; R.miss = 0; }
    if (!lis && R.wasListening) R.endT = performance.now();
    if (R.endT && !R.gotWords && performance.now() - R.endT > 1500) { R.miss = R.miss || R.endT; R.endT = 0; } // 1.5 s of grace: some recognizers answer a moment after you let go
    R.wasListening = lis;
    if (!heard) { heard = document.createElement('div'); heard.id = 'swHeard'; document.body.appendChild(heard); }
    if (!on) { heard.className = ''; return; }
    const ls = lines(), say = ls.find((l) => l.k === 'say'), listen = listening(); let t, k;
    if (listen) { t = '🎙 ' + T('在听…', 'Listening…') + (R.said ? ' ' + R.said : ''); k = 'listen'; }
    else if (R.miss && !R.gotWords && performance.now() - R.miss < 5000) { t = '⚠ ' + T('没听清，再按住说一遍', 'Did not catch that: hold and say it again'); k = 'miss'; }
    else if (say && R.saidDone) { t = '✓ ' + T('听到了：', 'Heard: ') + say.t; k = 'ok'; }
    else if (say) { t = say.t; k = 'ok'; }
    else { t = T('按住 🎙 或空格说话', 'Hold 🎙 or Space and talk'); k = 'idle'; }
    heard.textContent = t; heard.className = 'on ' + k;
  }
  function tick(rec) { // hud, the quiet that ends the story, the time limit
    const now = performance.now(), dt = (now - rec.last) / 1000; rec.last = now; const secs = (now - rec.t0) / 1000, hud = $('cine'); if (hud) hud.textContent = 'REPLAY ' + Math.floor(secs) + 's' + (rec.final ? T(' · 最后一圈', ' · last lap') : T(' · 按 Esc 结束', ' · Esc to stop'));
    if (rec.final) return;
    if (busy()) { rec.seen = true; rec.quiet = 0; } else rec.quiet += dt;
    if (R.autoStop && rec.seen && rec.quiet >= QUIET_S) finish(); // off by default: a build can take a minute and has pauses; the film ends when you press the button or Esc
  }
  function target() { // what the last lap goes around: the middle lane of Watch it learn, else what was just built, else what was last touched
    const WL = YX.watchLearn; if (WL && WL.lanes.length) { const l = WL.lanes[Math.floor(WL.lanes.length / 2)], o = l && l.ids.map((id) => W.objs.get(id)).find((x) => x && !x.dead); if (o) return o; }
    if (YX.lastBuilt) { const l = Array.from(W.objs.values()).filter((o) => o.type === YX.lastBuilt && !o.dead); if (l.length) return l[l.length - 1]; }
    const f = W.focusId != null ? W.objs.get(W.focusId) : null; return f && !f.dead && f.type !== '__pending' ? f : null;
  }
  function finish() {
    const rec = R.rec; if (!rec || rec.final) return; rec.final = true; paintBtn();
    const tg = target(), lap = R.lapS || LAP_S; let went = false;
    if (tg && YX.startMove) { // a higher view: rise smoothly above the result first, then go round it looking down
      try {
        YX.cineStop(); const f = YX.poseNow(), want = Math.max(7, (tg.y || 0) + (tg.size ? tg.size[1] : 3) * 0.9 + 6), up = want - f.y, crane = R.craneS != null ? R.craneS : 2.5;
        const orbit = () => { try { YX.cineStop(); return YX.startMove('orbit', tg, { dur: lap, deg: 360, amount: 1.5 }, () => setTimeout(() => stop(rec), 400)); } catch (e) { return false; } };
        went = up > 1 ? YX.startMove('crane', tg, { dur: crane, amount: up }, orbit) : orbit(); if (up > 1 && !went) went = orbit();
      } catch (e) { went = false; }
    }
    if (!went) setTimeout(() => stop(rec), 300);
    else setTimeout(() => stop(rec), (lap * 3 + 12) * 1000); // a slow machine may never finish the lap: the film ends anyway
  }
  function stop(rec) { if (R.rec !== rec || rec.stopping) return; rec.stopping = true; rec.secs = (performance.now() - rec.t0) / 1000; cancelAnimationFrame(rec.raf); try { rec.mr.stop(); } catch (e) { done(rec); } }
  function cleanup(mic, rec) { if (rec) { clearInterval(rec.iv); clearTimeout(gateT); scan.until = 0; paintScan(); try { if (YX.audio) YX.audio.tap = null; if (rec.msrc) rec.msrc.disconnect(); } catch (e) {} } paintHeard(false); if (mic) for (const t of mic.getTracks()) t.stop(); document.body.classList.remove('cinema'); YX.filmFrame(null); const hud = $('cine'); if (hud) hud.textContent = ''; }
  function done(rec) {
    if (R.rec !== rec) return; R.rec = null; cleanup(rec.mic, rec); paintBtn();
    const blob = new Blob(rec.chunks, { type: rec.type }); R.lastMs = Math.round(rec.secs * 1000);
    if (!blob.size) return U.toast(T('没有录到画面', 'Nothing was recorded'));
    const d = new Date(), p2 = (v) => String(v).padStart(2, '0'); R.last = { size: blob.size, secs: rec.secs, type: rec.type, audio: !!rec.mic, townSound: !!rec.town };
    if (YX.filmTake) YX.filmTake(blob, rec.type, rec.secs, '', 'koemachi-replay-' + p2(d.getHours()) + p2(d.getMinutes()) + p2(d.getSeconds()));
  }
  window.addEventListener('keydown', (e) => { if (R.rec && e.code === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(); } }, true);

  /* ---------- the button ---------- */
  function paintBtn() { if (!btn) return; const on = !!R.rec; btn.textContent = on ? (R.rec.final ? T('收尾中…', 'Finishing…') : T('■ 结束并环绕', '■ Finish with a lap')) : T('● 回放', '● Replay it'); btn.classList.toggle('on', on); btn.disabled = on && R.rec.final; }
  const st = document.createElement('style'); st.textContent = '#swReplayBtn{position:fixed;left:10px;bottom:74px;z-index:4;padding:5px 10px;border:0;border-radius:6px;background:rgba(14,16,20,.7);color:#fff;font:600 11px/1.2 var(--f-ui,system-ui);cursor:pointer}#swReplayBtn:hover,#swReplayBtn.on{background:rgba(190,50,40,.88)}#swReplayBtn:disabled{opacity:.6;cursor:default}#swTrain{bottom:104px!important}#swHeard{position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:9;max-width:min(860px,90vw);padding:9px 18px;border-radius:999px;font:600 18px/1.3 var(--f-ui,system-ui);color:#fff;background:rgba(14,16,20,.82);pointer-events:none;display:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#swScan{position:fixed;right:24px;top:96px;width:300px;z-index:9;padding:10px;border-radius:14px;background:rgba(14,16,20,.84);color:#fff;font:600 14px/1.35 var(--f-ui,system-ui);display:none;pointer-events:none}#swScan.on{display:block}#swScan .p{position:relative;overflow:hidden;border-radius:8px;margin:8px 0 6px}#swScan img{display:block;width:100%}#swScan i{display:none;position:absolute;left:0;right:0;top:0;height:3px;background:#96ffb4;box-shadow:0 0 18px 8px rgba(80,220,120,.5);animation:swscan 1.4s ease-in-out infinite alternate}#swScan.look i{display:block}#swScan.look .p{outline:2px solid #96ffb4}#swScan .t{color:#ffd27a}#swScan.ok .t{color:#8be0a4}@keyframes swscan{from{top:0}to{top:calc(100% - 3px)}}#swHeard.on{display:block}#swHold{position:fixed;left:50%;bottom:116px;transform:translateX(-50%);z-index:10;width:60px;height:60px;border-radius:50%;border:0;background:rgba(14,16,20,.82);color:#fff;font-size:26px;cursor:pointer;display:none;touch-action:none;user-select:none}#swHold.on{display:block}#swHold:hover{background:rgba(40,110,60,.9)}#swHold.down{background:rgba(190,50,40,.95);transform:translateX(-50%) scale(1.1)}#swHeard.listen{background:rgba(190,50,40,.9)}#swHeard.miss{background:rgba(150,100,20,.95)}#swHeard.ok{background:rgba(40,110,60,.9)}';
  document.head.appendChild(st); btn = document.createElement('button'); btn.id = 'swReplayBtn'; btn.title = T('录下整个过程：画面、模型在做什么、你的声音，最后绕它一圈', 'Film the whole story: the picture, what the model is doing, your voice, and a lap around the result'); btn.onclick = start; document.body.appendChild(btn); paintBtn();
  R.start = start; R.finish = finish;
})();
