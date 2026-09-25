# E007 — Siedzenie, przerwy i biurka sit-stand: fakty do infografiki

> Dokument wewnętrzny dla właściciela projektu (opisy po polsku, gotowe zdania na stronę po angielsku).
> Stan: 2026-09-25. Autor: agent badawczy (E005 wave 1).
> Metoda: wyszukiwanie w sieci plus odczyt streszczeń prac (Europe PMC API, PDF-y EU-OSHA/BMJ/Eurobarometru rozpakowane lokalnie).
> Wszystkie liczby poniżej pochodzą z tekstu pierwotnego, który został przeczytany w tej sesji, chyba że dopisano inaczej ("źródło wtórne", "niezweryfikowane").

## Skala pewności

| Poziom | Znaczenie |
|---|---|
| **strong** | Wytyczne WHO/EU-OSHA, duże metaanalizy, spójne wyniki z wielu kohort. |
| **moderate** | Pojedyncza duża kohorta, RCT albo małe, dobrze kontrolowane badania laboratoryjne. |
| **weak** | Badanie pilotażowe, bardzo mała próba, modelowanie lub liczba znana tylko z komunikatu prasowego. |

**Najważniejsze zastrzeżenie:** niemal wszystkie dane o śmiertelności to **obserwacje (asocjacje), a nie dowód przyczynowy**. Na stronie piszemy "linked to" / "associated with", nigdy "causes" / "kills".

---

## 0. Co z tego wynika dla Open Smart Desk (w skrócie)

1. **Problemem nie jest samo siedzenie, tylko siedzenie długo i bez przerw.** Ryzyko rośnie przy dużej łącznej liczbie godzin (ok. 8–9,5 h dziennie i więcej) oraz przy długich, nieprzerwanych okresach siedzenia (Ekelund 2019, Patterson 2018, Diaz 2017).
2. **Oficjalne zalecenia mówią o częstych przerwach:** EU-OSHA zaleca wstawanie co 20–30 minut, a WHO podaje, że liczy się ruch o dowolnej intensywności.
3. **Stanie to nie lekarstwo.** Samo stanie nie zmniejsza ryzyka sercowo-naczyniowego, a ponad 2 godziny stania dziennie wiąże się z wyższym ryzykiem chorób krążenia żylnego (Ahmadi 2024). Nasz przekaz to więc **zmieniaj pozycję i ruszaj się**, a nie "stój cały dzień". To dokładnie pasuje do produktu.
4. **Ludzie kupują biurka sit-stand i przestają z nich korzystać.** Po latach dostępu około 1/3 w ogóle nie używa funkcji stania (Renaud 2018). **Przypomnienia działają:** w badaniu Sharma 2019 liczba osób, które nigdy nie podnosiły biurka, spadła o 76%. To najsilniejszy dowód dla naszej kategorii produktu.
5. **"Nawet 2 minuty stania się liczą": uwaga na sformułowanie.** Wyniki dla krótkich przerw na stanie są niejednoznaczne. 5 minut stania co 30 minut obniżyło glukozę (Henson 2016), ale 2 minuty stania co 20 minut nie dały efektu (Bailey & Locke 2015). Chodzenie działa w badaniach bardziej konsekwentnie. **Rekomendacja:** 2 minuty przedstawiamy jako *start nawyku i przerwanie ciągu siedzenia*, a nie jako dawkę o udowodnionym działaniu zdrowotnym. Przykład: "Every break counts. Two minutes is where the habit starts."

---

## 1. Shortlist na infografikę strony głównej (10 faktów)

Kolejność odpowiada proponowanemu przebiegowi opowieści: problem → dlaczego przerwy → dlaczego biurko nie wystarcza → dlaczego przypominacz.

### S1. WHO: ogranicz siedzenie, liczy się każda aktywność — **strong**
- **Źródło:** Bull FC et al. / WHO, *World Health Organization 2020 guidelines on physical activity and sedentary behaviour*, Br J Sports Med 2020. https://doi.org/10.1136/bjsports-2020-102955 (także https://www.ncbi.nlm.nih.gov/books/NBK566048/)
- **Dokładnie:** "Adults should limit the amount of time spent being sedentary. Replacing sedentary time with physical activity of any intensity (including light intensity) provides health benefits." WHO zaznacza też, że dowody nie pozwoliły ustalić progu ilościowego.
- **EN one-liner:** "WHO's advice for every adult: sit less. Replacing sitting with activity of *any* intensity brings health benefits."
- **Visual (low-poly):** globus low-poly, z którego wstaje postać z krzesła, a obok ikona tarczy WHO. Uwaga: bez logo WHO, bo to marka zastrzeżona; wystarczy tekst "WHO 2020".

### S2. Próg ok. 9,5 godziny siedzenia dziennie — **strong** (metaanaliza z akcelerometrami, ale obserwacyjna)
- **Źródło:** Ekelund U, Tarp J, et al., *Dose-response associations between accelerometry measured physical activity and sedentary time and all cause mortality: systematic review and harmonised meta-analysis*, BMJ 2019;366:l4570. https://doi.org/10.1136/bmj.l4570
- **Dokładnie:** 8 kohort, n=36 383, mediana obserwacji 5,8 roku, 2149 zgonów. Ryzyko "increased gradually from about 7.5 to 9 hours and were more pronounced at greater than 9.5 hours". 10 h/d → HR 1.48 (1.22–1.79), 12 h/d → HR 2.92 (2.24–3.83) względem 7,5 h/d. Kwartyle czasu siedzącego: HR 1.00 / 1.28 / 1.71 / 2.63. Próba: osoby w średnim i starszym wieku (średnio 62,6 roku).
- **EN one-liner:** "In a meta-analysis of 36,000 device-tracked adults, mortality risk climbed noticeably beyond ~9.5 sedentary hours a day."
- **Visual:** zegar low-poly z tarczą 24 h. Segment 0–7,5 h jest neutralny, dalej kolor przechodzi w ciepły gradient, a przy 9,5 h stoi znacznik.
- Uwaga: "sedentary time" z akcelerometru obejmuje cały dzień, nie tylko pracę.

### S3. Liczy się też *jak długo siedzisz bez przerwy* — **moderate**
- **Źródło:** Diaz KM, Howard VJ, Hutto B, et al., *Patterns of Sedentary Behavior and Mortality in U.S. Middle-Aged and Older Adults: A National Cohort Study*, Ann Intern Med 2017;167:465–475. https://doi.org/10.7326/M17-0212
- **Dokładnie:** n=7985, wiek ≥45 lat, akcelerometr na biodrze, mediana obserwacji 4 lata, 340 zgonów. Najdłuższe średnie "ciągi" siedzenia (kwartyl 4, ≥12,4 min na ciąg) wobec najkrótszych (<7,7 min): HR 1.96 (1.31–2.93), model uwzględniający MVPA. Najwyższe ryzyko miały osoby, u których oba parametry były wysokie (≥12,5 h/d i ≥10 min na ciąg). Komunikat prasowy (EurekAlert, https://www.eurekalert.org/news-releases/921239) podaje: "Participants who kept their sitting bouts to less than 30 minutes had the lowest risk for death". Nie podaje przy tym procentu.
- **Zastrzeżenie:** kontynuacja tej kohorty (Diaz 2019, AJE, https://doi.org/10.1093/aje/kwy271) pokazała, że zamiana długich ciągów na **krótsze ciągi siedzenia** (bez ruchu) nie wiązała się z niższą śmiertelnością (HR 1.00). Korzystna była dopiero zamiana na aktywność: lekka aktywność HR 0.83 na każde 30 min. **Samo "przerwanie" bez ruchu to za mało.**
- **EN one-liner:** "It's not just how much you sit — people whose sitting came in the longest unbroken stretches had about twice the mortality risk (US cohort, 7,985 adults)."
- **Visual:** dwa paski czasu obok siebie. Pierwszy to jeden długi ciemny blok, drugi ten sam czas pocięty na krótkie segmenty z małymi figurkami stojącymi w przerwach.

### S4. 5 minut ruchu co 30 minut — **moderate** (małe badanie laboratoryjne)
- **Źródło:** Duran AT, Friel CP, Serafini MA, Ensari I, Cheung YK, Diaz KM, *Breaking Up Prolonged Sitting to Improve Cardiometabolic Risk: Dose-Response Analysis of a Randomized Crossover Trial*, Med Sci Sports Exerc 2023. https://doi.org/10.1249/MSS.0000000000003109
- **Dokładnie:** n=11, 8 godzin siedzenia, porównano 4 dawki przerw na lekki spacer. Glukoza (iAUC) spadła istotnie **tylko** przy dawce 5 min co 30 min. **Wszystkie** dawki obniżyły ciśnienie skurczowe, najbardziej 1 min co 60 min (−5,2 mmHg) i 5 min co 30 min (−4,3 mmHg). Liczba "**58%** mniejszy skok cukru po posiłku" pochodzi z komunikatu prasowego Columbia (https://www.cuimc.columbia.edu/news/rx-prolonged-sitting-five-minute-stroll-every-half-hour), a nie ze streszczenia. Jeśli jej użyjemy, cytujemy komunikat.
- **EN one-liner:** "In a controlled trial, a 5-minute stroll every 30 minutes blunted after-meal blood-sugar spikes, and every break schedule tested lowered blood pressure."
- **Visual:** kolejka 16 klepsydr low-poly (8 h), przy co drugiej maleńka ścieżka z krokami, a pod spodem wygładzona linia glukozy.

### S5. Stanie jako przerwa: 5 min co 30 min obniżyło glukozę o 34% — **moderate** (grupa ryzyka, n=22)
- **Źródło:** Henson J, Davies MJ, Bodicoat DH, et al., *Breaking Up Prolonged Sitting With Standing or Walking Attenuates the Postprandial Metabolic Response in Postmenopausal Women: A Randomized Acute Study*, Diabetes Care 2016;39(1):130–138. https://doi.org/10.2337/dc15-1240
- **Dokładnie:** 22 kobiety po menopauzie z nadwagą lub otyłością i zaburzoną glikemią, 7,5 h siedzenia. Glukoza iAUC: siedzenie 5,3, przerwy na stanie 3,5 (≈ −34%), przerwy na spacer 3,8 mmol/L·h. Insulina również niższa. Efekt glukozowy utrzymywał się następnego dnia.
- **Kontra:** Bailey DP, Locke CD, J Sci Med Sport 2015 (https://doi.org/10.1016/j.jsams.2014.03.008): 10 osób bez otyłości, **2 min stania co 20 min nie zmieniły glukozy**, a 2 min spaceru ją obniżyły. Wniosek: stanie może pomóc, szczególnie osobom z grupy ryzyka i przy dłuższych przerwach. Ruch działa pewniej.
- **EN one-liner:** "Even standing counts: in women at risk of diabetes, 5 minutes of standing every half hour cut the post-meal glucose rise by about a third."
- **Visual:** krzesło i sylwetka stojąca na przemian, jak metronom, a za nimi zaokrąglona krzywa glukozy obniżona o 1/3.

### S6. EU-OSHA: wstawaj co 20–30 minut; 28% pracowników UE siedzi niemal cały czas — **strong** (wytyczne i dane z badań ankietowych)
- **Źródło:** European Agency for Safety and Health at Work (EU-OSHA), *Prolonged static sitting at work — Health effects and good practice advice* (Executive summary), 2021. https://osha.europa.eu/sites/default/files/Sitting_at_work_%20summary_EN.pdf
- **Dokładnie:** zalecenia: "Avoid sitting for any length of time — aim to get up at least every 20-30 minutes"; "Always get up for at least 10 minutes after 2 hours of sitting"; "Spend 50 % or less of your working day sitting"; "Do not exceed 5 hours of sitting at work each day"; "Our next posture is the best posture". Dane: EWCS 2015 — 28% pracowników siedzi "almost all the time", a kolejne 30% od 1/4 do 3/4 czasu (kobiety 31%, mężczyźni 25%). Eurostat 2017 — 39% pracowników UE pracuje na siedząco. ESENER 2019 — długie siedzenie było drugim najczęściej zgłaszanym czynnikiem ryzyka i występowało w 61% zakładów w UE-27.
- **EN one-liner:** "EU safety experts' advice: get up at least every 20–30 minutes. Your next posture is your best posture."
- **Visual:** timer low-poly z trzema znacznikami (20, 30 min, 2 h) i mapa UE złożona z trójkątów, gdzie ~3 na 10 figurek siedzi.

### S7. 1 na 3 osoby z biurkiem sit-stand w ogóle nie używa funkcji stania — **moderate** (ankieta, n=1098)
- **Źródło:** Renaud LR, Huysmans MA, van der Ploeg HP, Speklé EM, van der Beek AJ, *Long-Term Access to Sit-Stand Workstations in a Large Office Population: User Profiles Reveal Differences in Sitting Time and Perceptions*, Int J Environ Res Public Health 2018;15(9):2019. https://doi.org/10.3390/ijerph15092019
- **Dokładnie:** holenderskie biuro, osoby z **długoterminowym** dostępem do biurek sit-stand. Grupy użytkowników: **non-users 32,1%**, monthly/weekly 37,5%, **daily 30,4%**. Osoby niekorzystające siedziały więcej i dłużej bez przerwy. Postrzegały biurko jako "uncomfortable, distracting, and unpractical".
- **EN one-liner:** "Buying the desk isn't the hard part: among office workers with long-term access to sit-stand desks, about 1 in 3 never used the standing function."
- **Visual:** trzy biurka low-poly. Jedno pokrywa kurz i pajęczyna, drugie jest w połowie wysokości, trzecie w górze ze stojącą postacią, a nad nimi etykiety 32% / 38% / 30%.

### S8. Przypomnienia działają: −76% osób, które nigdy nie podnosiły biurka — **moderate** (badanie terenowe, n=194, 1 rok)
- **Źródło:** Sharma PP, Mehta RK, Pickens A, Han G, Benden M, *Sit-Stand Desk Software Can Now Monitor and Prompt Office Workers to Change Health Behaviors*, Human Factors 2019. https://doi.org/10.1177/0018720818807043
- **Dokładnie:** oprogramowanie mierzyło **obiektywnie** pozycję elektrycznego biurka i uwzględniało nieobecność przy biurku. Interwencja (przypomnienia plus informacja zwrotna na bieżąco) "doubled desk usage by increasing ~1 change to ~2 changes per work day" i dała "76% reduction in workers who never used the sit-stand function". W pełnym tekście: grupa niekorzystających zmniejszyła się z 33 do 7 osób, a średnia reakcja na przypomnienie wyniosła 61%.
- **Dodatkowe wsparcie:** Cochrane 2018 (L11 niżej): przypomnienia komputerowe z informacją skróciły siedzenie w pracy o 55 min/dzień w okresie średnioterminowym (1 badanie, niska jakość). Krótkie przerwy (1–2 min co pół godziny) dały −40 min/dzień wobec dwóch 15-minutowych przerw (1 badanie, niska jakość).
- **EN one-liner:** "Nudges work: in a year-long office study, desk reminders cut the number of people who never raised their desk by 76% and doubled daily posture changes."
- **Visual:** dymek powiadomienia low-poly nad biurkiem, strzałka w górę i licznik "1 → 2 changes/day".

### S9. Ból dolnej części pleców to globalnie najczęstsza przyczyna życia z niepełnosprawnością — **strong** (GBD)
- **Źródło:** GBD 2021 Low Back Pain Collaborators, *Global, regional, and national burden of low back pain, 1990–2020, its attributable risk factors, and projections to 2050*, Lancet Rheumatology 2023. https://doi.org/10.1016/S2665-9913(23)00098-X
- **Dokładnie:** 619 mln osób z bólem dolnej części pleców w 2020 r., prognoza 843 mln w 2050 r. (+36,4%). Pozostaje on wiodącą przyczyną lat przeżytych z niepełnosprawnością (YLD). 38,8% YLD przypisano czynnikom zawodowym, paleniu i wysokiemu BMI.
- **UWAGA:** GBD **nie** przypisuje bólu pleców siedzeniu. Nie wolno pisać "sitting causes back pain" (patrz "Claims to avoid"). Ten fakt pokazuje skalę problemu, a nie przyczynę.
- **EN one-liner:** "Low back pain is the world's leading cause of years lived with disability — 619 million people in 2020, heading to 843 million by 2050."
- **Visual:** kręgosłup low-poly z podświetlonym odcinkiem lędźwiowym i dwa słupki, 619M → 843M.

### S10. Samo stanie nie jest rozwiązaniem: zmieniaj pozycję — **moderate** (UK Biobank, n=83 013)
- **Źródło:** Ahmadi MN, Coenen P, Straker L, Stamatakis E, *Device-measured stationary behaviour and cardiovascular and orthostatic circulatory disease incidence*, Int J Epidemiol 2024;53(6):dyae136. https://doi.org/10.1093/ije/dyae136
- **Dokładnie:** 83 013 dorosłych, akcelerometr, obserwacja 6,9 roku. Więcej stania **nie** wiązało się z niższym ryzykiem chorób sercowo-naczyniowych. Każde 30 min stania powyżej 2 h/d podnosiło ryzyko chorób ortostatycznych i krążenia żylnego (żylaki, przewlekła niewydolność żylna, hipotonia ortostatyczna) średnio o HR +0,11. Z kolei każda godzina siedzenia powyżej 10 h/d zwiększała ryzyko CVD o HR +0,15, a chorób ortostatycznych o +0,26.
- **EN one-liner:** "Standing all day isn't the cure either — research links long standing to circulation problems. The goal is to switch: sit, stand, move."
- **Visual:** trzy ikony w pętli (krzesło → stojąca postać → idąca postać) połączone strzałkami w okrąg low-poly.

**Alternatywy do shortlisty:** L2 (Patterson: próg 6–8 h), L11 (Cochrane: sit-stand −100 min/dzień), L1 (USA: 6,4 h siedzenia dziennie).

---

## 2. Dłuższa lista na stronę /problem

### A. Ile siedzimy

**L1. Dorośli w USA siedzą 6,4 h dziennie, o godzinę więcej niż w 2007 r. — strong** (NHANES, reprezentatywne, deklaracje)
- Yang L, Cao C, Kantor ED, et al., *Trends in Sedentary Behavior Among the US Population, 2001-2016*, JAMA 2019;321(16):1587–1597. https://doi.org/10.1001/jama.2019.3636
- 2007→2016: dorośli 5,5 → 6,4 h/d (+1,0 h). Nastolatki 7,0 → 8,2 h/d. Odsetek dorosłych używających komputera ≥1 h/d w czasie wolnym: 29% → 50% (2003–2016).
- EN: "US adults now sit about 6.4 hours a day — a full hour more than a decade earlier."

**L1b. UE: 11% dorosłych siedzi ≥8,5 h dziennie (2022) — strong** (Eurobarometr, deklaracje)
- European Commission, *Special Eurobarometer 525 — Sport and physical activity*, 2022 (fieldwork 19.04–16.05.2022, n=26 580). Karta krajowa NL: https://www.nederlandse-sportraad.nl/site/binaries/site-content/collections/documents/2023/03/08/special-eurobarometer-525---sports-and-physical-activity/Special+Eurobarometer+525+-+Sports+and+Physical+Activity_2022.pdf ; raport: https://europa.eu/eurobarometer/surveys/detail/2668
- EU27, pytanie o siedzenie w zwykły dzień: ≤2h30 16%, 2h31–5h30 43%, 5h31–8h30 28%, **≥8h31 11%** (−1 pp. vs 2017). Holandia: 26% siedzi ≥8,5 h.
- Starsze dane (Eurobarometr 2013, cyt. w EU-OSHA 2021; Loyen et al., PLoS ONE 2016, https://doi.org/10.1371/journal.pone.0149320): 18% dorosłych w UE siedzi >7,5 h dziennie.
- EN: "More than 1 in 10 Europeans sit for 8.5 hours or more on a usual day — in the Netherlands it's more than 1 in 4."

**L1c. Praca siedząca w UE — strong** (EU-OSHA 2021, patrz S6): 39% pracowników pracuje na siedząco (Eurostat 2017), 28% siedzi niemal cały czas (EWCS 2015). Odsetek osób pracujących przy komputerze cały lub prawie cały czas wzrósł z 17,6% (2000) do 30,3% (2015).
- EN: "Nearly 3 in 10 EU workers sit almost all of their working time."

### B. Ryzyko zdrowotne (asocjacje)

**L2. Próg 6–8 h siedzenia dziennie — strong** (metaanaliza, 1,33 mln osób)
- Patterson R, McNamara E, Tainio M, et al., *Sedentary behaviour and risk of all-cause, cardiovascular and cancer mortality, and incident type 2 diabetes: a systematic review and dose response meta-analysis*, Eur J Epidemiol 2018;33:811–829. https://doi.org/10.1007/s10654-018-0380-1
- 34 badania, 1 331 468 uczestników. Po uwzględnieniu aktywności: RR na każdą 1 h/d wynosi 1,01 do 8 h/d i 1,04 powyżej 8 h/d (śmiertelność ogólna). Dla CVD próg to 6 h. Dla cukrzycy typu 2 zależność liniowa (RR 1,01/h). Oglądanie TV ma silniejszy związek (próg 3–4 h/d). Wniosek autorów: "a threshold of 6-8 h/day of total sitting … above which the risk is increased".
- EN: "Across 1.3 million people, the risk linked to sitting rises most steeply beyond 6–8 hours a day."

**L3. Siedzenie a śmiertelność i cukrzyca: metaanaliza Biswas — strong/moderate**
- Biswas A, Oh PI, Faulkner GE, et al., *Sedentary Time and Its Association With Risk for Disease Incidence, Mortality, and Hospitalization in Adults*, Ann Intern Med 2015;162:123–132. https://doi.org/10.7326/M14-1651
- Śmiertelność ogólna HR 1,24 (1,09–1,41). Najsilniejszy związek dotyczył zachorowań na cukrzycę typu 2 (HR ≈1,91). Liczbę 1,91 znam z wyszukiwarki i streszczeń wtórnych; przed publikacją sprawdzić w tabeli oryginału.
- EN: "High sitting time is linked to a roughly 24% higher risk of early death and a markedly higher risk of type 2 diabetes."

**L4. Ruch może zrównoważyć siedzenie, ale potrzeba go dużo — strong**
- Ekelund U, Steene-Johannessen J, Brown WJ, et al., *Does physical activity attenuate, or even eliminate, the detrimental association of sitting time with mortality? A harmonised meta-analysis of data from more than 1 million men and women*, Lancet 2016;388:1302–1310. https://doi.org/10.1016/S0140-6736(16)30370-1
- 1 005 791 osób, 84 609 zgonów. Najmniej aktywni, którzy siedzą >8 h/d, mieli HR 1,59 wobec aktywnych, którzy siedzą <4 h. W najbardziej aktywnym kwartylu (>35,5 MET-h/tydz., czyli ok. **60–75 min umiarkowanej aktywności dziennie**) siedzenie nie wiązało się z wyższą śmiertelnością. Wyjątek: przy oglądaniu TV ryzyko było osłabione, ale nie znikało.
- **Dlaczego to ważne:** uczciwa kontra. Większość pracowników biurowych nie robi 60–75 min ruchu dziennie, więc częste przerwy są realistyczną drogą.
- EN: "About 60–75 minutes of moderate activity a day appears to offset the risk linked to long sitting — most desk workers get far less, which is why breaking up sitting matters."

**L5. Szacunek: 3,8% zgonów w 54 krajach przypisanych siedzeniu >3 h/d — weak/moderate** (modelowanie)
- Rezende LFM, Sá TH, Mielke GI, et al., *All-Cause Mortality Attributable to Sitting Time: Analysis of 54 Countries Worldwide*, Am J Prev Med 2016;51(2):253–263. https://doi.org/10.1016/j.amepre.2016.01.022
- 3,8% zgonów (ok. 433 000 rocznie), a wyeliminowanie siedzenia >3 h/d dałoby +0,20 roku długości życia. Autorzy zakładają, że efekt siedzenia jest niezależny od aktywności. Używać ostrożnie.
- EN (jeśli w ogóle): "One modelling study attributed about 3.8% of deaths in 54 countries to sitting more than 3 hours a day."

### C. Przerywanie siedzenia: badania ostre (mechanizmy)

**L6. 2 minuty lekkiego spaceru co 20 min: glukoza −25%, insulina −23% — moderate**
- Dunstan DW, Kingwell BA, Larsen R, et al., *Breaking Up Prolonged Sitting Reduces Postprandial Glucose and Insulin Responses*, Diabetes Care 2012;35(5):976–983. https://doi.org/10.2337/dc11-1931
- n=19, osoby z nadwagą lub otyłością w wieku 45–65 lat. Glukoza iAUC: 6,9 (siedzenie) → 5,2 (lekki spacer) → 4,9 (umiarkowany). Insulina: 828,6 → 633,6 / 637,6. Procenty (≈−25% i −23%) wyliczono z tych liczb, a nie przepisano z pracy.
- EN: "Two minutes of easy walking every 20 minutes lowered post-meal glucose by about a quarter compared with sitting straight through."

**L7. Tętnice nóg: 3 h siedzenia pogarszają ich funkcję, trzy 5-minutowe spacery temu zapobiegają — weak/moderate**
- Thosar SS, Bielko SL, Mather KJ, Johnston JD, Wallace JP, *Effect of prolonged sitting and breaks in sitting time on endothelial function*, Med Sci Sports Exerc 2015;47(4):843–849. https://doi.org/10.1249/MSS.0000000000000479
- n=12 młodych mężczyzn. FMD tętnicy udowej spadło z 4,72% do 2,2% po 3 h siedzenia. Spacer 5 min w 30., 90. i 150. minucie zapobiegł spadkowi.
- EN: "Three hours of uninterrupted sitting measurably impaired leg-artery function in a lab study; three 5-minute walks prevented it."

**L8. Stanie po obiedzie: wzrost glukozy −43% — weak** (n=10, prawdziwe biuro)
- Buckley JP, Mellor DD, Morris M, Joseph F, *Standing-based office work shows encouraging signs of attenuating post-prandial glycaemic excursion*, Occup Environ Med 2014;71(2):109–111. https://doi.org/10.1136/oemed-2013-101823
- 185 min pracy na stojąco po lunchu dało wzrost glukozy (AUC) mniejszy o 43% niż przy siedzeniu. Badanie podaje też +174 kcal za całe popołudnie, ale metaanaliza (L16) pokazuje znacznie mniejszą różnicę.
- EN: "In a small real-office study, working standing after lunch cut the post-meal blood-sugar rise by 43%."

**L9. Energia i nastrój — moderate**
- Bergouignan A, Legget KT, De Jong N, et al., *Effect of frequent interruptions of prolonged sitting on self-perceived levels of energy, mood, food cravings and cognitive function*, Int J Behav Nutr Phys Act 2016;13:113. https://doi.org/10.1186/s12966-016-0437-z
- n=30. Przy sześciu 5-minutowych spacerach co godzinę uczestnicy mieli więcej wigoru i energii oraz mniej zmęczenia niż przy ciągłym siedzeniu. **Brak** różnic w testach poznawczych.
- EN: "Short hourly walking breaks left people feeling more energetic and less fatigued — no brain-boost claims needed."

**L10. Skład przerw: EU-OSHA i konsensus ekspertów — moderate** (konsensus, dowody głównie obserwacyjne)
- Buckley JP, Hedge A, Yates T, et al., *The sedentary office: an expert statement on the growing case for change towards better health and productivity*, Br J Sports Med 2015;49:1357–1362. https://doi.org/10.1136/bjsports-2015-094618
- Zalecenie dla pracowników biurowych: najpierw 2 h dziennie stania lub lekkiej aktywności w czasie pracy, potem stopniowo do 4 h. Siedzenie należy regularnie przerywać pracą na stojąco, biurkiem sit-stand albo krótkimi przerwami. Autorzy sami zaznaczają, że dowody są w większości obserwacyjne i krótkoterminowe.
- EN: "Expert guidance for desk workers: build up to 2 hours of standing and light movement across the workday, then aim for 4."

### D. Biurka sit-stand: czy działają i czy ich używamy

**L11. Cochrane: biurka sit-stand −100 min siedzenia w pracy dziennie, ale dowody niskiej jakości — strong (jako przegląd) / low-quality evidence**
- Shrestha N, Kukkonen-Harjula KT, Verbeek JH, Ijaz S, Hermans V, Pedisic Z, *Workplace interventions for reducing sitting at work*, Cochrane Database Syst Rev 2018. https://doi.org/10.1002/14651858.CD010912.pub4 (też https://pubmed.ncbi.nlm.nih.gov/29926475/)
- 34 badania, 3397 osób. Sit-stand: −100 min/dzień roboczy krótkoterminowo (95% CI −116 do −84; 10 badań; low quality), −57 min w okresie 3–12 miesięcy (2 badania). **Brak danych długoterminowych.** Komunikat Cochrane Canada: "Health effects of sit-stand desks and interventions aimed to reduce sitting at work are still unproven" (https://canada.cochrane.org/news/press-release-health-effects-sit-stand-desks-and-interventions-aimed-reduce-sitting-work-are-st).
- EN: "Sit-stand desks cut workplace sitting by around 100 minutes a day in the short term — but evidence on lasting use is thin."

**L12. SMArT Work RCT: biurko plus wsparcie behawioralne −83 min/dzień po 12 miesiącach — moderate/strong** (RCT klastrowe)
- Edwardson CL, Yates T, Biddle SJH, et al., *Effectiveness of the Stand More AT (SMArT) Work intervention: cluster randomised controlled trial*, BMJ 2018;363:k3870. https://doi.org/10.1136/bmj.k3870
- NHS, 146 osób. Biurko regulowane plus cele, informacja zwrotna, narzędzie do samomonitoringu i przypomnień, coaching. Siedzenie w pracy vs kontrola: −50,6 min (3 mies.), −64,4 (6 mies.), −83,3 min/dzień roboczy (12 mies.). Poprawiły się też samooceniane: wydajność w pracy, zaangażowanie, zmęczenie zawodowe i prezenteizm.
- EN: "In a year-long NHS trial, a height-adjustable desk plus feedback and prompts reduced sitting by about 83 minutes per workday."
- **Uwaga produktowa:** efekt dało *biurko plus zmiana zachowania*, nie samo biurko. To argument za naszym modelem.

**L13. Spadek używania w czasie — moderate**
- Wilks S, Mortimer M, Nylén P, *The introduction of sit–stand worktables; aspects of attitudes, compliance and satisfaction*, Applied Ergonomics 2006;37(3):359–365. https://doi.org/10.1016/j.apergo.2005.06.007 — w streszczeniu: "Users were, in general, positive to the worktables, but showed poor compliance in using them". Wykorzystanie funkcji sit-stand było niższe niż potrzebne do odciążenia. (Popularny cytat "1 na 10 używa codziennie" — **niezweryfikowany**, patrz sekcja 3.)
- Pronk NP, Katz AS, Lowry M, Payfer JR, *Reducing Occupational Sitting Time and Improving Worker Health: The Take-a-Stand Project, 2011*, Prev Chronic Dis 2012;9:110323. https://doi.org/10.5888/pcd9.110323 — n=24 plus 10 w grupie kontrolnej, 4 tygodnie. Siedzenie −66 min/dzień, ból górnej części pleców i szyi −54%. **Po zabraniu urządzenia poprawa zniknęła w ciągu 2 tygodni.** Siła dowodu: weak.
- EN: "People like their sit-stand desks — they just don't use them much. Benefits fade as soon as the habit stops."

### E. Koszty

**L14. USA: ból dolnej części pleców i karku to największa pozycja wydatków zdrowotnych — strong**
- Dieleman JL, Cao J, Chapin A, et al., *US Health Care Spending by Payer and Health Condition, 1996-2016*, JAMA 2020;323(9):863–884. https://doi.org/10.1001/jama.2020.0734 (IHME: https://www.healthdata.org/news-events/newsroom/news-releases/low-back-and-neck-pain-tops-us-health-spending)
- Ból dolnej części pleców i karku to 134,5 mld USD w 2016 r. (95% UI 122,4–146,9 mld), najwięcej spośród 154 schorzeń. Wszystkie schorzenia mięśniowo-szkieletowe razem przekraczają 380 mld USD.
- EN: "Low back and neck pain was the single most expensive health condition in the US: $134.5 billion in 2016."

**L15. UE: schorzenia mięśniowo-szkieletowe to najczęstszy problem zdrowotny związany z pracą — strong**
- EU-OSHA, *Work-related musculoskeletal disorders: prevalence, costs and demographics in the EU* (Executive summary), 2019. https://osha.europa.eu/sites/default/files/Work_related_MSDs_prevalence_costs_and_demographics_in_EU_summary.pdf
- Około 3 na 5 pracowników w UE-28 zgłasza dolegliwości mięśniowo-szkieletowe, najczęściej ból pleców i kończyn górnych. 60% osób z problemem zdrowotnym związanym z pracą wskazuje je jako najpoważniejszy. 1 na 5 osób w UE-28 miała w ostatnim roku przewlekłe schorzenie pleców lub szyi. 53% pracowników z takimi schorzeniami było nieobecnych w pracy w ciągu roku (wobec 32% bez problemów zdrowotnych). Niemcy 2016: 17,2 mld EUR strat produkcji (0,5% PKB) i 30,4 mld EUR utraconej wartości dodanej (1,0% PKB).
- **UWAGA:** te schorzenia mają wiele przyczyn, a większość nie wynika z siedzenia. Nie przypisujemy tych kosztów siedzeniu.
- EN: "Musculoskeletal problems are the EU's most common work-related health issue — in Germany alone they cost €17.2 billion in lost production in 2016."

### F. Ciało przy biurku stojącym

**L16. Stanie spala mało kalorii: +0,15 kcal/min — strong** (metaanaliza)
- Saeidifard F, Medina-Inojosa JR, Supervia M, et al., *Differences of energy expenditure while sitting versus standing: A systematic review and meta-analysis*, Eur J Prev Cardiol 2018;25(5):522–538. https://doi.org/10.1177/2047487317752186
- 46 badań, 1184 osoby. Różnica 0,15 kcal/min (0,12–0,17), czyli ok. 9 kcal/h (przeliczenie własne).
- EN (do sekcji mitów): "Standing isn't a workout: it burns only about 0.15 extra calories per minute. The benefit comes from breaking up sitting, not from burning fat."

**L17. Długie stanie i krążenie — patrz S10 (Ahmadi 2024).** Raport EU-OSHA o długim, wymuszonym staniu (2021, https://osha.europa.eu/sites/default/files/2021-11/Standing_at_work_summary_EN.pdf) opisuje ryzyka stania w pracy. Tego PDF-u nie czytałem, więc liczb z niego nie cytuję.

---

## 3. Czego unikać (claims to avoid) i niezweryfikowane statystyki

| # | Popularne twierdzenie | Dlaczego unikać / co mówić zamiast | Źródło |
|---|---|---|---|
| X1 | **"Sitting is the new smoking"** | Porównanie nie trzyma się danych. Siedzenie: HR ≈1,22 dla śmiertelności ogólnej. Palenie: RR ≈2,8 (u palaczy >40 papierosów/d ok. 4,1–4,4). Nadmiarowe zgony: ≈190/100 tys./rok przy najdłuższym siedzeniu wobec >2000/100 tys./rok u najcięższych palaczy. Wyjątek: ryzyko cukrzycy typu 2. Hasło pochodzi z mediów. **Nie używać nawet ironicznie w nagłówku.** | Vallance JK, Gardiner PA, Lynch BM, et al., *Evaluating the Evidence on Sitting, Smoking, and Health: Is Sitting Really the New Smoking?*, AJPH 2018;108(11):1478–1482, https://doi.org/10.2105/AJPH.2018.304649 |
| X2 | "Sitting kills" / "sitting causes disease" | Dane o śmiertelności są obserwacyjne i nie dowodzą przyczyny. Mówimy "linked to", "associated with". | Ekelund 2019, Patterson 2018 (uwagi autorów) |
| X3 | "A standing desk will make you healthier" | Cochrane: wpływ biurek sit-stand na zdrowie "still unproven", a dowody na zmniejszenie siedzenia mają niską jakość. Samo stanie nie obniża ryzyka CVD (Ahmadi 2024). | Cochrane 2018; Ahmadi 2024 |
| X4 | "Stand all day" / "standing is always better" | Ponad 2 h stania dziennie wiąże się z ryzykiem chorób krążenia żylnego. EU-OSHA ostrzega też przed długim, wymuszonym staniem. Mówimy "alternate". | Ahmadi 2024; EU-OSHA 2021 |
| X5 | "Standing burns 50 extra calories an hour" (i podobne) | Metaanaliza: ok. 0,15 kcal/min, czyli ok. 9 kcal/h. Zero obietnic dotyczących odchudzania. | Saeidifard 2018 |
| X6 | "Exercise can't undo sitting" | Nieprawda w tej formie. 60–75 min umiarkowanej aktywności dziennie znosi związek siedzenia (ale nie oglądania TV) ze śmiertelnością. Mówimy: większość z nas tyle nie ćwiczy, więc przerwy są realistyczne. | Ekelund 2016 |
| X7 | **"Just 2 minutes of standing fixes your blood sugar"** | 2 min stania co 20 min nie zmieniło glukozy (Bailey & Locke 2015, n=10). Efekt dało 5 min stania co 30 min u kobiet z grupy ryzyka (Henson 2016). Krótkie przerwy bez ruchu nie wiązały się z niższą śmiertelnością (Diaz 2019). **2 minuty = start nawyku, nie dawka lecznicza.** | Bailey & Locke 2015; Henson 2016; Diaz 2019 |
| X8 | "Sitting causes back pain" | Tego związku nie zweryfikowałem w tej sesji. EU-OSHA wymienia ból pleców i karku jako skutki długiego, statycznego siedzenia, ale literatura przeglądowa o *przyczynowym* związku siedzenia z bólem pleców jest niejednoznaczna. Na stronie: "static postures are linked to back and neck discomfort" i cytat EU-OSHA, bez twierdzenia o przyczynie. | EU-OSHA 2021; przegląd nie wykonany (**NOT_CHECKED**) |
| X9 | "Every hour of sitting takes 22 minutes off your life" | Liczba 21,8 min dotyczy **oglądania TV** po 25. roku życia, pochodzi z **modelu tablic trwania życia** dla Australii i ma przedział niepewności 0,3–44,7 min. Nie przenosić jej na siedzenie przy biurku. | Veerman JL, et al., Br J Sports Med 2012;46:927–930, https://doi.org/10.1136/bjsports-2011-085662 |
| X10 | "Only 1 in 10 people use their sit-stand desk daily" (przypisywane Wilks 2006) | **Niezweryfikowane.** Streszczenie Wilks 2006 mówi tylko o "poor compliance". Liczba 1/10 pojawia się w tekstach wtórnych. Zamiast niej używać Renaud 2018 (32,1% non-users, 30,4% daily). | Wilks 2006 (streszczenie) |
| X11 | "Standing desks boost productivity by 46%" (Garrett et al. 2016, call center) | **Niezweryfikowane** w tej sesji (nie znalazłem streszczenia). Z tego, co wiadomo, "produktywność" oznaczała tam liczbę udanych rozmów w jednym call center, bez randomizacji. Nie używać. Uczciwsza alternatywa: SMArT Work — poprawa **samoocenianej** wydajności i zaangażowania. | brak weryfikacji (**NOT_CHECKED**) |
| X12 | "12% of Europeans sit more than 8.5 hours" | To wartość z 2017 r. W 2022 r. (Eurobarometr 525) EU27 = **11%**. | Eurobarometr 525 |
| X13 | "The average office worker sits 10/12/15 hours a day", "86% of workers sit all day" | Krążą w infografikach sprzedawców biurek. **Nie znalazłem źródła pierwotnego.** Zamiast nich: USA 6,4 h/d (Yang 2019), UE 28% pracowników siedzi niemal cały czas (EWCS 2015). | brak źródła pierwotnego |
| X14 | "Physical inactivity kills 5 million people a year" jako argument o siedzeniu | Brak ruchu to **inny** czynnik niż siedzenie, więc nie mieszać. Liczby nie weryfikowałem w tej sesji. | **NOT_CHECKED** |
| X15 | "Breaking up sitting improves focus/cognition" | Bergouignan 2016: lepsza energia i nastrój, **bez** poprawy wyników testów poznawczych. Obiecujemy energię, nie IQ. | Bergouignan 2016 |
| X16 | Liczba "58%" z Duran 2023 bez kontekstu | Pochodzi z komunikatu prasowego, n=11, badanie laboratoryjne. Jeśli jej użyjemy, dodajemy "in a small lab study" i link do komunikatu Columbia. | Duran 2023; CUIMC |

---

## 4. Zalecenia redakcyjne dla strony

- Każdy fakt na infografice ma przypis (autor, rok, link). Na /problem stosujemy pełne cytowanie.
- Formułowanie ryzyka: używamy "linked to" / "associated with" oraz ryzyka względnego z kontekstem ("vs. the least sedentary"). Nie piszemy "X% more likely to die" bez podania grupy odniesienia.
- Główny przekaz marki zgodny z dowodami: **"Break it up. Switch it up. Your next posture is your best posture."** Ostatnie zdanie pochodzi z EU-OSHA, więc na stronie cytujemy je z przypisem.
- Dla "2 min": "Every break counts toward breaking the streak. Two minutes is where the habit starts; five minutes every half hour is what studies tested." Obie części są zgodne z L6, S4 i S5.
- Najmocniejsza argumentacja produktowa (S7 + S8 + L12): **desk ≠ habit**. Biurka stoją nieużywane, a przypomnienia i informacja zwrotna podwajają liczbę zmian pozycji. Nie twierdzimy przy tym, że nasz produkt poprawia zdrowie, bo nie mamy własnych danych.

## 5. Luki i rzeczy NOT_CHECKED

- Liczby z pełnego tekstu Sharma 2019 (33 → 7 osób, 61% reakcji) pochodzą z przeglądu PMC wykonanego przez narzędzie pomocnicze. Streszczenie potwierdza −76% i ~1 → ~2 zmiany dziennie.
- Biswas 2015: HR dla cukrzycy (1,91) znam tylko ze źródła wtórnego.
- Przyczynowy związek siedzenia z bólem pleców: nie przeszukano przeglądów systematycznych.
- Dane CDC: nie pobrano osobnej strony CDC. Amerykańskie dane o siedzeniu pochodzą z NHANES (Yang 2019, JAMA), którego operatorem jest CDC/NCHS. Jeśli potrzebny jest cytat "CDC", trzeba go dobrać osobno (np. Physical Activity Guidelines for Americans, 2nd ed., 2018: "move more and sit less").
- Dane dla Polski (GUS, Eurobarometr PL): nie pobrano.
- Raport EU-OSHA o długim staniu (2021): nie przeczytano.
