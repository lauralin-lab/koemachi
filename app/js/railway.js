/* Koemachi · railway: the single-track line's timetable and the level crossing.
   Every `period` seconds a one- or two-car train crosses the town (east, then west, then east...). While it is near the crossing the lamps flash
   (alternately, twice a second) and the barrier arms come down; when it has passed they go up again. The layout (koemachi.js) says where the track is
   in YX.koe.rail = { z, xc, x0, x1 }; the controller finds the train, the lamps and the arms in the world by type, so a saved and restored world keeps working. */
'use strict';
(function () {
  const YX = window.YX, W = YX.world, DEG = YX.DEG;
  const R = { period: 60, speed: 13, warn: 95, clear: 7, t: 0, alarmT: 0, flash: 0, arm: 82, dir: 1 }; YX.railway = R;
  const find = (type) => { const out = []; for (const o of W.objs.values()) if (o.type === type && !o.dead) out.push(o); return out; };
  const prev = YX.onFrame;
  YX.onFrame = function (dt) {
    if (prev) prev.apply(this, arguments);
    const K = YX.koe && YX.koe.rail; if (!K || !W.objs.size) return;
    const trains = find('train'); if (!trains.length) return; const tr = trains[0];
    R.t += dt; const cyc = Math.floor(R.t / R.period), ph = R.t - cyc * R.period; R.dir = cyc % 2 ? -1 : 1;
    const transit = (K.x1 - K.x0) / R.speed, running = ph < transit, len = tr.params.cars * 16 + (tr.params.cars - 1) * 1.1;
    let x = R.dir > 0 ? K.x0 + R.speed * ph : K.x1 - R.speed * ph; if (!running) x = K.x1 + 400; // parked far away
    tr.holder.visible = running; tr.x = x; tr.z = K.z; tr.y = 0.36; tr.base = YX.KOE_LEVEL ? YX.KOE_LEVEL.rail : 0; // it always rides the railway level, in from one hillside and out of the other tr.rot = (R.dir > 0 ? 90 : -90) * DEG; YX.syncHolder(tr);
    const ahead = R.dir * (K.xc - x) - len / 2, behind = R.dir * (K.xc - x) + len / 2; // metres before the train's nose reaches the crossing / after its tail left it
    const alarm = running && ahead < R.warn && behind > -R.clear;
    if (alarm) R.alarmT += dt; else R.alarmT = 0;
    R.flash += alarm ? dt : 0; const phase = alarm ? Math.floor(R.flash / 0.45) % 2 : 0;
    for (const c of find('railway_crossing')) if (c.params.alarm !== alarm || c.params.phase !== phase) { c.params.alarm = alarm; c.params.phase = phase; YX.rebuild(c); }
    const target = alarm && R.alarmT > 1.2 ? 0 : 82; R.arm += Math.max(-dt * 38, Math.min(dt * 38, target - R.arm));
    for (const a of find('crossing_arm')) { a.bank = R.arm * DEG; YX.syncHolder(a); }
  };
})();
