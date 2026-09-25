# E012 — Dystrybucja DIY przez JLCPCB („zamów sam, rozdaj znajomym”)

- Epik: E005 product-site program, fala 2
- Data researchu: 2026-09-25
- Status: research, dokument wewnętrzny dla właściciela
- Zakres: Hardware v2 (warianty A–D z ADR-003, RP2040-Zero z ADR-004), strona `/diy`

> **To nie jest porada prawna.** Część 3 opisuje moje rozumienie przepisów UE na
> podstawie tekstów źródłowych i wytycznych Komisji. Punkty oznaczone **[NIEPEWNE]**
> trzeba potwierdzić u prawnika albo w jednostce notyfikowanej (np. przez PARP albo
> izbę gospodarczą), zanim cokolwiek zostanie sprzedane.

Poziomy pewności: **H** = potwierdzone w źródle pierwotnym, **M** = źródło wtórne albo
dane zmienne (ceny, stany magazynowe), **L** = wnioskowanie lub brak źródła.

---

## 1. Precedensy — kto już tak dystrybuuje sprzęt

| Wzorzec | Jak działa | Czego uczy | Pewność |
|---|---|---|---|
| **OSHWLab + EasyEDA → JLCPCB** | Projekt leży w OSHWLab; przycisk „Order PCB” w EasyEDA sam wgrywa pliki do koszyka JLCPCB. Ten „one-click” działa tylko dla projektów EasyEDA | Najkrótsza ścieżka istnieje, ale wymaga EasyEDA, a my projektujemy w tscircuit. Społeczność sama prosi o prawdziwy przycisk „one click order”, bo użytkownik i tak musi ustawiać opcje PCB/SMT | M |
| **PCBWay Shared Projects** | Wgrywasz Gerbery (+ BOM) do „Projects”, inni klikają „Order”. PCBWay wypłaca autorowi **10% wartości zamówienia** (PCB/montaż/druk 3D/CNC) na konto | Jedyny znaleziony mechanizm z prawdziwym deep-linkiem „zamów ten projekt” **i** prowizją dla autora. Montaż w PCBWay bywa droższy niż w JLC | M |
| **Kitspace + 1-click BOM** | Strona projektu z repo git; rozszerzenie wypełnia koszyki Digikey/Mouser z pliku `.tsv` | Dobry dla PCB + części do samodzielnego lutowania, **nie** dla PCBA z JLC | M |
| **DeskHop (RP2040) — fork „JLCPCB version”** | Fork przerobiony pod pełny montaż JLC: RP2040 bezpośrednio na płytce zamiast modułu Pico, BOM + CPL w repo. Około **$10/płytka** przy 10 szt. | Najbliższy nam precedens. Problemy: obroty w CPL (o 270° źle, poprawione w podglądzie JLC), 1 z 10 ręcznie lutowanych Pico miał zimny lut, złącze USB dostępne tylko przez LCSC | M |
| **OpenMicroKbd „Fab it yourself”** | Wpis blogowy: „upload three files, check the placement preview”; lista ustawień krytycznych (warstwy, stackup, ENIG) | Wzór prezentacji: ustawienia, które „po cichu” psują płytkę, wypisane wprost. Wiersze BOM bez części (np. otwory montażowe) trzeba oznaczyć jako do-not-place | M |
| **Keyboardy (Corne/3W6/Arisu itd.)** | README + `BOM.csv` + `CPL.csv` z numerami LCSC; części THT zamawiane osobno i lutowane ręcznie | Najczęstsza pułapka: część z BOM wyprzedana (np. ATMEGA32U4), a użytkownik nie wie, czym ją zastąpić | M |
| **Crowd Supply (Mouser)** | Kampania → fulfillment Mousera, VAT i cło przedpłacone dla UE | Naturalny etap „później”: Crowd Supply zdejmuje logistykę, ale **deklarację zgodności UE wystawia twórca**, nie platforma | M |

**JLCPCB API / afiliacja:** nie znalazłem publicznego deep-linku typu „zamów projekt X”
dla repozytoriów spoza EasyEDA/OSHWLab ani publicznego API do składania zamówień przez
zwykłego użytkownika (**L**). JLCPCB prowadzi programy sponsoringowe dla twórców (kupony,
wzmianki), ale warunki są indywidualne — trzeba napisać do nich bezpośrednio (**L**).

**Pułapki z precedensów:** (1) część wyprzedana w dniu zamówienia; (2) opłata za części
Extended; (3) złe obroty w CPL; (4) moduły THT lutowane ręcznie zawodzą; (5) nowe cło UE
od 07.2026 (patrz §2.5).

---

## 2. Mechanika — co opublikować, żeby zamówienie było prawie jednym kliknięciem

### 2.1 Pakiet plików na wydanie (per wariant, per wersja)

```
hardware/releases/v2.0-B/
  gerbers-v2.0-B.zip          # wgrywany do JLC bez rozpakowywania
  bom-jlcpcb-v2.0-B.csv       # Comment, Designator, Footprint, "JLCPCB Part #" (LCSC Cxxxx)
  cpl-jlcpcb-v2.0-B.csv       # Designator, Mid X, Mid Y, Rotation, Layer (mm)
  ORDER.md                    # dokładne ustawienia formularza JLC + zrzuty ekranu
  alternates.csv              # zamienniki LCSC dla każdej części (gdy brak w magazynie)
  enclosure/*.step, *.3mf     # obudowa + profil druku
  checksums.txt, LICENSE (CERN-OHL-S-2.0 lub -P)
```

- Wymagane kolumny CPL: `Designator`, `Mid X`, `Mid Y`, `Rotation`, `Layer`, w milimetrach (**H**, pomoc JLCPCB).
- BOM musi mieć numer części LCSC (`Cxxxx`) w każdym wierszu montowanym. Wiersze bez części (otwory, pady testowe) wyłączamy z BOM/CPL albo oznaczamy jako DNP.
- **tscircuit:** `tsci export` / w przeglądarce *File > Export > Fabrication Files* daje Gerbery, BOM CSV (MPN + `supplierPartNumbers`) i Pick'n'Place CSV. Części deklarujemy przez `supplierPartNumbers={{ jlcpcb: "C…" }}` albo `footprint="jlcpcb:C2040"`. CLI przed eksportem wywołuje `populatePartOrientationMetadata` z dostawcą `"jlcpcb"` — obroty pin-1 zostały poprawione niedawno (PR #4932), więc **każde wydanie trzeba sprawdzić w podglądzie JLC** (**M**).
- Nagłówki BOM/CPL z tscircuit mogą nie zgadzać się 1:1 z szablonem JLC. Dodać mały skrypt `scripts/jlc-normalize` i test w CI, który porównuje nagłówki (**L**, do sprawdzenia na pierwszym eksporcie).

### 2.2 Koszty montażu JLCPCB (stan ze strony cennika, **M** — ceny się zmieniają)

| Pozycja | Economic PCBA | Standard PCBA |
|---|---|---|
| Opłata setup/engineering | $8.18 | $25.56 (1 strona) |
| Szablon (stencil) | $1.53 | $8.21 |
| Części Extended | **$3.07 za każdą unikalną część** | $1.53 ładowanie podajnika |
| Lut SMT | $0.0016/lut | $0.0016/lut |
| Limit ilości | do 30 szt. na projekt | bez limitu |

Części Basic (typowe R/C) są stale w podajnikach i nie mają opłaty. Każdy układ scalony
to prawie zawsze Extended. Montaż ręczny THT: około $3.5 + $0.0173 za lut (**M**).

### 2.3 Moduły czy „chip-down”? (kluczowa decyzja projektowa)

| Element | Jako moduł | Bezpośrednio na płytce (wariant B/C) |
|---|---|---|
| **RP2040-Zero** | Jest w bibliotece JLC: `C5350143` (Extended, „Standard Only”), dodatkowo pozycja `C9900174641` „pico-rp2040-zero” montowana na fali (TH-23P). Wymusza droższy **Standard PCBA** lub montaż THT; części często w trybie pre-order (9–15 dni) | `RP2040` = `C2040` (LQFN-56, MSL3) + flash QSPI + kwarc 12 MHz + LDO 3V3 + USB-C 16p + ESD. Działa w **Economic PCBA**. Wymaga starannego routingu USB i flasha (ADR-002: zewnętrzny review przed produkcją) |
| **Czujnik ToF** | Niebieskie breakouty (`UL53LDK`/`VL53LDK`) **nie są** w bibliotece JLC → ręczne lutowanie przez użytkownika | `VL53L1CXV0FY/1` = `C190004` (LGA-12, Extended, MSL3) albo VL53L0X. Wymaga pasty i reflow → idealny do montażu JLC, niemożliwy dla amatora z lutownicą |

**Rekomendacja (M):** wariant przeznaczony do DIY to **B (chip-down)**, montowany w
całości przez JLC, jednostronnie, w Economic PCBA, bez żadnego lutowania u użytkownika.
Wariant A (moduły) zostaje referencją warsztatową i „ścieżką z lutownicą”. Szacunkowo
6–8 części Extended (RP2040, flash, VL53L1X, USB-C, LDO, kwarc, ESD) → około $18–25
jednorazowej opłaty na zamówienie, rozłożonej na 5 płytek. Szansa na ograniczenie:
wybierać części z listy „Preferred Extended” (bez opłaty w Economic — **L**, sprawdzić
aktualne zasady JLC).

### 2.4 Pułapki dostępności części
- Stan magazynowy JLC zmienia się codziennie. `alternates.csv` + strona `/diy` z datą ostatniej weryfikacji BOM.
- Części z Global Sourcing (9–20 dni roboczych) i pre-order nie mogą być łączone w jednym zamówieniu PCBA z tą samą częścią z innego źródła (**M**).
- MSL3 (RP2040, VL53L1X): brak znaczenia przy montażu JLC; ma znaczenie przy lutowaniu ręcznym.
- Otwór czujnika: VL53L1X nie może być zasłonięty ciemnym drukiem; ewentualna szybka ochronna wymaga kalibracji cross-talk (dokumentacja ST).

### 2.5 Cena za 5 zmontowanych płytek z wysyłką do PL (szacunek, **L/M**)

| Pozycja | Szacunek |
|---|---|
| 5× PCB 2-warstwowa, mała | $2–5 |
| Setup + stencil (Economic) | ~$10 |
| Opłaty Extended (6–8 części) | ~$18–25 |
| Części (RP2040 ~$1, VL53L1X ~$4–6, reszta ~$2) × 5 | ~$35–45 |
| Wysyłka do PL (tańsze linie) | ~$10–25 |
| VAT 23% (IOSS, pobierany przy kasie do ~$170) | ~$18–25 |
| **Nowe cło tymczasowe od 1.07.2026**: €3,00 **za każdy kod HS** w paczce ≤€150 | €3–6 |
| Ewentualna opłata przewoźnika za odprawę (bez DDP) | €12–45+ |
| **Razem** | **≈ $100–140 → ok. €20–28 za płytkę** (bez obudowy) |

Źródło zasad celnych: JLCPCB „EU Customs Reform (EUCR) July 2026 – Client FAQ”. W ramach
IOSS JLC pobiera VAT, ale **nie** cło tymczasowe. Na stronie zalecić **DDP** (JLC płaci
VAT, cło i opłatę za odprawę z góry), żeby kurier nie żądał dopłaty przy drzwiach (**M**).
Łączenie PCB i druku 3D w jednej paczce powyżej €150 przechodzi na zwykłe stawki
celne — przy elektronice zwykle korzystniej (**M**, do sprawdzenia per przypadek).

---

## 3. Prawo UE — kto jest „producentem” i kiedy zaczynają się obowiązki

### 3.1 Kluczowe definicje
- **„making available on the market”** = „any supply of a product for distribution, consumption or use on the Union market **in the course of a commercial activity, whether in return for payment or free of charge**” (GPSR (EU) 2023/988, art. 3; ta sama formuła w Blue Guide) (**H/M**).
- **„manufacturer”** (GPSR) = osoba, która wytwarza produkt lub zleca jego zaprojektowanie/wytworzenie „and markets that product under that person's name or trademark” (**M**).
- Blue Guide: działalność handlowa to dostarczanie towarów „in a business related context”, oceniane „case by case” (regularność, cechy produktu, intencje dostawcy). „In principle, occasional supplies by charities or hobbyists should not be considered as taking place in a business related context” (**M** — cytat z Blue Guide 2016; wersja 2022 **usunęła** zdanie, że sprzedaż C2C zasadniczo nie jest handlowa → **[NIEPEWNE]**, czy zdanie o hobbystach dalej obowiązuje w tym brzmieniu).
- Przewodnik Komisji do dyrektywy EMC: „When equipment is constructed for own use (…) it is not considered to be placed on the market” (**H**).

### 3.2 Scenariusze

| Scenariusz | Kto jest producentem? | Wprowadzenie do obrotu? | Ocena |
|---|---|---|---|
| **S1.** Użytkownik pobiera pliki i sam zamawia 5 płytek w JLC dla siebie | Użytkownik buduje „for own use”; JLC jest podwykonawcą na zlecenie | Nie | Niskie ryzyko dla właściciela projektu (**M**). Publikacja plików to informacja, nie produkt |
| **S2.** Ten użytkownik daje 4 płytki rodzinie i znajomym, bez zapłaty | Użytkownik | Prawdopodobnie nie („occasional”, prywatnie, bez kontekstu biznesowego) | **[NIEPEWNE]** — „free of charge” nie wyklucza obrotu; decyduje brak kontekstu biznesowego |
| **S3.** Właściciel projektu sam zamawia 50 płytek i rozdaje je za darmo pod marką Open Smart Desk, z tej samej strony, która pokazuje cennik i pre-order | Właściciel | **Ryzyko TAK** — darmowe próbki w kontekście biznesowym (promocja przyszłego produktu) to typowy przypadek „free of charge” | **[NIEPEWNE], wysokie ryzyko.** Strona ma dziś `Pricing.tsx` i pre-order → trudno przekonywać, że to działalność czysto hobbystyczna |
| **S4.** Właściciel sprzedaje zestawy/płytki (Tindie, własny sklep) | Właściciel (albo importer, gdy wysyła JLC → klient w UE pod jego marką) | Tak | Pełne obowiązki: CE (EMC + RoHS), GPSR, WEEE, dokumentacja, oznakowanie |
| **S5.** Crowd Supply / Elecrow sprzedaje pod marką właściciela | Właściciel pozostaje producentem; platforma jest dystrybutorem/importerem | Tak | DoC wystawia twórca; logistykę i VAT przejmuje platforma |

### 3.3 Przepisy przy sprzedaży (S4/S5)

| Akt | Dotyczy? | Uwagi |
|---|---|---|
| **EMC 2014/30/EU** | Tak — urządzenie cyfrowe z zegarem 12–133 MHz i USB | Samoocena (moduł A) + DoC + CE. Wyjątek „custom built evaluation kits destined for professionals (…) solely at research and development facilities” **nas nie obejmuje** (wymaga indywidualnego zamówienia dla ośrodków B+R) (**H**). Zalecane badania wstępne emisji (EN 55032 klasa B) w laboratorium: rzędu kilku tysięcy zł (**L**) |
| **RoHS 2011/65/EU** | Tak | Części LCSC zwykle mają deklarację RoHS; wybrać wykończenie **LeadFree HASL lub ENIG**, a w dokumentacji technicznej przechowywać deklaracje części |
| **LVD 2014/35/EU** | Nie | Zasilanie USB 5 V jest poniżej progu 75 V DC; bezpieczeństwo ogólne przejmuje GPSR |
| **RED 2014/53/EU** | **Nie dla A/B/C** (brak radia). **Tak dla wariantu D (ESP32-C3)** | D przy sprzedaży = RED + akt delegowany o cyberbezpieczeństwie (EN 18031, obowiązuje od 08.2025). Użycie certyfikowanego modułu pomaga, ale nie zwalnia z DoC. Argument, żeby D nie był pierwszym wariantem sprzedażowym |
| **GPSR 2023/988** | Tak (produkt konsumencki) | Analiza ryzyka, dokumentacja techniczna, nazwa i adres producenta na produkcie/opakowaniu, identyfikator partii, instrukcja PL, kanał zgłaszania wypadków. Sprzedaż online: te dane muszą być też w ofercie (art. 19) |
| **Laser** | Tak, ale łagodnie | VL53L1X: „Class 1 laser (…) compliant with IEC 60825-1:2014”, **pod warunkiem** użycia ustawień zalecanych przez ST (**H**, datasheet ST). Firmware nie może zmieniać parametrów emitera poza zakres ST. W instrukcji umieścić zdanie „Class 1 Laser Product” (IEC 60825-1); dla klasy 1 etykieta może być w dokumentacji zamiast na obudowie (**M**) |
| **WEEE 2012/19/EU** | Tak przy sprzedaży | Rejestracja producenta w każdym kraju sprzedaży (w PL: rejestr BDO), opłaty, symbol przekreślonego kosza. Małe wolumeny: przez organizację odzysku (**M**) |
| **Nowa dyrektywa PLD (EU) 2024/2853** | Tak od 9.12.2026 | Odpowiedzialność za wady obejmuje też oprogramowanie; wyłączone jest FOSS „developed or supplied outside the course of a commercial activity” → dotyczy też **MoveUp**, jeśli kiedyś stanie się płatny lub zostanie dołączony do sprzedawanego sprzętu (**M**) |
| **CRA (EU) 2024/2847** | Przy sprzedaży — prawdopodobnie tak (produkt z elementami cyfrowymi, firmware + aplikacja) | Główne obowiązki od 12.2027. Czyste open source poza działalnością handlową jest wyłączone (**M/[NIEPEWNE]** co do zakresu dla prostego czujnika USB) |

### 3.4 Jak ograniczyć ryzyko teraz (etap DIY)
1. **Nie sprzedawać i nie rozdawać seryjnie** płytek zamówionych przez właściciela pod marką projektu. Prototypy dla testerów opisać jako próbki badawcze z pisemną zgodą testera (to nadal **[NIEPEWNE]** — rozważyć rozmowę z prawnikiem).
2. Oddzielić `/diy` od `/pricing` i pre-order (osobna strona, brak przycisku „kup”, brak cen „od nas”).
3. Licencja sprzętu: **CERN-OHL-S-2.0** lub -P (zawiera wyłączenie gwarancji i odpowiedzialności w granicach prawa); oprogramowanie: licencja OSI.
4. Disclaimer na `/diy` i w `ORDER.md`: „Design files provided AS IS for hobbyist/evaluation use. You are the manufacturer of any device you build. Not a finished consumer product; not CE-marked by the project.” Uwaga: disclaimer **nie** usuwa odpowiedzialności wobec osób trzecich, gdy w rzeczywistości zachodzi wprowadzenie do obrotu (**M**).
5. **Nie** umieszczać znaku CE w Gerberach/silkscreenie ani na obudowie DIY — CE bez DoC jest naruszeniem. Na silkscreenie wystarczy: nazwa projektu, wersja, URL, „Class 1 Laser Product”.
6. Mimo to wykonać podstawową analizę ryzyka (nagrzewanie LDO, przewód USB, laser) i ją opublikować — buduje zaufanie i wystarczy jako punkt wyjścia do przyszłej dokumentacji technicznej.

---

## 4. Rekomendacja: plan etapowy

| Etap | Co | Warunek wejścia | Obowiązki prawne |
|---|---|---|---|
| **0. Teraz** | Wariant A (moduły) jako referencja warsztatowa, bez publicznego „zamów” | — | brak |
| **1. DIY-order-yourself** | Wydanie wariantu **B chip-down** (Economic PCBA, 1 strona, zero lutowania) + STL/3MF obudowy + przycisk „Pobierz paczkę JLC” + instrukcja krok po kroku. Równolegle projekt na **PCBWay Shared Projects** (deep-link + 10% prowizji na testy) | ADR-002 external review zaliczony; 1 własna partia 5 szt. zamówiona dokładnie według `ORDER.md` i przetestowana | S1/S2: minimalne; strona bez sprzedaży |
| **2. Społeczność** | Galeria „zbudowane przez was”, `alternates.csv` utrzymywany przez PR, powiadomienie o wyprzedanych częściach (skrypt CI sprawdzający stan LCSC raz w tygodniu) | ≥ 20 niezależnych budów bez krytycznych zgłoszeń | jw. |
| **3. Kity / gotowe płytki** | Tindie albo Elecrow (produkcja + wysyłka) lub Crowd Supply (fulfillment Mouser, VAT UE) | Popyt z etapu 2; działalność gospodarcza; badania wstępne EMC | CE (EMC+RoHS), GPSR, WEEE (BDO), DoC, instrukcja PL/EN |
| **4. Produkt certyfikowany / OEM** | Pełny produkt lub kit OEM dla producentów biurek (model z ECOSYSTEM.md) | Umowa z OEM | Po stronie OEM/właściciela, plus CRA od 2027 |

### Zawartość strony `/diy`
1. Nagłówek: „Build your own — order 5 assembled boards, keep one, give four away”.
2. Wybór wariantu (B = rekomendowany; A = z lutownicą; D = eksperymentalny, bez RED → tylko na własny użytek).
3. Przycisk pobrania paczki wydania (Gerber/BOM/CPL/ORDER.md/obudowa) + link do PCBWay Shared Project.
4. Ustawienia formularza JLC krok po kroku ze zrzutami: warstwy, grubość 1.6 mm, **LeadFree HASL**, PCBA Economic, jedna strona, „Confirm Parts Placement”, sprawdzenie obrotów U1/U2/J1.
5. Tabela „BOM zweryfikowany dnia …” + zamienniki; co zrobić, gdy część jest wyprzedana.
6. Koszt realny (tabela z §2.5) z datą, informacja o **DDP** i nowym cle €3/HS.
7. Obudowa: plik 3MF + profil (PETG, bez podpór), opcja JLC3DP.
8. Flashowanie firmware (drag-and-drop UF2) + pobranie MoveUp.
9. Bezpieczeństwo i prawo: „Class 1 Laser Product”, disclaimer, „you are the manufacturer”, brak CE.
10. „Rozdaj dalej”: karta do wydruku dla obdarowanych (QR do instrukcji i MoveUp).

### Ryzyka
- **Wyprzedane części (wysokie)** → zamienniki, cotygodniowy check, data weryfikacji na stronie.
- **Błędy obrotów/footprintu w pierwszym wydaniu (wysokie)** → własna partia testowa przed publikacją, zewnętrzny review (ADR-002).
- **Koszt wyższy od oczekiwań (średnie)** → uczciwa tabela kosztów; „zamów z 4 znajomymi” jako ramka społeczna.
- **Uznanie rozdawania przez właściciela za wprowadzenie do obrotu (średnie, [NIEPEWNE])** → etap 1 bez rozdawania przez właściciela, oddzielenie `/diy` od pre-order.
- **Laser poza klasą 1 przez modyfikację firmware (niskie)** → blokada parametrów emitera w firmware + ostrzeżenie w README.
- **Wariant D z radiem rozdawany szerzej (średnie)** → oznaczyć jako eksperymentalny, bez rozdawania.

---

## Źródła
- JLCPCB, cennik PCBA: https://jlcpcb.com/help/article/pcb-assembly-price
- JLCPCB, EU Customs Reform FAQ (07.2026): https://jlcpcb.com/help/article/eu-customs-reform-faq
- JLCPCB, IOSS: https://jlcpcb.com/help/answers/detail/528-IOSS%20number%20for%20EU%20countries
- JLCPCB, pozyskiwanie części (Global Sourcing / pre-order / consigned): https://jlcpcb.com/help/article/pcba-parts-sourcing-instruction
- JLCPCB, możliwości montażu (Economic ≤30 szt., THT): https://jlcpcb.com/capabilities/pcb-assembly-capabilities
- Części: RP2040 https://jlcpcb.com/partdetail/RaspberryPi-RP2040/C2040 · VL53L1X https://jlcpcb.com/partdetail/Stmicroelectronics-VL53L1CXV0FY1/C190004 · RP2040-Zero https://jlcpcb.com/partdetail/Waveshare-RP2040Zero/C5350143 · https://jlcpcb.com/partdetail/JlcpcbAssembly-pico_rp2040zero/C9900174641
- tscircuit: https://docs.tscircuit.com/command-line/tsci-export · https://docs.tscircuit.com/guides/understanding-fabrication-files · https://docs.tscircuit.com/building-electronics/ordering-prototypes · https://github.com/tscircuit/tscircuit.com/pull/4932
- OSHWLab: https://blog.rambros3d.com/ordering-boards-for-oshwlab-projects · https://oshwlab.com/
- PCBWay Shared Projects (10%): https://www.pcbway.com/blog/help_center/Shared_Projects_PCBWay_Community_PCBWay_Website_Exploration_05_17c562d8.html
- Kitspace 1-click BOM: https://github.com/kitspace/1clickBOM
- DeskHop JLCPCB: https://github.com/hrvach/deskhop/discussions/52 · OpenMicroKbd: https://openmicrokbd.org/blog/fab-with-jlcpcb/ · Arisu BOM/CPL: https://gist.github.com/overset/bfde44e95b8ca72d8ffed75c40979b75
- Crowd Supply: https://www.crowdsupply.com/guide/fulfillment-and-logistics · https://www.crowdsupply.com/guide/about-ce-certification
- GPSR: https://eur-lex.europa.eu/eli/reg/2023/988/oj/eng · https://gpsr-online.com/general-product-safety-regulation/chapter-1/article-3/
- Blue Guide 2016/2022: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=oj%3AJOC_2016_272_R_0001 · https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A52022XC0629%2804%29 · https://products.cooley.com/2022/07/08/the-new-blue-eu-updates-key-blue-guide-to-products-laws/
- Przewodnik Komisji do EMC 2014/30/EU (2018): https://ec.europa.eu/docsroom/documents/33601/attachments/1/translations/en/renditions/native
- ST VL53L1X datasheet (Class 1, IEC 60825-1:2014): https://www.st.com/resource/en/datasheet/vl53l1x.pdf
