// Watch it learn: one sentence goes to the base model and to each checkpoint of the newest run; each answer is built in its own lane, named; Clear takes it away.
const out = [], WL = YX.watchLearn, TW = YX.trainWorld, W = YX.world;
TW.info = { count: 40, min: 30, base: 'base', active: null, models: [
  { id: 'old-e1', label: 'Old run', epoch: 1, nll: 1.0 }, { id: 'run2-e1', label: 'Run 2 e1', epoch: 1, nll: 0.9 }, { id: 'run2-e2', label: 'Run 2 e2', epoch: 2, nll: 0.6 }] };
out.push('contenders: ' + WL.contenders(TW.info).map((c) => c.id).join(', '));
const seen = []; window.__route = (u, s, opt) => { seen.push(opt && opt.modelId);
  const id = opt && opt.modelId;
  if (id === 'base') return '{"op":"say","text":"hm"}\n{"op":"invent","type":"foodtruck","label":"Food truck","brief":"a truck","size":[4,3,2],"place":{"front":8}}';
  if (id === 'run2-e1') return '{"op":"add","type":"bench","place":{"front":8}}\n{"op":"move","id":"#1","place":{"front":3}}';
  return '{"op":"add","type":"bench","place":{"near":"#1"},"id":"b1"}\n{"op":"add","type":"cat","count":2,"place":{"on":"b1"}}'; };
const n0 = W.objs.size, v = YX.viewNow();
await WL.watch('put a ramen food truck here');
out.push('models asked: ' + seen.slice().sort().join(', ') + ' (same prompt: ' + new Set((window.__prompts || []).slice(-3)).size + ' distinct)');
for (const l of WL.lanes) out.push(l.c.short + ' [' + l.state + '] built: ' + (l.built || '-') + ' | not run: ' + (l.skipped || []).join('; ') + ' | objects ' + l.ids.length);
const xs = WL.lanes.map((l) => { const o = W.objs.get(l.ids[0]); return o ? ((o.x - v.x) * v.rx + (o.z - v.z) * v.rz).toFixed(0) : 'none'; });
out.push('lane offsets to the right of the player (m): ' + xs.join(', '));
out.push('labels: ' + Array.from(document.querySelectorAll('body > div')).map((d) => d.textContent).filter((t) => /^(Base|Epoch)/.test(t)).join(', '));
out.push('objects added: ' + (W.objs.size - n0));
WL.clear(); await new Promise((r) => setTimeout(r, 800));
out.push('after clear: ' + (W.objs.size - n0) + ' extra objects, lanes ' + WL.lanes.length);
return out.join('\n');
