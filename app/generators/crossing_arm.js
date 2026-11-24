/* Koemachi · generator: crossing_arm
   The barrier arm of a level crossing: a red-and-white striped arm hinged at the base box, extending along +x. The railway controller tips it up
   and down by changing the object's bank (rotation about its own z axis): 0 = lowered across the road, about 82 degrees = raised. params: length. */
'use strict';
(function () {
  const YX = window.YX;
  YX.GEN.crossing_arm = {
    label: '道口栏杆', cls: 'street', solid: false, face: 'road', nouns: ['道口栏杆', '栏杆', '拦路杆', 'crossing barrier', 'barrier arm', 'boom gate', '遮断桿', '遮断機'], params: { length: { d: 3.6, min: 2, max: 8 } }, dims: { width: 'length' }, foot: (p) => [p.length, 0.6],
    build(b, p) {
      b.box(0.45, 0.9, 0.4, '#d9d4c6', 0, 0, 0); b.cyl(0.14, 0.14, 0.4, '#8d9399', 0, 0.85, 0, { rx: 90, sides: 10 });
      b.group({ y: 0.9 }, () => { const n = 8, seg = p.length / n; for (let i = 0; i < n; i++) b.box(seg, 0.1, 0.07, i % 2 ? '#f4f0e6' : '#c93a2c', 0.2 + seg * (i + 0.5), 0, 0); b.cyl(0.07, 0.07, 0.08, '#ff3b2a', p.length + 0.1, 0.0, 0, { rx: 90, sides: 8, emissive: '#ff3b2a' }); });
    },
  };
})();
