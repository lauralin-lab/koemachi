/* Spoken World · host: where the page lives.
   The world asks its home for a few things and does not care who provides them:

     ai      Promise<fn | null>    fn(input, { modelTier: 'quick'|'default'|'complex', task, onText({text}), signal }) -> Promise<{ text }>
                                   task (optional) says what the call is for ('shot': one simple camera move, 'shot-long': a take with several beats);
                                   a host may use it to pick a model, or ignore it
     voice   Promise<obj | null>   { start({language}), stop(), onPartial(fn), onFinal(fn), onState(fn) }: speech to text
     save    Promise<obj | null>   { save({ filename, data }) }: hand a file to the viewer
     gate    null | { title, body, note, action: { label, href } }: what to say when the AI cannot be reached and the world should not start
                                   (each text is [中文, English])
     access  null | { open({ what, text }) }: a home that lets visitors in before they have the AI (it calls YX.hooks.aiLater() when it does)
     strings { key: [中文, English] }: wording of the page that differs in this home (keys of the text table in ui.js, plus aiReady, aiLater, needTag)

   The one home is site/tinker.js (Inkling through Tinker, reached via the local server site/serve.js). It registers itself by setting
   window.SW_HOST before this file runs. Without it (app/ opened on its own) there is no AI and the page says how to start the server. */
'use strict';
(function () {
  const YX = window.YX; YX.hooks = YX.hooks || {};
  const none = { name: 'none', ai: null, voice: null, save: null, gate: { title: ['没有连接 AI', 'No AI connected'], body: ['请用 node site/serve.js 打开这个页面（见 README）。', 'Open this page through node site/serve.js (see the README).'], action: null } };
  const H = (YX.host = window.SW_HOST && typeof window.SW_HOST === 'object' ? window.SW_HOST : none);
  H.strings = H.strings || {}; if (H.gate === undefined) H.gate = null; if (H.access === undefined) H.access = null;
  for (const k of ['ai', 'voice', 'save']) H[k] = Promise.resolve(H[k] == null ? null : H[k]).catch(() => null);
})();
