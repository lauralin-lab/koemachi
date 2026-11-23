# Security and your API key

## How the Tinker key is handled

- The key lives only on the machine that runs `node site/serve.js`: in `.env` (git-ignored), in the environment, or in the file `SW_ENV_FILE`
  points to. It is read on the server when a call is made and is never sent to the browser or printed.
- The page sends its model calls to `POST /__tinker/messages` on that server, which adds the key and the model (`TINKER_MODEL`) and forwards the call
  to `TINKER_BASE_URL`. The server listens on `127.0.0.1` only and refuses requests from another origin or another host name.
- Your key pays for what the page does. Create a key for this purpose alone and delete it when you are done.

## What leaves your browser

- To your local server, and from it to Tinker: your commands as text, and the description of the scene the model needs to act on them.
- Voice: with Chrome's Web Speech API, the microphone audio you speak while holding Space goes to the browser's own speech service (Google, in Chrome),
  not to this app's server or to Tinker.
- To cdnjs: the request for Three.js.
- Nothing else.

## Generated code

"Build something new" asks the model for a small generator program and runs it. It runs in a Web Worker that has no
access to the page and whose network functions (`fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts`) are
removed; only its output, a list of parts, is used. The generated programs are stored with your world in `localStorage` and run again, the same way,
when the world loads.

## Reporting a problem

Please open a private security advisory on the GitHub repository (Security tab, "Report a vulnerability"). For anything
that is not sensitive, an ordinary issue is fine.
