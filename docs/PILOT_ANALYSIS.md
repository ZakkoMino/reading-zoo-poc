# Čtecí ZOO – hloubková analýza pilotu

Analýza aktuálního stavu prototypu (commit `f4a22ae`): co opravit, jaké
funkce přidat a jak prodloužit používání aplikace. Vychází z přečtení
celého kódu (`js/*`), obsahových dat (`data/content/*`) a stávajících
dokumentů (`PRODUCT_CONCEPT`, `NEXT_STEPS`).

---

## 1. Co opravit

### 1.1 Integrita učení (nejdůležitější)

| # | Problém | Kde | Dopad |
|---|---------|-----|-------|
| 1 | Úkol **„Přečti"** se vždy započítá jako správně (`resolve({correct: true})`) – dítě může jen klikat. | `tasks.js` → `read()` | Nafouknuté knowledge score i statistiky pro rodiče. Minimálně počítat zvlášť („samostatně potvrzeno“ vs. „ověřeno“). |
| 2 | Úkol **„Spoj s obrázkem"** ukazuje název zvířete pod každým obrázkem → dítě může jen porovnat dva stejné texty, nemusí rozumět. Navíc se slovo po 200 ms **předčítá nahlas**, takže ani číst nemusí. | `tasks.js` → `match()` | Úkol jde vyřešit bez čtení. Skrýt popisky do vyřešení; předčítání nechat jen jako nápovědu na tlačítku. |
| 3 | Věty se **4+ slovy** ve skládání spadnou do fallbacku „Přečti → Pokračovat“, který se vždy započítá jako správně. | `tasks.js` → `composeSentence()` | Další zdroj falešného skóre. |
| 4 | **Doplň písmeno** u vět: pokud chybí první písmeno věty, správná volba je jediná **velkým písmenem** mezi malými distraktory → prozrazuje odpověď. | `tasks.js` → `fill()` | Sjednotit velikost písmen voleb. |
| 5 | Adaptivní model **nezapomíná**: položka se skóre 5 má váhu 1 vs. 6 a časem se prakticky nevrací. Žádné opakování po čase (spaced repetition); `lastSeen` se ukládá jen globálně, ne per slovo. | `lessons.js`, `state.js` | Dítě „umí“ navždy – po pár dnech to neplatí. |
| 6 | **Žádný postup mezi úrovněmi.** Dítě zůstává na zvolené úrovni, dokud rodič ručně nepřepne; aplikace zvládnutí úrovně nijak nesignalizuje. | `lessons.js`, `views.js` | Hlavní pedagogická i retenční díra – viz kap. 3. |

### 1.2 Technické chyby a robustnost

1. **Odchod z lekce uprostřed** (klik na Domů/Moje ZOO) nechá asynchronní
   smyčku `renderLesson` viset na odpojeném DOM. Skóre už je částečně
   zapsané, ale lekce se nezapočítá do statistik (asymetrie). Chybí
   potvrzení „opravdu odejít?“ a zrušení lekce (abort token).
2. **Nesoulad ID úrovní** mezi inline fallbackem (`short/longer/...`) a
   seed daty (`simple/animals/nature/...`). Uložené `levelId` z jednoho
   režimu po přepnutí tiše spadne na `syllables` (`getLevel` fallback).
3. **Stav bez verze schématu** – budoucí migrace budou riskantní. Skóre
   klíčované surovým textem: oprava překlepu ve slovníku osiří skóre,
   stejné slovo ve dvou úrovních sdílí skóre.
4. **Detekce hlasu**: `speech.isAvailable()` kontroluje jen existenci
   `speechSynthesis`, ne českého hlasu. Upozornění se ukazuje až na kartě
   zvířete. Na zařízení bez cs hlasu se úkol „poslechni → slož“ tiše
   stane výrazně těžším bez varování – upozornit už v onboardingu.
5. **Mrtvé soubory**: kořenový `app.js` (deprecated placeholder),
   `assets/animals/` (12 starých SVG, používají se už jen jako fallback
   cesta v `animalImg`), `animals-contact-sheet.svg`. Rozhodnout a uklidit.
6. **Žádné testy** – aspoň lehké unit testy na `lessons.js` (planner,
   garance compose, témata) a `state.js` (merge starých uložených stavů).
7. **Chybí PWA základ** (manifest + service worker), přestože PWA je
   deklarovaný směr – bez něj žádná instalace ani offline.
8. Drobnosti: distraktory obsahují q/w/x (v češtině se nevyskytují),
   jediná rychlost TTS (0.9), `onvoiceschanged` nic nedělá.

---

## 2. Jaké funkce přidat

### 2.1 Rychlé výhry (dny)

- **Zvuky + mikroanimace odměny** (konfety, zvíře zamává, zvuk zvířete
  po kliknutí v ZOO) – levné, velký dopad na děti.
- **Výběr odměny**: po lekci nabídnout 2 zvířata, dítě si vybere –
  pocit kontroly výrazně zvyšuje motivaci.
- **Nový typ úkolu „poslechni → vyber slovo“** (obrácený match: zazní
  slovo, dítě vybírá ze 3 napsaných slov). Levné a skutečně testuje čtení
  – na rozdíl od dnešního match (viz 1.1/2).
- **Skrytí popisků v match** + odměnové odhalení po odpovědi.
- **Více profilů dětí** (sourozenci) – jen namespacing localStorage klíče.

### 2.2 Střední (týdny)

- **Automatický postup úrovní**: průměrné skóre úrovně nad práh →
  „Zkusíme delší slova? 🎉“ + odznak za zvládnutou úroveň. Nejdůležitější
  jednotlivá funkce pro dlouhodobé používání.
- **Opakování po čase**: per-item `lastSeen`, váha roste s časem od
  posledního setkání; jednou týdně „opakovací lekce“ ze zvládnutých slov.
- **Čtení po slabikách**: vizuální dělení slov na slabiky (ma-min-ka) –
  odpovídá české výuce čtení, data lze doplnit do slovníku.
- **Pexeso** se dvojicemi slovo ↔ obrázek – velmi česká, dětmi milovaná
  mechanika, recykluje existující assety.
- **Obtahování písmen** (canvas) – plánováno v MVP2, vhodné pro úroveň
  „Písmena a slabiky“, která je dnes obsahově nejchudší (13 slabik).
- **Rodičovský panel 2.0**: doporučení dalšího kroku, seznam „slova,
  která se pletou“, týdenní souhrn.

### 2.3 Větší (měsíce)

- **ZOO 2.0 – biotopy**: data už mají `biome` (domov, les, safari,
  voda…) – ZOO rozdělit na výběhy, dítě zvíře umisťuje, odemyká
  dekorace. Ze sbírky se stane prostor, kam se dítě vrací.
- **Hvězdičky zvířat**: opakované setkání se zvířetem (duplikát po
  dokončené sbírce) zvíře „vylepší“ (mládě → dospělec, 1–3 ⭐). Řeší
  konec hry po nasbírání 50 zvířat.
- **Krátké příběhy** odemčené nasbíranými zvířaty (úroveň „krátké
  texty“ z NEXT_STEPS) – přirozené pokračování progrese.
- **Nahrané dětské cs hlasy** s fallbackem na Web Speech.
- **Experiment: rozpoznávání řeči** pro úkol „Přečti“ (Web Speech
  `SpeechRecognition`, jen Chrome, opt-in) – jediná cesta, jak čtení
  skutečně ověřit.
- **Účty + synchronizace** (až po validaci; nutné pro více zařízení
  a skutečnou analytiku).

---

## 3. Jak prodloužit používání (retence)

**Jádro problému:** dnešní smyčka je konečná sbírka – ~50 lekcí a „hra
končí“. Není důvod se vracet denně, není progrese, není obsah po
dokončení sbírky.

1. **Denní rituál**: mise „Zvíře dne“, kalendář se samolepkami za dny
   s lekcí, jemná série (streak) bez trestání výpadku (dětem 4–7 nechceme
   vytvářet stres). PWA notifikace jako opt-in pro rodiče.
2. **Progrese jako runway obsahu**: automatický postup úrovní (2.2) +
   nové úrovně (shluky souhlásek, krátké texty) = měsíce obsahu místo
   týdnů. Datová pipeline (`scripts/`, seed JSON) už to umí zásobovat.
3. **Obnovitelné odměny**: hvězdičky zvířat, dekorace výběhů, „krmení“
   za dokončené lekce – sbírka nikdy „nedojde“.
4. **Rodina jako kanál**: profily sourozenců, týdenní souhrn pro rodiče
   (zpočátku jen obrazovka, později e-mail), sdílení obrázku „moje ZOO“.
5. **Měřit, pak stavět**: nejdřív privacy-friendly lokální analytika
   (délka sezení, úkoly/lekce, návratové dny) a definovat KPI: návrat
   D1/D7, lekce/týden, % dětí s postupem úrovně. Bez toho jsou retenční
   funkce střelba naslepo.
6. **Před dalším vývojem** dodržet krok z NEXT_STEPS: test s 1–3 dětmi.
   Opravy z kap. 1.1 ale udělat ještě před testem – jinak test změří
   klikání, ne čtení.

### Doporučené pořadí (30/60/90 dní)

| Horizont | Obsah |
|---|---|
| 30 dní | Opravy 1.1 (1–4), zvuky/animace, výběr odměny, „poslechni → vyber slovo“, profily, test s dětmi |
| 60 dní | Postup úrovní + odznaky, spaced repetition, pexeso, PWA (manifest + SW), lokální analytika |
| 90 dní | ZOO biotopy, hvězdičky zvířat, slabiky, rodičovský panel 2.0, rozhodnutí o nahraných hlasech |
