"""Headless render CLI for the Blender workspace.

  blender -b --factory-startup -P blender/render.py -- [options]

Options (after the `--`):
  --shots hero-sitting,hero-standing,sensor,port,paddle   (default: all stills)
  --engine eevee|cycles        eevee for iteration, cycles for finals (default: eevee)
  --samples N                  engine samples (eevee 32 / cycles 96 by default)
  --size 1920x1200             output size
  --percent 100                resolution percentage (50 for quick looks)
  --out DIR                    output directory (default: blender/out/renders)
  --blend                      also save a .blend per state into blender/out/blend
  --glb PATH                   export the sitting scene as GLB and print size + triangles
  --transparent                transparent film + backdrop hidden, floor kept as a shadow catcher
  --anim PATH.mp4              render the rise animation (desk 72 -> 112, the person stands)
  --frames N                   animation length in frames at 24 fps (default 120)
  --encode-only                with --anim: skip rendering, encode blender/out/anim_frames

Writes PNGs named <shot>.png and prints one JSON line per render with timings.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

from lib import camera, export, lighting, render_settings  # noqa: E402
from scenes import desk  # noqa: E402

OUT = os.path.join(HERE, "out")

# shot -> (stand progress t, camera builder(anchors) -> dict(pos, target, frame_h))
SHOTS = {
    "hero-sitting": (0.0, lambda a: dict(pos=(2.75, -2.05, 1.35), target=(0.08, -0.18, 0.76), frame_h=1.78)),
    "hero-standing": (1.0, lambda a: dict(pos=(2.75, -2.05, 1.45), target=(0.08, -0.18, 0.90), frame_h=1.95)),
    # the sensor from below and behind-right: case, lens, beam, the cable leaving the narrow end
    "sensor": (0.0, lambda a: dict(pos=tuple(a["sensor"] + Vector((0.30, -0.30, -0.25))),
                                   target=tuple(a["sensor"] + Vector((0.02, 0.02, -0.045))), frame_h=0.20)),
    # the plug seated in the monitor's side port, the cable leaving sideways and falling
    "port": (0.0, lambda a: dict(pos=tuple(a["port"] + Vector((0.46, -0.48, 0.22))),
                                 target=tuple(a["port"] + Vector((0.035, 0.0, -0.075))), frame_h=0.30)),
    # the paddle at the right end with its vertical buttons
    "paddle": (0.0, lambda a: dict(pos=tuple(a["paddle"] + Vector((0.16, -0.50, 0.05))),
                                   target=tuple(a["paddle"] + Vector((0.02, 0.0, 0.0))), frame_h=0.22)),
}


def parse():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser(prog="render.py")
    ap.add_argument("--shots", default=",".join(SHOTS))
    ap.add_argument("--engine", default="eevee", choices=["eevee", "cycles"])
    ap.add_argument("--samples", type=int)
    ap.add_argument("--size", default="1920x1200")
    ap.add_argument("--percent", type=int, default=100)
    ap.add_argument("--out", default=os.path.join(OUT, "renders"))
    ap.add_argument("--blend", action="store_true")
    ap.add_argument("--glb")
    ap.add_argument("--transparent", action="store_true")
    ap.add_argument("--anim")
    ap.add_argument("--frames", type=int, default=120)
    ap.add_argument("--no-stills", action="store_true")
    ap.add_argument("--encode-only", action="store_true", help="re-encode existing anim frames")
    ap.add_argument("--no-ao", action="store_true", help="skip the AO multiply in the compositor")
    a = ap.parse_args(argv)
    a.out = os.path.abspath(a.out)
    return a


def setup(args, transparent=False):
    w, h = (int(v) for v in args.size.split("x"))
    eng = render_settings.engine(args.engine, args.samples)
    render_settings.output(w, h, args.percent, transparent)
    lighting.rig()
    if not args.no_ao:
        render_settings.ao_boost()
    return eng


def make_transparent():
    """Hide the backdrop; the slab stays as a shadow catcher so the PNG composites on any page."""
    for ob in bpy.data.objects:
        if ob.name == "GEO-backdrop":
            ob.hide_render = True
        if ob.name in ("GEO-slab",):
            ob.is_shadow_catcher = True


def render_still(name, cam_kw, args):
    cam = camera.use(camera.camera(f"CAM-{name}", **cam_kw))
    path = os.path.join(args.out, f"{name}.png")
    bpy.context.scene.render.filepath = path
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    dt = time.time() - t0
    print("RENDER " + json.dumps({"shot": name, "path": path, "seconds": round(dt, 1),
                                   "engine": bpy.context.scene.render.engine}), flush=True)
    return dt


def run_stills(args):
    wanted = [s.strip() for s in args.shots.split(",") if s.strip()]
    by_t: dict[float, list[str]] = {}
    for s in wanted:
        by_t.setdefault(SHOTS[s][0], []).append(s)
    for t, names in sorted(by_t.items()):
        t0 = time.time()
        anchors = desk.build(t, OUT)
        print(f"BUILD t={t} {time.time() - t0:.1f}s", flush=True)
        setup(args, args.transparent)
        if args.transparent:
            make_transparent()
        if args.blend:
            os.makedirs(os.path.join(OUT, "blend"), exist_ok=True)
            bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "blend", f"desk-t{t:.0f}.blend"))
        for name in names:
            render_still(name + ("-transparent" if args.transparent else ""), SHOTS[name][1](anchors), args)


def run_glb(args):
    desk.build(0.0, OUT)
    info = export.glb(args.glb)
    print("GLB " + json.dumps(info), flush=True)


def run_anim(args):
    """Rise animation: rebuilds the scene per frame (the figure is re-posed and re-meshed), so it
    renders frames to PNG and encodes them afterwards with Blender's own FFmpeg (VSE)."""
    frames_dir = os.path.join(OUT, "anim_frames")
    os.makedirs(frames_dir, exist_ok=True)
    n = args.frames
    if args.encode_only:
        encode(frames_dir, args.anim, n, args)
        return
    hold = 12  # frames held at each end
    for f in range(n):
        u = min(1.0, max(0.0, (f - hold) / (n - 2 * hold - 1)))
        t = desk.smooth(u)
        story = desk.story_for(t)
        tex = desk.textures(os.path.join(OUT, "textures", "anim"), t, story)
        anchors = desk.build(t, OUT, tex=tex)
        setup(args)
        lift = 0.06 * t
        cam = camera.use(camera.camera("CAM-anim", pos=(2.75, -2.05, 1.35 + lift),
                                       target=(0.05, -0.15, 0.80 + lift), frame_h=2.05))
        path = os.path.join(frames_dir, f"f{f:04d}.png")
        bpy.context.scene.render.filepath = path
        t0 = time.time()
        bpy.ops.render.render(write_still=True)
        print(f"FRAME {f} t={t:.3f} {time.time() - t0:.1f}s", flush=True)
    encode(frames_dir, args.anim, n, args)


def encode(frames_dir, mp4, n, args):
    desk.clear()
    sc = bpy.context.scene
    w, h = (int(v) for v in args.size.split("x"))
    sc.render.resolution_x, sc.render.resolution_y = w * args.percent // 100, h * args.percent // 100
    sc.render.resolution_percentage = 100
    sc.sequence_editor_create()
    files = sorted(os.listdir(frames_dir))[:n]
    strip = sc.sequence_editor.strips.new_image("frames", os.path.join(frames_dir, files[0]), 1, 1) \
        if hasattr(sc.sequence_editor, "strips") else \
        sc.sequence_editor.sequences.new_image("frames", os.path.join(frames_dir, files[0]), 1, 1)
    for fn in files[1:]:
        strip.elements.append(fn)
    sc.frame_start, sc.frame_end = 1, len(files)
    sc.render.fps = 24
    sc.view_settings.view_transform = "Standard"
    if hasattr(sc.render.image_settings, "media_type"):  # Blender 5.x: video is a media type
        sc.render.image_settings.media_type = "VIDEO"
    sc.render.image_settings.file_format = "FFMPEG"
    sc.render.ffmpeg.format = "MPEG4"
    sc.render.ffmpeg.codec = "H264"
    sc.render.ffmpeg.constant_rate_factor = "HIGH"
    sc.render.filepath = mp4
    t0 = time.time()
    bpy.ops.render.render(animation=True)
    print("ANIM " + json.dumps({"path": mp4, "frames": len(files), "encode_s": round(time.time() - t0, 1)}), flush=True)


def main():
    args = parse()
    os.makedirs(args.out, exist_ok=True)
    if not args.no_stills and not args.anim and not (args.glb and args.shots == ""):
        run_stills(args)
    if args.glb:
        run_glb(args)
    if args.anim:
        run_anim(args)


if __name__ == "__main__":
    main()
