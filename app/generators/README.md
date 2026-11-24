# Generators

Everything in Koemachi that is not the ground, the sky or the sea is made by a **generator**: a small JavaScript recipe that builds an object out of boxes,
cylinders, tubes and text from a few parameters and a random seed. There are no model files and no textures to download. One file here is one generator.

```
app/generators/
  _common.js     shared helpers: the palette (YX.koe), kawara roofs, signs, the season          (not a generator)
  _shop.js       the shop-front builder the three shotengai shops share                           (not a generator)
  machiya.js  terrace.js  stone_steps.js  torii.js  shrine.js  fishing_boat.js  …              (one generator each)
```

`node site/build.mjs` puts a `<script>` tag in the page for every `*.js` file in this folder, in name order (files that start with `_` first). Drop a file in, rebuild,
reload: the object exists, and its words (see `nouns`) are in the voice grammar, so "add a …" works with no other change.

## A generator, start to finish

```js
/* Koemachi · generator: bicycle_rack
   A row of black steel hoops on little feet, for leaning bicycles against. params: hoops (how many), color. Front is +z. */
'use strict';
(function () {
  const YX = window.YX, C = YX.koe;                       // C: the palette and helpers from _common.js
  YX.GEN.bicycle_rack = {
    label: '自行车架', en: 'Bicycle rack', cls: 'street', solid: false, face: 'road',
    nouns: ['自行车架', 'bicycle rack', 'bike rack', '駐輪ラック', '自転車置き場'],          // what people can say; English, 中文 and 日本語 all help
    params: { hoops: { d: 5, min: 2, max: 12, int: 1 }, color: { d: '#222222', color: 1 } },
    dims: { width: 'hoops' },                              // which parameter "make it bigger / wider" changes
    foot: (p) => [p.hoops * 0.6 + 0.5, 0.6],               // the footprint [x, z] in metres, used to place it without overlaps
    build(b, p, rand) {                                    // the one signature every generator has
      for (let i = 0; i < p.hoops; i++) {
        const x = (i - (p.hoops - 1) / 2) * 0.6;
        b.tube([[x, 0, -0.2], [x, 0.8, -0.2], [x, 0.8, 0.2], [x, 0, 0.2]], 0.03, p.color);
        b.box(0.1, 0.04, 0.5, p.color, x, 0, 0);
      }
    },
  };
})();
```

The file name is the generator's name (`bicycle_rack.js` defines `YX.GEN.bicycle_rack`), lower-case with underscores. The first line is the header comment: what it is,
its parameters, and anything a reader needs to know about its orientation.

### Conventions

- **Metres, +Y up.** The origin is the centre of the base, on the floor. The **front faces +z** (south, towards the sea). `rot: 0` means the front faces south.
- **`build(b, p, rand)`**: `b` is the parts builder, `p` the parameters (each one's default `d` unless the player changed it), `rand()` a deterministic random number in
  0..1 (seeded per object, so the same object always looks the same).
- **Be cheap.** A town has hundreds of objects. Use few parts (a house is about 100), low `sides` on cylinders and tubes (`{ sides: 4 }` for thin things), `seg: 6` on
  small spheres. Parts with the same material are merged into one draw call.
- **Be original.** Procedural only, no copied models, no real brands or trademarks on signs (use generic words: ラーメン, 和菓子, 雑貨, ゆ, 営業中).

### The fields

| field | meaning |
|---|---|
| `label`, `en` | the name in 中文 and in English (shown in messages) |
| `cls` | `building`, `street`, `nature`, `ground`, `creature`, `vehicle`, `sky`, `prim`, `furniture` |
| `solid` | `'box'`, `'trunk'` (a thin pillar) or `false`: whether people walk round it |
| `face` | which way a newly placed one turns: `'road'`, `'me'` (towards the player), `'random'`, `'none'` |
| `nouns` | words the voice grammar knows it by |
| `params` | `{ name: { d, min, max, int } }` a number; `{ d, bool: 1 }`; `{ d: '#rrggbb', color: 1 }`; `{ d, opts: [...] }`; `{ d, text: 1 }` |
| `dims` | `{ height, width, depth, size }`: the parameter that "taller", "wider", "bigger" change |
| `foot` | `(p) => [x, z]` footprint |
| `floor` | `(p, lx, lz) => height or null`: makes it walkable (a terrace, steps, a platform); see `terrace.js` and `stone_steps.js` |
| `light` | `{ pos: [x, y, z], color, power }`: a real light after dark (a street light, a lighthouse) |
| `float`, `flat` | no gravity (a boat on the water, lanterns on a wire); a decal on the ground |
| `motion` | `'wander'`, `'drive'`, `'fly'`, … for things that move by themselves |

### The builder `b`

`b.box(w,h,d,color,x,y,z,opt)` · `b.cyl(rTop,rBottom,h,color,x,y,z,opt)` · `b.cone(r,h,color,x,y,z,opt)` · `b.sphere(r,color,x,y,z,opt)` · `b.roof(w,h,d,color,x,y,z,opt)` ·
`b.pyramid(…)` · `b.torus(R,r,color,x,y,z,opt)` · `b.lathe([[r,y],…],color,x,y,z,opt)` · `b.extrude([[x,y],…],depth,color,x,y,z,opt)` · `b.tube([[x,y,z],…],radius,color,opt)` ·
`b.text(str,size,color,x,y,z,opt)` · `b.foliage(r,color,x,y,z,opt)` · `b.halo(size,color,x,y,z)` · `b.group({x,y,z,rx,ry,rz,scale,anim}, () => { … })` · `b.anchor(name,x,y,z)`.

`box`, `cyl`, `cone`, `roof`, `pyramid` are bottom-centred, `sphere` and `torus` are centred. `opt` may hold `rx ry rz` (degrees), `sx sy sz`, `emissive: '#hex'` (always lit),
`glow: '#hex'` (lit only at night: windows, lanterns), `opacity`, `metal`, `rough`, `flat`, `noShadow`, `tex: 'brick' | 'wood' | 'roof' | 'stone' | 'plaster' | 'stripes' | 'grass' | 'sand'`.
Animation goes on a group: `anim: { bob: { amp, freq } }`, `{ swing: { axis, deg, freq } }`, `{ spin: { axis, speed } }`, `{ pulse: { amp, freq } }`, `{ hinge: { axis, deg } }`.

### Shared helpers (`YX.koe`, from `_common.js`)

`C.wood`, `C.kawara`, `C.indigo`, `C.vermilion`, … the town's palette · `C.kawaraRoof(b, w, d, h, x, y, z, color, { eave })` a tiled gable roof (under snow in winter) · `C.tile(color)` a colour that snow
may cover · `C.sign(b, text, w, h, x, y, z, bg, fg)` · `C.season` the current season: `'spring' | 'summer' | 'autumn' | 'winter'`, read when the object is built. A parameter whose default follows the season
(`sakura_tree`, `momiji_tree`) is written `season: { get d() { return C.season; }, opts: [...] }`.

## Checking it

```sh
node tests/check_generators.js          # every file here: header, one generator of the right name, the fields, and that build() runs (spring and winter)
node site/build.mjs && node site/serve.js
# then in the page:  "add a bicycle rack here"   (the voice grammar knows the nouns)
```

To see a new generator on its own, spawn it somewhere clear from the browser console: `YX.spawn({ type: 'bicycle_rack', x: 0, z: 0, params: {}, seed: 1 })`.

## Letting the model write one, and keeping it

When Inkling builds a new kind of object you like ("put a ramen food truck here"), the corner note offers **Save as generator** once Look & Fix has judged it, or say
"save this as a generator" (保存为生成器 / ジェネレーターとして保存して). The code the model wrote, with what you asked for and how it was checked in the header, is written to
`app/generators/<name>.js` in exactly the format above (never over a file that exists: a second one is `<name>_2.js`). Read it, tidy it, add `nouns` in 中文 and 日本語 and an `en` name if
it needs one, run `node tests/check_generators.js`, and it is a pull request.

## Contributing

Open a pull request with the new file (and nothing else, if you can). It should pass `node tests/check_generators.js`, look right from the front at golden hour and at night, be cheap, and be
original work you are free to release under Apache-2.0.
