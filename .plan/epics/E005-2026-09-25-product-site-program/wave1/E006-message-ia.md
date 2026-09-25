# E006 — Komunikat i architektura informacji (strona Open Smart Desk)

Status: propozycja do akceptacji (fala 1, research). Prozą po polsku; wszystkie
teksty na stronę po angielsku. Źródła: `PRD.md`, `research/vision/MISSION.md`,
`research/algorithm/NOTIFICATION-ALGORITHM.md`, `research/user-quotes.xml` (cytaty `#n`),
`ROADMAP.md`, `ECOSYSTEM.md`, `E005/PLAN.md`.

## 1. Pozycjonowanie (wg April Dunford)

- **Alternatywa konkurencyjna:** aplikacje-timery (Stretchly, Stand Up!), przypomnienia
  ze smartwatcha, automatycznie podnoszące się biurka (Tempo, Upsy Desky), własne
  hacki na Raspberry Pi (#9, #14, #26).
- **Unikalna cecha:** czujnik laserowy pod blatem + aktywność klawiatury/myszy. System
  **wie, czy naprawdę wstałeś** i czy w ogóle jesteś przy biurku.
- **Wartość:** nudge przychodzi tylko wtedy, gdy siedzisz i jesteś obecny; sukces jest
  mierzony, a nie deklarowany; po 3 nieodebranych sygnałach system milknie. Wynik:
  nawyk zamiast kolejnej ignorowanej aplikacji.
- **Dla kogo:** osoby, które mają biurko z regulacją i **nie używają** jej (#1, #2, #9, #14, #19).
- **Kategoria:** nie „smart desk", nie „timer" — **habit coach dla biurka, które już masz**.
  Pozycjonujemy się jako brakujący element, nie jako nowy mebel.

Zdanie pozycjonujące (wewnętrzne, nie na stronę):
*Open Smart Desk to otwarty czujnik i aplikacja, które zamieniają posiadane biurko
z regulacją w nawyk stania — bo jako jedyne widzą, czy wstałeś, i dlatego mogą
nagradzać zamiast poganiać.*

## 2. Jeden komunikat + trzy filary

**Core message (EN):** *Your desk already goes up. Now something knows if you do.*

| Filar | Obietnica (EN, tytuł sekcji) | Dowód z produktu |
|---|---|---|
| A. It knows | **"It knows you actually stood up."** | Laser ToF mierzy wysokość blatu; próg kalibrowany; timer resetuje 2 min stania |
| B. It doesn't nag | **"A nudge, not an alarm."** | Sygnał po ~45 min *obecnego* siedzenia; brak sygnałów gdy away/stoisz/po godzinach; max 3 powtórki, potem cisza |
| C. It's yours | **"Open source. Local data. Your desk."** | Kod otwarty, dane w CSV na dysku, bez konta i chmury, DIY za ~60–80 PLN części |

Ramka StoryBrand: bohater = osoba z zakurzonym biurkiem; problem zewnętrzny = siedzę
cały dzień; wewnętrzny = „kupiłem drogie biurko i czuję się głupio" (#1, #14, #19);
przewodnik = mały czujnik, który widzi prawdę bez oceniania; plan = podłącz, kalibruj,
pracuj; sukces = seria dni ze staniem; porażka, której unikamy = kolejna wyciszona apka.

## 3. Persony i obiekcje (z cytatów)

**P1 — Zdalny developer z martwym biurkiem (główna).** Ma biurko, „siedzi przy nim 99% czasu"
(#1), „zapomina i orientuje się po tygodniu" (#2, #3), „zaskakująco trudno zbudować nawyk"
(#10), „za łatwo powiedzieć: wstanę za chwilę" (#11). Chce, żeby „zdrowy rytm działał sam"
(#12), ale nie chce być zmuszany. Obiekcje: „kolejny timer, wyciszę go" → filar B;
„czy to mnie śledzi?" → filar C; „mam biurko z prostym pilotem bez portu" → czujnik
nie dotyka elektroniki biurka, mierzy tylko wysokość (#20, #26).

**P2 — Majsterkowicz / homelab.** Już buduje własne rozwiązania (#17, #23, #25, #26),
kombinuje z detekcją obecności (#21, #22). Obiekcje: „to mogę sam" → tak, i po to jest
DIY z gotowym firmware i algorytmem; „detekcja obecności bywa błędna" (#22) →
obecność z klawiatury/myszy, nie z ruchu ciała.

**P3 — Osoba z bólem pleców, która kiedyś stała (trzeciorzędna, emocjonalna).**
„Pomagało na bóle głowy i spięte barki, potem przestałem" (#16, #14), „mniej sztywności,
mniej bólu po powrocie do nawyku" (#18, #13), „godziny rozwalony na krześle" (#15).
Obiekcja: „nie chcę urządzenia medycznego ani obietnic" → mówimy o nawyku, nie o
leczeniu (PRD: „not a medical device").

**Nie-persona:** pracownik biura z obawą o nadzór (PRD non-target) — strona nie kieruje
do niego komunikatu, ale filar C uprzedza obawę.

## 4. Sitemap

| Ścieżka | Cel | Główne pytanie odwiedzającego |
|---|---|---|
| `/` | Strona produktu: komunikat, jak działa, filary, CTA | „Co to jest i czy to dla mnie?" |
| `/how-it-works` | Pełny cykl: sit → nudge → stand (2 min counts) → streak; tryb AWAY, drzemka, cisza po 3 | „Czy będzie mnie wkurzać?" |
| `/why-stand` | Badania o siedzeniu (E007): 5–10 liczb ze źródłami, bez claimów medycznych | „Czy to w ogóle ma znaczenie?" |
| `/diy` | Lista części, schemat, montaż, firmware, kalibracja | „Jak to zbudować dziś?" |
| `/app` | Aplikacja: platformy, tryb software-only, prywatność danych; prelaunch = formularz | „Co pobieram i gdzie lądują dane?" |
| `/journal` | Obecny wersjonowany raport inżynierski (E002): wersje, decyzje, dowody | „Czy projekt żyje i kto za nim stoi?" |
| `/open-source` (opcjonalnie sekcja na `/`) | Repo, licencja, roadmap, wizja standardu | „Czy mogę zaufać i dołożyć się?" |

Nazwy angielskie zamiast `/jak-to-dziala`, `/problem`, `/dziennik` z PLAN.md (decyzja:
strona po angielsku). `/why-stand` zamiast `/problem` — mówi o korzyści, nie o winie.

**Raport → `/journal` (zakładam: tak).** Za: strona główna dostaje jedno zadanie
(konwersja na „notify me"); raport pozostaje dowodem wiarygodności, co jest ważniejsze
niż testimoniale, których nie mamy. Przeciw / koszty: (1) E002 i `astro/design.md` zakładają
odwrotnie — trzeba je zaktualizować; (2) obecne linki wewnętrzne/OG do raportu na `/`
przestaną pasować (redirect 301); (3) ryzyko, że `/journal` brzmi jak blog — na stronie
nazwać go **"Engineering journal"** z podtytułem „versioned build log". Alternatywa:
`/build-log`. Mieszanie obu na `/` odrzucam: dwa cele = zero konwersji.

## 5. Strona główna — sekcja po sekcji

Kolejność wg PAS + StoryBrand: obietnica → problem → mechanizm → dowód → zaufanie → CTA.

1. **Hero.** Cel: w 5 s powiedzieć, co to jest i że nie jest to biurko.
   H1: *Your desk already goes up. Now something knows if you do.*
   Sub: *A tiny open-source sensor under your height-adjustable desk and a quiet tray app.
   It nudges you to stand after 45 minutes of sitting, and it actually knows when you did.*
   CTA: [Notify me at launch] [Build it yourself (DIY)]. Mikro-linia pod CTA: *No spam. One
   email when the app ships.*
   3D: `DeskScene` v1 — biurko, czujnik pod blatem, cienki promień lasera z odczytem
   wysokości, monitor z powiadomieniem; blat jedzie w górę po scrollu.

2. **Problem („You bought the desk. Then you sat.").** Cel: rozpoznanie siebie.
   Key line: *Most height-adjustable desks get raised once. Then forgotten.*
   Trzy krótkie zdania parafrazujące #1, #2, #11 (bez fikcyjnych podpisów; jeśli cytujemy,
   to z podaniem źródła publicznego forum lub wcale). 3D: to samo biurko, blat nisko,
   postać zapadnięta w krześle, warstwa kurzu na przycisku „up" (humor, nie wstyd).

3. **How it works (3 kroki).** Cel: mechanizm w 20 s.
   Tytuł: *How it works*. Kroki: *1. Plug in* (USB-C, clips under the desktop) → *2. It
   watches two things* (desk height from a laser, whether you're at the keyboard) →
   *3. It nudges, then checks* (after ~45 min sitting; 2 minutes standing counts).
   3D: przewijana sekwencja: laser mierzy → ikona klawiatury pulsuje → dymek powiadomienia →
   blat jedzie w górę → zielony „check". Link: *See the full cycle → /how-it-works*.

4. **Pillar A — "It knows you actually stood up."** Cel: różnica wobec timerów.
   Key line: *Every reminder app is blind to what you did next. This one measures it.*
   3D: porównanie split: po lewej telefon z 12 zignorowanymi powiadomieniami, po prawej
   laser + rosnąca wysokość i odhaczona sesja.

5. **Pillar B — "A nudge, not an alarm."** Cel: zdjąć obiekcję „będzie mnie wkurzać".
   Key line: *It stays quiet when you're away, standing, or done for the day. After three
   unanswered nudges it lets go.* Lista 4 reguł z algorytmu. 3D: postać odchodzi od biurka,
   timer w scenie zamiera (AWAY); wraca — timer rusza. Podgląd prawdziwego UI powiadomienia
   (blocker: repo aplikacji, PLAN §8 pkt 4).

6. **Pillar C — "Open source. Local data. Your desk."** Cel: zaufanie bez testimoniali.
   Key line: *No account. No cloud. A CSV on your disk you can delete anytime.*
   Dwie karty: *Build it yourself* (części ~60–80 PLN; waluta na stronie EN — decyzja E010)
   i *Read the code*. 3D: rozłożona płytka (RP2040-Zero + ToF) w low-poly,
   opcjonalnie eksport z tscircuit.

7. **Where we are (status).** Cel: uczciwość zamiast liczników.
   Tytuł: *Where the project is today*. Trzy stany: *Prototype: running on the founder's
   desk* · *Hardware v2: spec ready, DIY build available* · *App: near release*.
   Link: *Follow the engineering journal → /journal*. Bez dat, których nie dotrzymamy.

8. **The bigger idea (krótko).** Cel: wizja dla tych, którzy scrollują do końca.
   Key line: *We think every adjustable desk should ship with this. That's why the spec
   is open.* Jedno zdanie o standardzie (ECOSYSTEM), bez OEM/consortium/revenue.

9. **Final CTA + FAQ (5 pytań).** Ten sam komponent CTA co w hero. FAQ: Does it move my
   desk? (No — you press the button.) · Works without the sensor? (Yes, software-only,
   less accurate.) · Which desks? (Any that goes up and down; we measure height, not
   electronics.) · Which OS? (per repo, do potwierdzenia) · Is my data shared? (No.)

## 6. Model stanów CTA

Jeden komponent `<LaunchCTA state=...>`; treść sterowana konfiguracją, nie kodem sekcji.

| Stan | Główny | Drugi | Mikro-copy |
|---|---|---|---|
| `prelaunch` (teraz) | **Notify me at launch** (email) | **Build it yourself (DIY)** → `/diy` | *One email when the app ships. No newsletter.* |
| `launch` | **Download the app** → `/app` | **Get the sensor** → sklep / DIY | *Free and open source. Sensor optional.* |
| `launch` z gotowym kitem | **Order the sensor kit** | **Download the app** | *Ships from Poland.* (tylko gdy prawdziwe) |

Zasady: stan w jednym pliku konfiguracji (`site.launch = 'prelaunch' | 'launch'`);
nazwy eventów analityki stałe (`cta_primary`, `cta_secondary`) z atrybutem stanu;
formularz bez działającego backendu **nie wchodzi** na produkcję (PLAN §8 pkt 3).

## 7. Czego NIE mówimy

- Żadnych testimoniali, liczników („1 240 osób czeka"), gwiazdek, logo prasy, pasków
  „pre-orders 73%" — usunąć istniejące, nie przenosić (PLAN §7).
- Żadnych claimów medycznych („leczy ból pleców", „spala X kcal"). Dopuszczalne wyłącznie
  cytowane badania na `/why-stand` z linkami (E007), z zastrzeżeniem „not medical advice".
- Nie „smart desk", nie „automatic", nie „AI" w hero. Produkt nie porusza biurkiem
  i to jest cecha, nie brak.
- Nie „gamification/XP/levels" jako obietnica — to Faza 2 (PRD). Wolno: „streaks" tylko
  jeśli app v1 je ma; w przeciwnym razie „a timeline of your day".
- Nie mówimy o cenach kitu, OEM, konsorcjum, grantach na stronie produktu.
- Nie wstydzimy użytkownika („you've been sitting 2 hours!!") — ton jak w algorytmie.
- Nie obiecujemy dat premiery ani platform, których repo nie potwierdza.

## 8. Nagłówki — trzy warianty i wybór

| # | H1 | Za | Przeciw |
|---|---|---|---|
| 1 | **Your desk already goes up. Now something knows if you do.** | Zawiera cały insight (masz biurko + differentiator), lekki, nie brzmi jak gadżet | Długi (11 słów), wymaga dobrego sub-headline |
| 2 | *The standing-desk habit, finally measured.* | Krótki, kategoria + różnica | Zimny, „measured" kojarzy się z nadzorem |
| 3 | *Stand more. Without the nagging.* | Klasyczny benefit + obiekcja | Brzmi jak każdy timer; gubi czujnik |

**Wybór: #1.** Jedyny, który w jednym zdaniu odróżnia nas od timerów i od biurek. Wariant
#3 zostaje jako tytuł filaru B; #2 jako meta description / OG.

## 9. Otwarte pytania dla Pawła

1. Nazwa podstrony raportu: `/journal` czy `/build-log`?
2. Czy app v1 ma streaks (wpływa na wolno/nie wolno w §7)?
3. Waluta i kwota DIY na stronie EN: PLN, EUR czy „about €20 in parts"?
4. Czy pokazujemy nazwiska/źródła cytatów z forów w sekcji 2, czy tylko parafrazy?
