/* 言出法随 · stage: cinematic camera moves, shots (机位), handheld takes, and the starting town */
'use strict';
(function () {
  const YX = window.YX, W = YX.world, DEG = YX.DEG, clamp = YX.clamp, lerp = YX.lerp, cine = YX.cine;
  const num = (v, d) => { v = +v; return isFinite(v) ? v : d; };
  const poseNow = () => { const P = W.player; return { x: P.x, y: P.y, z: P.z, yaw: P.yaw, pitch: P.pitch }; };
  function setPose(p) { const P = W.player, c = YX.three.camera; P.x = p.x; P.y = Math.max(0.4, p.y); P.z = p.z; P.yaw = p.yaw; P.pitch = clamp(p.pitch, -1.5, 1.5); P.vx = P.vz = 0; c.position.set(P.x, P.y, P.z); c.rotation.set(P.pitch, P.yaw, 0); }
  const lookAt = (f, tx, ty, tz) => { const dx = tx - f.x, dy = ty - f.y, dz = tz - f.z; return { yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) }; };
  const angLerp = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };
  YX.setPose = setPose; YX.poseNow = poseNow;

  YX.cineStart = function (spec) { cine.active = Object.assign({ t: 0, dur: 2, from: poseNow() }, spec); };
  function cineEnd(finished) { const a = cine.active; cine.active = null; const P = W.player; P.fly = P.y > 1.95; if (a && a.onDone) a.onDone(finished); }
  YX.cineStop = function () { if (cine.active) cineEnd(false); };
  YX.updateCine = function (dt) {
    const a = cine.active; if (!a) return;
    a.t += dt; const k0 = clamp(a.t / a.dur, 0, 1), k = (a.ease || YX.ease.inOut)(k0), f = a.from; let p = { x: f.x, y: f.y, z: f.z, yaw: f.yaw, pitch: f.pitch };
    if (a.type === 'pose') { const t = a.to; p = { x: lerp(f.x, t.x, k), y: lerp(f.y, t.y, k), z: lerp(f.z, t.z, k), yaw: angLerp(f.yaw, t.yaw, k), pitch: lerp(f.pitch, t.pitch, k) }; }
    else if (a.type === 'dolly') { p.x = f.x + a.dx * k; p.y = Math.max(0.5, f.y + a.dy * k); p.z = f.z + a.dz * k; if (a.look) { const l = lookAt(p, a.look[0], a.look[1], a.look[2]); p.yaw = angLerp(f.yaw, l.yaw, Math.min(1, k * 3)); p.pitch = lerp(f.pitch, l.pitch, Math.min(1, k * 3)); } }
    else if (a.type === 'pan') { p.yaw = f.yaw + a.dyaw * k; p.pitch = f.pitch + a.dpitch * k; }
    else if (a.type === 'orbit') { const ang = a.a0 + a.sweep * k; p.x = a.cx + Math.cos(ang) * a.R; p.z = a.cz + Math.sin(ang) * a.R; p.y = f.y + (a.dy || 0) * k; const l = lookAt(p, a.cx, a.cy, a.cz); p.yaw = angLerp(f.yaw, l.yaw, Math.min(1, k0 * 6)); p.pitch = lerp(f.pitch, l.pitch, Math.min(1, k0 * 6)); }
    else if (a.type === 'follow') { const o = a.target; if (!o || o.dead) return cineEnd(false); const hx = Math.sin(o.rot), hz = Math.cos(o.rot), d = a.dist, wx = o.x - hx * d, wz = o.z - hz * d, wy = o.y + a.h, s = 1 - Math.exp(-4 * dt), P = W.player; p.x = lerp(P.x, wx, s); p.y = lerp(P.y, wy, s); p.z = lerp(P.z, wz, s); const l = lookAt(p, o.x, o.y + o.size[1] * 0.6, o.z); p.yaw = angLerp(P.yaw, l.yaw, 1 - Math.exp(-8 * dt)); p.pitch = lerp(P.pitch, l.pitch, 1 - Math.exp(-8 * dt)); }
    else if (a.type === 'fn') p = a.fn(a.t); // a pose worked out from the time alone
    else if (a.type === 'take') { const S = a.samples, t = a.t; let i = a.i || 0; while (i < S.length - 2 && S[i + 1].t < t) i++; a.i = i; const s0 = S[i], s1 = S[Math.min(S.length - 1, i + 1)], u = clamp((t - s0.t) / Math.max(0.0001, s1.t - s0.t), 0, 1); p = { x: lerp(s0.x, s1.x, u), y: lerp(s0.y, s1.y, u), z: lerp(s0.z, s1.z, u), yaw: angLerp(s0.yaw, s1.yaw, u), pitch: lerp(s0.pitch, s1.pitch, u) }; }
    setPose(p);
    if (k0 >= 1) cineEnd(true);
  };
  const T = YX.T, MOVE_Z = { push: '推近', pull: '拉远', pan: '摇镜', tilt: '俯仰', truck: '横移', crane: '升降', orbit: '环绕', arc: '环绕', follow: '跟拍', overview: '鸟瞰', reset: '回到地面', street: '沿街平推', reveal: '拉升揭示', flyover: '飞越' }, MOVE_E = { push: 'Push in', pull: 'Pull out', pan: 'Pan', tilt: 'Tilt', truck: 'Truck', crane: 'Crane', orbit: 'Orbit', arc: 'Arc', follow: 'Follow', overview: "Bird's-eye view", reset: 'Back to ground', street: 'Street track', reveal: 'Reveal', flyover: 'Flyover' }, moveN = (m) => T(MOVE_Z[m] || m, MOVE_E[m] || m);
  YX.startMove = function (m, tg, op, onDone) {
    op = op || {}; const f = poseNow(), cp = Math.cos(f.pitch), fw = [-Math.sin(f.yaw) * cp, Math.sin(f.pitch), -Math.cos(f.yaw) * cp], rt = [Math.cos(f.yaw), 0, -Math.sin(f.yaw)];
    const tc = tg ? [tg.x, tg.y + tg.size[1] * 0.55, tg.z] : null, dist = tc ? Math.hypot(tc[0] - f.x, tc[1] - f.y, tc[2] - f.z) : 12;
    if (m === 'push' || m === 'pull' || m === 'dolly' || m === 'zoom') { let am = op.amount != null ? num(op.amount, 6) : m === 'pull' ? 8 : tc ? Math.max(1.5, dist - (Math.max(tg.foot[0], tg.foot[1]) / 2 + Math.max(2.5, tg.size[1] * 0.9))) : 6; if (m === 'pull') am = -Math.abs(am); YX.cineStart({ type: 'dolly', dur: clamp(num(op.dur, 3.5), 0.3, 60), dx: fw[0] * am, dy: fw[1] * am, dz: fw[2] * am, look: tc, onDone }); }
    else if (m === 'truck' || m === 'slide') { const am = num(op.amount, 6); YX.cineStart({ type: 'dolly', dur: clamp(num(op.dur, 3.5), 0.3, 60), dx: rt[0] * am, dy: 0, dz: rt[2] * am, look: tc, onDone }); }
    else if (m === 'crane' || m === 'rise') { const am = num(op.amount, 7); YX.cineStart({ type: 'dolly', dur: clamp(num(op.dur, 4), 0.3, 60), dx: 0, dy: am, dz: 0, look: tc, onDone }); }
    else if (m === 'pan') YX.cineStart({ type: 'pan', dur: clamp(num(op.dur, 3.5), 0.3, 60), dyaw: -num(op.deg, 45) * DEG, dpitch: 0, onDone });
    else if (m === 'tilt') YX.cineStart({ type: 'pan', dur: clamp(num(op.dur, 3), 0.3, 60), dyaw: 0, dpitch: num(op.deg, 15) * DEG, onDone });
    else if (m === 'orbit' || m === 'arc') { const c = tc || [f.x + fw[0] * 12, Math.max(1, f.y + fw[1] * 12), f.z + fw[2] * 12]; let R = Math.hypot(f.x - c[0], f.z - c[2]); const minR = tg ? Math.max(tg.foot[0], tg.foot[1]) * 0.7 + 3 : 3; let a0 = Math.atan2(f.z - c[2], f.x - c[0]); const sweep = num(op.deg, m === 'arc' ? 90 : 360) * DEG; if (R < minR) { cine.active = null; setPose(Object.assign({}, f, { x: c[0] + Math.cos(a0) * minR, z: c[2] + Math.sin(a0) * minR })); R = minR; }
      YX.cineStart({ type: 'orbit', dur: clamp(num(op.dur, Math.abs(sweep) > 4 ? 12 : 6), 0.5, 90), cx: c[0], cy: c[1], cz: c[2], R, a0, sweep, dy: num(op.amount, 0), ease: Math.abs(sweep) > 4 ? YX.ease.lin : YX.ease.inOut, onDone }); }
    else if (m === 'follow' || m === 'track') { if (!tg) return false; YX.cineStart({ type: 'follow', dur: clamp(num(op.dur, 10), 1, 120), target: tg, dist: Math.max(4, Math.max(tg.foot[0], tg.foot[1]) * 1.6 + 2.5), h: Math.max(1.6, tg.size[1] * 0.9 + 0.8), ease: YX.ease.lin, onDone }); }
    else if (m === 'overview' || m === 'top') YX.cineStart({ type: 'pose', dur: clamp(num(op.dur, 1.6), 0.3, 20), to: { x: f.x - fw[0] * 20, y: num(op.amount, 75), z: f.z - fw[2] * 20, yaw: f.yaw, pitch: -1.15 }, onDone });
    else if (m === 'reset' || m === 'ground') YX.cineStart({ type: 'pose', dur: 1.2, to: { x: f.x, y: 1.7, z: f.z, yaw: f.yaw, pitch: 0 }, onDone });
    else if (m === 'street' || m === 'travel' || m === 'along') { // glide along the nearest road in the direction the camera faces, or straight ahead when there is no road
      const hl = Math.hypot(fw[0], fw[2]) || 1; let ax = fw[0] / hl, az = fw[2] / hl, best = 26;
      for (const r of W.objs.values()) { if (r.type !== 'road' || r.dead) continue; const c = Math.cos(r.rot), s = Math.sin(r.rot), lon = r.foot[0] >= r.foot[1], ux = lon ? c : s, uz = lon ? -s : c, dx = f.x - r.x, dz = f.z - r.z, off = Math.abs(dx * -uz + dz * ux); if (Math.abs(dx * ux + dz * uz) < Math.max(r.foot[0], r.foot[1]) / 2 + 4 && off < best) { best = off; const sg = ux * fw[0] + uz * fw[2] >= 0 ? 1 : -1; ax = ux * sg; az = uz * sg; } }
      const dur = clamp(num(op.dur, 8), 0.5, 60), am = num(op.amount, dur * 2.6);
      YX.cineStart({ type: 'dolly', dur, dx: ax * am, dy: num(op.rise, 0), dz: az * am, look: [f.x + ax * 400, f.y - 6, f.z + az * 400], ease: YX.ease.lin, onDone }); }
    else if (m === 'reveal') { const hl = Math.hypot(fw[0], fw[2]) || 1, am = num(op.amount, 14); YX.cineStart({ type: 'dolly', dur: clamp(num(op.dur, 8), 0.5, 60), dx: (-fw[0] / hl) * am, dy: num(op.rise, 9), dz: (-fw[2] / hl) * am, look: tc || [f.x + fw[0] * 30, Math.max(1, f.y + fw[1] * 30), f.z + fw[2] * 30], onDone }); }
    else if (m === 'flyover' || m === 'drone' || m === 'aerial') { const hl = Math.hypot(fw[0], fw[2]) || 1, am = num(op.amount, 55); YX.cineStart({ type: 'pose', dur: clamp(num(op.dur, 8), 0.5, 60), to: { x: f.x + (fw[0] / hl) * am, y: Math.max(f.y, 2) + num(op.rise, 22), z: f.z + (fw[2] / hl) * am, yaw: f.yaw, pitch: -0.55 }, ease: YX.ease.lin, onDone }); }
    else return false;
    return true;
  };
  YX.camOp = function (op, ctx) {
    const P = W.player, msg = [];
    if (op.lens != null) { const l = op.lens === 0 || /^(free|reset|none|自由)$/i.test(String(op.lens)) ? 0 : clamp(num(parseFloat(op.lens), 35), 8, 600); P.lens = l; msg.push(l ? T(l + 'mm 镜头', l + 'mm lens') : T('自由视角', 'Free view')); }
    if (op.letterbox != null && YX.hooks.letterbox) { YX.hooks.letterbox(!!op.letterbox); msg.push(op.letterbox ? T('电影画幅', 'Cinema frame') : T('全屏画幅', 'Full frame')); }
    if (op.stop) { if (YX.filmLive && YX.filmLive()) { YX.filmStop(); return { ok: true, msg: T('停止录制', 'Recording stopped') }; } if (YX.cine.active) { YX.cineStop(); return { ok: true, msg: T('镜头停下了', 'Camera stopped') }; } return { ok: false, msg: T('现在没有在录制', 'Nothing is being recorded') }; }
    const D = YX.director, mv = op.move ? String(op.move).toLowerCase() : null;
    if (op.revise != null && D) { const r = D.revise({ text: String(op.revise), rec: !!op.rec }); if (YX.hooks.ui) YX.hooks.ui(); return r; } // a note on the shot just made changes that shot
    if (D && !YX.playing && ((mv && D.can(mv)) || (!mv && op.design))) { // a move with a path: designed for this place (by the model when it is there), checked against what stands around, then flown
      const tg = op.target != null ? ctx.one(op.target) : W.objs.get(ctx.view.aimId) || null, r = D.go({ text: op.design || '', move: mv, target: tg, rec: !!op.rec, dur: op.dur, deg: op.deg, amount: op.amount, rise: op.rise, instant: !!op.instant });
      if (msg.length) r.msg = msg.join(T('，', ', ')) + T('，', ', ') + r.msg; if (YX.hooks.ui) YX.hooks.ui(); return r; }
    if (op.move) { const m = String(op.move).toLowerCase(), tg = op.target != null ? ctx.one(op.target) : W.objs.get(ctx.view.aimId) || null; const keep = !['reset', 'ground', 'overview', 'top'].includes(m) && !YX.playing, rec = !!op.rec && !!YX.filmMove && keep, o2 = Object.assign({}, op);
      if (rec) { o2.dur = clamp(num(o2.dur, 8), 2, 10); if (m === 'orbit' && o2.deg == null) o2.deg = 150; } else if (m === 'orbit' && o2.deg == null && o2.dur == null) { o2.deg = 150; o2.dur = 8; }
      // every spoken move is kept as a shot: it can be replayed, adjusted and recorded from the Film panel
      const sh = keep ? YX.saveShot(moveN(m) + (tg ? ' · ' + (tg.name || YX.labelOf(YX.defOf(tg))) : ''), { type: m, target: tg ? tg.id : null, dur: o2.dur, amount: o2.amount, deg: o2.deg, rise: o2.rise }) : null;
      if (rec ? YX.filmMove(m, tg, o2) : YX.startMove(m, tg, o2)) { if (sh && sh.move && sh.move.dur == null && YX.cine.active && YX.cine.active.dur > 0) sh.move.dur = Math.round(YX.cine.active.dur * 10) / 10; msg.push(moveN(m) + (tg && ['orbit', 'follow', 'push', 'arc', 'reveal'].includes(m) ? ' ' + YX.lab(tg) : '') + (rec ? T('，正在录制', ', recording') : sh ? T('（已存为镜头 ' + W.shots.length + '：说“录下来”拍成片子，按 C 可以重看）', ' (kept as shot ' + W.shots.length + ': say “record it” to film it, press C to see it again)') : '')); }
      else { if (sh) { W.shots.pop(); if (YX.hooks.ui) YX.hooks.ui(); } return { ok: false, msg: m === 'follow' ? T('没找到要跟拍的对象', 'Nothing there to follow') : T('不认识的运镜 ', 'Unknown camera move ') + m }; }
      if (m === 'reset') P.lens = 0; }
    else if (op.rec) { // "record it": the move that was just made, flown again and filmed; with no recent move, simply what the player sees from now on
      const li = YX.lastMoveShot(), recent = !op.live && li >= 0 && YX.lastMoveAt && performance.now() - YX.lastMoveAt < 120000;
      if (recent && YX.filmShot && YX.filmShot(li)) msg.push(T('把刚才的镜头“' + W.shots[li].name + '”重走一遍并录下来', 'Flying “' + W.shots[li].name + '” again and recording it'));
      else if (YX.filmLiveStart && YX.filmLiveStart()) msg.push(T('开始录制你看到的画面，最长 10 秒。说“停”或按 R 结束', 'Recording what you see, up to 10 s. Say “stop” or press R to finish'));
      else return { ok: false, msg: T('现在没法开始录制', 'Recording cannot start right now') }; }
    if (YX.hooks.ui) YX.hooks.ui();
    return { ok: true, msg: msg.join(T('，', ', ')) || T('镜头已调整', 'Camera adjusted') };
  };

  /* ---------- shots ---------- */
  function autoName() {
    const P = W.player, o = W.aim, cam = YX.three.camera;
    let size = T('空镜', 'Empty frame');
    if (o) { const d = Math.hypot(o.x - P.x, o.y + o.size[1] / 2 - P.y, o.z - P.z), fr = o.size[1] / (2 * d * Math.tan((cam.fov * DEG) / 2)); size = fr > 1.3 ? T('特写', 'Close-up') : fr > 0.65 ? T('近景', 'Medium close') : fr > 0.3 ? T('中景', 'Medium') : fr > 0.12 ? T('全景', 'Full') : T('远景', 'Wide'); }
    const ang = P.pitch < -0.4 ? T('俯拍', 'High angle') : P.pitch > 0.28 ? T('仰拍', 'Low angle') : P.y > 9 ? T('高机位', 'High camera') : P.y < 1 ? T('低机位', 'Low camera') : '';
    return (ang ? ang + ' ' : '') + size + (o ? ' · ' + (o.name || YX.labelOf(YX.defOf(o))) : '');
  }
  const thumb = (s) => { YX.afterRender = (cv) => {try { const c = document.createElement('canvas'); c.width = 176; c.height = 99; const g = c.getContext('2d'), k = Math.max(176 / cv.width, 99 / cv.height), w = cv.width * k, h = cv.height * k; g.drawImage(cv, (176 - w) / 2, (99 - h) / 2, w, h); s.th = c.toDataURL('image/jpeg', 0.55); if (YX.hooks.ui) YX.hooks.ui(); } catch (e) {} }; }; // a picture of its first frame, for the Film panel
  YX.reShot = (s) => { thumb(s); if (YX.hooks.ui) YX.hooks.ui(); };
  YX.saveShot = function (name, move, take) {
    const P = W.player, s = { name: String(name || autoName()).slice(0, 28), x: +P.x.toFixed(2), y: +P.y.toFixed(2), z: +P.z.toFixed(2), yaw: +P.yaw.toFixed(4), pitch: +P.pitch.toFixed(4), lens: P.lens || 0 };
    if (move && move.type) s.move = move; if (take) s.take = take;
    thumb(s);
    if (W.shots.length >= 24) W.shots.shift();
    W.shots.push(s); YX.markDirty(); if (YX.hooks.ui) YX.hooks.ui(); YX.sfx('shot');
    return s;
  };
  YX.goShot = function (i, instant) { const s = W.shots[i]; if (!s) return false; W.player.lens = s.lens || 0; if (instant) { YX.cineStop(); setPose(s); YX.snapFov(); W.player.fly = s.y > 1.95; } else YX.cineStart({ type: 'pose', dur: 0.9, to: s }); if (YX.hooks.ui) YX.hooks.ui(); return true; };
  /* replay one shot from its own start: the move or path it holds, or just its framing */
  YX.playShot = function (i, onDone) {
    const s = W.shots[i]; if (!s || YX.playing) return false; YX.cineStop(); W.player.lens = s.lens || 0; setPose(s); YX.snapFov(); W.player.fly = s.y > 1.95; YX.lastMoveAt = performance.now();
    if (s.take && s.take.length > 1) YX.cineStart({ type: 'take', samples: s.take, dur: s.take[s.take.length - 1].t, ease: YX.ease.lin, onDone });
    else if (s.move && YX.startMove(s.move.type, s.move.target != null ? W.objs.get(s.move.target) || null : null, s.move, onDone)) { /* running */ }
    else if (onDone) YX.cineStart({ type: 'hold', dur: 2.4, onDone });
    if (YX.hooks.ui) YX.hooks.ui(); return true;
  };
  YX.lastMoveShot = () => { for (let i = W.shots.length - 1; i >= 0; i--) if (W.shots[i].move || (W.shots[i].take && W.shots[i].take.length > 1)) return i; return -1; };
  YX.shotDur = (s) => (s.take && s.take.length > 1 ? s.take[s.take.length - 1].t : s.move ? num(s.move.dur, s.move.type === 'orbit' ? 12 : 3.5) : 2.4);
  YX.playing = false;
  YX.playShots = function (opt) {
    opt = opt || {}; const list = W.shots.slice(); if (!list.length || YX.playing) return false;
    YX.cineStop(); const back = poseNow(), backLens = W.player.lens, backFly = W.player.fly; let i = -1; YX.playing = true;
    if (YX.hooks.cinema) YX.hooks.cinema(true);
    const end = () => { YX.playing = false; cine.active = null; W.player.lens = backLens; setPose(back); W.player.fly = backFly; YX.snapFov(); if (YX.hooks.cinema) YX.hooks.cinema(false); if (opt.onDone) opt.onDone(); };
    const next = (ok) => {
      if (ok === false) return end(); i++; if (i >= list.length) return end();
      const s = list[i]; W.player.lens = s.lens || 0; setPose(s); YX.snapFov(); if (YX.hooks.shotStep) YX.hooks.shotStep(i, s, list.length);
      if (s.take && s.take.length > 1) YX.cineStart({ type: 'take', samples: s.take, dur: s.take[s.take.length - 1].t, ease: YX.ease.lin, onDone: next });
      else if (s.move && YX.startMove(s.move.type, s.move.target != null ? W.objs.get(s.move.target) || null : null, s.move, next)) { /* running */ }
      else YX.cineStart({ type: 'hold', dur: 2.4, onDone: next });
    };
    next(true); return true;
  };
  YX.stopPlay = function () { if (YX.playing) YX.cineStop(); };
  let rec = null;
  YX.recording = () => !!rec;
  YX.recToggle = function () {
    if (rec) { const r = rec; rec = null; if (r.samples.length > 4) { const P0 = r.samples[0]; const keep = poseNow(); const s = YX.saveShot(T('手持 · ', 'Handheld · ') + Math.round(r.samples[r.samples.length - 1].t) + T(' 秒', 's'), null, r.samples); s.x = P0.x; s.y = P0.y; s.z = P0.z; s.yaw = P0.yaw; s.pitch = P0.pitch; setPose(keep); } if (YX.hooks.ui) YX.hooks.ui(); return false; }
    rec = { t: 0, last: -1, samples: [] }; if (YX.hooks.ui) YX.hooks.ui(); return true;
  };
  YX.onFrame = function (dt) { if (!rec) return; rec.t += dt; if (rec.t - rec.last >= 0.066) { rec.last = rec.t; const P = W.player; rec.samples.push({ t: +rec.t.toFixed(3), x: +P.x.toFixed(3), y: +P.y.toFixed(3), z: +P.z.toFixed(3), yaw: +P.yaw.toFixed(4), pitch: +P.pitch.toFixed(4) }); if (rec.t > 60) YX.recToggle(); } };
  YX.shotOp = function (op, ctx) {
    if (op.save) { const tg = op.target != null ? ctx.one(op.target) : W.objs.get(ctx.view.aimId) || null; const s = YX.saveShot(op.name, op.move ? { type: String(op.move).toLowerCase(), target: tg ? tg.id : null, dur: op.dur, amount: op.amount, deg: op.deg } : null); return { ok: true, msg: T('机位 ', 'Shot ') + W.shots.length + ' · ' + s.name }; }
    if (op.go != null) { const i = clamp(Math.round(num(op.go, 1)), 1, Math.max(1, W.shots.length)) - 1; if (!W.shots[i]) return { ok: false, msg: T('还没有保存机位', 'No shots saved yet') }; YX.goShot(i); return { ok: true, msg: T('切到机位 ', 'Shot ') + (i + 1) + ' · ' + W.shots[i].name }; }
    if (op.play) { if (!W.shots.length) return { ok: false, msg: T('还没有保存机位，先说“保存机位”', 'No shots yet. Say “save shot” first') }; YX.playShots({}); return { ok: true, msg: T('预演 ' + W.shots.length + ' 个机位', 'Previewing ' + W.shots.length + ' shots') }; }
    if (op.delete != null) { const i = Math.round(num(op.delete, W.shots.length)) - 1; if (W.shots[i]) { W.shots.splice(i, 1); YX.markDirty(); if (YX.hooks.ui) YX.hooks.ui(); return { ok: true, msg: T('删除机位 ', 'Deleted shot ') + (i + 1) }; } return { ok: false, msg: T('没有这个机位', 'No such shot') }; }
    if (op.clear) { W.shots = []; YX.markDirty(); if (YX.hooks.ui) YX.hooks.ui(); return { ok: true, msg: T('机位已清空', 'Shots cleared') }; }
    if (op.record != null) { // record: true toggles; 'start' and 'stop' only ever do what they say
      if (op.record === 'stop' && !rec) { if (YX.filmLive && YX.filmLive()) { YX.filmStop(); return { ok: true, msg: T('停止录制', 'Recording stopped') }; } return { ok: false, msg: T('现在没有在录制', 'Nothing is being recorded') }; }
      if (op.record === 'start' && rec) return { ok: false, msg: T('已经在录了', 'Already recording') };
      const on = YX.recToggle(); return { ok: true, msg: on ? T('开始录制手持镜头', 'Recording a handheld take') : T('手持镜头已保存', 'Handheld take saved') }; }
    return { ok: false, msg: '' };
  };

  /* the starting town is Koemachi: app/js/koemachi.js (YX.buildTown) */
})();
