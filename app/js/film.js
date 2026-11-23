/* Spoken World · film: record a 16:9 clip of the world and play it back. */
'use strict';
(function () {
  const YX = window.YX, W = YX.world, T = YX.T, U = YX.ui, $ = (id) => document.getElementById(id);
  const LIMIT = 10, SIZE = [1280, 720]; // seconds an uploaded source video may run; the frame every clip is recorded at
  const canvas = YX.three.renderer.domElement, cine = $('cine');
  let mr = null, chunks = [], t0 = 0, tick = 0, cap = 0, mode = '', clip = null;
  const fmt = (s) => { s = Math.max(0, s); return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') + '.' + Math.floor((s * 10) % 10); };


  /* ---------- recording ---------- */
  const pickMime = () => ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } });
  const planned = () => W.shots.reduce((a, s) => a + YX.shotDur(s), 0);
  YX.filmLive = () => !!mr && (mode === 'live' || mode === 'move');
  function hud() { if (!mr) return; const s = (performance.now() - t0) / 1000; cine.textContent = 'REC ' + fmt(s) + ' / ' + fmt(cap) + (mode === 'live' ? T(' · 按 R 或 Esc 结束', ' · R or Esc to finish') : T(' · Esc 结束', ' · Esc to finish')); }
  let recTitle = null; // what the clip being recorded is a recording of: the name of the shot, or nothing for a take by hand
  function start(m, move) {
    if (mr) return stop();
    recTitle = m === 'shots' ? T('全部镜头', 'All shots') : (move && move.title) || null;
    if (!canvas.captureStream || typeof MediaRecorder === 'undefined') return U.toast(T('这个浏览器不支持录制', 'This browser cannot record'));
    if (m === 'shots' && !W.shots.length) return U.toast(T('还没有机位。先存一个，或者用“实时录制”', 'No shots yet. Save one first, or use “Record live”'));
    if (YX.playing) return;
    const mime = pickMime(); U.closePops(); YX.filmFrame(SIZE); mode = m; chunks = [];
    cap = m === 'shots' ? Math.min(LIMIT, planned() + 0.3) : m === 'move' ? Math.min(LIMIT, move.dur + 0.5) : LIMIT;
    // one frame later the canvas has its new size: only then is the stream the right shape
    requestAnimationFrame(() => requestAnimationFrame(() => {
      try { mr = new MediaRecorder(canvas.captureStream(30), mime ? { mimeType: mime, videoBitsPerSecond: 12e6 } : undefined); } catch (e) { mr = null; YX.filmFrame(null); return U.toast(T('录制没能启动', 'Recording could not start')); }
      const type = (mr.mimeType || mime || 'video/webm').split(';')[0];
      mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = () => finish(type);
      try { mr.start(250); } catch (e) { mr = null; YX.filmFrame(null); return U.toast(T('录制没能启动', 'Recording could not start')); }
      t0 = performance.now(); cine.classList.add('rec'); paint();
      if (m === 'shots') { if (!YX.playShots({ onDone: () => setTimeout(stop, 250) })) stop(); }
      else if (m === 'move') { document.body.classList.add('cinema'); if (!move.run(() => setTimeout(stop, 280))) stop(); } // the camera move itself decides when the clip ends
      else { document.body.classList.add('cinema'); U.toast(T('开始录了：现在怎么走，片子就怎么拍。最长 ' + LIMIT + ' 秒', 'Recording: the clip is whatever you do now, up to ' + LIMIT + ' s')); }
      tick = setInterval(() => { hud(); if ((performance.now() - t0) / 1000 >= cap) stop(); }, 100); hud();
    }));
    return true;
  }
  function stop() {
    if (!mr) return; clearInterval(tick); tick = 0;
    const r = mr; mr = null; r._secs = (performance.now() - t0) / 1000; lastSecs = r._secs;
    try { r.stop(); } catch (e) { finish('video/webm'); }
    if (YX.playing) YX.stopPlay();
    if (mode === 'move' && YX.cine && YX.cine.active) YX.cineStop();
  }
  let lastSecs = 0;
  YX.filmStop = stop;
  YX.filmRun = function (dur, run, title) { if (mr || YX.playing) return false; return start('move', { dur: Math.min(LIMIT, Math.max(1, +dur || 8)), run, title: title || null }) === true; }; // record while something flies the camera
  YX.filmLiveStart = function () { if (mr || YX.playing) return false; return start('live') === true; };
  YX.filmShot = function (i) { const s = W.shots[i]; if (!s || mr || YX.playing) return false; return YX.filmRun(YX.shotDur(s), (done) => YX.playShot(i, done), s.name); };
  YX.filmBusy = () => !!mr;
  /* a camera move and its recording as one action: "orbit this house and record it" */
  YX.filmMove = function (m, tg, op) { if (mr || YX.playing) return false; return start('move', { dur: +op.dur || 8, title: op.title || null, run: (done) => YX.startMove(m, tg, op, done) }) || YX.startMove(m, tg, op); };
  YX.filmLast = function () {
    let s = null; for (let i = W.shots.length - 1; i >= 0 && !s; i--) if (W.shots[i].move) s = W.shots[i];
    if (!s || mr || YX.playing) return false;
    YX.cineStop(); Object.assign(W.player, { x: s.x, y: s.y, z: s.z, yaw: s.yaw, pitch: s.pitch, lens: s.lens || 0, fly: s.y > 1.95 }); YX.snapFov();
    const op = Object.assign({}, s.move); op.dur = Math.min(10, Math.max(2, +op.dur || 8)); if (s.move.type === 'orbit' && op.deg == null) op.deg = 150;
    return YX.filmMove(s.move.type, s.move.target != null ? W.objs.get(s.move.target) || null : null, op);
  };
  function finish(type) {
    cine.classList.remove('rec'); if (mode === 'live' || mode === 'move') { document.body.classList.remove('cinema'); cine.textContent = ''; }
    YX.filmFrame(null);
    const blob = new Blob(chunks, { type }); chunks = [];
    if (!blob.size) { paint(); return U.toast(T('没有录到画面', 'Nothing was recorded')); }
    const d = new Date(), p2 = (v) => String(v).padStart(2, '0'), stem = 'spoken-world-clip-' + p2(d.getHours()) + p2(d.getMinutes()) + p2(d.getSeconds()), ext = type === 'video/mp4' ? '.mp4' : '.webm';
    clip = { blob, url: URL.createObjectURL(blob), name: stem + ext, secs: lastSecs, stem, type, tiles: 1, title: recTitle };
    clips.unshift(clip); while (clips.length > 8) { const old = clips.pop(); try { URL.revokeObjectURL(old.url); } catch (e) {} }
    U.togglePanel('director', 'bDir', true); paint(); showClip(clip); // the film is on screen the moment it exists
    if (U.canSave()) saveClip(clip);
  }
  const clips = []; // what was recorded in this session, newest first
  YX.filmTake = function (blob, type, secs, note, stem, opt) { // a clip recorded by something else (the three-camera rig) joins the list, opens and is saved like any other; opt.tiles: pictures side by side
    const ext = type === 'video/mp4' ? '.mp4' : '.webm', c = { blob, url: URL.createObjectURL(blob), name: stem + ext, secs: +secs || 0, stem, type, tiles: (opt && opt.tiles) || 1 };
    clip = c; clips.unshift(c); while (clips.length > 8) { const old = clips.pop(); try { URL.revokeObjectURL(old.url); } catch (e) {} }
    U.togglePanel('director', 'bDir', true); paint(); showClip(c); if (U.canSave()) saveClip(c);
  };
  function saveClip(c) { if (!U.canSave()) return U.toast(T('这个窗口不能保存文件', 'This window cannot save files')); U.save({ filename: c.name, data: c.blob }).then(() => U.toast(T('已保存 ' + c.name, 'Saved ' + c.name)), () => U.toast(T('没能保存 ' + c.name, 'Could not save ' + c.name))); }
  function showClip(c) { setPane(c.blob, c.name); note(T('你的片子 · ' + c.secs.toFixed(1) + ' 秒', 'Your clip · ' + c.secs.toFixed(1) + ' s')); open(); vA.addEventListener('loadeddata', () => { if (cmp.classList.contains('on')) play(); }, { once: true }); }
  function paintClips() {
    const L = $('clipList'); if (!L) return; L.textContent = ''; { const cap = L.previousElementSibling; if (cap && cap.classList.contains('fhint')) cap.style.display = clips.length ? '' : 'none'; }
    if (!clips.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = T('录好的片子会出现在这里，并立刻打开播放。', 'What you record appears here and opens straight away.'); L.appendChild(e); return; }
    clips.forEach((c, i) => { const d = document.createElement('div'); d.className = 'scard'; d.innerHTML = '<button class="th" type="button"><video muted playsinline preload="metadata"></video><span class="pl">▶</span><span class="d"></span></button><div class="meta"><span class="nm"></span><button class="mini" type="button">⤓</button></div>';
      const th = d.children[0], v = th.children[0]; v.src = c.url + '#t=0.1'; th.children[2].textContent = c.secs.toFixed(1) + 's'; th.title = T('播放', 'Play'); th.onclick = () => showClip(c);
      { const nm = d.children[1].children[0]; nm.textContent = c.title || (c.tiles > 1 ? T(c.tiles + ' 个机位', c.tiles + ' cameras') : T('手持录制 ', 'By hand ') + (clips.length - i)); nm.title = c.title ? T('镜头“' + c.title + '”录成的视频', 'Video recorded from the shot “' + c.title + '”') : c.tiles > 1 ? T('固定机位同时录的视频', 'Video recorded by the standing cameras') : T('你自己走位时录的视频', 'Video recorded while you moved the camera yourself'); } const dl = d.children[1].children[1]; dl.title = T('再保存一次', 'Save again'); dl.onclick = () => saveClip(c); L.appendChild(d); });
  }
  function paint() {
    const rec = !!mr, sv = $('sVid'), sl = $('sLive'); if (!sv) return; paintClips();
    const rt = $('recT'); if (rt) rt.textContent = rec && mode !== 'shots' ? '' : T('最长 ' + LIMIT + ' 秒', 'up to ' + LIMIT + ' s'); const lb = sl.querySelector('span'); if (lb) lb.textContent = rec && (mode === 'live' || mode === 'move') ? T('停止录制', 'Stop recording') : T('录下我看到的画面', 'Record what I see');
    sv.setAttribute('aria-pressed', String(rec && mode === 'shots')); sl.setAttribute('aria-pressed', String(rec && (mode === 'live' || mode === 'move')));
    sv.disabled = !W.shots.length && !rec;
    const tot = planned(), n = W.shots.length;
    const fd = $('fDur'), over = n && tot > LIMIT, cap = T('连拍只录前 ' + LIMIT + ' 秒', '“Film all” records the first ' + LIMIT + ' s');
    fd.textContent = n ? tot.toFixed(1) + T(' 秒', ' s') : ''; fd.classList.toggle('over', !!over); fd.title = over ? cap : ''; sv.title = over ? cap : '';
  }
  YX.filmPaint = paint;
  $('sVid').onclick = () => start('shots'); $('sLive').onclick = () => start('live');
  for (const b of document.querySelectorAll('#moveRow [data-mv]')) b.onclick = () => { const rec = $('mvRec').getAttribute('aria-pressed') === 'true', r = YX.exec({ op: 'cam', move: b.dataset.mv, rec, instant: true }, YX.newCtx(YX.viewNow())); if (r && r.msg) U.toast(r.msg); };
  $('mvRec').onclick = () => $('mvRec').setAttribute('aria-pressed', String($('mvRec').getAttribute('aria-pressed') !== 'true'));
  /* ---------- the clip player: a recorded clip, played full screen ---------- */
  const cmp = $('cmp'), A = $('cmpA'), vA = A.querySelector('video'), seek = $('cmpSeek');
  let raf = 0, seeking = false;
  const dur = (v) => (isFinite(v.duration) && v.duration > 0 ? v.duration : 0);
  function note(t) { const n = $('cmpNote'); if (n) n.textContent = t || ''; }
  function setPane(file) {
    if (vA._url) URL.revokeObjectURL(vA._url);
    vA._url = URL.createObjectURL(file); vA.src = vA._url; vA.loop = true; vA.muted = true; vA.load(); pause();
    // a clip straight from the recorder may not know its own length yet: seeking far past the end makes the browser work it out
    vA.addEventListener('loadedmetadata', () => { if (!isFinite(vA.duration)) { const back = () => { vA.removeEventListener('timeupdate', back); try { vA.currentTime = 0; } catch (e) {} }; vA.addEventListener('timeupdate', back); try { vA.currentTime = 1e101; } catch (e) {} } }, { once: true });
    if (clip && file === clip.blob) { const own = clip; vA.addEventListener('durationchange', () => { if (clip === own && isFinite(vA.duration) && vA.duration > 0) { own.secs = vA.duration; paint(); } }); }
  }
  function paintTime() { const d = dur(vA); $('cmpTime').textContent = fmt(vA.currentTime) + ' / ' + fmt(d); if (!seeking && d) seek.value = String(Math.round((vA.currentTime / d) * 1000)); }
  function loop() { raf = requestAnimationFrame(loop); paintTime(); }
  function play() { const r = vA.play(); if (r && r.catch) r.catch(() => {}); $('cmpPlay').textContent = T('❚❚ 暂停', '❚❚ Pause'); }
  function pause() { vA.pause(); $('cmpPlay').textContent = T('▶ 播放', '▶ Play'); }
  const playing = () => !vA.paused && !vA.ended;
  function seekTo(f) { const d = dur(vA); if (d) vA.currentTime = Math.min(d - 0.01, f * d); paintTime(); }
  function nudge(dt) { pause(); const d = dur(vA); if (d) seekTo(Math.min(1, Math.max(0, (vA.currentTime + dt) / d))); }
  function open() {
    if (mr) return; U.closePops(); if (document.pointerLockElement) document.exitPointerLock();
    cmp.classList.add('on'); document.body.classList.add('cmp-on'); if (clip && !vA.src) setPane(clip.blob); if (!raf) loop(); $('cmpPlay').focus();
  }
  function close() { pause(); cmp.classList.remove('on'); document.body.classList.remove('cmp-on'); if (raf) cancelAnimationFrame(raf); raf = 0; canvas.focus(); }
  $('cmpX').onclick = close;
  $('cmpPlay').onclick = () => (playing() ? pause() : play());
  seek.addEventListener('input', () => { seeking = true; seekTo(+seek.value / 1000); }); seek.addEventListener('change', () => { seeking = false; });
  window.addEventListener('keydown', (e) => {
    if (!cmp.classList.contains('on')) return;
    if (e.code === 'Escape') { e.preventDefault(); close(); }
    else if (e.code === 'Space' && !/^(BUTTON|INPUT)$/.test((e.target && e.target.tagName) || '')) { e.preventDefault(); playing() ? pause() : play(); }
    else if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') { if (e.target === seek) return; e.preventDefault(); nudge((e.code === 'ArrowLeft' ? -1 : 1) / 24); }
  }, true);
  paint();
})();
