# Spoken World: how it is put together, and where to extend it

One page, no build step for the product itself. `app/` is the page; it runs as a Claude artifact as it is, and as an open-web site
(`site/`, Gemini) with one extra file in front. Scripts load in the order below; each layer only knows the ones above it.

```
core.js      maths, colours, the parts builder (b.box, b.extrude, …), the renderer of parts
gens.js      the built-in object types (G.house, G.bus, …): each a recipe that builds an object from parameters and a seed
gens2.js     more of them
world.js     the world: objects (W.objs), environment (W.env), motion, gravity, collision, aim, save/restore
ops.js       the operations every sentence compiles to ({op:'add'|'set'|'move'|…}), undo, invented object types (code in a worker)
stage.js     cameras, shots, camera moves
mind.js      speech -> operations: tier 0 local grammar (instant), tier 1 the AI streams operations, tier 2 the AI writes a new object type or a scene
host.js      where the page lives: who provides the AI, voice input, saving, a video model, and the sign-in gate     <- swap this to move house
ui.js        boot, input, voice, panels, language
film.js      recording, scene description, the previz/real comparison
inside.js director.js multicam.js talk.js play.js after.js grass.js post.js wet.js perf.js guide.js
             rooms, AI shot design, three cameras, the townspeople, playback, consequences, grass, grading, rain, frame-rate guard, first-run guide
```

State is data, not meshes: an object is `{ id, type, params, x, y, z, rot, s, seed, motion, … }`; its shape is rebuilt from that by its
recipe. The whole world serialises to one JSON document (`YX.serialize()` / `YX.restore()`), which is what saving, undo and the film's
deterministic takes rest on.

## Extension points

| To add… | Do this | Nothing else changes because… |
|---|---|---|
| a built-in object | one entry `G.name = { label, nouns, params, build(b, p, rand) }` in gens2.js | nouns feed the grammar, the catalogue goes to the AI's prompt, params get sliders and sentences for free |
| an object at run time | nothing: "add a …" makes the AI write a recipe (`YX.registerCustom(meta, code)`), saved with the world | invented types go through the same builder and the same operations |
| a new kind of sentence | a rule in mind.js `parse…` that returns operations, or just a line in the operation catalogue the AI reads | every tier compiles to the same operations |
| a new operation | `OPS.name = (op, ctx) => ({ ok, msg })` in ops.js, plus one line in the catalogue in mind.js | undo, logging and the AI path wrap every operation the same way |
| a world rule as a setting (rain strength, wind, …) | as gravity is done: the value lives in `W.env` (world.js `setEnv`), `{op:"env","gravity":0}` sets it, a line of grammar says it ("zero gravity") | env is already saved, undone and described to the AI |
| another home (your own proxy, another model, another speech or video service) | one host object: `window.SW_HOST = { ai, voice, save, video, gate, strings }` before host.js (see app/js/host.js; site/gemini.js is the worked example) | the page only ever talks to `YX.host` |
| something that reacts to the world | a hook: `YX.hooks.afterCommand`, `YX.hooks.log`, `YX.hooks.ui`, `YX.onFrame` | talk.js, after.js and guide.js are all built this way |

## Two homes

- **Claude artifact** (`app/` as is): host = `window.claude` (AI, dictation, downloads). No outside calls, so no video model: footage is made outside and dropped in.
- **Open web** (`site/`): `node site/build.mjs` copies `app/` to `site/dist` and loads `site/gemini.js` first. That file is the Gemini host:
  the viewer's own API key, Gemini 4 Hydrogen for the AI, Gemini 3.5 Transcribe Live for voice, Gemini Omni for Make it real.

## What is deliberately not here yet

- Real physics (stacking, toppling, collisions with response): motion and gravity are hand-written rules. A physics engine would sit beside world.js `gravity()`/`solidPush()`.
- NPC memory beyond the last 8 exchanges per person, and people talking to each other (talk.js).
- Sharing a world between viewers (the world is one JSON document, so a host with storage could provide it: a `store` member on the host).


## Film: how a shot is made, changed and recorded

1. **Ask for a move** ("orbit this house", "push from the corner to the bakery door, then rise"). `director.js` gives the model the request, the camera, the subject (with the distance needed to hold all of it in frame at 24/35/50 mm), every obstacle's footprint and height, the roads and who is moving. The answer is 3-7 keyframes; the engine smooths them, bends the path round or over anything solid, flies it once as a preview and keeps it as a shot.
2. **Say what to change.** The shot is remembered as its keyframes (`director.last`), so a note changes that shot instead of asking for a new one:
   - distance, height, speed, direction and lens ("farther", "too low", "slower", "the other way", "wider lens", "20 m away") are arithmetic on the keys (`applyNote`): instant and exact, no model call;
   - anything else ("start from the left and end on the door") goes to the model together with the shot as it stands and the notes already given, with the instruction to change only what the note is about.
   A note counts as being about the shot when it names the camera or follows a shot directly; "higher" said after other work is still about the object under the crosshair. The buttons under the plan do the same things.
3. **"Record it"** flies the shot again and films it, and stops by itself. "Action" / "cut" are only for filming by hand and for standing cameras.

Standing cameras (`multicam.js`): "film this with three cameras" places three around the subject (`angles`: three of wide, side, low, close, front, back, top). "Put a camera here" stands one where the player is, filming exactly what they see; up to three, anywhere, including indoors (`YX.eyes` keeps that room built and lit). "Action" films them side by side in one clip, one 1280x720 picture each.

People use doors (`ops.js` walk, `world.js` goto): a walker's `ms.via` is a stretch walked exactly as laid out, with the height following the floor. Going into a building is door -> floor -> spot; coming out is floor -> door -> ground. `{"op":"walk","from":BUILDING}` brings out whoever is inside, or a new person when nobody is.


## Freedom before presets

Where a thing could be done in many ways, the engine takes a description, not a pick from a list; the named presets are shorthand for the same numbers.

- **Paths** (`director.js` route, `world.js` motion `route`): anything that flies, walks or drives can be given a path in words ("a figure of eight over the square", "spiral up the tower and land on its roof"). The model gets the same plan of the place as for camera work and writes the points; the engine smooths them, takes them round (or over) what is in the way, and the thing travels them once or round and round. A path that ends on a roof is a landing. Notes change the path the way they change a shot. `flight: circle | roam` remain as two instant presets.
- **Standing cameras** (`multicam.js`): `cams: [{az, dist, height, lens, look, travel}]` describes each camera round its subject, whether the subject stands or moves; `angles: ["wide", "close", ...]` are named sets of those numbers. `here` puts one where the player stands; `follow` makes it turn with something.
- **Pointing** (`world.js` updateAim): boxes only choose which things to ask; the line of sight is tested against their real surfaces. When it meets only ground or a hillside, lines a little to each side are tried, because the crosshair has a size: the gap between a rover's legs is the rover.
- **Doors**: a door leaf is a `hinge` part; `YX.holdDoor(building, seconds)` opens it for whoever walks through, the player included. A house is a shell with a real doorway, so the room shows through it.
- **The video prompt** (`film.js`): fixed instruction + a scene description written from the world when the clip was recorded; shown beside "Make it real" and editable per clip.

The open-web build stamps itself (`window.SW_BUILD`, `version.json`): an open tab notices a newer build on the server and offers to reload.
