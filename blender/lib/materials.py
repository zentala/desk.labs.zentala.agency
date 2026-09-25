"""Materials in the "faceted light" language (DESIGN.md §8.1-§8.2).

Everything is a Principled BSDF so the scene exports cleanly to glTF
(three.js MeshStandardMaterial). Finishes:
  matte  - the default: high roughness, low specular (reads like Lambert)
  satin  - monitor body, chair base: a soft highlight, still no reflections
  glow   - the one emissive thing: the coral beam and its floor dot
  screen - an emissive image (the app UI), dimmed a little to sit with the paper
Materials are cached by name; call with the same name to reuse.
"""
from __future__ import annotations

import bpy

from .tokens import lin, tok


def _principled(mat: bpy.types.Material):
    mat.use_nodes = True  # no-op/deprecated in 5.x (always on), kept for 4.x
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    if bsdf is None:
        nt.nodes.clear()
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
        nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return nt, bsdf


def _get(name: str):
    return bpy.data.materials.get(name)


def matte(name: str, hex_colour: str, roughness: float = 0.88, specular: float = 0.18):
    if (m := _get(name)) is not None:
        return m
    m = bpy.data.materials.new(name)
    _, bsdf = _principled(m)
    bsdf.inputs["Base Color"].default_value = lin(hex_colour)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Specular IOR Level"].default_value = specular
    m.diffuse_color = lin(hex_colour)  # viewport / solid mode
    return m


def satin(name: str, hex_colour: str):
    return matte(name, hex_colour, roughness=0.45, specular=0.45)


def glow(name: str, hex_colour: str, strength: float = 6.0):
    """Emissive coral: the beam and the floor dot (the only glow, DESIGN.md §0 elevation.beam)."""
    if (m := _get(name)) is not None:
        return m
    m = bpy.data.materials.new(name)
    _, bsdf = _principled(m)
    bsdf.inputs["Base Color"].default_value = lin(hex_colour)
    bsdf.inputs["Emission Color"].default_value = lin(hex_colour)
    bsdf.inputs["Emission Strength"].default_value = strength
    bsdf.inputs["Roughness"].default_value = 0.9
    return m


def halo(name: str, hex_colour: str, strength: float = 1.2, alpha: float = 0.35):
    """Soft coral disc under the beam: radial alpha falloff (render only; glTF keeps a flat alpha)."""
    if (m := _get(name)) is not None:
        return m
    m = bpy.data.materials.new(name)
    nt, bsdf = _principled(m)
    bsdf.inputs["Base Color"].default_value = lin(hex_colour)
    bsdf.inputs["Emission Color"].default_value = lin(hex_colour)
    bsdf.inputs["Emission Strength"].default_value = strength
    # radial falloff from the object's generated coordinates (disc centred at 0.5, 0.5)
    tex = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeVectorMath")
    sep.operation = "DISTANCE"
    sep.inputs[1].default_value = (0.5, 0.5, 0.5)
    ramp = nt.nodes.new("ShaderNodeMapRange")
    ramp.inputs["From Min"].default_value = 0.0
    ramp.inputs["From Max"].default_value = 0.5
    ramp.inputs["To Min"].default_value = alpha
    ramp.inputs["To Max"].default_value = 0.0
    nt.links.new(tex.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs["Value"], ramp.inputs["Value"])
    nt.links.new(ramp.outputs["Result"], bsdf.inputs["Alpha"])
    try:
        m.surface_render_method = "BLENDED"
    except (AttributeError, TypeError):
        pass
    return m


def screen(name: str, image_path: str, strength: float = 0.94):
    """The app on a display: an emissive image. `strength` < 1 dims it (DESIGN.md §3.3: dimmed 6 %)."""
    m = _get(name)
    if m is None:
        m = bpy.data.materials.new(name)
    nt, bsdf = _principled(m)
    for n in list(nt.nodes):
        if n.type == "TEX_IMAGE":
            nt.nodes.remove(n)
    img = bpy.data.images.load(image_path, check_existing=True)
    img.reload()
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = img
    tex.interpolation = "Cubic"
    bsdf.inputs["Base Color"].default_value = (0.0, 0.0, 0.0, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.35
    bsdf.inputs["Specular IOR Level"].default_value = 0.25
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = strength
    return m


class Palette:
    """Scene palette: DESIGN.md §8.2 roles mapped to materials (light theme)."""

    def __init__(self, theme: str = "light"):
        t = lambda p: tok(p, theme)  # noqa: E731
        self.paper = matte("paper", t("bg"), roughness=0.95, specular=0.05)
        self.slab = matte("slab", t("surface-2"), roughness=0.95, specular=0.05)
        self.rug = matte("rug", t("line"), roughness=1.0, specular=0.0)
        self.desk_top = matte("desk_top", t("material.desk-top"), roughness=0.8)
        self.ink = matte("ink", t("ink"))
        self.ink_satin = satin("ink_satin", t("ink"))
        self.ink_muted = matte("ink_muted", t("ink-muted"))
        self.line = matte("line", t("line"))
        self.line_strong = matte("line_strong", t("line-strong"))
        self.stage_mid = matte("stage_mid", "#4B5160")
        self.fabric = matte("fabric", t("material.fabric"), roughness=0.95, specular=0.1)
        self.figure = matte("figure", t("material.figure"), roughness=0.9, specular=0.12)
        self.surface = matte("surface", t("surface"), roughness=0.6, specular=0.3)
        self.case = matte("case", t("material.case"), roughness=0.7, specular=0.25)
        self.pcb = matte("pcb", t("material.pcb"))
        self.beam = glow("beam", t("brand"), strength=8.0)
        self.dot = glow("dot", t("brand"), strength=4.0)
        self.halo = halo("halo", t("brand"))
