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

## Asset balík – 50 ilustrovaných zvířat

| Soubor | Popis |
|---|---|
| [`data/content/animals_50_seed.json`](data/content/animals_50_seed.json) | JSON manifest – metadata, věty, fakta (cs-CZ) |
| [`data/content/animals_50_seed.csv`](data/content/animals_50_seed.csv) | CSV export stejných dat |
| [`data/content/animals_50.schema.json`](data/content/animals_50.schema.json) | JSON Schema (draft-07) |
| `assets/animals-illustrated/*.svg` | 50 originálních SVG ilustrací |
| [`animals-preview.html`](animals-preview.html) | Grid preview (vyžaduje lokální server) |

Vygenerovat/přegenerovat assety: `node scripts/generate-animals-50.mjs`  
Validovat: `node scripts/validate-animals-50.mjs`

---

## Jak spustit

Žádné závislosti, žádný build, žádné `npm install`.

### Varianta A – stačí dvojklik

Otevři soubor `index.html` přímo v moderním prohlížeči
(Chrome, Edge, Safari, Firefox). Aplikace je čistý
HTML + CSS + ES5 JavaScript bez modulů, takže funguje
i přes `file://`.

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
| 4 úrovně (písmena/slabiky, krátká slova, delší slova, věty) | ✅ |
| 3 délky lekce (5 / 8 / 10 úkolů) | ✅ |
| 4 typy úkolů (čtení, spoj s obrázkem, slož celé slovo/větu, doplň písmeno) | ✅ |
| Pestré střídání úkolů, žádný stejný dvakrát po sobě | ✅ |
| 50 zvířat se SVG ilustracemi (assets/animals-illustrated/) | ✅ |
| Sbírka zvířat se zámkem na neodemčená | ✅ |
| Karta zvířete s faktem a tlačítkem výslovnosti | ✅ |
| Web Speech API (`lang="cs-CZ"`) s graceful fallbackem — jen u obrázků/ZOO, ne u úkolu „Přečti“ | ✅ |
| Adaptivní výběr slov podle „knowledge score" 0–5 | ✅ |
| Skóre + ZOO se ukládají do `localStorage` | ✅ |
| Rodičovský panel se statistikami a resetem | ✅ |
| Pozitivní zpětná vazba, žádné negativní hlášky | ✅ |
| Velká písmena, vysoký kontrast, `html lang="cs"` | ✅ |

---

## Architektura

```
reading-zoo-prototype/
├── index.html              # statická kostra + skripty
├── styles.css              # styly pro všech 5 obrazovek
├── animals-preview.html    # grid preview 50 ilustrovaných zvířat
├── assets/
│   ├── animals/*.svg       # 12 původních SVG ilustrací (prototyp)
│   └── animals-illustrated/*.svg  # 50 nových SVG ilustrací (seed)
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

Po chybě úkol nešidíme – ukážeme správnou odpověď a měkce
hlásíme „Zkus to ještě jednou.“; dítě může pokračovat.

Každá lekce, která obsahuje vhodná slova/věty, nově garantuje alespoň
jeden úkol **„Slož celé slovo z písmen“** nebo u vět **„Slož větu ze slov“**,
aby se nepletlo se samotným doplňováním jednoho písmene.

Úkol skládání nyní nejdřív cílové slovo/větu přečte nahlas přes Web Speech API
a až potom dítě skládá. Samostatný úkol **„Přečti“** naopak zůstává bez
předčítání, aby dítě skutečně četlo samo.

### Odměny do ZOO

Po dokončení lekce planner upřednostní **zvíře, které se v lekci
opravdu objevilo** a které dítě ještě nemá. Pokud žádné takové
není, vybere libovolné chybějící. Když je ZOO kompletní, dítě
dostane bonusové opakování zvířete.

---

## Vědomá omezení

* **Ilustrace jsou prototypové placeholdery.** Jsou ručně psané
  SVG ve stejném vizuálním klíči (kruhové pozadí, 200×200), ale
  produkčně bychom chtěli **jednotnou profesionální sadu**
  od ilustrátora (např. vektorová sada CC-BY / vlastní zakázka).
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
