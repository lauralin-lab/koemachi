/* Spoken World · floors: walkable surfaces that are not the ground (terraces, stairs, piers).
   A generator that has a `floor(p, lx, lz)` function (local metres in, height of its top at that spot out, or null outside it) is a floor.
   YX.floorAt(x, z, maxY, skip, below)  the height of the highest floor under (x, z) that is not above maxY: 0 when there is none. `below` (an id) limits it to
   floors made before that one: a floor can stand on an earlier floor (steps on a terrace), never the other way round.
   Every other object keeps its y relative to the floor it stands on; the engine adds o.base (this module's baseOf) when it places the object in the scene,
   so gravity, placement, people and vehicles work on a terrace exactly as they do on the ground. The player follows the floor too (world.js updatePlayer). */
'use strict';
(function () {
  const YX = window.YX, W = YX.world;
  let list = [], ver = 1, built = 0;
  const floors = () => { if (built !== ver) { built = ver; list = []; for (const o of W.objs.values()) { const d = YX.defOf(o); if (d && d.floor && !o.dead) list.push([o, d]); } } return list; };
  YX.floorAt = function (x, z, maxY, skip, below) {
    let best = 0; const lim = maxY == null ? Infinity : maxY;
    for (const [o, d] of floors()) {
      if (o === skip || o.dead || (below != null && o.id >= below)) continue;
      const dx = x - o.x, dz = z - o.z, c = Math.cos(o.rot), s = Math.sin(o.rot), h = d.floor(o.params, (dx * c - dz * s) / o.s[0], (dx * s + dz * c) / o.s[2], o);
      if (h == null) continue;
      const top = (o.base || 0) + o.y + h * o.s[1]; if (top <= lim && top > best) best = top;
    }
    return best;
  };
  YX.baseOf = (o) => { const d = YX.defOf(o); return !d || d.cls === 'sky' ? 0 : YX.floorAt(o.x, o.z, Infinity, o, d.floor ? o.id : null); };
  YX.rebase = function () { // after floors appear, move or go: every object takes the height of what it now stands on
    ver++; const all = Array.from(W.objs.values()), isF = (o) => { const d = YX.defOf(o); return !!(d && d.floor); };
    const fl = all.filter(isF).sort((a, b) => a.id - b.id); for (const o of fl) o.base = 0;
    for (const o of fl) { o.base = YX.baseOf(o); YX.syncHolder(o); } // in the order they were made: steps on a terrace settle after the terrace
    for (const o of all) if (!isF(o)) { const b = YX.baseOf(o); if (b !== o.base) { o.base = b; YX.syncHolder(o); } }
  };
  const spawn0 = YX.spawn, remove0 = YX.removeObj, restore0 = YX.restore, town0 = YX.buildTown;
  YX.spawn = function (d) { const o = spawn0.apply(this, arguments); if (o) { const f = YX.defOf(o) && YX.defOf(o).floor; if (f) { ver++; YX.rebase(); } else { o.base = YX.baseOf(o); YX.syncHolder(o); } } return o; };
  YX.removeObj = function (o) { const f = o && YX.defOf(o) && YX.defOf(o).floor; const r = remove0.apply(this, arguments); if (f) YX.rebase(); return r; };
  YX.restore = function () { const r = restore0.apply(this, arguments); YX.rebase(); return r; };
  YX.floorsChanged = () => YX.rebase();
})();
