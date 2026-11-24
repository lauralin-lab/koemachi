/* Koemachi · Look & Fix: after the model builds a new kind of object, the object is looked at.
   capture(o)  renders the object alone, from a temporary camera, as a JPEG under 1.5 MB.
   check(o, ask, round)  sends that picture and the original request to the model (as an image) and gets {match, problems, fix} back.
   The orchestration (revise the code, rebuild, check again, at most 2 rounds) is in mind.js (inventRun), where the code writer lives.
   status(label)  is the small corner note: "Checking…" → "Fixed: wheels were floating" / "Looks right".
   save(file, ...)  hands a picture or a note to the local server, which keeps it in data/lookfix/ (see site/serve.js). */
'use strict';
(function () {
  const YX = window.YX, T = YX.T, M = YX.mind, W = YX.world, MAX_BYTES = 1.5 * 1024 * 1024, WIDTH = 1024;
  const L = (YX.lookFix = { enabled: true, busy: 0, rounds: 2, history: [], skipped: [], outcomes: [] }); // history: every check, newest last (for the console and the tests)

  /* ---------- the picture ---------- */
  L.capture = function (o) { // -> { b64, bytes } | null
    if (!o || o.dead || !o.holder) return null;
    const { renderer, scene, camera: cam } = YX.three, box = new THREE.Box3().setFromObject(o.holder); if (box.isEmpty()) return null;
    const c = box.getCenter(new THREE.Vector3()), r = Math.max(0.6, box.getSize(new THREE.Vector3()).length() / 2), cv = renderer.domElement, rot = o.rot || 0, FOV = 32;
    const dir = new THREE.Vector3(0.6 * Math.cos(rot) + 0.9 * Math.sin(rot), 0.36, -0.6 * Math.sin(rot) + 0.9 * Math.cos(rot)).normalize(); // front, a little to the right, a little above
    const keep = { p: cam.position.clone(), q: cam.quaternion.clone(), fov: cam.fov, near: cam.near, mask: cam.layers.mask }, hidden = [];
    for (const x of W.objs.values()) if (x !== o && x.holder && x.holder.visible) { x.holder.visible = false; hidden.push(x.holder); } // only this object, on the ground and under the sky
    const held = new Set(Array.from(W.objs.values()).map((x) => x.holder)); for (const ch of scene.children) if (ch.layers.mask === 4 && ch.visible && !held.has(ch)) { ch.visible = false; hidden.push(ch); } // the aim highlight
    let url = '';
    try {
      cam.fov = FOV; cam.near = 0.05; cam.updateProjectionMatrix(); cam.position.copy(c).addScaledVector(dir, (r / Math.sin((FOV / 2) * (Math.PI / 180))) * 0.8); cam.lookAt(c); cam.updateMatrixWorld(true);
      renderer.autoClear = true; renderer.shadowMap.needsUpdate = true; // shadows are worked out again, so objects that are hidden here leave none
      if (!(YX.post && YX.post.render(renderer, scene, cam))) renderer.render(scene, cam);
      const k = WIDTH / cv.width, out = document.createElement('canvas'); out.width = WIDTH; out.height = Math.round(cv.height * k); out.getContext('2d').drawImage(cv, 0, 0, out.width, out.height);
      for (const q of [0.88, 0.75, 0.6, 0.45]) { url = out.toDataURL('image/jpeg', q); if ((url.length * 3) / 4 < MAX_BYTES) break; }
    } finally {
      for (const h of hidden) h.visible = true;
      cam.position.copy(keep.p); cam.quaternion.copy(keep.q); cam.fov = keep.fov; cam.near = keep.near; cam.layers.mask = keep.mask; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
      renderer.shadowMap.needsUpdate = true;
    }
    const b64 = url.split(',')[1] || ''; return b64 ? { b64, bytes: Math.round((b64.length * 3) / 4) } : null;
  };

  /* ---------- the question ---------- */
  const PROMPT = (ask, lang) => 'A player of a 3D world asked for: "' + ask + '".\nThe engine built it procedurally from boxes, cylinders and other simple parts (low-poly, plain colours, no textures). The picture is a render of just that object (everything else is hidden), seen from the front, a little from the right and from above.\n' +
    'Judge whether it matches the request: recognisable as the thing asked for, parts where they belong (wheels touching the ground, nothing floating, nothing sunk into something else), sensible proportions and colours, and the details the player named. Be tolerant of the low-poly style; only call out real problems.\n' +
    'Reply with JSON only, no other text: {"match": true or false, "problems": [up to 3 short phrases of under 8 words each, in ' + (lang === 'zh' ? 'Chinese' : 'English') + ', e.g. "wheels were floating"], "fix": "one or two sentences telling the person who writes the object\'s code exactly what to change"}. If it matches, problems is [] and fix is "".';
  function parse(text) { const m = String(text || '').match(/\{[\s\S]*\}/); if (!m) throw new Error('no JSON in the check'); const j = JSON.parse(m[0]); const problems = (Array.isArray(j.problems) ? j.problems : []).map(String).filter(Boolean).slice(0, 3); return { match: (j.match === true || j.match === 'true') && !problems.length, problems, fix: String(j.fix || '') }; /* a problem the check names is a problem, whatever it says about matching */ }
  L.check = async function (o, ask, round, signal) { // -> { match, problems, fix, shot: { b64, bytes } }
    const shot = L.capture(o); if (!shot) throw new Error('nothing to look at');
    const res = await M.sample([{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: shot.b64 } }, { type: 'text', text: PROMPT(ask, YX.lang) }] }], { modelTier: 'quick', task: 'check', label: 'look-check r' + round, cache: false, signal });
    const out = Object.assign(parse(res.text), { shot }); L.history.push({ ask, round, match: out.match, problems: out.problems, fix: out.fix, shot: out.shot.b64 }); return out;
  };

  /* ---------- the corner note ---------- */
  let box = null;
  function ensureBox() {
    if (box) return box;
    const st = document.createElement('style'); st.textContent = '#lfBox{position:fixed;right:12px;bottom:12px;z-index:5;display:flex;flex-direction:column;gap:6px;align-items:flex-end;pointer-events:none}#lfBox div{max-width:min(320px,80vw);padding:7px 11px;border-radius:9px;background:rgba(14,16,20,.82);color:#f4efe6;font:500 12.5px/1.35 var(--f-ui,system-ui);box-shadow:0 6px 20px rgba(0,0,0,.3);transition:opacity .5s}#lfBox div.ok{border-left:3px solid #6fd08c}#lfBox div.fix{border-left:3px solid #ffd84a}#lfBox div.off{opacity:0}#lfBox div button{pointer-events:auto;margin-left:10px;padding:3px 9px;border:1px solid rgba(255,255,255,.35);border-radius:6px;background:rgba(255,255,255,.1);color:#fff;font:600 11.5px/1.2 var(--f-ui,system-ui);cursor:pointer}#lfBox div button:hover{background:rgba(255,255,255,.22)}';
    document.head.appendChild(st); box = document.createElement('div'); box.id = 'lfBox'; box.setAttribute('role', 'status'); document.body.appendChild(box); return box;
  }
  L.status = function (label) { // one line per object being looked at
    const line = document.createElement('div'); line.className = ''; ensureBox().appendChild(line); let gone = 0;
    return {
      say(text, kind) { line.className = kind || ''; line.textContent = label + ' · ' + text; },
      end(text, kind, action) { if (!text) { line.remove(); return; } this.say(text, kind); if (action) { const b = document.createElement('button'); b.type = 'button'; b.textContent = action.label; b.onclick = (e) => { e.stopPropagation(); b.disabled = true; Promise.resolve(action.run()).then(() => { b.remove(); }, () => { b.disabled = false; }); }; line.appendChild(b); } clearTimeout(gone); gone = setTimeout(() => { line.classList.add('off'); setTimeout(() => line.remove(), 600); }, action ? 30000 : 7000); },
    };
  };

  /* ---------- keeping the pictures: the local server writes them to data/lookfix/ ---------- */
  L.save = function (file, b64OrText, isText) { // fire and forget; the page works the same if the server says no
    return fetch('/__shot', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(isText ? { file, text: b64OrText } : { file, data: b64OrText }) }).then((r) => r.ok).catch(() => false);
  };
})();
