# E008a — Audyt aktualnego stylu wizualnego i architektury frontendu (astro/)

Zakres: `desk.zentala.io/astro` (Astro 5, Tailwind v4, React 19 islands). Build sprawdzony
lokalnie (`npm run build` w `astro/`, node_modules obecne) — **zielony**, 14 stron, ~16.6s,
bez błędów (tylko ostrzeżenie `browserslist` o nieaktualnej bazie caniuse-lite).

## 1. Tokeny — jak jest zaimplementowane vs jak opisane w `design.md`

Tokeny żyją w jednym miejscu: `astro/src/styles/global.css:6-25` (blok `@theme`, Tailwind v4
CSS-first config). To jest zgodne z dobrą praktyką — jedno źródło prawdy.

- **Kolory**: `--color-dark-900..500` (tło, 5 odcieni), `--color-brand-green*` (3 odcienie),
  `--color-muted` (#94a3b8), plus zestaw `--color-report-*` i `--color-status-*` dla trybu
  "report" (`global.css:19-25`). Brak tokenów `ink`, `fog`, `soft` (cień) — a są używane
  w kilku komponentach (patrz sekcja 4, "martwy kod").
- **Typografia**: Space Grotesk (nagłówki) + DM Sans (body) ładowane przez Google Fonts
  `@import url(...)` w `global.css:2` — zgodne z `design.md` ("Use Space Grotesk for display
  headings and DM Sans for body"). Brak lokalnego self-hostingu fontów — zależność
  od zewnętrznego CDN przy każdym ładowaniu strony.
- **Spacing/promień/cień**: brak dedykowanych tokenów spacing/radius — wszystko inline przez
  klasy Tailwind (`rounded-2xl`, `rounded-full`, `p-6` itd.), spójne w praktyce ale nieopisane
  jako system. Cienie: `--shadow-glow`, `--shadow-card` (`global.css:15-16`) — używane w
  `btn-primary` (`global.css:58`), ale komponenty "light theme" (sekcja 4) odwołują się do
  nieistniejącego `shadow-soft`.
- **Report container**: `design.md` mówi "max reading width of 1024px" — `report-container`
  faktycznie `max-w-5xl` (`global.css:71`) = 1024px. Zgodne.
- **Zakaz komponentów LP na raporcie** (`design.md`: "must not import Hero, Pricing,
  WaitlistForm..."): potwierdzone — `src/pages/index.astro:1-11` importuje wyłącznie
  komponenty z `components/report/*`. Granica jest realnie przestrzegana.

## 2. Niespójności i duplikacja

- **Dwa niepowiązane systemy designu w jednym repo**: "dark report/funnel" (tokeny `dark-*`,
  `brand-*`, `report-*`, faktycznie używany) i "light card" (klasy `ink`, `fog`, `card`,
  `shadow-soft` — nigdzie niezdefiniowane, zob. sekcja 4). To nie jest zamierzony wariant
  jasny/ciemny — to relikt wcześniejszej iteracji designu, który nie został usunięty.
- **`text-muted` klasa vs `--color-muted` token**: token istnieje (`global.css:17`), ale nie
  ma zdefiniowanej klasy `.text-muted` w `@layer components` — działa tylko dzięki
  auto-generowanej klasie Tailwind v4 z tokena `--color-muted`. Działa, ale nieoczywiste przy
  czytaniu samego CSS.
- **Podwójna definicja przycisków**: `btn-primary`/`btn-secondary` (`global.css:53-67`) używane
  tylko w `Hero.tsx` i `Software.tsx` (ten drugi martwy — sekcja 4). Reszta LP (Pricing,
  StickyCTA, FAQ, WaitlistForm) buduje przyciski inline z Tailwind bez wspólnej klasy —
  duplikacja tego samego wzorca (`rounded-full`, `bg-brand-green`, `hover:-translate-y-0.5`)
  rozproszona po plikach zamiast współdzielona.
- **`Icon.tsx`** (`src/components/ui/Icon.tsx:1-6`) ma mapę tylko 11 nazw ikon i używany jest
  wyłącznie w `components/report/*`; LP-owe komponenty importują `lucide-react` bezpośrednio —
  jedna ścieżka ikon ma warstwę pośrednią, druga nie.

## 3. Co jest dobre i warto zachować

- Jedno miejsce tokenów (`@theme` w `global.css`), Tailwind v4 CSS-first — nowoczesne,
  łatwe w utrzymaniu.
- Twarda granica report/LP wymuszona przez brak importów, nie tylko przez konwencję
  (`index.astro` nie widzi żadnego komponentu LP).
- `report/*` komponenty (Astro, nie React) są lekkie, statyczne, bez zbędnej hydracji —
  dobry wzorzec dla treści, która nie potrzebuje JS.
- `ReportLayout.astro` (`src/layouts/ReportLayout.astro`) jest minimalny i czytelny.
- Build jest zielony i szybki — dobry sygnał dla dalszej rozbudowy.

## 4. Problemy architektoniczne — w tym KAŻDE sfabrykowane treści

### Martwy kod / osierocone komponenty
Następujące pliki w `src/components/` **nie są importowane przez żadną stronę** (sprawdzone
grep-em po `src/pages/`): `Background.tsx`, `Architecture.tsx`, `Behavior.tsx`, `CTA.tsx`,
`Goals.tsx`, `HardwareAppendix.tsx`, `Software.tsx`, `PostMortem.tsx`, `Licensing.tsx`,
`Stats.tsx` (korzysta z `src/data/stats.ts`, też nieużywany). Wszystkie odwołują się do
niezdefiniowanych klas `ink`/`fog`/`card`/`shadow-soft` z wcześniejszej (jasnej) wersji
designu — repo dźwiga martwy submodel UI. `licensing.astro` (`src/pages/licensing.astro:1-3`)
renderuje treść **inline w Astro**, a NIE importuje `Licensing.tsx`, mimo niemal identycznej
treści — prawdopodobny "zapomniany refaktor".

### Sfabrykowane treści (lista kompletna, każda z lokalizacją)
1. **Testimonials** — `src/components/SocialProof.tsx:14-34`: trzy fikcyjne osoby (Marcus W.,
   Lisa K., Erik N.) z cytatami, oznaczone komentarzem `TEMPLATE: replace with real
   testimonials from early users` — czyli autorzy sami wiedzą, że to placeholder.
2. **Before/After metryki** — `SocialProof.tsx:52-70`: konkretne liczby ("Standing time 8%→22%",
   "Longest sit session 3.5h→52min") oznaczone `PLACEHOLDER: replace with real data` — brak
   źródła, wygląda jak realny wynik badania.
3. **Social Wall / mentions** — `src/components/SocialWall.tsx:1-4,23-83`: 8 fikcyjnych wpisów
   z Reddita/HN/Twittera z fałszywymi nazwami użytkowników, datami z marca 2026 i linkami `#`
   (martwe). Komentarz w kodzie przyznaje: "All mentions are placeholders until real ones are
   collected after launch".
4. **Licznik pre-orderów** — `public/preorder-count.json`: statyczny plik z liczbami
   `{"basic":34,"pro":12,"founder":5}` konsumowany przez `Pricing.tsx:83-93` jako żywe dane
   ("Only N spots left", pasek postępu %). Wygląda jak realny stan sprzedaży, a jest
   twardo wpisaną liczbą w repo.
5. **Referral link** — `ReferralProgram.tsx:31`: placeholder `YOUR_CODE` w linku
   referencyjnym, funkcjonalnie nieaktywny mechanizm.
6. **Schema.org Product JSON-LD** — `src/pages/lp/index.astro:66-95`: deklaruje realne ceny
   i `PreOrder` availability jako dane strukturalne dla wyszukiwarek, zasilane tymi samymi
   niezweryfikowanymi cenami z `pricing.ts` — ryzykowne SEO/rich-snippet dla produktu, który
   nie jest jeszcze sprzedawany.

`design.md` explicite zakazuje fabrykowanych metryk i testimonial na stronie **report**
("No... testimonials, fabricated metrics") — reguła jest przestrzegana na `/` i `/versions`,
ale **nie obowiązuje na `/lp`**, gdzie żyje cała powyższa lista. Spójne z rozdziałem ról
(LP = sprzedaż), ale warto to jawnie nazwać — `/lp` nie ma żadnej analogicznej reguły
"fabricated content" zapisanej w repo.

### Granice komponentów
- `lp/index.astro` (`src/pages/lp/index.astro:1-105`) to jeden płaski plik HTML z 16
  komponentami React wrzuconymi bezpośrednio do `<body>` — brak warstwy layoutu współdzielonego
  z resztą strony (report ma `ReportLayout.astro`, LP nie ma swojego layoutu).
- Duplikacja meta/SEO/JSON-LD wpisana ręcznie w `lp/index.astro`, a nie w reużywalnym
  layout/head-komponencie — przy kolejnej stronie LP trzeba będzie kopiować cały blok head.

## 5. Dostępność (accessibility)

- **Focus states**: klasa `.focus-ring` (`global.css:76`) używana tylko w 4 plikach
  (`report/ArchiveLink.astro`, `report/PhotoGallery.astro`, `report/ProjectMasthead.astro`,
  `report/ReportNav.astro`) i w 2 komponentach LP (`ExitPopup.tsx`, `WaitlistForm.tsx`).
  Reszta interaktywnych elementów LP (`Pricing.tsx`, `StickyCTA.tsx`, `FAQ.tsx`,
  `ReferralProgram.tsx`, `ComparisonTable.tsx`) nie ma jawnego stylu fokusu — poleganie na
  domyślnym outline przeglądarki, co przy `rounded-full`/ciemnym tle bywa słabo widoczne.
  Nie sprawdzane wizualnie w przeglądarce (poza zakresem zadania) — do potwierdzenia.
- **Kontrast**: `--color-muted: #94a3b8` na `--color-dark-900: #0a0a0f` — wygląda na
  wystarczający kontrast (jasny szaro-niebieski na niemal czarnym), ale nie zmierzony
  narzędziem — do potwierdzenia automatycznym audytem (axe/Lighthouse) zamiast oceny "na oko".
- **Motion**: zero odwołań do `prefers-reduced-motion` w całym `global.css` i komponentach
  (grep pusty). `transition-all duration-200` i `hover:-translate-y-0.5` używane bezwarunkowo
  (`global.css:58-67` i wiele komponentów) — brak reduced-motion fallbacku.
- **JSON-LD z realnymi cenami dla produktu, który nie jest w sprzedaży** — kwestia uczciwości
  wobec użytkownika/wyszukiwarki, nie tylko SEO (patrz sekcja 4, pkt 6).

## 6. Gotowość na wyspy three.js / react-three-fiber

- Obecnie **brak jakiejkolwiek zależności 3D** w `package.json` (`three`,
  `@react-three/fiber`, `@react-three/drei` — żadnej). Trzeba dodać od zera.
- Astro + `@astrojs/react` już skonfigurowane (`astro.config.mjs:1-13`) — mechanizm wysp
  React działa, ale **żaden istniejący komponent LP nie używa `client:visible`** — wszystkie
  interaktywne komponenty na `/lp` używają `client:load` (`WaitlistForm`, `Pricing`,
  `ReferralProgram`, `FAQ`, `Footer`, `StickyCTA`, `ExitPopup` — `lp/index.astro:57-101`), czyli
  hydrują się natychmiast przy starcie strony, równolegle. Dla wyspy 3D (potencjalnie ciężkiej,
  `three` + `r3f` to zwykle 150–300kB+ gzip razem) to zły wzorzec — **trzeba świadomie użyć
  `client:visible` lub `client:idle`**, inaczej r3f wystartuje razem z 7 innymi hydratującymi
  się komponentami na starcie i spowolni LCP/TTI.
- Obecny największy chunk to `client.Dc9Vh3na.js` = 186.6kB / 58.5kB gzip (build output) — to
  już jest bazowy koszt Reacta 19 na stronie. Dodanie three.js/r3f jako osobnego chunku
  (dynamic import + `client:visible`) jest obowiązkowe, żeby nie wciągnąć go do wspólnego
  bundla ładowanego na każdej podstronie (raport `/`, `/blog` itd. nie potrzebują 3D w ogóle).
- Rekomendacja: nowy komponent 3D powinien żyć jako osobny plik `.tsx` z `client:visible`,
  importowany tylko na stronach, które faktycznie go potrzebują (nie w współdzielonym layout),
  i mierzyć rozmiar bundla przez `npm run build` output po dodaniu.

## 7. Rekomendacje (Importance / Points)

| # | Rekomendacja | Importance | Points |
|---|---|---|---|
| 1 | Usunąć martwe komponenty light-theme (`Background`, `Architecture`, `Behavior`, `CTA`, `Goals`, `HardwareAppendix`, `Software`, `PostMortem`, `Licensing.tsx`, `Stats.tsx`+`data/stats.ts`) albo dopisać brakujące tokeny `ink`/`fog`/`shadow-soft`, jeśli mają wrócić do użytku | Medium | 3 |
| 2 | Jawnie oznaczyć i/lub zdjąć fabrykowane treści na `/lp` przed pierwszym realnym ruchem: testimonials, before/after %, Social Wall, `preorder-count.json` — albo podłączyć do prawdziwych danych, albo usunąć do czasu realnych liczb | High | 5 |
| 3 | Dodać `prefers-reduced-motion` guard do globalnych transition/hover-translate w `global.css` | Medium | 2 |
| 4 | Ujednolicić `focus-ring` na wszystkich interaktywnych elementach LP (Pricing, StickyCTA, FAQ, ReferralProgram, ComparisonTable) | Medium | 3 |
| 5 | Zweryfikować kontrast `--color-muted` i statusowych kolorów narzędziem (axe/Lighthouse), nie okiem | Low | 1 |
| 6 | Wydzielić wspólny `LpLayout.astro`/head-komponent zamiast ręcznego meta/JSON-LD w `lp/index.astro` | Medium | 3 |
| 7 | Przed dodaniem wysp three.js/r3f: zainstalować `three`+`@react-three/fiber` (+opcjonalnie `drei`), zbudować jako osobny komponent z `client:visible`, zmierzyć wpływ na bundle przez `npm run build` | High | 5 |
| 8 | Rozważyć self-hosting fontów (Space Grotesk/DM Sans) zamiast zależności od Google Fonts CDN | Low | 2 |
| 9 | Skonsolidować wzorzec przycisków (`btn-primary`/`btn-secondary`) i użyć go konsekwentnie zamiast inline Tailwind w Pricing/StickyCTA/FAQ | Low | 2 |
| 10 | Zaktualizować `caniuse-lite`/browserslist (ostrzeżenie z builda) | Low | 1 |

## 8. Metadane

- Build zweryfikowany: `cd astro && npm run build` → **PASS**, 14 stron, ~16.6s, jedno
  ostrzeżenie (browserslist), zero błędów.
- Dev server: NIE uruchamiany (zgodnie z poleceniem).
- Kontrast/focus: oceniane ze źródła, nie zmierzone w realnej przeglądarce — pkt 5 w tabeli to
  konsekwencja tego ograniczenia.
