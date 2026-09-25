# W3-T5 — Owner feedback on DeskScene v2 (Paweł, 2026-09-25)

Verdict: big step up. The monitor does not look bad now (a slight curve would be welcome, not required). Take time; polish it.

MUST:
1. Fix everything in the coordinator's critique of v2:
   - the standing frame crops the chair legs and the figure's feet;
   - the ghost figure is crude (octagon head, lump arms not resting on the keyboard, standing figure passes through the desktop);
   - the on-screen cm readout should dominate more at hero size;
   - add a "Rising" transitional state instead of flipping at 92 cm;
   - the chair is too loud.
2. **Shapes more natural, as if someone drew them.** An illustrated, hand-drawn feel within the low-poly language (softer silhouettes, organic proportions, maybe subtle outline/ink treatment), not blocky primitives.
3. **Fit the website we have.** Define a restrained **color language** for illustrations. Neutral furniture: chair and desk legs must not shout. Color carries meaning only (coral = laser/nudge, state colors = app state on the screen). Write it into DESIGN.md §8.
4. **Zoom callouts** (circular magnified insets with leader lines and short labels), e.g.:
   - sensor stuck to the underside of the desktop, with a clear line of sight to the floor;
   - "USB-C cable to the monitor";
   - "laser measures desk height → we know if you sit or stand".
   They can be HTML/SVG overlays anchored to projected 3D points, or 3D insets. They must stay legible and on-style.
5. The sensor must be mounted **on the underside**, facing down, with visible line of sight to the floor. Make this explicit in the scene.

## Correction (Paweł, same day): item 2 is withdrawn

Do not aim for a hand-drawn look. The earlier simpler style (W3-T3) looked better. Its sharp shapes had form defined by light and shadow, and even the green legs showed their volume through shading. In v2 the legs read as one flat colour. The illustration must not pretend to be something it is not; it should use what real-time 3D does well.

Direction: **honest low-poly, faceted light.** Crisp edges, a strong key light plus fill so faces differ in tone, clear cast and contact shadows.
