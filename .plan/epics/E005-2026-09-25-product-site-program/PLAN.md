---
id: E005
title: Product site program — message, design system, storytelling, 3D visuals
status: wave 1 running (research only) — 2026-09-25
created: 2026-09-25
type: program (umbrella over E006–E010)
route: AO (program total > 13 pts) — each child epic routed by its own total
---

# E005 — Program: strona produktu z pełną wizją

> Status: **szkic do potwierdzenia.** Nic z tego nie jest wdrażane, dopóki Paweł nie
> potwierdzi sekcji „Decyzje do potwierdzenia”. Założenia przyjęte domyślnie są
> oznaczone **[domyślne]**.

## 1. Wizja w jednym akapicie

Strona `desk` przestaje być głównie raportem inżynierskim, a staje się **stroną
produktu tuż przed wydaniem**. Komunikat: *„Twoje biurko już się podnosi. Brakowało
tylko czegoś, co wie, czy naprawdę wstałeś.”* Pokazujemy pełną wizję i sposób
działania: czujnik laserowy mierzy wysokość blatu, aplikacja widzi, czy jesteś przy
komputerze, a po ~45 minutach siedzenia daje dyskretny sygnał. Nawet 2 minuty stania
się liczą, a seria rośnie. Wezwania do działania są przygotowane pod premierę. Dziś:
„Powiadom mnie o premierze” i „Zbuduj sam (DIY)”. Jutro to samo miejsce dostaje
„Kup / Zamów” i „Pobierz aplikację”. Całość opowiada spójna, niskopoligonowa grafika
3D (low-poly, czyste kolory), częściowo interaktywna.

## 2. Co ustaliliśmy w rozmowie (2026-09-25)

- Wizualizacja 3D w przeglądarce: **Three.js / react-three-fiber**, nie Blender jako
  główne narzędzie. Blender ewentualnie do statycznych renderów na później.
- Styl: **low-poly, czyste kolory**, spójny z nowym `DESIGN.md`.
- Komponent v1 `DeskScene.tsx` (biurko + czujnik + laser z odczytem wysokości + monitor
  z powiadomieniem w prawym dolnym rogu) jest zaakceptowany i wchodzi do programu.
- Zakres jest szerszy niż jeden komponent: komunikat, architektura informacji (IA),
  storytelling, badania o siedzeniu, system designu, grafika 3D, podstrony.
- Pracuje rój agentów, a główna sesja jest orkiestratorem. Teksty i grafikę
  koncepcyjną robi najmocniejszy dostępny model (Fable 5.1 / Opus 5.5).
- Teksty mogą wejść na stronę od razu po akceptacji. Grafika i interakcje idą planem.

## 3. Skąd bierzemy 3D — rekomendacja

| Element | Źródło | Dlaczego |
|---|---|---|
| Biurko, czujnik, laser, monitor, stołek, krzesło | **Proceduralnie w kodzie** (bryły R3F), jak w `meblarz` | Wymiary i animacja pod pełną kontrolą (blat jedzie, laser się skraca), zero plików binarnych, jeden styl materiałów |
| Postać człowieka (siedzi / wstaje / odchodzi / pajacyki) | **Gotowe modele CC0 z animacjami** (np. Quaternius, Kenney) | Riggowanie i animacja postaci to najdroższa część. Gotowe paczki CC0 mają `Idle/Sit/Jump` itd. |
| Płytka czujnika | Opcjonalnie eksport 3D z tscircuit (E003/E004) | Prawdziwy projekt PCB zamiast atrapy. Rozszerzenie, nie v1 |
| Statyczne ilustracje (OG image, sekcje bez JS) | **Render tych samych scen** do WebP (headless) | Jedna scena = interaktywna wersja + obrazek. Spójność gratis |

**Spójność:** wszystkie materiały biorą kolory z tokenów `DESIGN.md` (flat shading,
ograniczona paleta). Gotowe modele postaci są przebarwiane na tę paletę.

**Lekkość:** sceny ładowane jako wyspy Astro `client:visible`. Bez JS strona pokazuje
statyczny render. Proceduralne bryły ważą kilobajty. Koszt to głównie runtime three.js
(~150–200 KB gz), ładowany tylko tam, gdzie scena jest widoczna.

**Reuse z `meblarz` (Customizable):** ma `three@0.169`, `@react-three/fiber`, `drei`
i pakiet `@customizable/scene-viewport` („reusable 3D scene viewport”). Do sprawdzenia
w E009: czy da się wziąć viewport, oświetlenie i kamerę jako kod (kopia albo pakiet),
czy tylko wzorce. Pakiety są `private` i w pnpm workspace, a `desk` używa npm, więc
najpewniej **kopiujemy wzorce, nie zależność** [domyślne].

## 4. Proponowana struktura strony [domyślne — do weryfikacji w E006]

| Strona | Cel |
|---|---|
| `/` Główna | Co to jest → problem w 3 liczbach → jak działa (scrollowana historia 3D) → co wyróżnia (czujnik wie, czy wstałeś) → DIY / powiadom mnie |
| `/jak-to-dziala` | Pełna infografika cyklu: siedzisz → sygnał → wstajesz (2 min się liczy) → seria. Tryb AWAY, drzemka, brak nachalności |
| `/problem` | Badania: siedzenie, kręgosłup, metabolizm, koszty. 5–10 liczb ze źródłami |
| `/diy` | Zbuduj sam: lista części, schemat, instrukcja montażu, firmware |
| `/pobierz` | Aplikacja (gdy wyjdzie). Do tego czasu „powiadom mnie” |
| `/dziennik` (obecny raport) | Wersjonowany raport inżynierski z E002: wersje, decyzje, dowody |

CTA to jeden komponent sterowany stanem premiery (`prelaunch` → `launch`), żeby
zamiana „Powiadom mnie” na „Kup” była jedną zmianą konfiguracji.

## 5. Epiki programu

Skala punktów zgodna z polityką (Fibonacci). Ważność: High / Medium / Low.

| Epik | Zakres | Ważność | Pkt | Model / wykonawca |
|---|---|---|---|---|
| **E006** Komunikat i IA | Pozycjonowanie, jeden główny komunikat, persony (z `MISSION.md`, `user-quotes.xml`), mapa podstron, stany CTA, szkielet sekcji głównej | High | 5 | Fable (strategia treści) |
| **E007** Badania „problem siedzenia” | 5–10 liczb ze źródłami (zdrowie, kręgosłup, koszty pracodawcy, efekt krótkiego wstawania), weryfikacja źródeł, notatki do infografik | High | 5 | Sonnet (research) + niezależny weryfikator źródeł |
| **E008** DESIGN.md v2 | (a) audyt obecnego stylu, (b) **ślepa propozycja** agenta bez kontekstu obecnej strony, (c) research skilli/formatów `design.md` w sieci, (d) synteza nowego `DESIGN.md` z tokenami, typografią, ruchem, kierunkiem sztuki 3D low-poly, (e) poprawki techniczne skórki i biblioteki | High | 8 | 3 równoległe agenty + Fable do syntezy |
| **E009** System grafiki 3D | `DeskScene` v1 → biblioteka scen: biurko+laser+monitor, stołek, wstawanie, odejście (AWAY), pajacyki. Paleta z E008, statyczne rendery, reuse `meblarz` | High | 13 → podział na 2 fale | ts-dev (Sonnet) + Fable (art direction) |
| **E010** Storytelling i teksty | Scenariusz przewijanej historii („45 minut → sygnał → 2 minuty stania się liczą → seria”), teksty wszystkich podstron, mikrocopy CTA/powiadomień | High | 8 | Fable + skill `authorship` |
| **E011** Wdrożenie stron | Nowa główna, `/jak-to-dziala`, `/problem`, `/diy`, `/pobierz`, komponent CTA ze stanem premiery, przeniesienie raportu pod `/dziennik` | High | 13 | ts-dev, weryfikacja: verify + browser |

**Suma programu: ~52 pkt → trasa AO** (polityka: > 13). Każdy epik ma własny
`PLAN.md` i zadania przy starcie.

## 6. Kolejność (fale)

```
Fala 1 (równolegle, research):  E006 komunikat · E007 badania · E008 (a)(b)(c)
Fala 2 (synteza):               E008 (d)(e) DESIGN.md v2 · E010 scenariusz historii
Fala 3 (budowa):                E009 sceny 3D · E010 teksty stron
Fala 4 (składanie):             E011 strony + weryfikacja w przeglądarce
```

Punkt kontrolny z Pawłem po fali 1 (komunikat + IA) i po fali 2 (DESIGN.md + scenariusz),
zanim ruszy droga budowa.

## 7. Wpływ na istniejące plany

- **E002** (raport jako strona główna) i **`astro/design.md`** zabraniają cen, list
  oczekujących i CTA na głównej. Nowy kierunek odwraca to założenie. Raport zostaje, ale
  jako podstrona. Wymaga to decyzji i aktualizacji E002/ROADMAP po potwierdzeniu.
- **E001-T08** (lejek pod `/lp` za Cloudflare Access) prawdopodobnie traci sens. Lejek
  staje się stroną główną. Do przeglądu.
- Strona wciąż zawiera zmyślone treści (testimoniale, liczniki). Program je **usuwa**,
  zamiast przenosić: „traktujemy jak do wydania” oznacza zero fikcji.

## 8. Decyzje do potwierdzenia

1. ✅ **Główna = produkt (Paweł, 2026-09-25):** raport inżynierski przechodzi pod `/build-log`.
2. ✅ **CTA (Paweł, 2026-09-25):** główny „Powiadom mnie o premierze”, drugi „Zbuduj sam”.
3. **Backend zapisów** — obecny `waitlist…/api/signup` nie istnieje. Co przyjmuje e-maile?
   [domyślne: prosty Cloudflare Worker + D1 albo gotowy formularz, decyzja w E011]
4. **Repo aplikacji** — gdzie jest, czy jest co pobrać, jak wygląda UI powiadomienia
   (monitor w scenie powinien pokazywać prawdziwe UI)?
5. ✅ **Język (Paweł, 2026-09-25):** angielski.

## 9. Luki (GAPS)

- Nie przeczytałem jeszcze `@customizable/scene-viewport` — reuse to hipoteza.
- Próg 45 min i „2 minuty się liczą” pochodzą z `NOTIFICATION-ALGORITHM.md`. Czy
  aplikacja w repo produktu ma te same wartości, nie sprawdzone.
- Licencje gotowych modeli postaci do potwierdzenia przy wyborze (tylko CC0 / CC-BY).

## 10. Architecture impact

- New front-end components: React Three Fiber scene islands (`client:visible`) plus static WebP fallbacks. This adds `three`, `@react-three/fiber` and `drei` to `astro/`.
- New CTA component with a `prelaunch` / `launch` state switch. A real waitlist backend replaces the non-existent `waitlist…/api/signup` (new integration, to be decided in E011).
- Route change: the report homepage moves to `/journal`, pending the owner's decision.
- Triggers: an ADR for the homepage purpose change (supersedes the E002 report-first homepage), an ADR for the 3D stack, and an ADR for the waitlist backend. Update `.plan/ARCH.md` in E011 (sub-task).

## 11. Wave 1 findings so far

- **E009 reuse (wave1/E009-meblarz-reuse.md):** `meblarz` is a source of patterns to copy, not a dependency. Its viewport pins `@react-three/fiber ^8` and React 18, while `astro/` runs React 19.2, so we need fiber v9. It has no GLB export, no WebGL screenshots, no flat shading and no characters. The CC0 character sources are not verified yet. The agent estimates E009 at ~31 pts (my plan said 13). Re-split E009 into two epics before dispatch.

## 12. Checkpoint 1 decisions (Paweł, 2026-09-25, "ok")

1. The homepage is the product page. The engineering report moves to `/build-log`.
2. Design direction: "Warm workshop" (wave1/E008b) is the base for DESIGN.md v2. Keep whatever is good in the current site (E008a).
3. "Short stands count": the website presents it as the start of a habit, not as a health dose.
4. Owner's framing (to verify against evidence, E007b): what counts is a **change of position**, not standing as such. Standing up also means more incidental movement. The app's default minimum stand is 2 min, or possibly 10–15 min; the owner is unsure. Verify it in the app repo.
5. Streaks: promise them only if app v1 has them.
6. DIY price: EUR, or no amount.

## 13. What the app actually does (MoveUp, verified in code 2026-09-25)

Product repo: `~/code/MoveUp` (Tauri + Rust + React). Defaults are in `src-tauri/src/ergonomic_profile.rs:11-33`. The website must follow these values, not `NOTIFICATION-ALGORITHM.md` (which says 45 min / 2 min).

| Rule | Default | Source |
|---|---|---|
| Sitting before a nudge | **40 min** | `sitting_secs` 2400 |
| Minimum break that counts (stand, walk, away) | **1 min** | `break_min_secs` 60 |
| Break credit | **1 min up = 2 min of sitting cancelled**, proportional, no cliffs | `break_credit_multiplier` 2.0, MoveUp ADR 008 |
| Full break (bonus points) | 15 min of standing | `standing_target_secs` 900 |
| Standing too long → suggest sitting | 90 min | `standing_max_secs` 5400 |
| Posture changes KPI | sit→stand and stand→sit both count, and leaving the computer ≥5 min counts too. Green ≥1/h, yellow ≥0.5/h | `session_reading.rs:135-146, 209-216`, `changes_green/yellow` |
| Screen break (sitting + standing) | 60 min | `max_continuous_computer_secs` |
| Scoring | +1 pt/min standing, −0.5 pt/min sitting, +5 session bonus. **No streaks.** | `Scoring` |

Everything is configurable per profile. Found along the way: `Limits.standing_secs` (1200) is declared but not read by the engine. Dead config belongs in the MoveUp backlog, not here.

Consequence for the story: the claim is not "stand 2 minutes". It is **"change position; every minute up buys back two minutes of sitting; too much standing gets a nudge too"**. That matches the owner's framing that the change of position is what counts. Streaks are not promised; points and a posture-change rate are.
