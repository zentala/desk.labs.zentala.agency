"""Design tokens for Blender scenes, read from DESIGN.md §0 (the single source).

The JSON block under "## 0. Tokens" is parsed at import time, so a token change
in DESIGN.md reaches the renders without editing Python. Owner decisions that
are not yet tokens live in OVERRIDES with their date and source.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
DESIGN = REPO / "DESIGN.md"

# Owner decisions not yet in DESIGN.md §0 (candidates for a token).
OVERRIDES = {
    # 2026-09-25 owner decision (R-20): neutral warm case, replaces PCB green.
    "material.case": "#9D7E7E",
}


def _load() -> dict:
    text = DESIGN.read_text(encoding="utf-8")
    start = text.index("## 0. Tokens")
    m = re.search(r"```json\s*(\{.*?\})\s*```", text[start:], re.S)
    if not m:
        raise RuntimeError("DESIGN.md §0 JSON token block not found")
    return json.loads(m.group(1))


_TOKENS = _load()


def tok(path: str, theme: str = "light") -> str:
    """Hex colour for a dotted token path, e.g. 'ink', 'state.sitting.fill', 'material.figure'."""
    if path in OVERRIDES:
        return OVERRIDES[path]
    node = _TOKENS["color"]
    for part in path.split("."):
        node = node[part]
    value = node["$value"]
    return value[theme] if isinstance(value, dict) else value


def srgb_to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_to_srgb(h: str) -> tuple[float, float, float]:
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))  # type: ignore[return-value]


def lin(h: str, alpha: float = 1.0) -> tuple[float, float, float, float]:
    """Linear-light RGBA for a hex colour (Blender colour sockets are linear)."""
    r, g, b = (srgb_to_linear(c) for c in hex_to_srgb(h))
    return (r, g, b, alpha)


def lin_tok(path: str, theme: str = "light", alpha: float = 1.0):
    return lin(tok(path, theme), alpha)
