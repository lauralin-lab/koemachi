/* Spoken World: the Tinker host, the page's only home.
   Loaded before host.js by the page that site/serve.js serves. The AI is Thinking Machines' Inkling, reached through Tinker's
   Anthropic-compatible Messages API; the page never holds the key: it posts to /__tinker/messages on the local server, which adds the key and the
   model (TINKER_API_KEY, TINKER_MODEL) and forwards the call. Voice input is the browser's own Web Speech API.
   This file registers a host (window.SW_HOST, see app/js/host.js for what a host is). It must load before host.js. */
(function () {
  'use strict';
  const ENDPOINT = '/__tinker/messages', MAX_TOKENS = 16384;
  // how hard the model thinks (output_config.effort: low | medium | high | xhigh | max), by what the call is for: the page's task hint first, then its tier.
  // window.SW_EFFORT forces one level for every call (used to measure them).
  const EFFORT = { quick: 'low', default: 'low', complex: 'low', invent: 'low', check: 'low' };
  const effortOf = (o) => window.SW_EFFORT || EFFORT[o.task] || EFFORT[o.modelTier] || 'low';
  const zh = (() => { try { const p = JSON.parse(localStorage.getItem('yanchu.prefs.v2') || '{}'); if (p.ui === 'zh' || p.ui === 'en') return p.ui === 'zh'; } catch (e) {} return /^zh/i.test(navigator.language || ''); })();
  const T = (a, b) => (zh ? a : b);

  /* ---------- the server: is the model configured there? ---------- */
  const config = fetch('/__config', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

  /* ---------- the AI: the page's sample(input, opts) on Inkling, streamed ----------
     The page sends the same prompts as to any model and expects the same text back (JSON lines, or code). Inkling gets one model for every tier
     and task. The one thing done to its answer is tidy(): a reply wrapped in a markdown fence is unwrapped.
     Every call's token counts and timing are kept in SW_HOST.usage. */
  const tidy = (s) => s.replace(/^\s*```[\w-]*[ \t]*\n/, '').replace(/\n?[ \t]*```\s*$/, '');
  const usage = [];
  async function sample(input, opts) {
    const t0 = performance.now(); try { return await sample1(input, opts || {}, t0); } catch (e) { usage.push({ tier: (opts && opts.modelTier) || 'default', error: (e && (e.name === 'AbortError' ? 'aborted' : e.code || e.message)) || String(e), ms: Math.round(performance.now() - t0) }); throw e; }
  }
  async function errOf(r) {
    let j = null; try { j = await r.json(); } catch (e) {}
    const m = (j && j.error && j.error.message) || ('HTTP ' + r.status);
    return { code: r.status === 429 ? 'rate_limited' : r.status === 401 || r.status === 403 ? 'not_granted' : r.status === 404 ? 'model_unavailable' : 'model_error', status: r.status, message: m };
  }
  function sample1(input, opts, t0) {
    const msgs = []; // the Messages API wants roles to alternate, starting with the user
    for (const m of typeof input === 'string' ? [{ role: 'user', content: input }] : input || []) { const role = m.role === 'assistant' ? 'assistant' : 'user', c = Array.isArray(m.content) ? m.content : String(m.content), last = msgs[msgs.length - 1]; if (last && last.role === role && typeof last.content === 'string' && typeof c === 'string') last.content += '\n\n' + c; else msgs.push({ role, content: c }); } // content may be a list of blocks (text and images), passed on as it is
    return run({ max_tokens: MAX_TOKENS, stream: true, output_config: { effort: effortOf(opts) }, messages: msgs }, opts, t0);
  }
  async function run(body, opts, t0) {
    const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: opts.signal });
    if (!r.ok) throw await errOf(r);
    const rd = r.body.getReader(), dec = new TextDecoder(); let buf = '', text = '', shown = '', model = '', stop = '', ttft = 0, u = { in: 0, cached: 0, out: 0 };
    const take = (ev) => {
      for (const line of ev.split('\n')) {
        if (!line.startsWith('data:')) continue; let j; try { j = JSON.parse(line.slice(5).trim()); } catch (e) { continue; }
        if (j.type === 'error') throw { code: /overloaded|rate/.test((j.error && j.error.type) || '') ? 'rate_limited' : 'model_error', message: (j.error && j.error.message) || 'error' };
        if (j.type === 'message_start' && j.message) { model = j.message.model || ''; const m = j.message.usage || {}; u.in = (m.input_tokens || 0) + (m.cache_creation_input_tokens || 0); u.cached = m.cache_read_input_tokens || 0; u.out = m.output_tokens || 0; }
        else if (j.type === 'message_delta') { if (j.usage) { if (j.usage.input_tokens != null || j.usage.cache_creation_input_tokens != null) u.in = (j.usage.input_tokens || 0) + (j.usage.cache_creation_input_tokens || 0); if (j.usage.output_tokens != null) u.out = j.usage.output_tokens; } if (j.delta && j.delta.stop_reason) stop = j.delta.stop_reason; }
        else if (j.type === 'content_block_delta' && j.delta && j.delta.type === 'text_delta' && j.delta.text) {
          if (!ttft) ttft = performance.now() - t0; text += j.delta.text; const t = tidy(text);
          if (opts.onText) try { opts.onText({ text: t, delta: t.startsWith(shown) ? t.slice(shown.length) : '' }); } catch (e) { console.warn(e); } shown = t;
        }
      }
    };
    for (;;) {
      const { value, done } = await rd.read(); if (done) break;
      buf += dec.decode(value, { stream: true }).replace(/\r\n/g, '\n'); let i;
      while ((i = buf.indexOf('\n\n')) >= 0) { take(buf.slice(0, i)); buf = buf.slice(i + 2); }
    }
    if (buf.trim()) take(buf);
    usage.push({ tier: opts.modelTier || 'default', task: opts.task || '', label: opts.label || '', effort: body.output_config.effort, model, in: u.in, cached: u.cached, out: u.out, thoughts: 0, ttft: Math.round(ttft), ms: Math.round(performance.now() - t0) });
    return { text: tidy(text), truncated: stop === 'max_tokens', modelTierApplied: model };
  }

  /* ---------- voice: the browser's Web Speech API, behind the page's dictation interface ----------
     Hold Space, speak, release: partial hypotheses while you speak, a final text per phrase. Chrome sends the audio to its own speech service. */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  function makeDict() {
    const L = { p: [], f: [], s: [] }, emit = (k, e) => { for (const fn of L[k]) try { fn(e); } catch (x) { console.warn(x); } };
    const cjk = (s) => /^[⺀-鿿가-힯　-〿＀-￯]/.test(s), sp = (s, n) => (n && !cjk(s) ? ' ' : '') + s;
    const tag = (l) => (l === 'zh' ? 'zh-CN' : l === 'en' ? 'en-US' : l || navigator.language || 'en-US');
    let cur = null; // { rec, finals, partial, stopping, ended }
    function start(opt) {
      return (cur ? stop() : Promise.resolve()).then(() => new Promise((res, rej) => {
        const rec = new SR(), s = (cur = { rec, finals: 0, partial: '', stopping: false, ended: null }); let opened = false;
        rec.continuous = true; rec.interimResults = true; rec.lang = tag(opt && opt.language);
        emit('s', { state: 'starting' });
        rec.onstart = () => { opened = true; emit('s', { state: 'listening' }); res(); };
        rec.onresult = (e) => {
          if (s !== cur) return; let interim = '';
          for (let i = e.resultIndex; i < e.results.length; i++) { const r = e.results[i], t = r[0].transcript; if (r.isFinal) { if (t.trim()) { s.partial = ''; emit('f', { text: sp(t.trim(), s.finals) }); s.finals++; } } else interim += t; }
          if (interim) { s.partial = interim; emit('p', { text: sp(interim.trim(), s.finals) }); }
        };
        rec.onerror = (e) => {
          const c = e && e.error; if (c === 'no-speech' || c === 'aborted') return;
          if (!opened) { cur = null; emit('s', { state: 'idle', reason: 'error' }); rej({ code: c === 'not-allowed' || c === 'service-not-allowed' ? 'not_granted' : 'unavailable', message: String(c) }); }
        };
        rec.onend = () => {
          if (s.ended) s.ended();
          if (s === cur && !s.stopping) { cur = null; emit('s', { state: 'idle', reason: 'error' }); } // the browser ended the session by itself
          if (!opened) rej({ code: 'unavailable', message: 'ended' });
        };
        try { rec.start(); } catch (e) { cur = null; emit('s', { state: 'idle', reason: 'error' }); rej({ code: 'unavailable', message: String(e && e.message || e) }); }
      }));
    }
    async function stop() {
      const s = cur; if (!s) return; s.stopping = true; emit('s', { state: 'finishing' });
      const n0 = s.finals; await new Promise((res) => { s.ended = res; setTimeout(res, 2500); try { s.rec.stop(); } catch (e) { res(); } });
      if (s.partial && s.finals === n0) { emit('f', { text: sp(s.partial.trim(), s.finals) }); s.partial = ''; } // the service never settled the last words: what it heard is kept
      cur = null; try { s.rec.abort(); } catch (e) {}
      emit('s', { state: 'idle', reason: 'stopped' });
    }
    return { start, stop, onPartial: (f) => L.p.push(f), onFinal: (f) => L.f.push(f), onState: (f) => L.s.push(f) };
  }

  /* ---------- saving files: an ordinary download ---------- */
  const downloads = { save: ({ filename, data }) => { const b = data instanceof Blob ? data : new Blob([data == null ? '' : data], { type: 'text/plain;charset=utf-8' }); const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = filename || 'download'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60e3); return Promise.resolve({ ok: true }); } };

  /* ---------- the host, as app/js/host.js expects it ---------- */
  window.SW_HOST = {
    name: 'tinker',
    ai: config.then((c) => (c && c.ready ? sample : null)),
    voice: SR ? Promise.resolve(makeDict()) : null,
    save: downloads,
    gate: { // the AI is not reachable: say what to set, in the host's words
      title: ['Inkling 还没配置好', 'Inkling is not set up'],
      body: ['在 .env 里填好 TINKER_BASE_URL 和 TINKER_API_KEY（可选 TINKER_MODEL），重启 node site/serve.js，再刷新这个页面。', 'Put TINKER_BASE_URL and TINKER_API_KEY (and optionally TINKER_MODEL) in .env, restart node site/serve.js, then reload this page.'],
      note: ['这个页面要由 node site/serve.js 打开，且 MODEL_PROVIDER=tinker。', 'This page has to be served by node site/serve.js '],
      action: null,
    },
    strings: {
      aiReady: ['AI 可用（Inkling）', 'AI available (Inkling)'],
    },
    usage, models: { text: 'set by TINKER_MODEL on the server' },
  };
})();
