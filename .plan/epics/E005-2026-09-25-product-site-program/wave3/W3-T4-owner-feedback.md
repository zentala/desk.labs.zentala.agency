# W3-T4 — Owner feedback on DeskScene v1 (Paweł, 2026-09-25)

Verdict: "not bad for a first pass", with these corrections. All are MUST unless marked.

## Sensor and cable
1. The sensor is NOT at the front. At the front it would hit the user's legs or chair or shine on their belly. Place it at the **back right corner** (the camera sees the desk from the front right), mounted on the side/back of the desktop. The beam must reach the **floor** without touching a desk leg.
2. A thin cable runs from the sensor to the computer. Assume an **all-in-one monitor** and plug the cable into the monitor.

## Desk
3. The desk's own **control paddle** sits front right: buttons 1 2 3 4 (memory) plus up/down, like a standard electric desk. It connects only to the desk motor through its own cable. Show that these are **two separate systems**: the desk controller (buttons → motor) and our sensor (cable → computer). We do not integrate with the desk.
4. The desktop can be **narrower**. Keep it believable, not confusing.
5. Legs and frame should look more **solid / premium**. The middle crossbeam looks suspicious; check how real desks look from below (frame rails, column feet).
6. Remove the unexplained props (red cylinders, the small cone/"dome"). Props only if clearly recognisable, or none.

## Monitor and state
7. Use a **big, wide screen**, possibly curved or with rounded corners.
8. The height/state readout ("Standing · 112 cm") belongs **on the monitor screen, inside the app UI**, not floating in the scene. All state changes show up in the on-screen app.
9. The screen must render **sharp**. Canvas texture at devicePixelRatio ×2 or more, anisotropic filtering, readable text at hero size.

## People and motion
10. Add a **chair**, and a person or at least a **semi-transparent silhouette/shadow** of one, so it is obvious someone sits or stands there.
11. Idea to explore (SHOULD): **scroll-driven**. The desk starts in the sitting position and rises as you scroll. The page scroll *is* the stand-up moment.

## Corrections, round 2 (Paweł, 2026-09-25)

- Item 4 was misread. Keep the **desktop thickness**. Only the **depth** (front to back) may be slightly smaller.
- Item 5 clarified: **under the desktop a horizontal tube joins both columns and sticks out on the right side, mid-desk, as a red/orange rod.** It looks wrong. Remove it. A real frame is two side brackets plus a slim crossbar hidden flush under the top, not visible as a tube.
- **Columns are too thick.** Use telescopic stages where the **bottom stage is the thinnest and each stage above is wider by ~7 mm per side (~14 mm in total width)**. Nested profiles overlapping each other is what makes it look good. Overall columns are slimmer than now.
- **Feet** (the part touching the floor): good, keep as is.
- Composition with the wider monitor: minimalist and elegant, but not empty. Balance the proportions.
- **One consistent style for everything.** No external 3D models or libraries are required. Draw everything procedurally ourselves (chair, person silhouette, props) in the same low-poly language.
- Do a self-review pass: critique your own screenshots and fix what makes it look worse, beyond this list.
