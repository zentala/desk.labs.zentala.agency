// Builds the studio's candidate models from the downloaded packs (see LICENSES.md).
// Each output is one self-contained GLB: mesh + skin + only the clips the timeline uses.
// Clips from separate files are copied onto the target's joints BY NODE NAME.
import fs from "node:fs";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { prune, dedup, resample } from "@gltf-transform/functions";

const SCRATCH = path.resolve(process.argv[2]);
const OUT = path.resolve(process.argv[3]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

/** Copy named animations from `src` onto `dst`, binding channels to dst nodes with the same name. */
function copyClips(dst, src, keep) {
  const byName = new Map(dst.getRoot().listNodes().map((n) => [n.getName(), n]));
  const buffer = dst.getRoot().listBuffers()[0];
  for (const a of src.getRoot().listAnimations()) {
    const name = keep[a.getName()];
    if (!name) continue;
    const out = dst.createAnimation(name);
    let bound = 0;
    for (const ch of a.listChannels()) {
      const target = byName.get(ch.getTargetNode()?.getName());
      if (!target) continue;
      const s = ch.getSampler();
      const input = dst.createAccessor().setArray(s.getInput().getArray().slice()).setType(s.getInput().getType()).setBuffer(buffer);
      const output = dst.createAccessor().setArray(s.getOutput().getArray().slice()).setType(s.getOutput().getType()).setBuffer(buffer);
      const sampler = dst.createAnimationSampler().setInput(input).setOutput(output).setInterpolation(s.getInterpolation());
      out.addSampler(sampler).addChannel(dst.createAnimationChannel().setTargetNode(target).setTargetPath(ch.getTargetPath()).setSampler(sampler));
      bound++;
    }
    console.log(`  clip ${a.getName()} -> ${name}: ${bound}/${a.listChannels().length} channels bound`);
  }
}

function dropClipsExcept(doc, keep) {
  for (const a of doc.getRoot().listAnimations()) if (!keep.includes(a.getName())) a.dispose();
}

function dropTextures(doc, slots) {
  for (const m of doc.getRoot().listMaterials()) for (const slot of slots) m[`set${slot}`](null);
}

async function finish(doc, file) {
  await doc.transform(resample(), prune(), dedup());
  const p = path.join(OUT, file);
  await io.write(p, doc);
  console.log(`${file}: ${(fs.statSync(p).size / 1024).toFixed(0)} kB, clips: ${doc.getRoot().listAnimations().map((a) => a.getName()).join(", ") || "-"}`);
}

const UAL_CLIPS = ["Idle_Loop", "Idle_Talking_Loop", "Sitting_Enter", "Sitting_Exit", "Sitting_Idle_Loop", "Sitting_Talking_Loop", "Walk_Loop", "Walk_Formal_Loop"];

// 1. Quaternius UAL: its own mannequin plus the clips (UE-style joint names, shared with UBC)
{
  const doc = await io.read(path.join(SCRATCH, "itch/UAL1_Standard.glb"));
  dropClipsExcept(doc, UAL_CLIPS);
  await finish(doc, "ual-mannequin.glb");
}

// 2. Quaternius Universal Base Characters: bodies only (clips come from ual-mannequin.glb at runtime)
for (const who of ["Male", "Female"]) {
  const doc = await io.read(path.join(SCRATCH, `itch/ubc/Superhero_${who}_FullBody.gltf`));
  dropTextures(doc, ["NormalTexture", "MetallicRoughnessTexture", "OcclusionTexture"]);
  await finish(doc, `ubc-${who.toLowerCase()}.glb`);
}

// 3. KayKit mannequin (Rig_Medium) + chair / idle / walk clips
{
  const doc = await io.read(path.join(SCRATCH, "itch/kka/Mannequin_Medium.glb"));
  const keep = {
    "Rig_Medium_Simulation.glb": { Sit_Chair_Down: "Sit_Chair_Down", Sit_Chair_Idle: "Sit_Chair_Idle", Sit_Chair_StandUp: "Sit_Chair_StandUp" },
    "Rig_Medium_General.glb": { Idle_A: "Idle_A" },
    "Rig_Medium_MovementBasic.glb": { Walking_A: "Walking_A" },
  };
  for (const [file, clips] of Object.entries(keep)) copyClips(doc, await io.read(path.join(SCRATCH, "itch/kka", file)), clips);
  await finish(doc, "kaykit-mannequin.glb");
}

// 4. Microsoft Rocketbox Male_Adult_01 (FBX2glTF) + sit / idle clips, 512 px colour textures
{
  const doc = await io.read(path.join(SCRATCH, "rb/avatar.glb"));
  copyClips(doc, await io.read(path.join(SCRATCH, "rb/sit.glb")), { "Take 001": "Sit_Chair_Breathe" });
  copyClips(doc, await io.read(path.join(SCRATCH, "rb/idle.glb")), { "Take 001": "Idle_Neutral" });
  const images = { m002_body: "m002_body_color.jpg", m002_head: "m002_head_color.jpg", m002_opacity: "m002_opacity_color.png" };
  for (const m of doc.getRoot().listMaterials()) {
    const file = images[m.getName()];
    if (!file) continue;
    const tex = doc.createTexture(m.getName()).setImage(fs.readFileSync(path.join(SCRATCH, "rb", file))).setMimeType(file.endsWith(".png") ? "image/png" : "image/jpeg");
    m.setBaseColorTexture(tex).setBaseColorFactor([1, 1, 1, 1]);
    if (file.endsWith(".png")) m.setAlphaMode("MASK").setAlphaCutoff(0.5);
  }
  await finish(doc, "rocketbox-male-adult-01.glb");
}
