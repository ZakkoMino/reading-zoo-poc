# Čtecí ZOO – prototyp

Prototyp webové aplikace pro **děti učící se číst v češtině**. Dítě
si vybere úroveň a délku lekce, krátké pestré úkoly se střídají
a za každou dokončenou lekci si dítě odnese **zvíře do své ZOO**.

> Cílem prototypu je rychle ukázat koncept (UI, herní smyčka,
> adaptivní logika). Ilustrace jsou vlastní placeholder SVG –
> produkční verze by chtěla jednotnou profesionální sadu.

## Dokumentace

- [Produktový koncept](docs/PRODUCT_CONCEPT.md)
- [Obsahová strategie + slovní zásoba](docs/CONTENT_STRATEGY.md)
- [Fotky zvířat a licence](docs/ANIMAL_PHOTO_SOURCING.md)
- [Návrh dalších kroků](docs/NEXT_STEPS.md)
- [Strategie ilustrací](docs/ILLUSTRATION_STRATEGY.md)

## Asset balík – 82 ilustrovaných zvířat

| Soubor | Popis |
|---|---|
| [`data/content/animals_50_seed.json`](data/content/animals_50_seed.json) | JSON manifest – metadata, věty, fakta (cs-CZ) |
| [`data/content/animals_50_seed.csv`](data/content/animals_50_seed.csv) | CSV export stejných dat |
| [`data/content/animals_50.schema.json`](data/content/animals_50.schema.json) | JSON Schema (draft-07) |
| `assets/animals-3d/*.png` | 82 ilustrací Microsoft Fluent Emoji 3D (MIT) |
| `assets/animals-illustrated/*.svg` | 50 původních generovaných SVG (archiv) |
| [`animals-preview.html`](animals-preview.html) | Grid preview (vyžaduje lokální server) |

Stáhnout/aktualizovat ilustrace: `node scripts/fetch-animal-art.mjs`  
Validovat: `node scripts/validate-animals-50.mjs`

---

## Jak spustit

Žádné závislosti, žádný build, žádné `npm install`.

### Varianta A – stačí dvojklik

Otevři soubor `index.html` přímo v moderním prohlížeči
(Chrome, Edge, Safari, Firefox). Aplikace je čistý
HTML + CSS + ES5 JavaScript bez modulů, takže funguje
i přes `file://`.

### Instalace jako aplikace (Android tablet/mobil)

Otevři <https://zakkomino.github.io/reading-zoo-poc/> v Chrome,
potvrď nabídku **„Instalovat aplikaci“** (nebo menu ⋮ → *Přidat na
plochu*). Aplikace se nainstaluje s ikonou lva, běží celoobrazovkově
a po prvním načtení funguje **offline** (service worker si uloží
celý obsah, ~3,5 MB).

### Varianta B – přes lokální server (čistší)

Pokud chceš mít rozumný origin (např. pro Web Speech),
spusť kterýkoliv mini-server v kořeni projektu:

```bash
# Python 3 (předinstalovaný na macOS)
python3 -m http.server 8000

# nebo Node
npx --yes http-server -p 8000 -c-1
```

Pak v prohlížeči otevři <http://localhost:8000>.

---

## Co funguje

| Funkce | Stav |
|---|---|
| Onboarding s výběrem úrovně a délky lekce | ✅ |
| 8 úrovní (písmena → slabiky → slova → věty → příběhy), 858 položek | ✅ |
| Témata vět (Mazlíčci, Jídlo, Pohádky…) s ≥15 větami na obou větných úrovních | ✅ |
| Zamčené úrovně + zasloužený postup přes Velkou výzvu (8 z 8) + odznaky | ✅ |
| 3 délky lekce (5 / 8 / 10 úkolů) | ✅ |
| 6 typů úkolů (čtení, spoj s obrázkem, slož slovo/větu, doplň písmeno, obtahování, najdi zvíře od písmene) | ✅ |
| Věty „zvíře na konci“ pro úkol spoj s obrázkem (nutí číst celou větu) | ✅ |
| 25 mini příběhů odemykaných vlastnictvím zvířete | ✅ |
| Pestré střídání úkolů, žádný stejný dvakrát po sobě | ✅ |
| Bez opakování slov/vět v rámci sezení (dokud úroveň nabízí nová) | ✅ |
| 82 zvířat s ilustracemi Microsoft Fluent Emoji 3D (assets/animals-3d/, MIT) | ✅ |
| Sbírka zvířat se zámkem na neodemčená | ✅ |
| Výběr odměny: dítě si po lekci vybere 1 ze 2 zvířat | ✅ |
| Růst zvířat po hvězdičkách (1★ mládě → 5★ nejsilnější) | ✅ |
| Karta zvířete s faktem a tlačítkem výslovnosti | ✅ |
| Web Speech API (`lang="cs-CZ"`) s graceful fallbackem — jen u obrázků/ZOO, ne u úkolu „Přečti“ | ✅ |
| Adaptivní výběr slov podle „knowledge score" 0–5 | ✅ |
| Skóre + ZOO se ukládají do `localStorage` | ✅ |
| Rodičovský panel se statistikami a resetem | ✅ |
| Pozitivní zpětná vazba, žádné negativní hlášky | ✅ |
| Velká písmena, vysoký kontrast, `html lang="cs"` | ✅ |
| PWA: instalace na plochu (Android/desktop) + plný offline režim | ✅ |

---

## Architektura

```
reading-zoo-prototype/
├── index.html              # statická kostra + skripty
├── styles.css              # styly pro všech 5 obrazovek
├── animals-preview.html    # grid preview 50 ilustrovaných zvířat
├── assets/
│   ├── animals/*.svg       # 12 původních SVG ilustrací (fallback pro file://)
│   ├── animals-illustrated/*.svg  # 50 generovaných SVG (archiv, nahrazeno)
│   └── animals-3d/*.png    # 50 ilustrací Microsoft Fluent Emoji 3D (MIT)
├── data/content/
│   ├── animals_50_seed.json   # manifest 50 zvířat
│   ├── animals_50_seed.csv    # CSV export
│   └── animals_50.schema.json # JSON Schema
├── scripts/
│   ├── generate-animals-50.mjs      # generátor SVG + manifestů
│   ├── generate-animals-assets.mjs  # implementace generátoru
│   └── validate-animals-50.mjs      # validátor
├── js/
│   ├── data.js             # ANIMALS, LEVELS, LESSON_LENGTHS
│   ├── state.js            # localStorage + knowledge score
│   ├── speech.js           # cs-CZ TTS (fail-soft)
│   ├── lessons.js          # planner: výběr úkolů + odměny
│   ├── tasks.js            # 4 typy úkolů (read/match/compose/fill)
│   ├── views.js            # renderery 5 obrazovek
│   └── app.js              # mini-router + nav header
└── README.md
```

**Žádný framework, žádný bundler.** Každý JS soubor je IIFE,
která publikuje svůj modul do `window.App.<jméno>`. Skripty se
nahrávají v pořadí *data → state → speech → lessons → tasks →
views → app*, tedy bez kruhových závislostí.

### Datový model

Vše leží pod jediným klíčem v `localStorage`:

```json
{
  "settings":  { "levelId": "short", "lessonLength": 8 },
  "scores":    { "pes": 3, "kočka": 1, ... },
  "zoo":       ["pes", "sova", ...],
  "zooStars":  { "pes": 2, "sova": 1, ... },
  "stats":     { "lessonsCompleted": 2, "tasksCorrect": 11, "tasksTotal": 16 }
}
```

Klíč `reading-zoo-state` – jednoduše prozkoumatelný v DevTools
(Application → Local Storage).

### Adaptivní výběr

V `lessons.js` má každá učící položka **knowledge score 0–5**.
Pravidla:

* správně na první pokus  →  +1
* chyba                   →  −1 (min 0)
* pravděpodobnost zařazení do lekce = `1 + (5 − score)`,
  tj. nikdy neviděné slovo má cca **6× vyšší šanci** než
  zvládnuté slovo s max skóre.

Navíc platí **pravidlo bez opakování v sezení**: slova a věty použité
v předchozích lekcích od načtení stránky se znovu nenabízejí, dokud
úroveň nabízí dost nových položek. Teprve po vyčerpání zásoby se vrací
ty nejdéle neviděné. Uvnitř jedné lekce se text nikdy neopakuje; jen
u malých tematických sad (méně vět než úkolů) se sada projede dokola
tak, aby stejná věta nikdy nešla dvakrát po sobě.

Po chybě úkol nešidíme – ukážeme správnou odpověď a měkce
hlásíme „Zkus to ještě jednou.“; dítě může pokračovat.

Každá lekce, která obsahuje vhodná slova/věty, nově garantuje alespoň
jeden úkol **„Slož celé slovo z písmen“** nebo u vět **„Slož větu ze slov“**,
aby se nepletlo se samotným doplňováním jednoho písmene.

Úkol skládání nyní nejdřív cílové slovo/větu přečte nahlas přes Web Speech API
a až potom dítě skládá. Samostatný úkol **„Přečti“** naopak zůstává bez
předčítání, aby dítě skutečně četlo samo.

### Odměny do ZOO

Po dokončení lekce si dítě **vybere 1 ze 2 odměn**. Nabídka
upřednostňuje zvířata, která se v lekci opravdu objevila, a ideálně
kombinuje **nové zvíře** s **vylepšením** už získaného zvířete
o hvězdičku (1★ mládě → 2★ vyrůstá → 3★ dospělé → 4★ silné →
5★ nejsilnější). Když je vše nasbírané na max, dítě dostane
bonusovou oslavu.

---

## Vědomá omezení

* **Ilustrace jsou Microsoft Fluent Emoji (3D, MIT).** Jednotná,
  dětsky přívětivá sada — viz `docs/ANIMAL_ART_SETS.md` a
  `assets/animals-3d/LICENSE.md`. Stáhnout/aktualizovat:
  `node scripts/fetch-animal-art.mjs`. Zvířata bez emoji podoby
  (rys, srna, čmelák, kozel) byla nahrazena (hroch, papoušek,
  krokodýl, beran).
* **Web Speech API** závisí na hlasech operačního systému.
  Na macOS/Windows funguje cs-CZ hlas hned; na Linuxu může
  chybět. Pokud TTS není dostupné, tlačítko stále funguje, jen
  se nic nepřehraje – obsah je ale i textový.
* **Bez backendu.** Pokrok je per-prohlížeč/per-uživatel.
  Reset (panel „Pro rodiče“) ho smaže.
* **Heuristický výběr úkolů** – záměrně bez ML. Cílem je, aby
  byl model viditelný a snadno laditelný (`scoreOf` v DevTools).
* **Žádné testy** – prototyp je validovaný ručně. Pro
  produkci by se přidaly aspoň lehké unit testy na `lessons.js`
  a `state.js`.

---

## Návrh dalších kroků

1. Profesionální sada ilustrací.
2. Nahrané dětsky kvalitní cs-CZ hlasy s fallbackem na Web Speech.
3. Zvuky odměn a krátká drobná animace zvířete po dokončení.
4. Více slov a vět, příp. zaměření na fonetické skupiny
   („slova s ě“, „slova s ř“).
5. Volitelný cloud-sync pokroku (např. přes přihlášení rodiče).
