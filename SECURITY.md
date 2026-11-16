# Security and your API key

## How the Gemini key is handled

- The hosted page and your own builds of it are static files. There is no server of ours in between: the page calls
  `https://generativelanguage.googleapis.com` straight from your browser.
- The key you paste is kept in the tab's `sessionStorage`, so it is gone when the tab closes. If you tick
  "Remember on this device" it is also kept in `localStorage` for that browser. The "Gemini key · change" button on the
  title card removes both.
- It is sent to Google's Gemini API and nowhere else. It is not written to the world save, to exported clips or to logs.
- Run locally (`node site/serve.js`), the key can come from an env file instead. The local server gives it only to a page
  it served itself, on `localhost`, to a same-origin request; it listens on `127.0.0.1` only and never prints the key.
- Your key pays for what the page does. "Make it real" (video) is the expensive call and runs only when you press it.
  Anyone who can use your browser profile can use a remembered key: do not tick "Remember" on a shared computer.

Recommended: create a key for this purpose alone, with a spending limit, and delete it when you are done.

## What leaves your browser

- To Google: your commands (as text or as microphone audio while you hold Space), the description of the scene the model
  needs to act on them, and, for "Make it real", the clip you recorded.
- To cdnjs: the request for Three.js.
- Nothing else. The page has no analytics. If that ever changes it will be stated here and in the key dialog first.

## Generated code

"Build something new" asks the model for a small generator program and runs it. It runs in a Web Worker that has no
access to the page or your key and whose network functions (`fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts`) are
removed; only its output, a list of parts, is used. In a build that holds an API key the code is never run in the page
itself: where a browser cannot start a worker, building new things fails with a message. The generated programs are stored
with your world in `localStorage` and run again, the same way, when the world loads.

## Reporting a problem

Please open a private security advisory on the GitHub repository (Security tab, "Report a vulnerability"). For anything
that is not sensitive, an ordinary issue is fine.
