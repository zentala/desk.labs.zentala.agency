# E009 — co da się przenieść z `meblarz` do sceny 3D biurka na desk.zentala.io

Repo źródłowe: `C:/code/meblarz` (pnpm workspace, three@0.169, @react-three/fiber ^8, React 18 peer).
Repo docelowe: `desk.zentala.io/astro` (Astro 5 + React 19 island, npm).

## Co faktycznie istnieje w meblarz

**Viewport / kamera / światła / kontrolki — `packages/scene-viewport/src/OrbitSceneViewport.tsx`**
- `OrbitSceneViewport` (linie 144-162): `<Canvas shadows frameloop="demand" camera={...} onPointerMissed={...}>` + `<ViewportContent>` + `children`. `frameloop="demand"` = renderuje tylko po zmianie (ważne dla strony z wieloma sekcjami — nie pali GPU w tle).
- `ViewportContent` (linie 68-142): domyślne światła (`ambientLight` 1.0, `hemisphereLight` sky/ground, 3× `directionalLight`, jedno z `castShadow`), `<color attach="background">`, `<ContactShadows>` z drei, `<OrbitControls makeDefault enableDamping>`.
- `SceneViewportControls` (linie 37-40, 90-114): `reset()` i `fitToBox(min,max)` — liczy dystans kamery z FOV, przydatne gdyby scena miała kilka kadrów/zoomów.
- Typy `CameraConfig`, `LightingConfig`, `ContactShadowsConfig` (linie 6-35) — czysty kontrakt propsów, zero zależności appek.
- Testowany osobno przez `@react-three/test-renderer` (`OrbitSceneViewport.test.tsx`) bo prawdziwy `<Canvas>` potrzebuje WebGL, którego jsdom nie ma.

**Wzorzec proceduralnej geometrii (boxy + materiał) — `apps/inventory/src/scene/RackScene.tsx:79-93`**
```
<mesh castShadow receiveShadow>
  <boxGeometry args={[w,h,d]} />
  <meshStandardMaterial color={...} metalness={...} roughness={...} />
</mesh>
```
Prosty wzorzec „grid boxów z etykietami" — dokładnie ten kształt kodu potrzebny na blat/nogi biurka/monitor. Brak jednak niskopoligonowego/flat-shaded stylu — tu materiały są PBR-owe (`meshStandardMaterial` z metalness/roughness), nie `flatShading`/`MeshToonMaterial`. Żadnego użycia `flatShading` czy toon-material nie znaleziono w całym repo (sprawdzone grepem).

**Animacja — `apps/meblarz/src/three/ShoeDemo.tsx`, `Boxes.tsx`, `PlinthBox.tsx`, `steel/FrameView.tsx`**
Standardowy `useFrame` z `@react-three/fiber` do animacji per-klatka (widziane w 5 plikach). Sam plik `ShoeDemo.tsx` (linie 1-60) to głównie geometria/placement, nie sam wzorzec lerp — wzorca „animuj Y od A do B" nie czytałem linia-po-linii, ale mechanizm (`useFrame` + `useRef<Group>`) jest gotowym, sprawdzonym patternem w tym repo, wart podejrzenia przed pisaniem animacji windy blatu.

**Picking / raycasting / pomiar — `packages/scene-tools/src/index.ts` (całość, 39 linii)**
`pickNearest`, `pickFromScreen`, `createSurfaceAnchor`, `measure`, `chooseSnap` — czysty three.js (`Raycaster`), zero React. Przydatne tylko jeśli scena ma być klikalna (np. hover na czujniku/monitorze); dla czysto ozdobnej sceny na landing page — niepotrzebne.

**Import/inspekcja GLB — `apps/floorplan/src/planner/importers/glbImport.ts:1-40+`**
`inspectGlb()` ręcznie parsuje nagłówek/chunk GLB (magic number, JSON+BIN chunk), limituje rozmiar (`GLB_IMPORT_MAX_BYTES = 50_000_000`), odrzuca kompresję Draco/meshopt/basisu. To NIE jest loader do renderowania (nie ma `GLTFLoader`) — to walidator przed uploadem do edytora. Do wczytania modeli CC0 postaci (Quaternius/Kenney) i tak trzeba użyć `@react-three/drei`'s `useGLTF` / `GLTFLoader` z three.js — standardowa biblioteka, nie coś z meblarz.

## Czego NIE ma w meblarz (sprawdzone grepem, brak wyników)
- **Brak eksportu GLB/GLTF** — `packages/export/src/index.ts` to tylko `downloadText()` (Blob + anchor.click dla tekstu), zero `GLTFExporter`. Grep po `GLTFExporter` w całym repo — 0 trafień.
- **Brak renderowania screenshotów/miniatur z prawdziwej sceny 3D.** Wszystkie miniatury w repo (`Thumbnail.tsx`, `FurnitureThumbnail.tsx`, `ThumbnailGrid.tsx`) to SVG z 2D projekcji geometrii (`genericFurnitureGeometry`, `buildElevations`) — NIE renderowane z `WebGLRenderer`/`canvas.toDataURL`. Grep po `toDataURL`, `WebGLRenderer`, `renderer.render` — 0 trafień poza test-mocki.
- **Brak flat-shaded/low-poly stylu materiałów** — cały materiał to `MeshStandardMaterial` PBR (metalness/roughness), stylistycznie inny niż docelowy „low-poly flat-colored" look (który zwykle robi się `flatShading: true` + `MeshLambertMaterial`/`MeshToonMaterial` bez map).
- **Brak postaci/rigów/animacji szkieletowych** — cała geometria to boxy proceduralne (szafki, regały), zero `SkinnedMesh`/`AnimationMixer`.

## Co da się przenieść — sposób reużycia

| Element | Jak reużyć | Uwaga |
|---|---|---|
| `OrbitSceneViewport` (kamera/światła/kontrolki/canvas) | **jako wzorzec (przepisać)**, nie jako paczkę | patrz ryzyko wersji niżej |
| Wzorzec `<mesh><boxGeometry/><meshStandardMaterial/></mesh>` z RackScene | **jako wzorzec (skopiować kształt kodu, zmienić materiał na flat/toon)** | zamienić `meshStandardMaterial` na `flatShading`+prosty kolor |
| `useFrame` animacja (windowanie blatu, laser, notyfikacja) | **jako wzorzec** | logika lerp/easing do napisania od nowa pod konkretną animację |
| `scene-tools` (picking/measure) | **pominąć** — niepotrzebne dla ozdobnej, nieinteraktywnej sceny landing page | ewentualnie tylko jeśli scena ma być klikalna |
| `glbImport.ts` inspekcja | **tylko jako pattern parsowania nagłówka GLB**, jeśli w ogóle trzeba walidować rozmiar/format przed użyciem; do samego renderu i tak potrzebny `useGLTF`/`GLTFLoader` z drei/three, niezależnie od meblarz | niska wartość, pomiń |
| Eksport GLB, render screenshotów/WebP | **nie istnieje w meblarz — trzeba zbudować od zera** | patrz sekcja "rekomendacja" |

## Ograniczenia wersji / zależności

- `@customizable/scene-viewport` deklaruje `peerDependencies`: `react ^18.0.0`, `@react-three/fiber ^8.0.0`, `three ^0.169.0`. Docelowy `astro/package.json` ma **React 19.2.4** — `@react-three/fiber@8` NIE wspiera React 19 (fiber v9 jest wymagany dla React 19). Więc paczki meblarz nie da się po prostu `npm install` jako `workspace:*` ani skopiować 1:1 bez podniesienia fiber do v9 (i przetestowania API breaking changes, np. `frameloop`, `Canvas` props).
- Paczki w meblarz są `"private": true` i adresowane przez `workspace:*` (pnpm) — nie są opublikowane do rejestru; nie da się ich po prostu zainstalować z zewnątrz przez npm. Trzeba by albo (a) skopiować pliki źródłowe i dostosować, albo (b) publikować pakiet do `npm.internal`, co jest przerostem dla jednej ozdobnej sceny.
- `astro` używa **npm**, meblarz **pnpm** (`pnpm-workspace.yaml`) — różne lockfile/resolution, kolejny powód by nie próbować monorepo-linkować, tylko skopiować wybrane fragmenty.
- `clipper2-ts` w `@customizable/geometry` to zależność do topologii 2D (booleans na poligonach) — całkowicie nieprzydatna dla tej sceny 3D.

## Rekomendowane podejście dla desk.zentala.io

1. **Nie importować paczek meblarz.** Napisać mały, samodzielny komponent React-island (`astro/src/components/DeskScene.tsx` czy podobnie) z `@react-three/fiber@^9` + `@react-three/drei@^9` (kompatybilne z React 19) + `three@^0.169` (lub nowszy).
2. **Skopiować kształt `OrbitSceneViewport`** (canvas/kamera/światła/`frameloop="demand"`/OrbitControls) jako wzorzec startowy, przepisany pod fiber v9 API (sprawdzić breaking changes w migracji v8→v9, m.in. zmiany w `events`, `Canvas` defaultach).
3. **Materiały: `flatShading: true` na `MeshLambertMaterial` lub `MeshToonMaterial`** zamiast PBR `MeshStandardMaterial` z RackScene — to jedyna realna zmiana stylistyczna potrzebna do uzyskania looku "low-poly flat-colored".
4. **Geometria proceduralna** (blat, nogi, czujnik, wiązka lasera jako cienki `CylinderGeometry`/`LineSegments`, etykieta wysokości jako `Html` z drei) — pisać od zera wzorem `RackScene.tsx`, bo to tylko kilka boxów + linia.
5. **Statyczny WebP fallback (no-JS):** wyrenderować tę samą scenę offline (Node + `three` headless przez `gl`/`headless-gl` lub prościej: Puppeteer/Playwright robiący screenshot z lokalnego dev-serwera tej sceny) i zapisać jako WebP w `astro/public/`; w Astro renderować `<img>` jako fallback / `<noscript>`, a hydratować Canvas dopiero po `client:visible`. To wymaga osobnego skryptu build-time — w meblarz nie ma gotowego mechanizmu (patrz brak `WebGLRenderer.toDataURL`/renderu offline wyżej), trzeba go napisać.
6. **Postacie CC0 (patrz niżej):** wczytywać `.glb` przez `useGLTF`(drei) + `useAnimations`, przełączać klipy animacji (`idle/sit/stand/walk/jumping-jacks`) przez `AnimationMixer` — standardowy drei/three flow, niezwiązany z meblarz.

## Źródła CC0 low-poly postaci z animacjami

Sprawdzenie **bez dostępu do sieci w tej sesji** (agent czyta tylko lokalny kod) — poniższe to wiedza ogólna, do zweryfikowania przez WebFetch/WebSearch przed użyciem:

- **Kenney — "Toon Character" / "Mini Characters" packs** (kenney.nl, licencja CC0 dla większości assetów Kenneya) — rigowane, niskopoligonowe postacie z podstawowymi animacjami (idle/walk/run), ale zestaw animacji bywa ograniczony (nie zawsze ma "jumping jacks" czy "sit"). Wymaga weryfikacji dokładnej nazwy paczki i listy animacji na kenney.nl.
- **Quaternius — "Animated Characters" / "Ultimate Animated Character Pack"** (quaternius.com, licencja CC0) — szerszy zestaw animacji (idle, walk, run, sit, jump i inne), низкополи styl pasujący do "flat-colored". To bardziej prawdopodobne źródło animacji "siedzi/stoi/odchodzi/pajacyki", ale konkretną obecność "jumping jacks" trzeba potwierdzić na stronie (nie zweryfikowane w tej sesji).
- **Mixamo (Adobe)** — NIE CC0 (wymaga konta Adobe, licencja Adobe General Terms, nie wolna jak CC0), ale ma ogromną bibliotekę animacji w tym "Jumping Jacks" — możliwy fallback jeśli CC0 nie wystarczy, do rozważenia osobno (inne warunki licencyjne, nie mieszać w tym samym wpisie z CC0).

**Ryzyko:** żadnego z powyższych URL/nazw nie zweryfikowano faktycznym fetchem w tej sesji — traktować jako punkt startowy do sprawdzenia (WebSearch/WebFetch) przed pobraniem, nie jako potwierdzony fakt.

## Ryzyka

- **R1 (High):** fiber v8→v9 + React 19 — sam wzorzec `OrbitSceneViewport` trzeba przetestować pod nowym fiber, może być drobne API diffs (np. eventy pointer, `frameloop`).
- **R2 (Medium):** brak w meblarz jakiegokolwiek mechanizmu renderu offline/screenshotu — WebP fallback to nowa, nienapisana funkcjonalność (Puppeteer/Playwright + headless Chrome lub `node-canvas`+`gl`), potencjalnie kruche na CI/build.
- **R3 (Medium):** dokładna dostępność animacji "jumping jacks" w CC0 zestawach (Quaternius/Kenney) niepotwierdzona — może wymagać połączenia klipów z dwóch źródeł lub własnej animacji proceduralnej (bez riga, tylko rotacje kości ramion).
- **R4 (Low):** rozmiar bundle — three.js + drei + modele GLB postaci mogą znacząco obciążyć stronę statyczną typu landing page; wymaga lazy-load (`client:visible`) i kompresji GLB (Draco/meshopt), inaczej niż `glbImport.ts` w meblarz, który akurat ODRZUCA skompresowane GLB (dla edytora to bezpieczne, dla landing page — trzeba kompresji, nie odrzucania).

## Zgrubna lista zadań (Fibonacci, Importance High/Medium/Low)

| # | Zadanie | Importance | Points |
|---|---|---|---|
| 1 | Dodać `three`, `@react-three/fiber@^9`, `@react-three/drei@^9` do `astro/package.json`, smoke-test z React 19 | High | 2 |
| 2 | Przepisać `OrbitSceneViewport` jako lokalny komponent pod fiber v9 (kamera/światła/OrbitControls/frameloop=demand) | High | 3 |
| 3 | Zbudować proceduralny biurko (blat + nogi) z flat-shaded materiałem, animacja wysokości blatu przez `useFrame` | High | 3 |
| 4 | Czujnik + wiązka lasera (cienki cylinder/line) + label wysokości (`Html` z drei) | Medium | 3 |
| 5 | Monitor + notyfikacja w rogu (prosty plane/texture lub HTML overlay) | Medium | 2 |
| 6 | Zbadać i pobrać CC0 postać (Quaternius/Kenney) z animacjami idle/sit/stand/walk; zweryfikować licencję i listę klipów | Medium | 3 |
| 7 | Wczytać GLB postaci przez `useGLTF`+`useAnimations`, przełączanie animacji (sit→stand→walk away→jumping jacks) | Medium | 5 |
| 8 | Skrypt build-time render sceny → statyczny WebP fallback (Playwright/Puppeteer screenshot lub headless-gl) | Medium | 5 |
| 9 | Integracja z Astro: `client:visible` hydratacja, `<noscript>`/no-JS fallback na WebP | High | 2 |
| 10 | Optymalizacja: kompresja GLB (Draco/meshopt), lazy-load, budżet wydajności na landing page | Low | 3 |

**Suma:** 31 pkt → epik >13 pkt, wg reguły wykonania kwalifikuje się do AO (Agent Orchestrator), nie do prostych subagentów w 2-3 falach. Do potwierdzenia przy planowaniu E009.
