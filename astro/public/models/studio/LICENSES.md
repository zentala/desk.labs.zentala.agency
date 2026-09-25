# Studio models — sources and licences

Every file here is CC0 1.0 or MIT. Licences were checked per source on
2026-09-25 against the licence text shipped inside each download (quoted
below) and the source's own page. The GLBs are built from those downloads by
`build-models.mjs` (kept with the E005 studio screenshots in the repo's plan
folder): only the clips the timeline uses are kept, and joints are matched by
name. These files are lab material for `/lab/studio`; the public site never
loads them.

| File | Source | Author | Licence | Evidence |
|---|---|---|---|---|
| `ual-mannequin.glb` | Universal Animation Library [Standard] 1.x, `Unreal-Godot/UAL1_Standard.glb` — https://quaternius.itch.io/universal-animation-library (free tier) | Quaternius | CC0 1.0 | `License.txt` in the zip: "CC0 1.0 Universal (CC0 1.0) Public Domain Dedication"; the itch page: "Creative Commons Zero v1.0 Universal". Kept clips: Idle_Loop, Idle_Talking_Loop, Sitting_Enter, Sitting_Exit, Sitting_Idle_Loop, Sitting_Talking_Loop, Walk_Loop, Walk_Formal_Loop. |
| `ubc-male.glb`, `ubc-female.glb` | Universal Base Characters [Standard], `Base Characters/Godot - UE/Superhero_{Male,Female}_FullBody.gltf` — https://quaternius.itch.io/universal-base-characters, https://quaternius.com/packs/universalbasecharacters.html | Quaternius | CC0 1.0 | `License_Standard.txt` in the zip: "License: CC0 1.0 Universal (CC0 1.0) Public Domain Dedication"; the pack page links CC0. Normal, roughness and occlusion maps dropped; animated with the UAL clips (same joint names). |
| `kaykit-mannequin.glb` | KayKit Character Animations 1.1 (Free), `Mannequin Character/characters/Mannequin_Medium.glb` + clips from `Animations/gltf/Rig_Medium/Rig_Medium_{Simulation,General,MovementBasic}.glb` — https://kaylousberg.itch.io/kaykit-character-animations | Kay Lousberg (www.kaylousberg.com) | CC0 1.0 | `License.txt` in the zip: "License: (Creative Commons Zero, CC0) http://creativecommons.org/publicdomain/zero/1.0/ … free to use in personal, educational and commercial projects". Clips: Sit_Chair_Down, Sit_Chair_Idle, Sit_Chair_StandUp, Idle_A, Walking_A. |
| `rocketbox-male-adult-01.glb` | Microsoft Rocketbox, `Assets/Avatars/Adults/Male_Adult_01/Export/Male_Adult_01.fbx` + `Assets/Animations/all_animations_max_motextr_static/{m_sit_chair_breathe_01,m_idle_neutral_01}.max.fbx` — https://github.com/microsoft/Microsoft-Rocketbox | Microsoft (Rocketbox Studios) | MIT | GitHub reports the repository licence as MIT (`LICENSE.md`: "MIT License … Copyright (c) 2020 Microsoft"). Converted headless with FBX2glTF 0.9.7 (npm `fbx2gltf`); colour textures (`m002_body_color`, `m002_head_color`, `m002_opacity_color`, TGA 2048²) downscaled to 512² JPG/PNG. 0.94 MB. MIT requires the copyright and licence notice with copies: `LICENSE-Microsoft-Rocketbox.txt` (verbatim from the repository) sits next to the file. |

Removed after the spike (owner rejected): RobotExpressive (CC0), Kenney mini
character (CC0), and the Godot-named UAL mirror (replaced by the official
`UAL1_Standard.glb`, whose joint names match the Base Characters).

Not a model file, listed for completeness: the `mannequin-js` npm package used
by `/lab/studio` is **GPL-3.0**, not CC0/CC-BY/MIT. It stays a lab-only
comparison; shipping it in the public site bundle would put that bundle under
GPL-3.0 obligations.
