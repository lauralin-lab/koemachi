/* Koemachi · generator: kuromatsu
   A Japanese black pine: a twisted, leaning trunk and a few flat, cloud-shaped pads of dark needles, the tree of the sea shore and of shrines. params: height, lean. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe, mix = YX.mixHex;
  YX.GEN.kuromatsu = {
    label: '黑松', en: 'Black pine', cls: 'nature', solid: 'trunk', face: 'random', nouns: ['黑松', '松树', '海边松树', '松', '盆景松', 'black pine', 'pine tree', 'japanese pine', 'matsu', '松', '黒松'],
    params: { height: { d: 7, min: 2, max: 20 }, lean: { d: 0.22, min: -0.6, max: 0.6 } }, dims: { height: 'height', size: 'height', width: 'height' }, foot: (p) => [p.height * 0.5, p.height * 0.5],
    build(b, p, rand) {
      const H = p.height, bark = '#4a3b33', tr = H * 0.03 + 0.07, lx = p.lean * H, G = ['#2f5a3a', '#376844', '#2a4f36', '#3f7550'];
      const pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push([lx * t * t + Math.sin(t * 5 + rand()) * H * 0.04, H * 0.62 * t, Math.cos(t * 4) * H * 0.03]); } b.tube(pts, tr, bark, { sides: 8 }); b.cyl(tr * 1.4, tr * 1.9, H * 0.05, bark, 0, 0, 0, { sides: 9 });
      const pad = (x, y, z, r) => { b.foliage(r, mix(G[Math.floor(rand() * 4)], '#12301c', rand() * 0.1), x, y, z, { sy: 0.38, sx: 1.25, sz: 1.1, ry: rand() * 360 }); b.foliage(r * 0.7, mix(G[1], '#ffffff', 0.06), x + (rand() - 0.5) * r * 0.4, y + r * 0.22, z + (rand() - 0.5) * r * 0.4, { sy: 0.4, sx: 1.1, ry: rand() * 360 }); };
      b.group({ anim: { swing: { axis: 'z', deg: 1.0, freq: 0.14, phase: rand() * 6 } } }, () => {
        const top = pts[6]; pad(top[0], H * 0.74, top[2], H * 0.26);
        for (let i = 0; i < 3; i++) { const a = i * 2.1 + rand(), y = H * (0.5 + i * 0.07), t = y / (H * 0.62), bx = lx * Math.min(1, t) * Math.min(1, t) + Math.cos(a) * H * 0.2, bz = Math.sin(a) * H * 0.2; b.tube([[pts[4][0], pts[4][1], pts[4][2]], [(pts[4][0] + bx) / 2, y - H * 0.04, bz / 2], [bx, y, bz]], tr * 0.35, bark, { sides: 5 }); pad(bx, y + H * 0.04, bz, H * 0.18); }
      });
      b.anchor('top', lx, H * 0.84, 0);
    },
  };
})();
