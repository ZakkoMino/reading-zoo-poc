# Návrh: 8 úrovní + rozšíření obsahu na 600+ slov

Návrh k odsouhlasení před implementací. Cíl: dítě vždy vidí „zamčené
dveře“ s něčím lákavým za nimi – postup si **zaslouží**, ne přepne.

---

## 1. Žebřík úrovní

Vychází z české výuky čtení (písmena → slabiky → slova → shluky →
věty → texty). Každá úroveň má dětský název, odznak a jasné kritérium
postupu.

| # | Úroveň (dětský název) | Co se učí | Příklady | Položek | Odznak |
|---|---|---|---|---|---|
| 1 | **Lovec písmen** | písmena vč. dlouhých samohlásek a ch | A, M, Š, CH, Á | ~34 | 🔤 |
| 2 | **Slabikové mládě** | otevřené slabiky | ma, lo, sí, pe, tu | ~50 | 🧩 |
| 3 | **První slova** | krátká slova 2–4 písmena bez shluků | pes, oko, máma, les, kos | ~120 | 🐾 |
| 4 | **Velká slova** | delší slova 2–3 slabiky | liška, ryba, koleno, sova | ~150 | 📖 |
| 5 | **Záludná slova** | shluky souhlásek, ě/ř/ď/ť/ň | strom, vlak, medvěd, čtyři, hříbě | ~120 | 🧗 |
| 6 | **Krátké věty** | věty o 2–3 slovech | „Pes štěká.“ „Labuť pluje.“ | ~150 | ✏️ |
| 7 | **Dlouhé věty** | věty o 4–6 slovech | „Na dvoře hlasitě štěká pes.“ | ~100 | 📜 |
| 8 | **Čtenář příběhů** | mini příběhy o 3–4 větách se zvířaty ze ZOO | „Liška měla hlad. Šla do lesa. …“ | ~25 příběhů | 👑 |

Součet učebních položek: **~750** (slova + věty), z toho slov ~470 a
vět/příběhů ~280 → splňuje cíl 600+.

### Vazba na ZOO

Zvířata už mají `readingLevel` 1–3 → odměny se přirozeně odstupňují:
- úrovně 1–3 rozdávají zvířata s `readingLevel 1` (pes, lev, kos…),
- úrovně 4–5 `readingLevel 2` (liška, klokan, panda…),
- úrovně 6+ `readingLevel 3` (nosorožec, chobotnice, plameňák…).

Dítě tak ví: **za dalšími zvířaty se musí pročíst výš.**

---

## 2. Mechanika postupu (zasloužený level-up)

1. **Zamčené úrovně jsou vidět** v onboardingu (🔒 + název) – vytváří tah.
2. Aplikace sleduje zvládnutí aktuální úrovně:
   *≥ 80 % procvičených položek se skóre ≥ 4* **a** *≥ 5 dokončených lekcí*.
3. Po splnění se objeví **Velká výzva 🏆**: 8 úkolů z *následující*
   úrovně. Úspěch = ≥ 6 správně na první pokus.
4. Výhra → úroveň se odemkne + odznak + bonusové zvíře.
   Prohra → „Ještě trénujeme!“ – žádný trest, výzva se nabídne znovu.
5. Rodič může úroveň přepnout ručně v panelu Pro rodiče (pozdější
   verze: za matematickou rodičovskou bránou).

---

## 3. Věty: 2–3 ke každému zvířeti (82 zvířat)

Každé zvíře dostane sadu vět s jasnou rolí:

| Varianta | Účel | Příklad (pes) |
|---|---|---|
| **V1 – základní** (existuje) | úroveň 6, čtení/skládání | „Pes štěká.“ |
| **V2 – zvíře na konci** | úkol *spoj s obrázkem* – nutí přečíst celou větu | „Na dvoře štěká pes.“ |
| **V3 – dlouhá** | úroveň 7 | „Pes hlídá náš dům a vrtí ocasem.“ |

→ 82 × 2 nové věty = **+164 vět**. V2 se použije výhradně pro match,
V1/V3 pro čtení a skládání.

---

## 4. Mini příběhy (úroveň 8)

- 3–4 krátké věty, hlavní hrdina = zvíře ze ZOO.
- Příběh se **odemkne jen pokud dítě zvíře vlastní** → další důvod sbírat.
- Čtení příběhu = nová obrazovka (věta po větě, velkým písmem).
- Start: 25 příběhů pro nejoblíbenější zvířata.

Příklad:

> **Liška a kos**
> Liška měla hlad. Šla tiše lesem. Kos ji viděl a zapískal.
> Všechna zvířata se schovala.

---

## 5. Pracovní postup „společně“ (návrh)

Obsah tvoříme v dávkách – já navrhnu, ty zkontroluješ češtinu a
vhodnost pro děti, pak teprve zapojím do aplikace:

| Dávka | Obsah | Výstup k revizi |
|---|---|---|
| A | struktura úrovní + mechanika postupu (tento dokument) | ✅ tento návrh |
| B | slovníky úrovní 1–5 (~470 slov, CSV) | tabulka slov po úrovních |
| C | věty V2 + V3 pro 82 zvířat | tabulka vět po zvířatech |
| D | 25 mini příběhů | texty příběhů |
| E | implementace: zámky úrovní, Velká výzva, odznaky, obrazovka příběhů | funkční app |

Každou dávku dodám jako přehlednou tabulku (CSV/Markdown), abys mohl
škrtat a opravovat přímo v ní.

---

## 6. Otevřené otázky k rozhodnutí

1. **Názvy úrovní** – vyhovují dětské názvy (Lovec písmen…)?
2. **Práh výzvy** – 6 z 8 správně na první pokus: přísnější/mírnější?
3. **Úroveň 1 (písmena)** – stačí úkoly „přečti písmeno“ + „najdi
   zvíře od písmene P“ + „doplň písmeno“, nebo přidat i obtahování
   (kreslení prstem) hned?
4. **Příběhy** – odemykat vlastnictvím zvířete (doporučuji), nebo
   zpřístupnit všechny?
5. **Tempo dávek** – B → C → D postupně, nebo B+C najednou?
