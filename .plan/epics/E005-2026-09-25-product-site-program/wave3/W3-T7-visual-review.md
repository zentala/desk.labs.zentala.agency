# W3-T7 — Independent visual review of DeskScene v5 (2026-09-25)

Reviewer: fresh-context Fable, lenses from `design-review` and `design:design-critique`. Read-only;
no fixes applied. Inputs: `wave3/desk-scene-v5-*.png`, `home-section-v5.png`, v4/v3/v1.5 for
comparison, `W3-T4/T5` owner feedback, `W3-T7-v5-plan.md`, `DESIGN.md` §0 and §8.

## First impression (standing hero, `desk-scene-v5-standing.png`)

The eye lands on (1) the big dark chair bottom-left, (2) the sand figure, (3) the "112 cm" screen.
The product (sensor, beam, cable) is fourth. The picture reads as "a mannequin at a desk" before
it reads as "a sensor under a desk". It is clean, on-palette and clearly the same world as v4; the
screen is now sharp and the callouts are genuine renders. The insets, though, are the weakest
part of the frame, and they are the part that carries the product story. One word: *almost*.

## (A) Owner-requirement / DESIGN.md violations

| # | Finding | Evidence | Why it hurts | Fix | Imp. | Pts |
|---|---|---|---|---|---|---|
| A1 | Inset B does not show the cable entering a port. It shows a toast card and a black bezel; the plug is a ~6 px grey nub at the circle's right edge | all v5 desktop shots, inset top-right; `v5-inset.png` | The v5 plan's explicit ask ("cable entering the monitor") is not communicated; the object fills ~5 % of the circle, §8.10 asks ~60 % | Camera from behind-right at monitor-edge height, 16° lens, port + seated plug + 8 cm of cable filling the circle; show the bezel edge only as context | High | 3 |
| A2 | Text inside inset B ("Nice one." / "Time to stand up", skewed) | same | §8.10: "no text inside the circle"; the skewed, half-cropped toast reads as a rendering glitch | Exclude screen UI from inset B's `parts`, or aim the camera so the screen is off-frame | High | 1 |
| A3 | Leader line crosses its own label ("USB-C" in sitting and homepage; through the "C" in standing) | `v5-sitting.png` ~x1420 y325; `home-section-v5.png` y730 | Illegible label, looks unplaced; §8.10 forbids a leader crossing another inset — crossing the label is worse | Anchor the label under the ring and route the leader to the ring's lower-left tangent, or clamp the ring so the leader enters from below-left | High | 2 |
| A4 | Inset A's sensor fills ~15 % of the circle; most of the disc is an unexplained dark bracket and desktop underside | inset bottom-right in every v5 shot | §8.1 "nothing unexplained": the dark slab is the crossbar seen from below and reads as nothing; the PCB is small | Tighter lens (≈12°), sensor at ~50 % of the disc, `parts` = sensor + a 20 cm patch of top; drop the bracket from the inset | High | 2 |
| A5 | Plant moved left now sits in a tangent between the figure's arm and the monitor's left bezel; a green sliver only | `v5-standing.png` x925 y380; sitting x930 y530 | §8.1: recognisable at hero size or delete. It is a sliver; three edges meet at one point (arm, pot, bezel) | Move it 25 cm further left and 10 cm forward, or drop it (the owner allowed that) | Medium | 1 |
| A6 | Screen toast overlaps the "cm" unit of the readout | `v5-standing.png` x1085 y370: "112 c|Nice one." | The dominant element is clipped by the secondary one; looks like a layout bug on the product's own UI | Place the toast bottom-right under the readout baseline, or shrink the number's right margin; reserve a column for the toast | High | 2 |
| A7 | Columns do not show "three tones per box" | all shots, both columns | §8.1 rule and the owner's T5 correction ("legs reading as one flat colour is a lighting bug"). Front and +X side are within a few % of each other; the stage steps read only by the ink band | Raise fill intensity on +X or cool it further; give the bottom stage a value step visibly lighter than `ink` | Medium | 2 |
| A8 | Inset scissor leaks a square: a flat chord at the bottom of both rings and a light square behind the mobile rings | `v5-inset.png` y265 and y720; `v5-mobile.png` behind both 64 px circles | The "paper cover" corners do not match the page background, so the disc looks cut; on mobile the square is plainly visible | Mask with CSS `clip-path: circle()` on the View element instead of an SVG cover; cover colour must be `bg`, not `surface` | High | 2 |

## (B) Visual-quality issues

| # | Finding | Evidence | Why it hurts | Fix | Imp. | Pts |
|---|---|---|---|---|---|---|
| B1 | Ribcage + pelvis read as two stacked balls (snowman); the pelvis blob protrudes below the ribcage as a belly/bum lump | standing figure y530–620; worse in `figure-smooth.png` | Breaks the "someone" read; the eye goes to the lump | Scale the pelvis to 30 × 16 × 22, raise it 4 cm into the ribcage, add a short waist capsule so the silhouette is one mass | High | 3 |
| B2 | The empty chair is the largest, darkest mass in the standing hero and sits front-left at full size | `v5-standing.png` chair x330–780 | Hierarchy: the eye should go product → person → furniture; here furniture wins. Also cropped at the bottom edge (wheels at y1190) | Push the chair 30 cm back and 15 cm left in the standing pose (it was pushed back when they stood), lighten `material.fabric` one step, or lower the camera target lift so the wheels clear the frame | Medium | 2 |
| B3 | Cable rises in a stiff free-air arc from the desk corner to the port | all shots, x1230–1310 | Cables sag; a rising arc reads as bent wire, and the plan said "along the desk edge straight into the port" | Route: down from the sensor, along the back edge on the desktop, then a short drop-free run up the monitor's right side; make the on-desk segment visible | Medium | 2 |
| B4 | Mid-scroll "Rising" pose is a squat in mid-air, 40 cm in front of the chair | `v5-scroll-mid.png` | It is the frame most scroll users see longest; it reads as a glitch rather than standing up | Blend hips forward before up (stand-up arc: lean, then rise), keep the knees under the hips; the chair may roll back a few cm | Medium | 3 |
| B5 | Headroom: 300+ px of empty paper above the desk in sitting; on the homepage the scene box is 1,100 px tall with the story in the lower 60 % | `home-section-v5.png` y400–780 | The section is taller than its content; the insets float in the void top-right | Lower the frame height to ~1.9 m in the sitting pose or crop the container to 16:10 max on desktop | Medium | 2 |
| B6 | Homepage: the floor slab is sliced by the container's rounded corners, reading as a cropped photo | `home-section-v5.png` bottom corners | The "island" idea is lost; the corner radius competes with the sharp world | Let the slab end inside the frame (island) or drop the container radius for this section | Low | 1 |
| B7 | The chair's post/pan block is a slate-blue not in §8.2 (`sharp` variant) | standing x460 y940 | An off-palette colour on furniture; furniture must be neutral | Use `ink` for the post and pan | Low | 1 |
| B8 | Callout anchor dot sits exactly on the sensor and hides it | all shots, x1300 y540 | The one small product part in the main view is covered by UI | Offset the anchor 2 cm outboard of the sensor, or use a 3 px ring instead of a filled dot | Low | 1 |

## (C) Polish

- C1 Dark mode: inset A's paper cover appears as a lighter square against `#14171C` (`v5-standing-dark.png` bottom-right); same fix as A8. Low, 1.
- C2 Mobile: the chair backrest is cut by the left edge (`v5-mobile.png` x50); shift the target 10 cm right in portrait. Low, 1.
- C3 The "Open Smart Desk" app mark on the screen is ~8 px at hero size; either double it or drop it. Low, 1.
- C4 Inset labels are 13 px in a 1,920 px frame (`font-body` 500); at the homepage's real width they are fine, but the standing frame's label wraps to two lines while B's is one; align both to two-line boxes. Low, 1.
- C5 The keyboard is fully hidden behind the standing figure's hand; the "hands on keyboard" story is lost in the hero pose. Low, 1.

## Chair A/B and figure A/B

**Chair: A (sharp), with two edits.** The rounded variant (`v5-chair-rounded.png`) turns the
backrest into a lozenge leaf and the seat into a sagging pancake with the pan visible below; it
also breaks §8.1 (no smooth curves). The sharp chair belongs to the world, but its seat is ~10 cm
thick and its post block is off-palette (B7). Edits: seat 6 cm, backrest tilted 8°, post in `ink`.

**Figure: faceted.** The smooth variant (`v5-figure-smooth.png`) reads as an inflatable balloon
mannequin and makes B1 worse; the facets are what let the rig sculpt the form (the owner's own
T5 argument). Keep `faceted`; fix the torso (B1) and the standing arm pivot (the upper arm still
leaves the ribcage a little high).

## Do the insets communicate "sensor under desk → cable → monitor"?

Partially. **A says "there is a green board under the desk and a red beam goes down"** — yes,
readable, though the board is small and half the disc is unexplained bracket. **B says "a
notification on a monitor"** — no; the port and plug are invisible at a glance, the toast steals
the frame, and the leader crosses the label. The cable link between A and B is carried only by the
main view's arc, which reads as stiff wire. After A1, A3, A4 and B3 the chain would read in one
glance: sensor (A) → cable along the desk edge (main view) → plug in the port (B).

## Top 3 changes for perceived quality

1. Re-aim both insets (A1, A2, A4) and fix the square scissor leak + leader/label collision
   (A8, A3). This is the product story and the most visibly broken element. ~10 pts.
2. One-mass torso for the figure (B1) and a believable rising pose (B4). ~6 pts.
3. Screen layout: toast under the readout, nothing overlapping "cm" (A6); three visible tones on
   the columns (A7). ~4 pts.

## Worse than v4 / v1.5

- New in v5: inset scissor square (A8), leader crossing its label (A3), toast clipping "cm" (A6),
  plant tangent (A5). v4's toast sat clear of the number and its SVG insets, though fake, told the
  height story in one glance; v5's real B inset tells less than v4's drawing did.
- v1.5's desk had crisper value separation between leg faces than v5's columns (A7); v1.5's
  teal was wrong, its contrast was right.
- Everything else is better: screen sharpness at dpr 1 and 2, lighter shadows, arm pivots without
  shoulder caps, chair scale, the sensor visible in the main view, dark mode.

Totals: (A) 15 pts, (B) 15 pts, (C) 5 pts. Recommended for the one fix round: A1–A4, A6, A8, B1
(High) = 15 pts; A5, A7, B3, B4 if budget allows.
