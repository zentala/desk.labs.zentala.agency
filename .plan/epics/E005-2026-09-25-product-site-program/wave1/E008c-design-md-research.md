# E008(c) — Research: jak pisać DESIGN.md dla agentów kodujących i ludzi

Status: research, 2026-09-25. Konwencja `DESIGN.md` do zrobienia dla `desk.zentala.io`
(marka Open Smart Desk) — plik u źródła repo, wspólny dla ludzi i agentów (Claude/Cursor/Codex).

## 1. Najlepsze źródła (3–5) i dlaczego

1. **[awesome-design-md (VoltAgent)](https://github.com/voltagent/awesome-design-md)** —
   kolekcja analiz DESIGN.md dla znanych marek (Stripe, Linear, Vercel i in.).
   Najlepszy punkt startowy: pokazuje realny szkielet sekcji i to, że format jest
   już praktyką branżową, nie jednorazowym pomysłem. Warto podejrzeć 2–3 przykłady
   przed pisaniem własnego, żeby nie wymyślać nazewnictwa sekcji od zera.
2. **[Better Stack — "DESIGN.md: A Markdown Design System File for AI Coding Agents"](https://betterstack.com/community/guides/ai/design-md-ai/)** —
   najbardziej konkretny opis STRUKTURY pliku: front-matter YAML z tokenami
   (kolory, typografia, spacing, radius, komponenty) + markdown prose pod spodem
   z uzasadnieniem/intencją. To dokładnie wzorzec "maszynowo czytelny blok + opis
   po co", którego chce epik.
3. **[design.dev — "DESIGN.md Generator"](https://design.dev/ai/design-md-generator/)** oraz
   **[designmd.app](https://designmd.app/)** — potwierdzają konwencję pochodzącą od
   Google Stitch: plik w root repo, agent czyta go automatycznie przed generowaniem
   UI; wymiana pliku na inną markę = inny wynik bez zmiany promptu. Dobre jako
   dowód, że "jeden plik, dużo agentów" faktycznie działa w praktyce.
4. **[Design Tokens Community Group / W3C DTCG format](https://www.designtokens.org/tr/drafts/format/)** —
   oficjalny, stabilny od 2025.10 standard JSON dla tokenów (`$value`, `$type`,
   referencje między tokenami). Jeśli token-blok w DESIGN.md ma być czymś więcej
   niż czytelną tabelką, warto go modelować zgodnie z tym schematem (albo chociaż
   nie kolidować z nim), bo to jest język, który już rozumieją Style Dictionary
   i inne narzędzia.
5. **`C:/code/meblarz/DESIGN.md`** (lokalny, zatwierdzony) — patrz sekcja 4. Najlepszy
   dowód, że taki dokument DZIAŁA w naszym ekosystemie: ma MUST/SHOULD/MAY, tabelę
   tokenów CSS custom properties, sekcję antywzorców i decyzji z datami.

Dodatkowo: lokalne skille `design-review` i `design-html`
(`C:/Users/zentala/.agents/skills/design-review/SKILL.md`,
`C:/Users/zentala/.agents/skills/design-html/SKILL.md`) już ZAKŁADAJĄ istnienie
`DESIGN.md` w repo root — czytają go jako źródło tokenów przy audycie i przy
generowaniu HTML, i oferują dopisanie go, jeśli brakuje. `design-review` ma
wbudowaną listę "AI slop" (fioletowe gradienty, siatka 3 kolumn z ikonami w
kółkach, wyśrodkowane wszystko, bąbelkowate radiusy, emoji jako dekoracja) —
warto to przenieść do naszego DESIGN.md jako sekcję "czego unikamy", bo agent
i tak to sprawdza.

## 2. Rekomendowany szkielet sekcji dla naszego DESIGN.md

```
# DESIGN.md — Open Smart Desk

0. Status + normatywne słowa (MUST/SHOULD/MAY) — wzorzec z meblarz/DESIGN.md
1. Kontekst produktu (2 zdania: co to za produkt, kto go używa, jaki jest ton)
2. Kierunek wizualny — jedna nazwana "postawa" (np. meblarz ma "Warm Precision
   Studio"); 3-5 przymiotników + co odrzucamy i dlaczego (żeby agent nie musiał
   zgadywać "a może gradient?")
3. TOKENS (blok maszynowo czytelny — YAML lub JSON, DTCG-owy kształt jeśli się da:
   $value/$type) — kolor, typografia, spacing, radius, cienie, breakpointy.
   Duplikat w formie tabeli markdown pod spodem dla ludzi jest OK (meblarz robi
   to tak: tabela = jedyne źródło, ale nazwy tokenów jak CSS custom properties).
4. Komponenty i ich reguły (co istnieje, z czego korzystamy — biblioteka bazowa,
   ikony, kiedy tworzyć nowy komponent a kiedy użyć natywnego HTML)
5. Wzorce interakcji (formularze, puste stany, błędy, dialogi) — krótko, bo to
   marketing/landing, nie app UI
6. Ruch / motion (czas trwania, easing, prefers-reduced-motion)
7. 3D / art direction sprzętu (dla nas ważne: jak pokazywać biurko, sensor,
   zdjęcia produktowe — ton "cichy warsztat", nie "błyszczące demo SaaS")
8. Głos treści / content voice (Duolingo-style nudge, nie korporacyjny happy talk;
   patrz MISSION.md — "nudge system, nie produkt-desk")
9. Dostępność (WCAG 2.2 AA minimum, kontrast, touch targets 44px, focus ring)
10. Instrukcje dla agentów — explicit sekcja "AGENT INSTRUCTIONS": kiedy czytać
    ten plik, czego NIE robić bez pytania, przykładowe prompty ("zbuduj hero
    zgodnie z DESIGN.md"), lista zakazanych wzorców (AI slop)
11. Antywzorce (lista z design-review: gradienty fiolet/indygo, siatka 3 kolumn
    z ikonami w kółkach, wyśrodkowane wszystko, bąbelkowaty radius wszędzie,
    dekoracyjne blobs/fale, emoji jako element designu, kolorowy lewy border na
    kartach, generyczne hero copy typu "Unlock the power of...")
12. Źródła (linki, jak w meblarz/DESIGN.md — utrzymuje dokument w kontakcie z
    rzeczywistymi standardami)
13. Decyzje (tabela data/decyzja/uzasadnienie — ADR-lite, rośnie z czasem)
```

## 3. "Bajery" warte wzięcia

- **Token-blok maszynowo parsowalny** — YAML lub JSON front-matter (Better Stack)
  albo osobny plik `design-tokens.json` w kształcie DTCG (`$value`/`$type`), z
  którego DESIGN.md tylko cytuje tabelę. Ułatwia to narzędziom (Style Dictionary,
  przyszły CI) i agentom parsowanie bez łamania markdown.
- **MUST/SHOULD/MAY (RFC 2119-style)** — z meblarz/DESIGN.md: jednoznacznie mówi
  agentowi co jest twardym wymogiem a co sugestią. Tańsze niż długi opis.
- **Sekcja "Antywzorce" / AI slop blacklist** — konkretna, wyliczona lista
  zakazanych wzorców (z `design-review` SKILL.md) zamiast ogólnego "unikaj
  generycznego wyglądu". Agent potrafi to sprawdzić checklistą.
- **Sekcja "Odrzucone alternatywy"** — meblarz opisuje 2 odrzucone kierunki
  wizualne i dlaczego. To oszczędza przyszłej dyskusji "a może jednak..." i uczy
  agenta preferencji przez kontrast, nie tylko przez pozytywną specyfikację.
- **Governance / Definition of Done** — kto może zmieniać token, co wymaga
  przeglądu, kiedy nowy komponent jest uzasadniony (meblarz: "dwóch rzeczywistych
  konsumentów"). Zapobiega rozrostowi ad-hoc komponentów przez agentów.
- **Wizualna regresja / lint** — `design-review` skill już robi automatyczny audyt
  (ekstrakcja fontów/kolorów z żywej strony, checklisty 10 kategorii, AI slop
  score) i PORÓWNUJE z DESIGN.md jako baseline. Nie trzeba tego budować — trzeba
  tylko mieć DESIGN.md, żeby skill miał z czym porównywać.
- **Przykładowe prompty dla agentów** — jedna linijka typu "Buduj hero zgodnie z
  tokenami §3 i regułą 'cardless hero' §11" pomaga przy `design-html`/`design-review`,
  które i tak czytają ten plik.
- **Wersjonowanie w PR-ach** — DESIGN.md jako zwykły plik repo = przeglądalne
  diff'y zmian designu, nie osobne narzędzie.

## 4. Co przejąć z meblarz/DESIGN.md

Meblarz jest z tego samego ekosystemu (Paweł, ten sam sposób pracy z agentami) i
jest "approved" — najlepszy wzorzec strukturalny do kopiowania 1:1 w formie, nie
w treści:

- **Nagłówek normatywny** (Status + definicja MUST/SHOULD/MAY) — kopiować wprost.
- **Kształt tabeli tokenów** — `--ui-*` nazwy ról (nie odcieni), wartość hex,
  zastosowanie w jednej kolumnie. Czytelne i dla człowieka, i dla agenta grepującego.
- **Sekcja "Papier jako zachowanie, nie tekstura"** — wzorzec "metafora jest
  inspiracją, nie dosłowną teksturą" — dla nas analogicznie: biurko/sensor jako
  metafora "cichego narzędzia", nie dosłowny skeuomorfizm.
- **Sekcja "Antywzorce"** i **"Odrzucone alternatywy"** — kopiować format, wypełnić
  naszymi (patrz pkt 3 wyżej + AI slop z design-review).
- **Tabela "Decyzje" na końcu** — trzymać żywą, dopisywać przy każdej istotnej
  zmianie kierunku.
- **Sekcja "Źródła" na końcu** — kopiować format (markdown lista linków), zasilić
  linkami z pkt 1 tego dokumentu + DTCG spec.
- NIE kopiować: architektury pakietu `@customizable/ui`, Base UI/React specyfiki —
  desk.zentala.io to Astro + Tailwind + React (patrz `astro/CLAUDE.md`), więc
  sekcja "Fundament techniczny" (pkt 5 tam) musi być napisana od zera pod nasz stack
  (Tailwind v4 tokens, komponenty TSX Hero/Pricing/FAQ/itd.).

## 5. Dla naszego repo — dodatkowe akcenty

- Treść marki to "nudge system, nie desk-produkt" (MISSION.md) — sekcja "content
  voice" musi to wymusić: zero korporacyjnego SaaS happy-talk, ton bliższy
  Duolingo (przyjazny, nie infantylny).
  Aktualna strona opisuje jeszcze hardware v1 (relay board) — DESIGN.md powinien
  mieć adnotację, że treść wymaga odświeżenia względem v2 (RP2040 + ToF), ale to
  nie blokuje samego dokumentu designu.
- 3D/art direction: obecnie brak realnych renderów 3D w repo — sekcja "3D" może
  być na razie krótka (placeholder z zasadami na przyszłość: realistyczne
  materiały biurka, bez błyszczącego demo-SaaS 3D).

---

**Następny krok:** napisać właściwy `DESIGN.md` w root `desk.zentala.io` wg
szkieletu z pkt 2, wypełniony realnymi tokenami z `astro/src/styles` i
`astro/tailwind.config` (do sprawdzenia w kolejnym tasku E008(d) lub przy
pisaniu samego pliku).
