"""glTF (GLB) export and scene statistics.

The exporter converts Blender Z-up to glTF Y-up, so the GLB lands in the
three.js scene's coordinates (metres, front of the desk toward +Z).
"""
from __future__ import annotations

import os

import bpy


def triangles(objs=None) -> int:
    dg = bpy.context.evaluated_depsgraph_get()
    total = 0
    for ob in objs or bpy.context.scene.objects:
        if ob.type != "MESH" or ob.hide_render:
            continue
        me = ob.evaluated_get(dg).to_mesh()
        me.calc_loop_triangles()
        total += len(me.loop_triangles)
        ob.evaluated_get(dg).to_mesh_clear()
    return total


def glb(path: str, collections: list[str] | None = None) -> dict:
    """Export visible meshes (optionally only the named collections) to a .glb."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    keep = []
    for ob in bpy.context.scene.objects:
        ob.select_set(False)
        if ob.type != "MESH" or ob.hide_render:
            continue
        if collections and not any(c.name in collections for c in ob.users_collection):
            continue
        keep.append(ob)
    for ob in keep:
        ob.select_set(True)
    kw = dict(filepath=path, export_format="GLB", use_selection=True, export_apply=True,
              export_yup=True, export_cameras=False, export_lights=False, export_extras=False)
    try:
        bpy.ops.export_scene.gltf(**kw, export_image_format="WEBP")
    except TypeError:
        bpy.ops.export_scene.gltf(**kw)
    return {"path": path, "bytes": os.path.getsize(path), "triangles": triangles(keep), "objects": len(keep)}
