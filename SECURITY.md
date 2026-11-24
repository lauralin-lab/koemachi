# Security and your API key

## How the Tinker key is handled

- The key lives only on the machine that runs `node site/serve.js`: in `.env` (git-ignored; `.env.example` shows the shape), in the environment, or in the file `SW_ENV_FILE`
  points to. It is read on the server when a call is made and is never sent to the browser, written to a log or printed.
- The page sends its model calls to `POST /__tinker/messages` on that server, which adds the key and the model (`TINKER_MODEL`) and forwards the call to `TINKER_BASE_URL`.
- Your key pays for what the page does. Create a key for this purpose alone, and delete it when you are done. **If you ever paste a key into a chat, an issue or a commit, treat it as
  leaked and rotate it.**

## The local server

It listens on `127.0.0.1` only and answers a page it served itself: requests that come from another origin or another host name get a 403. Besides the page and the model proxy it has
a few small endpoints, all with that same check:

| endpoint | does | writes to |
|---|---|---|
| `GET /__config` | says whether the model is configured (never the key) | nothing |
| `POST /__shot` | keeps a Look & Fix picture or summary | `data/lookfix/` |
| `POST /__session` · `GET /__session` | appends one kept example · counts them | `data/sessions.jsonl` |
| `POST /__generator` | "Save as generator": one new file, never over an existing one, only if it starts with the standard header and defines the generator its name says | `app/generators/<name>.js` |

`data/` is git-ignored: the pictures, the kept examples (your commands and the scene around them) and the saved world stay on your machine unless you copy them out.

## What leaves your browser

- To your local server, and from it to Tinker: your commands as text, the description of the scene the model needs to act on them, and, for Look & Fix, a picture of one new object.
- Voice: with Chrome's Web Speech API, the microphone audio you speak while holding Space goes to the browser's own speech service (Google, in Chrome), not to this app's server or to Tinker.
- To cdnjs: the request for Three.js.
- Nothing else. There is no analytics and no account.

## Generated code

"Build something new" asks the model for a small generator program and runs it. It runs in a Web Worker that has no access to the page and whose network functions (`fetch`,
`XMLHttpRequest`, `WebSocket`, `importScripts`) are removed; only its output, a list of parts, is used. The generated programs are stored with your world in `localStorage` and run again,
the same way, when the world loads. A program you save with **Save as generator** becomes an ordinary file in `app/generators/`, which runs in the page like any other generator:
read it before you build it into your copy, and review any generator file in a pull request the way you would review any code.

## Reporting a problem

Please open a private security advisory on the GitHub repository (Security tab, "Report a vulnerability"). For anything that is not sensitive, an ordinary issue is fine.
