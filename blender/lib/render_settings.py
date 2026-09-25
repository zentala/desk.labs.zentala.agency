"""Render settings: EEVEE for iteration, Cycles (GPU, low samples + denoise) for finals.

Colour management uses "Khronos PBR Neutral" - the same curve as three.js
NeutralToneMapping on the site, so token colours land where the web scene
puts them (AgX desaturates the paper and the coral; Standard clips).
"""
from __future__ import annotations

import bpy


def _try(obj, attr, value):
    try:
        setattr(obj, attr, value)
        return True
    except (AttributeError, TypeError, ValueError):
        return False


def colour_management(scene=None, view="Khronos PBR Neutral", exposure=0.0):
    sc = scene or bpy.context.scene
    sc.display_settings.display_device = "sRGB"
    if not _try(sc.view_settings, "view_transform", view):
        sc.view_settings.view_transform = "AgX"
    _try(sc.view_settings, "look", "None")
    sc.view_settings.exposure = exposure
    sc.view_settings.gamma = 1.0


def output(width=1920, height=1200, percent=100, transparent=False, scene=None):
    sc = scene or bpy.context.scene
    r = sc.render
    r.resolution_x, r.resolution_y, r.resolution_percentage = width, height, percent
    r.film_transparent = transparent
    r.image_settings.file_format = "PNG"
    r.image_settings.color_mode = "RGBA" if transparent else "RGB"
    r.image_settings.color_depth = "8"
    _try(r.image_settings, "compression", 30)


def gpu_devices(kind: str = "OPTIX") -> str:
    """Enable every GPU of `kind` (falls back CUDA -> CPU). Returns what is in use."""
    prefs = bpy.context.preferences.addons["cycles"].preferences
    for k in (kind, "CUDA", "HIP", "METAL", "ONEAPI"):
        try:
            prefs.compute_device_type = k
        except TypeError:
            continue
        prefs.refresh_devices()
        gpus = [d for d in prefs.devices if d.type == k]
        if gpus:
            for d in prefs.devices:
                d.use = d.type == k
            return k
    return "CPU"


def eevee(samples=32, scene=None):
    sc = scene or bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    e = sc.eevee
    e.taa_render_samples = samples
    _try(e, "use_raytracing", True)
    _try(e, "use_shadows", True)
    _try(e, "shadow_ray_count", 2)
    _try(e, "shadow_step_count", 8)
    _try(e, "use_fast_gi", True)
    _try(e, "fast_gi_method", "GLOBAL_ILLUMINATION")
    _try(e, "fast_gi_distance", 0.6)
    colour_management(sc)


def cycles(samples=96, denoise=True, scene=None, device="OPTIX"):
    sc = scene or bpy.context.scene
    sc.render.engine = "CYCLES"
    used = gpu_devices(device)
    sc.cycles.device = "CPU" if used == "CPU" else "GPU"
    sc.cycles.samples = samples
    _try(sc.cycles, "use_adaptive_sampling", True)
    _try(sc.cycles, "adaptive_threshold", 0.02)
    sc.cycles.use_denoising = denoise
    _try(sc.cycles, "denoiser", "OPENIMAGEDENOISE")
    _try(sc.cycles, "denoising_input_passes", "RGB_ALBEDO_NORMAL")
    _try(sc.cycles, "denoising_use_gpu", True)
    sc.cycles.max_bounces = 6
    sc.cycles.diffuse_bounces = 3
    sc.cycles.glossy_bounces = 2
    sc.cycles.transparent_max_bounces = 8
    _try(sc.cycles, "caustics_reflective", False)
    _try(sc.cycles, "caustics_refractive", False)
    sc.render.use_persistent_data = True
    colour_management(sc)
    return used


def engine(name: str, samples: int | None = None):
    if name == "eevee":
        eevee(samples or 32)
        return "EEVEE"
    return "CYCLES/" + cycles(samples or 96)


def ao_boost(factor: float = 0.7, distance: float = 0.3, scene=None) -> bool:
    """N8AO-like contact darkening: multiply the beauty pass by the ambient-occlusion pass.

    Cycles already has physically correct occlusion from GI; this exaggerates it in creases and
    under objects the way a screen-space AO pass does on the web (DESIGN.md §8.3 notes that the
    site has no SSAO; the owner welcomed it for these renders). Blender 5.x compositor API:
    a CompositorNodeTree assigned to scene.compositing_node_group. Returns False if unsupported.
    """
    sc = scene or bpy.context.scene
    try:
        sc.view_layers[0].use_pass_ambient_occlusion = True
        if sc.world is not None:
            sc.world.light_settings.distance = distance
        ng = bpy.data.node_groups.get("COMP-ao") or bpy.data.node_groups.new("COMP-ao", "CompositorNodeTree")
        ng.nodes.clear()
        if not any(i.in_out == "OUTPUT" for i in ng.interface.items_tree):
            ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
        rl = ng.nodes.new("CompositorNodeRLayers")
        mix = ng.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "MULTIPLY"
        mix.inputs[0].default_value = factor
        out = ng.nodes.new("NodeGroupOutput")
        ng.links.new(rl.outputs["Image"], mix.inputs[6])
        ng.links.new(rl.outputs["Ambient Occlusion"], mix.inputs[7])
        ng.links.new(mix.outputs[2], out.inputs[0])
        sc.compositing_node_group = ng
        sc.render.use_compositing = True
        return True
    except Exception as exc:  # noqa: BLE001 - optional polish, never fail a render over it
        print(f"AO boost unavailable: {exc}")
        return False
