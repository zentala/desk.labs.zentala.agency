# E010 — Story script and copy: homepage, /how-it-works, /why-stand

Status: draft for owner review (wave 2). Language: English (site copy). Rules follow
PLAN.md §13 (MoveUp defaults), not `NOTIFICATION-ALGORITHM.md`. Numbers come only from
wave1/E007 and E007b, cited inline with confidence. Where E008b's illustration list says
"45 min", "2 minutes" or "streak", this document overrides it: 40 min, 1 min, no streaks.

Audience for the copy: someone who owns a height-adjustable desk, works at a computer
most of the day, and has already tried at least one reminder app. They do not need
"what is a standing desk" or "sitting is bad" explained. They need to know what this
thing does differently and whether it will annoy them.

---

## 1. The story

**One paragraph.** You bought a desk that goes up. It went up once. Since then it has
been a very expensive table, because nothing at the desk knows whether you stood or not,
so nothing can help you keep at it. Open Smart Desk is a small laser sensor clipped under
the desktop and a quiet app in your tray. The sensor measures the height of the desk. The
app watches whether you are at the keyboard. After 40 minutes of sitting it puts a small
card in the corner of your screen. You press the desk button yourself; the laser sees the
desk rise, and the sitting clock runs backwards: every minute up buys back two. Walk to
the kitchen, and that counts too. Stand too long and it asks you to sit, because the point
is to alternate, not to stand. At the end of the day you see how often you changed
position and a score that went up when you moved. No streak to break, no account, no
cloud, and the code is open.

**Narrative arc of the scroll-driven homepage (one day at the desk).** Scene tokens refer
to E008b §3.

| Beat | What the visitor sees | State token |
|---|---|---|
| 1. Morning | Character sits, beam on, readout `72 cm`. Clock chip starts | `sitting` (amber) |
| 2. 40 minutes | Chip reads `40 min`. A card slides up bottom-right of the monitor | `nudge` (coral) |
| 3. The button | Character reaches for the desk button. Desk rises, beam shortens, readout ticks `72 → 112 cm` | `standing` (green) |
| 4. Buying back | Sitting clock runs backwards at 2× while character stands | `standing` + amber clock decreasing |
| 5. Move a little | Character walks off, stool empty, beam still measuring | `away` (grey) |
| 6. Too long up | After 90 min standing a second card: "sit for a while?" Desk lowers | `nudge` → `sitting` |
| 7. End of day | Timeline bar: amber/green/grey segments; "6 posture changes · +42 pts"-style panel (illustrative, labelled as mock) | all four, plus `--brand` for score |
| 8. CTA | Same desk, evening light, card: "Notify me at launch" | `--brand-strong` |

The emotional line is: recognition (beat 1) → relief that the ask is small (2–3) →
delight that the maths is generous (4–5) → trust that it is not a standing cult (6) →
no guilt (7) → sign up (8).

---

## 2. Homepage copy, section by section

Global rules: no counters, no testimonials, no dates, no "AI", no "smart desk", no
"automatic". Headline font Bricolage 600–700, body Inter (E008b §4). CTA is the
`<LaunchCTA state="prelaunch">` component from E006 §6.

### 2.1 Hero

- **Eyebrow:** Open-source sensor + tray app for the desk you already own
- **H1:** Your desk already goes up. Now something knows if you do.
- **Subhead:** A laser sensor under your desktop and a quiet tray app. After 40 minutes of
  sitting it asks you to stand. When you do, it sees the desk rise and gives you credit.
- **CTA primary:** Notify me at launch · **secondary:** Build it yourself
- **Micro-line under CTA:** One email when the app ships. No newsletter.
- **Alt text (static fallback):** Low-poly desk with a small sensor under the desktop, a red
  laser line to the floor and a notification card in the bottom-right corner of the monitor.
- **3D brief:** E008b scene 1. Character seated, beam on, readout `72 cm`. Toast appears
  after 1.5 s: "40 min sitting. Up for a minute?" Camera 3/4 front-left, slow ±6° orbit on
  mouse. Click on the toast (or scroll 10%) → 0.8 s stand-up, desk rises 600 ms, readout
  ticks to `112 cm`, chip flips amber → green. Tokens: `--state-sitting`, `--state-nudge`,
  `--state-standing`, beam `--brand`.

### 2.2 The problem: "You bought the desk. Then you sat."

- **Eyebrow:** The problem
- **H2:** Most adjustable desks get raised once.
- **Body:** People who own one say the same thing on every forum: they sat at it
  nearly all the time, forgot for a week, or found it "strangely hard" to make a habit of
  something that takes one button press. (Paraphrased from public forum posts; see
  `research/user-quotes.xml` #1, #2, #10.)
  The desk is not the hard part. In one office with long-term access to sit-stand desks,
  about 1 in 3 people never used the standing function at all (Renaud 2018, n=1,098,
  moderate).
- **Alt text:** The same desk, low, with a thin layer of dust on the up button and a
  slumped figure in the chair.
- **3D brief:** Same room. Desk at `72 cm`, character slumped, tiny dust particles (6
  triangles) drifting off the desk button. No toast. Fixed camera, slightly lower than hero.
  Tone is a joke, not a scolding: token `--state-sitting` only.

### 2.3 How it works (three steps)

- **Eyebrow:** How it works
- **H2:** Plug in. It watches two things. It nudges, then checks.
- **Steps:**
  1. **Plug in.** A sensor the size of a matchbox clips under the desktop. USB-C to your
     computer. It does not touch the desk's electronics, so any desk that goes up and down
     works.
  2. **It watches two things.** The laser measures desk height, so it knows sitting from
     standing. The app watches keyboard and mouse activity, so it knows if you are there.
  3. **It nudges, then checks.** After 40 minutes of sitting, a small card in the corner.
     When the desk rises, it sees it. Every minute up buys back two minutes of sitting.
- **Link:** See the full cycle → /how-it-works
- **Alt text:** Three panels: sensor with laser under a desk; the desk raised with the
  height readout jumping; a state chip turning from amber to green.
- **3D brief:** E008b scene 2, scroll-stepped. Panel a: camera dips under the desktop,
  beam bright, PCB visible. Panel b: readout ticks `72 → 112 cm` in mono. Panel c: chip
  morphs amber → green with a mild spring (damping .8). `prefers-reduced-motion`: three
  posed frames.

### 2.4 Pillar A: "It knows you actually stood up."

- **H2:** Every reminder app is blind to what you did next. This one measures it.
- **Body:** Timers count minutes. They cannot tell whether you stood, snoozed, or muted
  them for good. A laser pointing at the floor can. That single fact is what lets the app
  reward you instead of pestering you, and what makes the numbers at the end of the day
  real.
- **Alt text:** Split view: a phone with a stack of ignored reminder notifications on the
  left; on the right the desk with a rising height readout and a green check.
- **3D brief:** Split scene. Left: flat phone, 9 grey toasts stacked (token
  `--state-away`). Right: desk rises, readout, green check pops once. Only the right half
  has the beam; the left half has no accent colour at all.

### 2.5 Pillar B: "A nudge, not an alarm."

- **H2:** Stand more. Without the nagging.
- **Body:** It stays quiet when you are away, when you are already standing, and after
  hours. The ask is small: a break of one minute counts. Standing, walking to the kettle,
  leaving the desk: all of it counts. And if you have stood for 90 minutes, it asks you to
  sit, because the goal is to alternate, not to stand all day.
- **Rules list (4):** Nudge after 40 min of sitting · Any break ≥ 1 min counts · 1 min up
  = 2 min of sitting cancelled · After 90 min standing: "sit for a while?"
- **Alt text:** Character walking away from the desk; the stool is empty, the laser is
  still on, the state chip reads "away" and there is no notification.
- **3D brief:** E008b scene 5. Character walk-away loop (1.2 s), stool empty, chip
  `--state-away`, beam breathing 0.85→1. Toast never appears. The monitor shows the real
  MoveUp toast component when available (PLAN §8 pt 4); until then the mock in §5.

### 2.6 Pillar C: "Open source. Local data. Your desk."

- **H2:** No account. No cloud. A file on your disk you can delete any time.
- **Body:** The firmware, the app and the hardware spec are open. Your posture data stays
  on your machine. Every threshold, from the 40 minutes to the 2× credit, is a setting.
- **Two cards:** **Build it yourself** — a microcontroller, a time-of-flight module and a
  cable. Parts list and firmware on /diy. · **Read the code** — repository link.
- **Alt text:** Exploded low-poly circuit board with a laser module and a USB-C cable,
  parts labelled.
- **3D brief:** E008b scene 3. PCB `#0F6B3A` with copper pads, ToF module, cable; parts
  drift apart on scroll and settle. Labels in JetBrains Mono. No beam here; the accent is
  the copper.

### 2.7 Where the project is today

- **H2:** Where the project is today
- **Three states (no dates):** Prototype: running on the founder's desk · Hardware v2:
  spec ready, DIY build available · App (MoveUp): near release
- **Link:** Follow the build log → /build-log
- **3D brief:** No scene. Three flat cards with `--surface`, hairline `--line`.

### 2.8 The bigger idea

- **H2:** We think every adjustable desk should ship with this.
- **Body:** That is why the spec is open. If a desk can measure its own height, any app
  can help you use it.
- **3D brief:** E008b scene 9 variant: a row of five desks, only one with a sensor; on
  scroll the sensor appears under each. Beam on all five at the end.

### 2.9 Final CTA + FAQ

- **H2:** Be there when it ships.
- **CTA:** Notify me at launch · Build it yourself · micro-line as hero.
- **FAQ (5):**
  - *Does it move my desk?* No. You press the button. It just knows when you did.
  - *Does it work without the sensor?* Yes, software-only, with less accuracy: it can
    only guess from your activity, not see the desk.
  - *Which desks?* Any desk that goes up and down. It measures height, not electronics.
  - *Which operating systems?* [Confirm against the MoveUp repo before publishing.]
  - *Where does my data go?* Nowhere. It stays on your computer.
- **3D brief:** Hero scene, evening light (key light warmer, 0.5), character standing,
  toast: "Nice one. 3 changes today." Idle loop, no interaction.

---

## 3. /how-it-works

- **H1:** One day with the sensor
- **Lead:** Here is exactly what the app does, and when it stays quiet. Every number below
  is a default you can change.

### 3.1 The cycle (scroll story, same beats as §1)

Short captions per beat, paired with the scene table in §1:

1. **You sit.** The laser reads the desk height. The app sees you typing. The sitting
   clock starts.
2. **40 minutes.** A card appears bottom-right. It does not shake, beep or count down.
3. **You stand.** The desk rises, the laser sees it. Green.
4. **You buy time back.** Every minute standing cancels two minutes of sitting. Stand
   five minutes, and the clock is back at 30.
5. **You move.** Walk away for a minute: that is a break too. Away for five: that counts as
   a posture change.
6. **You sit again.** After 90 minutes standing the app suggests it. Alternating is the goal.
7. **End of day.** Posture changes per hour, and points. No streak.

### 3.2 The rules, for humans

| When | What the app does | Default | Change it? |
|---|---|---|---|
| You have been sitting and present | Shows a nudge card | after 40 min | yes |
| You stand, walk or leave for at least 1 min | Counts it as a break | 1 min minimum | yes |
| You are up | Cancels sitting time in proportion: 1 min up = 2 min of sitting | 2× credit | yes |
| You stand 15 min | Counts a full break and adds bonus points | 15 min | yes |
| You have stood 90 min | Suggests sitting | 90 min | yes |
| You are at the screen 60 min without any break, sitting or standing | Suggests a screen break | 60 min | yes |
| You change posture (sit↔stand) or leave for ≥ 5 min | Counts a posture change. Goal: at least one an hour (green); half an hour (yellow) | ≥ 1/h | yes |
| You are away | Pauses everything. No nudge, no penalty | — | — |
| Scoring | +1 point per minute standing, −0.5 per minute sitting, +5 per session. No streaks. | — | yes |

Footnote under the table: *Defaults from the MoveUp app profile. The 40-minute
threshold is a design choice: EU safety guidance suggests getting up every 20–30 minutes
(EU-OSHA 2021, strong); we start looser so that the nudge is welcome, and you can tighten it.*

### 3.3 Infographic spec: "1 minute up = 2 minutes back"

- Horizontal bar, 40 segments, amber (`--state-sitting`), labelled `0` and `40 min`.
- A green (`--state-standing`) block grows from the right as the user "stands"; for each
  green segment added, two amber segments disappear from the right end of the bar.
- Three frozen states for print/no-JS: 40 sitting / 0 up → 30 sitting after 5 up →
  20 sitting after 10 up. Caption: "Five minutes standing and you are back at 30. No
  cliff, no all-or-nothing."
- Interactive: a slider "minutes standing" 0–20 drives the bar; tabular numbers.
- Reduced motion: slider still works, no tween.

---

## 4. /why-stand

- **H1:** Why change position at all?
- **Lead:** Not because sitting is "the new smoking". It is not (Vallance 2018, strong).
  Because long, unbroken sitting is linked to worse outcomes, and because standing still
  for hours is not the fix either. What helps is switching: sit, stand, move.
- **Structure:** lead → 8 fact cards in two rows → "What we don't claim" box → link to
  /how-it-works. Each card: fact, one-liner, source line, confidence chip, visual. Confidence
  chips reuse the E007 scale: strong / moderate / weak.

| # | Fact (headline) | One-liner | Source · confidence | Visual idea |
|---|---|---|---|---|
| 1 | Sit less, move at any intensity | WHO's advice for every adult: replacing sitting with activity of *any* intensity brings health benefits. | WHO 2020 guidelines (Bull et al., BJSM) · strong | Low-poly figure rising from a chair, "WHO 2020" text only, no logo |
| 2 | Long unbroken stretches matter | In a US cohort of 7,985 adults, those whose sitting came in the longest stretches had about twice the mortality risk. Shorter stretches without movement did not help; light activity did. | Diaz 2017, Ann Intern Med; Diaz 2019, AJE · moderate | Two timelines: one long dark block vs the same time cut into pieces with small standing figures |
| 3 | Risk climbs past ~9.5 h a day | Across 36,000 device-tracked adults, mortality risk rose noticeably beyond about 9.5 sedentary hours a day. | Ekelund 2019, BMJ · strong (observational) | 24-h clock, neutral to 7.5 h, warm gradient after, marker at 9.5 |
| 4 | Frequent short breaks work best | A meta-analysis of 39 lab studies found the largest blood-glucose effect when breaks came every 15–20 minutes. Walking beat standing. | Gale 2026, Obesity Reviews; Buffey 2022, Sports Med · moderate (acute studies) | Row of hourglasses, every second one with a short footpath |
| 5 | Standing counts, moving counts more | Five minutes of standing every half hour cut the post-meal glucose rise by about a third in women at risk of diabetes. Two minutes of standing every 20 minutes did nothing measurable in a small study; two minutes of walking did. | Henson 2016, Diabetes Care; Bailey & Locke 2015 · moderate / weak | Chair and standing figure alternating like a metronome |
| 6 | Owning the desk is not the habit | Among office workers with long-term sit-stand desks, about 1 in 3 never used the standing function. | Renaud 2018, IJERPH · moderate | Three desks: dusty, half-up, up with a figure |
| 7 | Nudges with feedback double the changes | In a year-long office study, desk reminders cut the number of people who never raised their desk by 76% and roughly doubled daily posture changes. | Sharma 2019, Human Factors · moderate | Notification card over a desk, counter "1 → 2 changes/day" |
| 8 | Standing all day is not the cure | In 83,000 adults, more standing did not lower cardiovascular risk, and standing over 2 h a day was linked to circulation problems. Lab studies see discomfort after about 40 minutes of static standing. | Ahmadi 2024, Int J Epidemiol; Coenen 2017 · moderate | Three icons in a loop: chair → standing → walking |

**"What we don't claim" box (copy):**

> **What we don't claim.** This is a habit tool, not a medical device. We do not claim
> that standing burns meaningful calories (about 0.15 kcal a minute more than sitting,
> Saeidifard 2018, strong), that one minute up "fixes" your blood sugar, that sitting
> causes back pain, or that our app improves your health: we have no data of our own yet.
> The studies above are mostly observational or single-day lab trials. Read them, and
> treat "linked to" as exactly that. Not medical advice.

Closing line: *Your next posture is your best posture.* (EU-OSHA 2021, cited.)

---

## 5. Notification microcopy (site mock; align with MoveUp strings)

All are mocks for the 3D monitor and screenshots. Before launch, replace with the exact
strings from the MoveUp repo. Voice: colleague tapping your shoulder; never an exclamation
mark of alarm; never a countdown.

| Moment | Title | Body | Actions |
|---|---|---|---|
| Nudge (40 min sitting) | 40 minutes sitting | Up for a minute? Even a short one counts. | Standing now · Later |
| Stand confirmed | Nice, you're up | Every minute here buys back two. | (auto-dismiss) |
| Full break reached | 15 minutes up | That's a full break. +5. | (auto-dismiss) |
| Standing too long (90 min) | 90 minutes standing | Sit for a while. Switching is the point. | Sitting now · Later |
| Screen break (60 min) | An hour at the screen | Look away for a minute. | OK |
| Away | Welcome back | You were away 12 minutes. That counted as a change. | (auto-dismiss) |
| End of day | Today | 6 posture changes · +42 points | Details |

Numbers in the last row are illustrative and must be labelled as such wherever the mock
appears outside the 3D scene.

---

## 6. Open questions for the owner (with recommended answers)

1. **The site says "40 minutes" and "1 minute" while MoveUp ships defaults. If the
   defaults change before launch, who updates the copy?** Recommend: put the numbers in
   one config file (`site/rules.ts`) mirrored from `ergonomic_profile.rs`, and render every
   threshold from it. Copy never hardcodes a number.
2. **May the problem section paraphrase forum posts without naming the sources?**
   Recommend: yes, paraphrase only, with a footnote "from public forum posts" and no
   names; the XML already keeps provenance for us.
3. **Points on the homepage: show the scoring formula, or only "points"?** Recommend:
   only "points" on `/` and the formula on /how-it-works. The −0.5/min sitting reads like a
   penalty on a first visit; on the rules page, with "no streaks" next to it, it reads fair.
4. **Which OS to name in the FAQ?** Recommend: name only what MoveUp builds today
   (Tauri suggests Windows/macOS/Linux, but verify) and write "more as we test them".
5. **Should /why-stand quote the 76% Sharma number this prominently?** Recommend: yes,
   it is the strongest evidence for the category, but keep "in a year-long office study,
   n=194" in the one-liner so nobody reads it as our own result.
