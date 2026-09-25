# Spike models — sources and licences

All files in this folder are CC0 1.0 (public domain dedication). Verified per
file on 2026-09-25 from the source's own licence text, linked below.

| File | Source | Author | Licence | Verified at |
|---|---|---|---|---|
| `RobotExpressive.glb` | https://github.com/mrdoob/three.js/blob/dev/examples/models/gltf/RobotExpressive/RobotExpressive.glb | Tomás Laulhé (Quaternius); morph targets + glTF conversion by Don McCurdy | CC0 1.0 | `examples/models/gltf/RobotExpressive/README.md` in the three.js repo: "Model by Tomás Laulhé. … CC0 1.0." (re-checked 2026-09-25) |
| `KenneyMiniCharacterMaleB.glb` | https://kenney.nl/assets/mini-characters (zip `kenney_mini-characters.zip`, file `Models/GLB format/character-male-b.glb`, pack v1.0, 2024-07-17) | Kenney (www.kenney.nl) | CC0 1.0 | `License.txt` inside the zip: "License: (Creative Commons Zero, CC0) http://creativecommons.org/publicdomain/zero/1.0/" |
| `Textures/colormap.png` | same zip, `Models/GLB format/Textures/colormap.png` — the external texture `KenneyMiniCharacterMaleB.glb` references by URI | Kenney (www.kenney.nl) | CC0 1.0 | same `License.txt`; kenney.nl/assets/mini-characters states "Creative Commons CC0" (re-checked 2026-09-25) |
| `QuaterniusAnimationLibrary.gltf` + `AnimationLibrary_Godot_Standard.bin` | https://github.com/J-Ponzo/gltf-universal-animation-library (`glTF/AnimationLibrary_Godot_Standard.*`), a glTF-only mirror of the free tier of https://quaternius.itch.io/universal-animation-library | Quaternius | CC0 1.0 | `LICENSE` in the mirror repo is the CC0 1.0 Universal text; the pack page states "Creative Commons Zero v1.0 Universal … (CC0 License)"; the mirror README says it is "the standard FREE version … as distributed at https://quaternius.itch.io/universal-animation-library on 2025-06-10" (re-checked 2026-09-25) |

Credit is not required by CC0; we credit anyway. These files are spike material
only (`/lab/spike`); nothing on the public site loads them.

Not a model file, listed for completeness: the `mannequin-js` npm package used
by `/lab/spike` is **GPL-3.0**, not CC0/CC-BY. It is fine inside this throw-away
spike, but shipping it in the public site bundle would put that bundle under
GPL-3.0 obligations — do not adopt it without a licence decision.
