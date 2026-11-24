/* Koemachi · savegen: "Save as generator".
   When the model builds a new kind of object you like (Inkling writes it as a small program, //@meta + code, and it runs sandboxed in a Worker), this turns it into a
   proper generator file in the same format as every other one in app/generators/ (header comment, YX.GEN.<name>, build(b, p, rand)) so it can be reviewed and
   contributed back. YX.generatorSource(type) makes the text; YX.saveGenerator(type) asks the local server (POST /__generator) to write it to app/generators/<name>.js.
   It is offered as a button in the corner note after an object is built and checked, and by voice: "save this as a generator" / このオブジェクトをジェネレーターとして保存. */
'use strict';
(function () {
  const YX = window.YX, G = YX.GEN, T = YX.T, W = YX.world, js = (v) => JSON.stringify(v), clean = (s) => String(s || '').replace(/\*\//g, '* /').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  const latin = (s) => /^[\x20-\x7e]+$/.test(s), title = (s) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase());

  YX.generatorSource = function (type, asName) {
    const C = YX.custom[type]; if (!C) return null;
    const m = C.meta, d = G[type] || {}, o = C.origin || {}, name = asName || m.name, label = m.label, en = latin(label) ? label : title(name.replace(/_/g, ' '));
    const nouns = Array.from(new Set([label.toLowerCase(), name.replace(/_/g, ' '), name])), params = Object.keys(m.params);
    const head = '/* Koemachi · generator: ' + name + '\n   ' + clean(label) + '. Written by ' + clean(o.model || 'a language model') + (o.ask ? ' from the request: “' + clean(o.ask) + '”' : '') + (o.look ? ' (Look & Fix: ' + clean(o.look) + ')' : '') + '.\n' +
      '   params: ' + (params.join(', ') || 'none') + '. Front is +z, origin at the centre of the base, metres. Signature: build(b, p, rand). */';
    const fields = ['label: ' + js(label) + ', en: ' + js(en) + ', cls: ' + js(d.cls || 'prim') + ', solid: ' + js(d.solid === undefined ? 'box' : d.solid) + ', face: ' + js(d.face || 'me') + (m.motion && m.motion !== 'none' ? ', motion: ' + js(m.motion) : '') + (d.cls === 'sky' ? ', alt: ' + (d.alt || 20) : '') + ',',
      'nouns: ' + js(nouns) + ',', 'params: ' + js(m.params) + ', dims: ' + js(m.dims) + (d.mainColor ? ', mainColor: ' + js(d.mainColor) : '') + ',', 'foot: () => [' + m.size[0] + ', ' + m.size[2] + '],'];
    const body = String(C.code || '').replace(/\s+$/, '').split('\n').map((l) => '      ' + l).join('\n');
    return head + "\n'use strict';\n(function () {\n  const YX = window.YX;\n  YX.GEN." + name + ' = {\n' + fields.map((f) => '    ' + f).join('\n') + '\n    build(b, p, rand) {\n' + body + '\n    },\n  };\n})();\n';
  };

  YX.saveGenerator = async function (type) {
    const C = YX.custom[type]; const say = (a, b) => { try { YX.ui.toast(T(a, b)); } catch (e) {} };
    if (!C) { say('这不是模型写出来的新物体，没有可保存的生成器', 'That is not an object the model wrote, so there is no generator to save'); return false; }
    let name = C.meta.name;
    for (let n = 1; n <= 6; n++) {
      const r = await fetch('/__generator', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, source: YX.generatorSource(type, name) }) }).catch(() => null);
      if (r && r.ok) { say('已保存：app/generators/' + name + '.js。重新运行 node site/build.mjs 后它就是内置生成器，可以提交回项目', 'Saved: app/generators/' + name + '.js. Run node site/build.mjs and it loads as a built-in generator, ready to contribute back'); return name; }
      if (r && r.status === 409) { name = C.meta.name + '_' + (n + 1); continue; } // a file of that name exists: never overwritten, try the next name
      say('没能保存这个生成器（要用 node site/serve.js 打开页面）', 'Could not save the generator (the page has to be served by node site/serve.js)'); return false;
    }
    return false;
  };

  /* "save this as a generator": the object under the crosshair, or else the one that was built last */
  YX.OPS.savegen = function () {
    const a = W.aim && (W.aim.type ? W.aim : W.aim.o), f = W.objs.get(W.focusId), pick = [a, f].find((o) => o && YX.custom[o.type]);
    const type = pick ? pick.type : YX.lastBuilt && YX.custom[YX.lastBuilt] ? YX.lastBuilt : null;
    if (!type) return { ok: false, msg: T('没有可保存的新物体：先让模型造一个', 'Nothing to save: ask the model to build something new first') };
    YX.saveGenerator(type); return { ok: true, msg: T('正在保存生成器…', 'Saving the generator…') };
  };
})();
